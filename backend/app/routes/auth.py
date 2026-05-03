from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from .. import db
from ..models.user import User
from ..models.patient import Patient
from ..models.doctor import Doctor
from ..utils.auth import hash_password, check_password

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': '请求数据为空'}), 400

    username = data.get('username', '').strip()
    password = data.get('password', '')
    identity = data.get('identity', '')

    if not username or not password or not identity:
        return jsonify({'status': 'error', 'message': '用户名、密码和身份不能为空'}), 400

    if identity not in ('patient', 'doctor'):
        return jsonify({'status': 'error', 'message': '身份必须是 patient 或 doctor'}), 400

    if len(password) < 6:
        return jsonify({'status': 'error', 'message': '密码长度至少为6位'}), 400

    # Check duplicate
    if User.query.filter_by(username=username).first():
        return jsonify({'status': 'error', 'message': '用户名已存在'}), 409

    # Create user
    user = User(
        username=username,
        password_hash=hash_password(password),
        identity=identity
    )
    db.session.add(user)

    # Create profile
    if identity == 'patient':
        patient = Patient(username=username)
        db.session.add(patient)
    else:
        doctor = Doctor(username=username)
        db.session.add(doctor)

    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': '注册成功',
        'username': username,
        'identity': identity
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': '请求数据为空'}), 400

    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'status': 'error', 'message': '用户名和密码不能为空'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'status': 'error', 'message': '用户不存在'}), 404

    if not check_password(password, user.password_hash):
        return jsonify({'status': 'error', 'message': '密码错误'}), 401

    # Create JWT token - identity must be a string in Flask-JWT-Extended 4.x
    token = create_access_token(
        identity=username,
        additional_claims={'identity': user.identity}
    )

    return jsonify({
        'status': 'success',
        'message': '登录成功',
        'token': token,
        'user': user.to_dict()
    })


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    username = get_jwt_identity()
    claims = get_jwt()
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'status': 'error', 'message': '用户不存在'}), 404

    result = user.to_dict()

    # Attach profile info
    if user.identity == 'doctor' and user.doctor_profile:
        result['profile'] = user.doctor_profile.to_dict()
    elif user.identity == 'patient' and user.patient_profile:
        result['profile'] = user.patient_profile.to_dict()

    return jsonify({'status': 'success', 'user': result})
