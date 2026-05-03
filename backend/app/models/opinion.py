from datetime import datetime
from .. import db


class Opinion(db.Model):
    __tablename__ = 'opinions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_name = db.Column(db.String(80), db.ForeignKey('patients.username'), nullable=False)
    doctor_name = db.Column(db.String(80), db.ForeignKey('doctors.username'), nullable=False)
    opinion = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref=db.backref('opinions', lazy='dynamic'))
    doctor = db.relationship('Doctor', backref=db.backref('opinions', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'patient_name': self.patient_name,
            'doctor_name': self.doctor_name,
            'opinion': self.opinion,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
        }
