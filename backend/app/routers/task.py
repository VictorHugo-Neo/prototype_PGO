from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..database import get_db

router = APIRouter(tags=["tasks_guidance"])

@router.post("/guidances/", response_model=schemas.GuidanceResponse)

def create_guidance(guidance: schemas.GuidanceCreate, db: Session = Depends(get_db)):
    return crud.create_guidance(db=db, guidance_date=guidance.model_dump())

