from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.doctor import Doctor
from ..models.user import User

doctor_bp = Blueprint('doctor', __name__)


@doctor_bp.route('', methods=['GET'])
@jwt_required()
def get_all_doctors():
    doctors = Doctor.query.all()
    result = []
    for d in doctors:
        data = d.to_dict()
        if d.user:
            data['real_name'] = d.user.real_name or d.username
        result.append(data)
    return jsonify({'status': 'success', 'doctors': result})


@doctor_bp.route('/department/<department>', methods=['GET'])
@jwt_required()
def get_doctors_by_department(department):
    doctors = Doctor.query.filter_by(department=department).all()
    result = []
    for d in doctors:
        data = d.to_dict()
        if d.user:
            data['real_name'] = d.user.real_name or d.username
        result.append(data)
    return jsonify({'status': 'success', 'doctors': result})


@doctor_bp.route('/<username>', methods=['GET'])
@jwt_required()
def get_doctor(username):
    doctor = Doctor.query.filter_by(username=username).first()
    if not doctor:
        return jsonify({'status': 'error', 'message': '医生不存在'}), 404
    return jsonify({'status': 'success', 'doctor': doctor.to_dict()})


@doctor_bp.route('/<username>', methods=['PUT'])
@jwt_required()
def update_doctor(username):
    doctor = Doctor.query.filter_by(username=username).first()
    if not doctor:
        return jsonify({'status': 'error', 'message': '医生不存在'}), 404

    data = request.get_json()
    if 'room' in data:
        doctor.room = data['room']
    if 'department' in data:
        doctor.department = data['department']
    if 'consultation_time' in data:
        doctor.consultation_time = data['consultation_time']

    db.session.commit()
    return jsonify({
        'status': 'success',
        'message': '医生信息更新成功',
        'doctor': doctor.to_dict()
    })


@doctor_bp.route('/<username>/checkin', methods=['POST'])
@jwt_required()
def doctor_checkin(username):
    doctor = Doctor.query.filter_by(username=username).first()
    if not doctor:
        return jsonify({'status': 'error', 'message': '医生不存在'}), 404

    data = request.get_json()
    if 'room' in data:
        doctor.room = data['room']
    if 'department' in data:
        doctor.department = data['department']
    if 'consultation_time' in data:
        doctor.consultation_time = data['consultation_time']

    db.session.commit()
    return jsonify({
        'status': 'success',
        'message': '签到成功',
        'doctor': doctor.to_dict()
    })
