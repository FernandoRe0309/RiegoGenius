#!/usr/bin/env python3
"""
serial_bridge.py — Raspberry Pi 400
─────────────────────────────────────────────────────────────
Lee JSON del Arduino por USB Serial y lo envía al backend
FastAPI local. También escucha comandos de riego del API.

Instalación:
    pip install pyserial requests

Uso:
    python3 serial_bridge.py

    # Para encontrar el puerto del Arduino:
    ls /dev/ttyUSB* o ls /dev/ttyACM*
    # Normalmente es /dev/ttyUSB0 o /dev/ttyACM0
"""

import serial
import serial.tools.list_ports
import json
import requests
import time
import logging
import threading
from datetime import datetime

# ── Configuración ─────────────────────────────────────────
FASTAPI_URL   = "http://localhost:8000"   # FastAPI en el mismo Pi
SERIAL_PORT   = None                       # None = autodetectar
BAUD_RATE     = 9600
SEND_INTERVAL = 5                          # segundos entre lecturas
RETRY_DELAY   = 10                         # segundos si hay error serial

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("serial_bridge.log"),
    ]
)
log = logging.getLogger(__name__)


# ── Autodetección del puerto Arduino ─────────────────────
def find_arduino_port() -> str | None:
    ports = serial.tools.list_ports.comports()
    for port in ports:
        desc = (port.description or "").lower()
        hwid = (port.hwid or "").lower()
        if any(k in desc for k in ["arduino", "ch340", "cp210", "ftdi", "usb serial"]):
            log.info(f"Arduino detectado: {port.device} — {port.description}")
            return port.device
        if "usb" in hwid:
            log.info(f"Puerto USB encontrado: {port.device} — {port.description}")
            return port.device
    return None


# ── Enviar lectura al FastAPI ─────────────────────────────
def send_reading(data: dict) -> int | None:
    """
    Envía la lectura de sensores al endpoint POST /sensors/
    Retorna el ID del registro guardado o None si hay error.
    """
    payload = {
        "source"       : "real",
        "temperature"  : data.get("temperature", 0),
        "air_humidity" : data.get("air_humidity", 0),
        "soil_humidity": data.get("soil_humidity", 0),
        "light"        : data.get("light", 0),
        "co2"          : data.get("co2", 0),
    }

    # Validar que los valores sean razonables (DHT11 a veces falla)
    if payload["temperature"] < 0 or payload["air_humidity"] < 0:
        log.warning(f"Lectura inválida del DHT11, descartando: {payload}")
        return None

    try:
        res = requests.post(
            f"{FASTAPI_URL}/sensors/",
            json=payload,
            timeout=5
        )
        if res.status_code == 201:
            reading_id = res.json().get("id")
            log.info(f"✅ Lectura guardada (id={reading_id}): "
                     f"temp={payload['temperature']}°C "
                     f"suelo={payload['soil_humidity']}% "
                     f"luz={payload['light']:.0f}lux")
            return reading_id
        else:
            log.error(f"Error del API: {res.status_code} — {res.text}")
    except requests.exceptions.ConnectionError:
        log.error(f"No se pudo conectar a FastAPI en {FASTAPI_URL}")
    except Exception as e:
        log.error(f"Error enviando lectura: {e}")
    return None


# ── Pedir predicción ML y controlar bomba ─────────────────
def check_and_irrigate(ser: serial.Serial, reading_id: int):
    """
    Pide predicción al modelo ML y activa/desactiva la bomba.
    """
    try:
        res = requests.post(
            f"{FASTAPI_URL}/predictions/predict",
            json={"sensor_reading_id": reading_id},
            timeout=10
        )
        if res.status_code != 201:
            return

        pred = res.json()
        should_irrigate = pred.get("should_irrigate", False)
        urgency         = pred.get("urgency", "none")
        confidence      = pred.get("confidence", 0)

        log.info(f"🤖 ML: irrigar={should_irrigate} urgencia={urgency} confianza={confidence:.0%}")

        # Solo activar riego automático si urgencia es alta
        if urgency == "high" and should_irrigate:
            log.info("💧 Activando bomba automáticamente (urgencia alta)")
            ser.write(b"RIEGO_ON\n")

            # Registrar evento de riego en el API
            duration = pred.get("estimated_duration_min", 10)
            requests.post(
                f"{FASTAPI_URL}/irrigation/toggle",
                json={
                    "active"       : True,
                    "trigger"      : "automatic",
                    "triggered_by" : "ml_model",
                    "prediction_id": pred.get("id"),
                },
                timeout=5
            )

            # Apagar bomba después de la duración estimada
            def stop_pump():
                time.sleep(duration * 60)
                ser.write(b"RIEGO_OFF\n")
                requests.post(
                    f"{FASTAPI_URL}/irrigation/toggle",
                    json={"active": False},
                    timeout=5
                )
                log.info(f"💧 Bomba apagada tras {duration} minutos")

            threading.Thread(target=stop_pump, daemon=True).start()

    except Exception as e:
        log.error(f"Error en predicción/riego: {e}")


# ── Escuchar comandos manuales del API ────────────────────
def poll_irrigation_commands(ser: serial.Serial):
    """
    Cada 2 segundos consulta si el usuario activó/desactivó
    el riego manualmente desde el dashboard.
    """
    last_state = False
    while True:
        try:
            res = requests.get(f"{FASTAPI_URL}/irrigation/status", timeout=3)
            if res.status_code == 200:
                active = res.json().get("active", False)
                if active != last_state:
                    cmd = b"RIEGO_ON\n" if active else b"RIEGO_OFF\n"
                    ser.write(cmd)
                    log.info(f"🔁 Comando manual: {'ON' if active else 'OFF'}")
                    last_state = active
        except Exception:
            pass
        time.sleep(2)


# ── Loop principal ────────────────────────────────────────
def main():
    log.info("🌱 RiegoGenius Serial Bridge iniciando…")

    # Esperar que FastAPI esté listo
    for i in range(10):
        try:
            requests.get(f"{FASTAPI_URL}/health", timeout=2)
            log.info(f"✅ FastAPI listo en {FASTAPI_URL}")
            break
        except Exception:
            log.info(f"Esperando FastAPI… ({i+1}/10)")
            time.sleep(3)

    # Encontrar puerto del Arduino
    port = SERIAL_PORT or find_arduino_port()
    if not port:
        log.error("No se encontró el Arduino. Verifica que esté conectado por USB.")
        log.error("Puertos disponibles:")
        for p in serial.tools.list_ports.comports():
            log.error(f"  {p.device} — {p.description}")
        return

    log.info(f"Conectando al Arduino en {port} a {BAUD_RATE} baud…")

    while True:
        try:
            with serial.Serial(port, BAUD_RATE, timeout=2) as ser:
                log.info(f"✅ Serial conectado: {port}")
                time.sleep(2)  # Esperar reset del Arduino

                # Hilo para comandos manuales del dashboard
                t = threading.Thread(
                    target=poll_irrigation_commands,
                    args=(ser,),
                    daemon=True
                )
                t.start()

                # Leer lecturas del Arduino
                buffer = ""
                while True:
                    try:
                        raw = ser.readline().decode("utf-8", errors="ignore").strip()
                        if not raw:
                            continue

                        # Parsear JSON
                        if raw.startswith("{"):
                            data = json.loads(raw)
                            log.debug(f"Serial recibido: {data}")

                            # 1. Guardar en SQLite
                            reading_id = send_reading(data)

                            # 2. Pedir predicción ML cada 5 lecturas
                            if reading_id and reading_id % 5 == 0:
                                threading.Thread(
                                    target=check_and_irrigate,
                                    args=(ser, reading_id),
                                    daemon=True
                                ).start()

                    except json.JSONDecodeError:
                        log.debug(f"Serial (no JSON): {raw}")
                    except Exception as e:
                        log.error(f"Error leyendo serial: {e}")
                        break

        except serial.SerialException as e:
            log.error(f"Error serial: {e}. Reintentando en {RETRY_DELAY}s…")
            time.sleep(RETRY_DELAY)
        except KeyboardInterrupt:
            log.info("Deteniendo bridge…")
            break


if __name__ == "__main__":
    main()
