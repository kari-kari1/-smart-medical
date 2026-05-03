from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.health_record import HealthRecord

health_bp = Blueprint('health', __name__)


@health_bp.route('/<username>', methods=['GET'])
@jwt_required()
def get_health_record(username):
    record = HealthRecord.query.filter_by(username=username).first()
    if not record:
        return jsonify({'status': 'error', 'message': '健康档案不存在'}), 404
    return jsonify({'status': 'success', 'health_record': record.to_dict()})


@health_bp.route('', methods=['POST'])
@jwt_required()
def create_health_record():
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': '请求数据为空'}), 400

    username = data.get('username', '').strip()
    if not username:
        return jsonify({'status': 'error', 'message': '用户名不能为空'}), 400

    # Check if already exists
    existing = HealthRecord.query.filter_by(username=username).first()
    if existing:
        return jsonify({'status': 'error', 'message': '健康档案已存在，请使用更新接口'}), 409

    record = HealthRecord(
        username=username,
        height=data.get('height'),
        weight=data.get('weight'),
        vital_capacity=data.get('vital_capacity'),
        blood_pressure_high=data.get('blood_pressure_high'),
        blood_pressure_low=data.get('blood_pressure_low'),
        heart_rate=data.get('heart_rate'),
        blood_sugar=data.get('blood_sugar'),
    )
    db.session.add(record)
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': '健康档案创建成功',
        'health_record': record.to_dict()
    }), 201


@health_bp.route('/<username>', methods=['PUT'])
@jwt_required()
def update_health_record(username):
    record = HealthRecord.query.filter_by(username=username).first()
    if not record:
        # Auto create
        record = HealthRecord(username=username)
        db.session.add(record)

    data = request.get_json()
    if 'height' in data:
        record.height = data['height']
    if 'weight' in data:
        record.weight = data['weight']
    if 'vital_capacity' in data:
        record.vital_capacity = data['vital_capacity']
    if 'blood_pressure_high' in data:
        record.blood_pressure_high = data['blood_pressure_high']
    if 'blood_pressure_low' in data:
        record.blood_pressure_low = data['blood_pressure_low']
    if 'heart_rate' in data:
        record.heart_rate = data['heart_rate']
    if 'blood_sugar' in data:
        record.blood_sugar = data['blood_sugar']

    db.session.commit()
    return jsonify({
        'status': 'success',
        'message': '健康档案更新成功',
        'health_record': record.to_dict()
    })
