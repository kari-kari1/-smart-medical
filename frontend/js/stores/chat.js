// Chat Store (Pinia)
const useChatStore = Pinia.defineStore('chat', {
    state: () => ({
        socket: null,
        connected: false,
        username: '',           // 当前用户名
        contacts: [],           // [{username, real_name, lastMsg, unread, online}]
        currentChat: null,      // 当前聊天对象 username
        messages: {},           // {username: [{id, sender, receiver, content, created_at, ...}]}
    }),
    actions: {
        initSocket(username) {
            this.username = username;  // 保存用户名

            if (this.socket) {
                this.socket.disconnect();
            }
            this.socket = io('http://127.0.0.1:5000', {
                transports: ['websocket', 'polling'],
                reconnection: true,
            });

            this.socket.on('connect', () => {
                this.connected = true;
                console.log('Socket connected');
                // 延迟发送上线通知，等待连接完全建立
                setTimeout(() => {
                    this.socket.emit('user_online', { username });
                    // 同时请求所有在线用户列表
                    this.socket.emit('get_online_users');
                }, 300);
            });

            this.socket.on('disconnect', () => {
                this.connected = false;
                console.log('Socket disconnected');
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            this.socket.on('error', (data) => {
                console.error('Socket error:', data);
                ElementPlus.ElMessage.error(data.message || '连接错误');
            });

            // 收到所有在线用户列表
            this.socket.on('all_online_users', (data) => {
                console.log('All online users:', data.users);
                const onlineUsers = data.users || [];
                // 更新所有联系人的在线状态
                this.contacts.forEach(contact => {
                    contact.online = onlineUsers.includes(contact.username);
                });
            });

            // 收到用户上线事件
            this.socket.on('user_online', (data) => {
                const onlineUser = data.username;
                if (onlineUser === this.username) return; // 忽略自己的上线事件

                console.log('User online event:', onlineUser);

                // 在 contacts 中查找或创建联系人
                const contact = this.contacts.find(c => c.username === onlineUser);
                if (contact) {
                    // 已存在，更新在线状态
                    contact.online = true;
                } else {
                    // 对方不在列表中，添加为新联系人
                    this.contacts.push({
                        username: onlineUser,
                        real_name: onlineUser,
                        lastMsg: '',
                        unread: 0,
                        online: true,
                    });
                }
            });

            // 收到用户离线事件
            this.socket.on('user_offline', (data) => {
                if (data.username === this.username) return; // 忽略自己的离线事件
                console.log('User offline event:', data.username);
                const contact = this.contacts.find(c => c.username === data.username);
                if (contact) {
                    contact.online = false;
                }
            });

            this.socket.on('receive_message', (msg) => {
                console.log('Received message:', msg);
                const other = msg.sender;
                if (!this.messages[other]) {
                    this.messages[other] = [];
                }
                this.messages[other].push(msg);

                // Update contact
                const contact = this.contacts.find(c => c.username === other);
                if (contact) {
                    contact.lastMsg = msg.content;
                    if (this.currentChat !== other) {
                        contact.unread = (contact.unread || 0) + 1;
                    }
                } else {
                    // 收到消息的发件人不在列表中，添加为联系人
                    this.contacts.push({
                        username: other,
                        real_name: other,
                        lastMsg: msg.content,
                        unread: this.currentChat === other ? 0 : 1,
                        online: true, // 发消息说明对方在线
                    });
                }

                // Mark read if currently chatting
                if (this.currentChat === other) {
                    this.markRead(other);
                }
            });

            this.socket.on('message_sent', (msg) => {
                console.log('Message sent confirmation:', msg);
                const other = msg.receiver;
                if (!this.messages[other]) {
                    this.messages[other] = [];
                }
                // 检查是否已经添加（避免重复）
                const exists = this.messages[other].some(m => m.id === msg.id || m.created_at === msg.created_at);
                if (!exists) {
                    this.messages[other].push(msg);
                }

                // Update contact
                const contact = this.contacts.find(c => c.username === other);
                if (contact) {
                    contact.lastMsg = msg.content;
                }
            });

            this.socket.on('history_messages', (data) => {
                console.log('History messages:', data);
                if (data.messages && data.messages.length > 0) {
                    const other = data.messages[0].sender === this.username
                        ? data.messages[0].receiver
                        : data.messages[0].sender;
                    this.messages[other] = data.messages;

                    // 同时把对方加入联系人列表
                    let contact = this.contacts.find(c => c.username === other);
                    if (!contact) {
                        this.contacts.push({
                            username: other,
                            real_name: other,
                            lastMsg: data.messages[data.messages.length - 1]?.content || '',
                            unread: 0,
                            online: false,
                        });
                    }
                }
            });

            this.socket.on('messages_read', (data) => {
                // Could update UI to show read status
            });
        },

        sendMessage(receiver, content) {
            if (!this.socket || !content.trim()) return;
            console.log('Sending message:', { sender: this.username, receiver, content });
            this.socket.emit('send_message', {
                sender: this.username,
                receiver,
                content: content.trim(),
                msg_type: 'text',
            });
        },

        loadHistory(otherUser) {
            if (!this.socket) return;
            console.log('Loading history with:', otherUser);
            this.socket.emit('get_history', {
                user1: this.username,
                user2: otherUser,
                page: 1,
                per_page: 100,
            });
        },

        markRead(otherUser) {
            if (!this.socket) return;
            this.socket.emit('mark_read', {
                sender: otherUser,
                receiver: this.username,
            });
            const contact = this.contacts.find(c => c.username === otherUser);
            if (contact) contact.unread = 0;
        },

        selectChat(username) {
            this.currentChat = username;
            if (!this.messages[username]) {
                this.messages[username] = [];
            }
            this.markRead(username);
            this.loadHistory(username);
        },

        disconnect() {
            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
            }
        },
    },
    getters: {
        currentMessages: (state) => {
            return state.messages[state.currentChat] || [];
        },
        totalUnread: (state) => {
            return state.contacts.reduce((sum, c) => sum + (c.unread || 0), 0);
        },
    },
});