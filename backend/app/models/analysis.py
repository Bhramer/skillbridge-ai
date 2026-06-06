from __future__ import annotations

import uuid
from typing import Optional
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, JSONType


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    resume_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("resumes.id"), nullable=True
    )
    analysis_type: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )
    result_data: Mapped[dict] = mapped_column(JSONType, nullable=False)
    ats_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="analyses")
    resume = relationship("Resume", back_populates="analyses")
