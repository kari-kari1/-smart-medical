// Doctor Chat Page
const DoctorChat = {
    template: `
    <app-layout>
        <div class="chat-layout">
            <div class="chat-sidebar">
                <div class="chat-sidebar-header">
                    <h3>患者列表</h3>
                    <el-input v-model="searchText" placeholder="搜索患者..." size="small" clearable />
                </div>
                <div class="contact-list">
                    <div v-if="filteredContacts.length === 0" style="padding:20px;text-align:center;color:#c0c4cc;font-size:13px;">
                        暂无联系人
                    </div>
                    <div v-for="contact in filteredContacts" :key="contact.username"
                         class="contact-item" :class="{ active: chatStore.currentChat === contact.username }"
                         @click="selectContact(contact)">
                        <div class="avatar">{{ (contact.real_name || contact.username).charAt(0) }}</div>
                        <div class="contact-info">
                            <div class="name">{{ contact.real_name || contact.username }}</div>
                            <div class="last-msg">{{ contact.lastMsg || '暂无消息' }}</div>
                        </div>
                        <span v-if="contact.unread > 0" class="badge">{{ contact.unread }}</span>
                        <span :class="contact.online ? 'online-dot' : 'offline-dot'" style="margin-left:4px;"></span>
                    </div>
                </div>
            </div>
            <div class="chat-main" v-if="chatStore.currentChat">
                <div class="chat-header">
                    <span>{{ currentContactName }}</span>
                    <span :class="isCurrentOnline ? 'online-dot' : 'offline-dot'" style="margin-left:8px;"></span>
                    <span style="font-size:12px;color:#909399;margin-left:4px;">{{ isCurrentOnline ? '在线' : '离线' }}</span>
                </div>
                <div class="chat-messages" ref="messagesRef">
                    <div v-for="msg in chatStore.currentMessages" :key="msg.id || msg.created_at"
                         class="msg-item" :class="msg.sender === authStore.username ? 'sent' : 'received'">
                        <span class="msg-time">{{ msg.created_at }}</span>
                        <div class="msg-bubble">{{ msg.content }}</div>
                    </div>
                    <div v-if="chatStore.currentMessages.length === 0" style="text-align:center;color:#c0c4cc;padding:40px;">
                        暂无消息，开始聊天吧
                    </div>
                </div>
                <div class="chat-input-area">
                    <el-input v-model="inputMsg" placeholder="输入消息..." @keyup.enter="sendMessage" />
                    <el-button type="primary" @click="sendMessage">发送</el-button>
                </div>
            </div>
            <div class="chat-empty" v-else>
                <div style="text-align:center;">
                    <div style="font-size:64px;margin-bottom:16px;">&#x1F4AC;</div>
                    <p>选择患者开始聊天</p>
                </div>
            </div>
        </div>
    </app-layout>
    `,
    setup() {
        const authStore = useAuthStore();
        const chatStore = useChatStore();
        const searchText = Vue.ref('');
        const inputMsg = Vue.ref('');
        const messagesRef = Vue.ref(null);
        const patients = Vue.ref([]);

        Vue.onMounted(async () => {
            if (!chatStore.socket) {
                chatStore.initSocket(authStore.username);
            }

            // Load patients and add to contacts
            try {
                const res = await patientApi.getAll();
                const patientList = res.data.patients || [];
                patientList.forEach(p => {
                    const username = p.username;
                    // 检查是否已在 contacts 中
                    let contact = chatStore.contacts.find(c => c.username === username);
                    if (!contact) {
                        chatStore.contacts.push({
                            username: username,
                            real_name: username,
                            lastMsg: '',
                            unread: 0,
                            online: false,
                        });
                    }
                });
                patients.value = patientList;
            } catch (e) { /* ignore */ }
        });

        const filteredContacts = Vue.computed(() => {
            const list = chatStore.contacts;
            if (!searchText.value) return list;
            return list.filter(p =>
                p.username.includes(searchText.value) ||
                (p.real_name && p.real_name.includes(searchText.value))
            );
        });

        const currentContactName = Vue.computed(() => {
            const contact = chatStore.contacts.find(c => c.username === chatStore.currentChat);
            return contact ? (contact.real_name || contact.username) : chatStore.currentChat;
        });

        const isCurrentOnline = Vue.computed(() => {
            const contact = chatStore.contacts.find(c => c.username === chatStore.currentChat);
            return contact?.online || false;
        });

        const selectContact = (contact) => {
            chatStore.selectChat(contact.username);
        };

        const sendMessage = () => {
            if (!inputMsg.value.trim() || !chatStore.currentChat) return;
            chatStore.sendMessage(chatStore.currentChat, inputMsg.value);
            inputMsg.value = '';
            Vue.nextTick(() => {
                if (messagesRef.value) {
                    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
                }
            });
        };

        Vue.watch(() => chatStore.currentMessages.length, () => {
            Vue.nextTick(() => {
                if (messagesRef.value) {
                    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
                }
            });
        });

        return { authStore, chatStore, searchText, inputMsg, messagesRef, filteredContacts, currentContactName, isCurrentOnline, selectContact, sendMessage };
    },
};