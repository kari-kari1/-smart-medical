import os
import getpass

# Fix PyMySQL on Windows: ensure USER is set
if not os.environ.get('USER'):
    os.environ['USER'] = os.environ.get('USERNAME', 'HP')

# Patch getuser to avoid 'pwd' module error on Windows
_original_getuser = getpass.getuser
def _safe_getuser():
    try:
        return _original_getuser()
    except (ImportError, OSError):
        return os.environ.get('USERNAME', os.environ.get('USER', 'HP'))
getpass.getuser = _safe_getuser

from app import create_app, socketio

app = create_app()

if __name__ == '__main__':
    print('='*50)
    print('  智慧医疗管理系统后端启动中...')
    print('  API地址: http://127.0.0.1:5000')
    print('='*50)
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
