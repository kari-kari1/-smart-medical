from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.patient import Patient

patient_bp = Blueprint('patient', __name__)


@patient_bp.route('', methods=['GET'])
@jwt_required()
def get_all_patients():
    patients = Patient.query.all()
    return jsonify({
        'status': 'success',
        'patients': [p.to_dict() for p in patients]
    })


@patient_bp.route('/<username>', methods=['GET'])
@jwt_required()
def get_patient(username):
    patient = Patient.query.filter_by(username=username).first()
    if not patient:
        return jsonify({'status': 'error', 'message': '患者不存在'}), 404
    return jsonify({'status': 'success', 'patient': patient.to_dict()})


@patient_bp.route('/<username>', methods=['PUT'])
@jwt_required()
def update_patient(username):
    patient = Patient.query.filter_by(username=username).first()
    if not patient:
        return jsonify({'status': 'error', 'message': '患者不存在'}), 404

    data = request.get_json()
    if 'registration_status' in data:
        patient.registration_status = data['registration_status']

    db.session.commit()
    return jsonify({
        'status': 'success',
        'message': '患者信息更新成功',
        'patient': patient.to_dict()
    })
