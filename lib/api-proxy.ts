// lib/api-proxy.ts
// Proxy ligero hacia el backend FastAPI (puerto 8000)
// Agrega aquí PYTHON_API_URL=http://localhost:8000 en tu .env.local

const BASE = process.env.PYTHON_API_URL ?? "http://localhost:8000"

export async function apiGet(path: string, params?: Record<string, string>) {
  const url = new URL(`${BASE}${path}`)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { cache: "no-store" })
  return { data: await res.json(), status: res.status }
}

export async function apiPost(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  return { data: await res.json(), status: res.status }
}

export async function apiPatch(path: string) {
  const res = await fetch(`${BASE}${path}`, { method: "PATCH", cache: "no-store" })
  return { data: await res.json(), status: res.status }
}
