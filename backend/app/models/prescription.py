from datetime import datetime
from .. import db


class Prescription(db.Model):
    __tablename__ = 'prescriptions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_username = db.Column(db.String(80), db.ForeignKey('patients.username'), nullable=False)
    doctor_username = db.Column(db.String(80), db.ForeignKey('doctors.username'), nullable=False)
    prescription_content = db.Column(db.Text, nullable=False)
    doctor_advice = db.Column(db.Text, nullable=False)
    total_amount = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = db.relationship('Patient', backref=db.backref('prescriptions', lazy='dynamic'))
    doctor = db.relationship('Doctor', backref=db.backref('prescriptions', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'patient_username': self.patient_username,
            'doctor_username': self.doctor_username,
            'prescription_content': self.prescription_content,
            'doctor_advice': self.doctor_advice,
            'total_amount': self.total_amount,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
        }
