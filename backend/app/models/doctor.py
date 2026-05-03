from datetime import datetime
from .. import db


class Doctor(db.Model):
    __tablename__ = 'doctors'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), db.ForeignKey('users.username'), unique=True, nullable=False)
    room = db.Column(db.String(80), nullable=False, default='')
    department = db.Column(db.String(80), nullable=False, default='')
    consultation_time = db.Column(db.String(200), nullable=False, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('doctor_profile', uselist=False))

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'room': self.room,
            'department': self.department,
            'consultation_time': self.consultation_time,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
        }
