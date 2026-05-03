from datetime import datetime
from .. import db


class Registration(db.Model):
    __tablename__ = 'registrations'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_username = db.Column(db.String(80), db.ForeignKey('patients.username'), nullable=False)
    doctor_username = db.Column(db.String(80), db.ForeignKey('doctors.username'), nullable=False)
    examination_time = db.Column(db.String(100), nullable=False)
    room = db.Column(db.String(80), nullable=False, default='')
    symptom = db.Column(db.Text, nullable=False, default='')
    status = db.Column(db.String(20), nullable=False, default='待就诊')  # 待就诊/已完成/已取消
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = db.relationship('Patient', backref=db.backref('registrations', lazy='dynamic'))
    doctor = db.relationship('Doctor', backref=db.backref('registrations', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'patient_username': self.patient_username,
            'doctor_username': self.doctor_username,
            'examination_time': self.examination_time,
            'room': self.room,
            'symptom': self.symptom,
            'status': self.status,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
        }
