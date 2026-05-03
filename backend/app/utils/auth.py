import bcrypt
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt, verify_jwt_in_request


def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def get_current_user():
    """Get current username from JWT."""
    return get_jwt_identity()


def get_current_identity():
    """Get current user identity (patient/doctor) from JWT claims."""
    claims = get_jwt()
    return claims.get('identity', '')


def identity_required(*identities):
    """Decorator to require specific identity (patient/doctor)."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get('identity') not in identities:
                return jsonify({'status': 'error', 'message': '无权限访问'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
