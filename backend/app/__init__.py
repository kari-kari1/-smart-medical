import os
from flask import Flask, send_from_directory, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_jwt_extended import JWTManager

from .config import Config

db = SQLAlchemy()
socketio = SocketIO(cors_allowed_origins='*')
jwt = JWTManager()

# frontend 目录的绝对路径
FRONTEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'frontend')
)


def create_app():
    # 不使用 Flask 的 static_folder，避免路由冲突
    app = Flask(__name__)
    app.config.from_object(Config)

    # Init extensions
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    socketio.init_app(app, async_mode='threading')
    jwt.init_app(app)

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.patient import patient_bp
    from .routes.doctor import doctor_bp
    from .routes.registration import registration_bp
    from .routes.prescription import prescription_bp
    from .routes.opinion import opinion_bp
    from .routes.health import health_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patient_bp, url_prefix='/api/patients')
    app.register_blueprint(doctor_bp, url_prefix='/api/doctors')
    app.register_blueprint(registration_bp, url_prefix='/api/registrations')
    app.register_blueprint(prescription_bp, url_prefix='/api/prescriptions')
    app.register_blueprint(opinion_bp, url_prefix='/api/opinions')
    app.register_blueprint(health_bp, url_prefix='/api/health')

    # Register socket events
    from .socket.chat import register_chat_events
    register_chat_events(socketio)

    # ---- 前端静态文件服务 ----

    @app.route('/')
    def serve_index():
        return send_from_directory(FRONTEND_DIR, 'index.html')

    @app.route('/css/<path:filename>')
    def serve_css(filename):
        return send_from_directory(os.path.join(FRONTEND_DIR, 'css'), filename)

    @app.route('/js/<path:filename>')
    def serve_js(filename):
        return send_from_directory(os.path.join(FRONTEND_DIR, 'js'), filename)

    @app.route('/img/<path:filename>')
    def serve_img(filename):
        return send_from_directory(os.path.join(FRONTEND_DIR, 'img'), filename)

    @app.route('/lib/<path:filename>')
    def serve_lib(filename):
        return send_from_directory(os.path.join(FRONTEND_DIR, 'lib'), filename)

    # Create tables
    with app.app_context():
        from . import models  # noqa: F401
        db.create_all()

    return app
