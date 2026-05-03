// Patient Dashboard
const PatientDashboard = {
    template: `
    <app-layout>
        <div class="dashboard-welcome">
            <h2>您好，{{ authStore.username }}！</h2>
            <p>欢迎使用智慧医疗管理系统，在这里您可以便捷地进行预约挂号、查看病历和健康档案管理。</p>
        </div>
        <div class="stat-cards">
            <div class="stat-card">
                <div class="stat-icon blue">&#x1F4CB;</div>
                <div class="stat-info">
                    <h3>{{ stats.regCount }}</h3>
                    <p>挂号记录</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">&#x1F48A;</div>
                <div class="stat-info">
                    <h3>{{ stats.prescCount }}</h3>
                    <p>处方记录</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange">&#x1F4AC;</div>
                <div class="stat-info">
                    <h3>{{ stats.msgCount }}</h3>
                    <p>未读消息</p>
                </div>
            </div>
        </div>
        <h3 class="page-title">快捷功能</h3>
        <div class="func-cards">
            <div class="func-card" @click="$router.push('/patient/register')">
                <div class="card-icon" style="background:#ecf5ff;color:#409EFF;">&#x1F4CB;</div>
                <h3>预约挂号</h3>
                <p>选择科室和医生，快速完成在线预约挂号</p>
            </div>
            <div class="func-card" @click="$router.push('/patient/health')">
                <div class="card-icon" style="background:#f0f9eb;color:#67C23A;">&#x2764;</div>
                <h3>健康档案</h3>
                <p>查看和管理您的个人健康档案数据</p>
            </div>
            <div class="func-card" @click="$router.push('/patient/viewcase')">
                <div class="card-icon" style="background:#fdf6ec;color:#E6A23C;">&#x1F4C4;</div>
                <h3>查看病历</h3>
                <p>查看历史挂号记录和处方信息</p>
            </div>
            <div class="func-card" @click="$router.push('/patient/chat')">
                <div class="card-icon" style="background:#fef0f0;color:#F56C6C;">&#x1F4AC;</div>
                <h3>医患沟通</h3>
                <p>与医生进行实时在线沟通交流</p>
            </div>
        </div>
    </app-layout>
    `,
    setup() {
        const authStore = useAuthStore();
        const chatStore = useChatStore();
        const stats = Vue.reactive({ regCount: 0, prescCount: 0, msgCount: 0 });

        Vue.onMounted(async () => {
            try {
                const [regRes, prescRes] = await Promise.all([
                    registrationApi.getByPatient(authStore.username),
                    prescriptionApi.getByPatient(authStore.username),
                ]);
                stats.regCount = regRes.data.registrations?.length || 0;
                stats.prescCount = prescRes.data.prescriptions?.length || 0;
                stats.msgCount = chatStore.totalUnread;
            } catch (e) { /* ignore */ }
        });

        return { authStore, chatStore, stats };
    },
};
