from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.opinion import Opinion

opinion_bp = Blueprint('opinion', __name__)


@opinion_bp.route('', methods=['POST'])
@jwt_required()
def create_opinion():
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': '请求数据为空'}), 400

    patient_name = data.get('patient_name', '').strip()
    doctor_name = data.get('doctor_name', '').strip()
    opinion_text = data.get('opinion', '').strip()

    if not all([patient_name, doctor_name, opinion_text]):
        return jsonify({'status': 'error', 'message': '请填写完整的意见信息'}), 400

    opinion = Opinion(
        patient_name=patient_name,
        doctor_name=doctor_name,
        opinion=opinion_text
    )
    db.session.add(opinion)
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': '意见提交成功',
        'opinion': opinion.to_dict()
    }), 201


@opinion_bp.route('/doctor/<username>', methods=['GET'])
@jwt_required()
def get_opinions_by_doctor(username):
    opinions = Opinion.query.filter_by(doctor_name=username)\
        .order_by(Opinion.created_at.desc()).all()
    return jsonify({
        'status': 'success',
        'opinions': [o.to_dict() for o in opinions]
    })


@opinion_bp.route('/patient/<username>', methods=['GET'])
@jwt_required()
def get_opinions_by_patient(username):
    opinions = Opinion.query.filter_by(patient_name=username)\
        .order_by(Opinion.created_at.desc()).all()
    return jsonify({
        'status': 'success',
        'opinions': [o.to_dict() for o in opinions]
    })


@opinion_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_opinion(id):
    opinion = Opinion.query.get(id)
    if not opinion:
        return jsonify({'status': 'error', 'message': '意见不存在'}), 404

    db.session.delete(opinion)
    db.session.commit()
    return jsonify({'status': 'success', 'message': '意见已删除'})
