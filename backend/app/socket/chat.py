from flask_socketio import emit, join_room, leave_room
from flask import request
from datetime import datetime

# Online users: {username: sid}
online_users = {}


def register_chat_events(socketio):

    @socketio.on('connect')
    def handle_connect():
        print(f'Client connected: {request.sid}')

    @socketio.on('disconnect')
    def handle_disconnect():
        # Remove from online users
        username = None
        for user, sid in online_users.items():
            if sid == request.sid:
                username = user
                break
        if username:
            del online_users[username]
            emit('user_offline', {'username': username}, broadcast=True, include_self=True)
            print(f'User offline: {username}')

    @socketio.on('user_online')
    def handle_user_online(data):
        username = data.get('username')
        if not username:
            return

        # 更新 online_users（可能sid变了）
        old_sid = online_users.get(username)
        if old_sid != request.sid:
            online_users[username] = request.sid
            # 广播上线事件给其他人
            emit('user_online', {'username': username}, broadcast=True, include_self=False)
            # 告诉新上线的用户当前所有在线用户
            emit('all_online_users', {'users': list(online_users.keys())})
            print(f'User online: {username}, all online: {list(online_users.keys())}')

    @socketio.on('send_message')
    def handle_send_message(data):
        sender = data.get('sender')
        receiver = data.get('receiver')
        content = data.get('content')
        msg_type = data.get('msg_type', 'text')

        if not all([sender, receiver, content]):
            emit('error', {'message': '消息数据不完整'})
            return

        # Save to database
        try:
            from .. import db
            from ..models.chat_message import ChatMessage
            from .. import create_app

            msg = ChatMessage(
                sender=sender,
                receiver=receiver,
                content=content,
                msg_type=msg_type,
                is_read=False
            )
            db.session.add(msg)
            db.session.commit()

            msg_data = msg.to_dict()
        except Exception as e:
            msg_data = {
                'sender': sender,
                'receiver': receiver,
                'content': content,
                'msg_type': msg_type,
                'is_read': False,
                'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            }

        # Send to receiver if online
        receiver_sid = online_users.get(receiver)
        if receiver_sid:
            emit('receive_message', msg_data, room=receiver_sid)

        # Send back to sender for confirmation
        emit('message_sent', msg_data)

    @socketio.on('mark_read')
    def handle_mark_read(data):
        sender = data.get('sender')
        receiver = data.get('receiver')
        if not all([sender, receiver]):
            return

        try:
            from .. import db
            from ..models.chat_message import ChatMessage
            ChatMessage.query.filter_by(
                sender=sender, receiver=receiver, is_read=False
            ).update({'is_read': True})
            db.session.commit()
        except Exception:
            pass

        # Notify sender
        sender_sid = online_users.get(sender)
        if sender_sid:
            emit('messages_read', {'reader': receiver}, room=sender_sid)

    @socketio.on('get_history')
    def handle_get_history(data):
        user1 = data.get('user1')
        user2 = data.get('user2')
        page = data.get('page', 1)
        per_page = data.get('per_page', 50)

        if not all([user1, user2]):
            emit('error', {'message': '参数不完整'})
            return

        try:
            from ..models.chat_message import ChatMessage
            messages = ChatMessage.query.filter(
                ((ChatMessage.sender == user1) & (ChatMessage.receiver == user2)) |
                ((ChatMessage.sender == user2) & (ChatMessage.receiver == user1))
            ).order_by(ChatMessage.created_at.desc()).paginate(
                page=page, per_page=per_page, error_out=False
            )
            emit('history_messages', {
                'messages': [m.to_dict() for m in reversed(messages.items)],
                'total': messages.total,
                'page': page
            })
        except Exception as e:
            emit('error', {'message': f'获取历史消息失败: {str(e)}'})

    @socketio.on('get_online_users')
    def handle_get_online_users():
        emit('all_online_users', {'users': list(online_users.keys())})