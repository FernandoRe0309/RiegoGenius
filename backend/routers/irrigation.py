"""
routers/irrigation.py
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from datetime import datetime

from database import get_db, IrrigationEvent
from schemas import IrrigationToggle, IrrigationEventOut

router = APIRouter(prefix="/irrigation", tags=["irrigation"])


@router.get("/status")
def get_status(db: Session = Depends(get_db)):
    active = db.execute(
        select(IrrigationEvent)
        .where(IrrigationEvent.active == True)
        .order_by(desc(IrrigationEvent.started_at))
        .limit(1)
    ).scalar_one_or_none()

    if active:
        duration_so_far = (datetime.utcnow() - active.started_at).total_seconds() / 60
        return {
            "active"             : True,
            "event_id"           : active.id,
            "started_at"         : active.started_at,
            "duration_min_so_far": round(duration_so_far, 1),
            "trigger"            : active.trigger,
            "zone"               : active.zone,
        }
    return {"active": False}


@router.post("/toggle", response_model=IrrigationEventOut, status_code=201)
def toggle_irrigation(body: IrrigationToggle, db: Session = Depends(get_db)):
    if not body.active:
        active = db.execute(
            select(IrrigationEvent).where(IrrigationEvent.active == True).limit(1)
        ).scalar_one_or_none()

        if active:
            active.ended_at     = datetime.utcnow()
            active.active       = False
            active.duration_min = (active.ended_at - active.started_at).total_seconds() / 60
            db.commit()
            db.refresh(active)
            return active

        dummy = IrrigationEvent(
            active=False, trigger=body.trigger,
            triggered_by=body.triggered_by, zone=body.zone,
            ended_at=datetime.utcnow(), duration_min=0,
        )
        db.add(dummy)
        db.commit()
        db.refresh(dummy)
        return dummy

    event = IrrigationEvent(
        trigger       = body.trigger,
        triggered_by  = body.triggered_by,
        zone          = body.zone,
        prediction_id = body.prediction_id,
        notes         = body.notes,
        active        = True,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/history", response_model=list[IrrigationEventOut])
def get_history(limit: int = 50, db: Session = Depends(get_db)):
    return db.execute(
        select(IrrigationEvent)
        .order_by(desc(IrrigationEvent.started_at))
        .limit(limit)
    ).scalars().all()
