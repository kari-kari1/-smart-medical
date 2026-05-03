from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.prescription import Prescription
from ..models.patient import Patient

prescription_bp = Blueprint('prescription', __name__)


@prescription_bp.route('', methods=['GET'])
@jwt_required()
def get_all_prescriptions():
    prescriptions = Prescription.query.order_by(Prescription.created_at.desc()).all()
    return jsonify({
        'status': 'success',
        'prescriptions': [p.to_dict() for p in prescriptions]
    })


@prescription_bp.route('', methods=['POST'])
@jwt_required()
def create_prescription():
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': '请求数据为空'}), 400

    patient_username = data.get('patient_username', '').strip()
    doctor_username = data.get('doctor_username', '').strip()
    prescription_content = data.get('prescription_content', '').strip()
    doctor_advice = data.get('doctor_advice', '').strip()
    total_amount = data.get('total_amount', 0)

    if not all([patient_username, doctor_username, prescription_content, doctor_advice]):
        return jsonify({'status': 'error', 'message': '请填写完整的处方信息'}), 400

    # Verify patient exists
    patient = Patient.query.filter_by(username=patient_username).first()
    if not patient:
        return jsonify({'status': 'error', 'message': '患者不存在'}), 404

    try:
        total_amount = float(total_amount)
    except (ValueError, TypeError):
        return jsonify({'status': 'error', 'message': '金额格式不正确'}), 400

    prescription = Prescription(
        patient_username=patient_username,
        doctor_username=doctor_username,
        prescription_content=prescription_content,
        doctor_advice=doctor_advice,
        total_amount=total_amount
    )
    db.session.add(prescription)

    # Update patient status
    patient.registration_status = '已完成'

    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': '处方添加成功',
        'prescription': prescription.to_dict()
    }), 201


@prescription_bp.route('/patient/<username>', methods=['GET'])
@jwt_required()
def get_prescriptions_by_patient(username):
    prescriptions = Prescription.query.filter_by(patient_username=username)\
        .order_by(Prescription.created_at.desc()).all()
    return jsonify({
        'status': 'success',
        'prescriptions': [p.to_dict() for p in prescriptions]
    })


@prescription_bp.route('/doctor/<username>', methods=['GET'])
@jwt_required()
def get_prescriptions_by_doctor(username):
    prescriptions = Prescription.query.filter_by(doctor_username=username)\
        .order_by(Prescription.created_at.desc()).all()
    return jsonify({
        'status': 'success',
        'prescriptions': [p.to_dict() for p in prescriptions]
    })


@prescription_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_prescription(id):
    prescription = Prescription.query.get(id)
    if not prescription:
        return jsonify({'status': 'error', 'message': '处方不存在'}), 404

    data = request.get_json()
    if 'prescription_content' in data:
        prescription.prescription_content = data['prescription_content']
    if 'doctor_advice' in data:
        prescription.doctor_advice = data['doctor_advice']
    if 'total_amount' in data:
        prescription.total_amount = float(data['total_amount'])

    db.session.commit()
    return jsonify({
        'status': 'success',
        'message': '处方更新成功',
        'prescription': prescription.to_dict()
    })


@prescription_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_prescription(id):
    prescription = Prescription.query.get(id)
    if not prescription:
        return jsonify({'status': 'error', 'message': '处方不存在'}), 404

    db.session.delete(prescription)
    db.session.commit()
    return jsonify({'status': 'success', 'message': '处方已删除'})
