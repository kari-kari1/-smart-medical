import os
from datetime import timedelta


class Config:
    # MySQL
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:123456@127.0.0.1:3306/hospital?charset=utf8mb4'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False

    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'smart-medical-secret-key-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

    # SocketIO
    SECRET_KEY = os.environ.get('SECRET_KEY', 'socket-io-secret-2026')

    # CORS
    CORS_ORIGINS = '*'
