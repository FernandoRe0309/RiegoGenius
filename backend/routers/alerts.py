"""
routers/alerts.py
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, desc, func
from datetime import datetime

from database import get_db, Alert
from schemas import AlertOut

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/", response_model=list[AlertOut])
def list_alerts(
    resolved: bool | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    q = select(Alert).order_by(desc(Alert.created_at)).limit(limit)
    if resolved is not None:
        q = q.where(Alert.resolved == resolved)
    return db.execute(q).scalars().all()


@router.patch("/{alert_id}/resolve", response_model=AlertOut)
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(404, "Alerta no encontrada")
    alert.resolved    = True
    alert.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert


@router.get("/stats")
def alert_stats(db: Session = Depends(get_db)):
    rows = db.execute(
        select(Alert.severity, func.count(Alert.id))
        .where(Alert.resolved == False)
        .group_by(Alert.severity)
    ).all()
    return {sev: count for sev, count in rows}
