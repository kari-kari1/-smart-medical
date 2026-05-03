from datetime import datetime
from .. import db


class Patient(db.Model):
    __tablename__ = 'patients'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), db.ForeignKey('users.username'), unique=True, nullable=False)
    registration_status = db.Column(db.String(20), nullable=False, default='未挂号')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('patient_profile', uselist=False))

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'registration_status': self.registration_status,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
        }
