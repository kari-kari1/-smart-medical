from .user import User
from .patient import Patient
from .doctor import Doctor
from .prescription import Prescription
from .registration import Registration
from .opinion import Opinion
from .health_record import HealthRecord
from .chat_message import ChatMessage

__all__ = [
    'User', 'Patient', 'Doctor', 'Prescription',
    'Registration', 'Opinion', 'HealthRecord', 'ChatMessage'
]
