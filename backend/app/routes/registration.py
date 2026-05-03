from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.registration import Registration
from ..models.patient import Patient
from ..models.doctor import Doctor

registration_bp = Blueprint('registration', __name__)


@registration_bp.route('', methods=['GET'])
@jwt_required()
def get_all_registrations():
    regs = Registration.query.order_by(Registration.created_at.desc()).all()
    return jsonify({
        'status': 'success',
        'registrations': [r.to_dict() for r in regs]
    })


@registration_bp.route('', methods=['POST'])
@jwt_required()
def create_registration():
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': '请求数据为空'}), 400

    username = data.get('username', '').strip()
    doctor_username = data.get('doctor_username', '').strip()
    examination_time = data.get('examination_time', '').strip()
    symptom = data.get('symptom', '').strip()
    room = data.get('room', '').strip()

    if not all([username, doctor_username, examination_time, symptom]):
        return jsonify({'status': 'error', 'message': '请填写完整的挂号信息'}), 400

    # Verify patient and doctor exist
    patient = Patient.query.filter_by(username=username).first()
    if not patient:
        return jsonify({'status': 'error', 'message': '患者不存在'}), 404

    doctor = Doctor.query.filter_by(username=doctor_username).first()
    if not doctor:
        return jsonify({'status': 'error', 'message': '医生不存在'}), 404

    if not room:
        room = doctor.room

    reg = Registration(
        patient_username=username,
        doctor_username=doctor_username,
        examination_time=examination_time,
        room=room,
        symptom=symptom,
        status='待就诊'
    )
    db.session.add(reg)

    # Update patient status
    patient.registration_status = '已挂号'

    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': '挂号成功',
        'registration': reg.to_dict()
    }), 201


@registration_bp.route('/patient/<username>', methods=['GET'])
@jwt_required()
def get_registrations_by_patient(username):
    regs = Registration.query.filter_by(patient_username=username)\
        .order_by(Registration.created_at.desc()).all()
    return jsonify({
        'status': 'success',
        'registrations': [r.to_dict() for r in regs]
    })


@registration_bp.route('/doctor/<username>', methods=['GET'])
@jwt_required()
def get_registrations_by_doctor(username):
    regs = Registration.query.filter_by(doctor_username=username)\
        .order_by(Registration.created_at.desc()).all()
    return jsonify({
        'status': 'success',
        'registrations': [r.to_dict() for r in regs]
    })


@registration_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_registration(id):
    reg = Registration.query.get(id)
    if not reg:
        return jsonify({'status': 'error', 'message': '挂号记录不存在'}), 404

    data = request.get_json()
    if 'status' in data:
        reg.status = data['status']
    if 'examination_time' in data:
        reg.examination_time = data['examination_time']
    if 'room' in data:
        reg.room = data['room']

    db.session.commit()
    return jsonify({
        'status': 'success',
        'message': '挂号信息更新成功',
        'registration': reg.to_dict()
    })


@registration_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_registration(id):
    reg = Registration.query.get(id)
    if not reg:
        return jsonify({'status': 'error', 'message': '挂号记录不存在'}), 404

    # Update patient status
    patient = Patient.query.filter_by(username=reg.patient_username).first()
    if patient:
        other_regs = Registration.query.filter(
            Registration.patient_username == reg.patient_username,
            Registration.id != reg.id,
            Registration.status == '待就诊'
        ).count()
        if other_regs == 0:
            patient.registration_status = '未挂号'

    db.session.delete(reg)
    db.session.commit()

    return jsonify({'status': 'success', 'message': '挂号记录已删除'})
