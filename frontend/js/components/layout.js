// AppLayout Component - Shared sidebar layout
const AppLayout = {
    template: `
    <div class="app-layout">
        <aside class="app-sidebar">
            <div class="sidebar-header">
                <div class="logo-sm">&#x1F3E5;</div>
                <h2>智慧医疗</h2>
                <div class="user-info">{{ authStore.user?.identity === 'doctor' ? '医生端' : '患者端' }}</div>
            </div>
            <nav class="sidebar-menu">
                <template v-if="authStore.isPatient">
                    <router-link to="/patient/dashboard" class="menu-item" :class="{ active: $route.path === '/patient/dashboard' }">
                        <span class="icon">&#x1F3E0;</span><span>首页</span>
                    </router-link>
                    <router-link to="/patient/register" class="menu-item" :class="{ active: $route.path === '/patient/register' }">
                        <span class="icon">&#x1F4CB;</span><span>预约挂号</span>
                    </router-link>
                    <router-link to="/patient/health" class="menu-item" :class="{ active: $route.path === '/patient/health' }">
                        <span class="icon">&#x2764;</span><span>健康档案</span>
                    </router-link>
                    <router-link to="/patient/viewcase" class="menu-item" :class="{ active: $route.path === '/patient/viewcase' }">
                        <span class="icon">&#x1F4C4;</span><span>查看病历</span>
                    </router-link>
                    <router-link to="/patient/chat" class="menu-item" :class="{ active: $route.path === '/patient/chat' }">
                        <span class="icon">&#x1F4AC;</span><span>医患沟通</span>
                        <span v-if="chatStore.totalUnread > 0" class="badge" style="margin-left:auto;background:#f56c6c;color:#fff;border-radius:10px;padding:1px 6px;font-size:11px;">{{ chatStore.totalUnread }}</span>
                    </router-link>
                </template>
                <template v-if="authStore.isDoctor">
                    <router-link to="/doctor/dashboard" class="menu-item" :class="{ active: $route.path === '/doctor/dashboard' }">
                        <span class="icon">&#x1F3E0;</span><span>首页</span>
                    </router-link>
                    <router-link to="/doctor/caseedit" class="menu-item" :class="{ active: $route.path === '/doctor/caseedit' }">
                        <span class="icon">&#x1F4DD;</span><span>病历处方</span>
                    </router-link>
                    <router-link to="/doctor/profile" class="menu-item" :class="{ active: $route.path === '/doctor/profile' }">
                        <span class="icon">&#x1F464;</span><span>个人信息</span>
                    </router-link>
                    <router-link to="/doctor/checkin" class="menu-item" :class="{ active: $route.path === '/doctor/checkin' }">
                        <span class="icon">&#x2705;</span><span>签到打卡</span>
                    </router-link>
                    <router-link to="/doctor/chat" class="menu-item" :class="{ active: $route.path === '/doctor/chat' }">
                        <span class="icon">&#x1F4AC;</span><span>医患沟通</span>
                        <span v-if="chatStore.totalUnread > 0" class="badge" style="margin-left:auto;background:#f56c6c;color:#fff;border-radius:10px;padding:1px 6px;font-size:11px;">{{ chatStore.totalUnread }}</span>
                    </router-link>
                </template>
            </nav>
            <div class="sidebar-footer">
                <div class="menu-item" @click="handleLogout">
                    <span class="icon">&#x1F6AA;</span><span>退出登录</span>
                </div>
            </div>
        </aside>
        <main class="app-main">
            <slot></slot>
        </main>
    </div>
    `,
    setup() {
        const authStore = useAuthStore();
        const chatStore = useChatStore();
        const router = VueRouter.useRouter();

        const handleLogout = () => {
            chatStore.disconnect();
            authStore.logout();
            router.push('/login');
        };

        return { authStore, chatStore, handleLogout };
    },
};
