from datetime import datetime
from .. import db


class HealthRecord(db.Model):
    __tablename__ = 'health_records'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), db.ForeignKey('patients.username'), unique=True, nullable=False)
    height = db.Column(db.Float, nullable=True)       # cm
    weight = db.Column(db.Float, nullable=True)       # kg
    vital_capacity = db.Column(db.Float, nullable=True)  # ml
    blood_pressure_high = db.Column(db.Integer, nullable=True)
    blood_pressure_low = db.Column(db.Integer, nullable=True)
    heart_rate = db.Column(db.Integer, nullable=True)
    blood_sugar = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = db.relationship('Patient', backref=db.backref('health_record', uselist=False))

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'height': self.height,
            'weight': self.weight,
            'vital_capacity': self.vital_capacity,
            'blood_pressure_high': self.blood_pressure_high,
            'blood_pressure_low': self.blood_pressure_low,
            'heart_rate': self.heart_rate,
            'blood_sugar': self.blood_sugar,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None,
        }
