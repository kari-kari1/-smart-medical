import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    # MySQL - 请在 .env 文件中配置
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'mysql+pymysql://username:password@127.0.0.1:3306/smart_medical?charset=utf8mb4'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False

    # JWT - 请在 .env 文件中配置安全的随机字符串
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'CHANGE_ME_IN_ENV_FILE')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

    # SocketIO - 请在 .env 文件中配置安全的随机字符串
    SECRET_KEY = os.environ.get('SECRET_KEY', 'CHANGE_ME_IN_ENV_FILE')

    # CORS
    CORS_ORIGINS = '*'
