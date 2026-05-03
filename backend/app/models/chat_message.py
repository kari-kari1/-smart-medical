from datetime import datetime
from .. import db


class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sender = db.Column(db.String(80), nullable=False, index=True)
    receiver = db.Column(db.String(80), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    msg_type = db.Column(db.String(20), nullable=False, default='text')  # text/image
    is_read = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'sender': self.sender,
            'receiver': self.receiver,
            'content': self.content,
            'msg_type': self.msg_type,
            'is_read': self.is_read,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
        }
