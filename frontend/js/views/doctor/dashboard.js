// Doctor Dashboard
const DoctorDashboard = {
    template: `
    <app-layout>
        <div class="dashboard-welcome">
            <h2>您好，{{ doctorName }}医生！</h2>
            <p>欢迎回到智慧医疗管理系统，今天的工作安排一目了然。</p>
        </div>
        <div class="stat-cards">
            <div class="stat-card">
                <div class="stat-icon blue">&#x1F4CB;</div>
                <div class="stat-info">
                    <h3>{{ stats.regCount }}</h3>
                    <p>今日挂号</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange">&#x23F3;</div>
                <div class="stat-info">
                    <h3>{{ stats.pendingCount }}</h3>
                    <p>待就诊</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">&#x1F48A;</div>
                <div class="stat-info">
                    <h3>{{ stats.prescCount }}</h3>
                    <p>已开处方</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon red">&#x1F4AC;</div>
                <div class="stat-info">
                    <h3>{{ stats.opinionCount }}</h3>
                    <p>收到意见</p>
                </div>
            </div>
        </div>
        <h3 class="page-title">快捷功能</h3>
        <div class="func-cards">
            <div class="func-card" @click="$router.push('/doctor/caseedit')">
                <div class="card-icon" style="background:#ecf5ff;color:#409EFF;">&#x1F4DD;</div>
                <h3>病历处方</h3>
                <p>查看患者挂号，编辑病历和开具处方</p>
            </div>
            <div class="func-card" @click="$router.push('/doctor/profile')">
                <div class="card-icon" style="background:#f0f9eb;color:#67C23A;">&#x1F464;</div>
                <h3>个人信息</h3>
                <p>查看和修改个人资料信息</p>
            </div>
            <div class="func-card" @click="$router.push('/doctor/checkin')">
                <div class="card-icon" style="background:#fdf6ec;color:#E6A23C;">&#x2705;</div>
                <h3>签到打卡</h3>
                <p>每日签到，设置出诊信息</p>
            </div>
            <div class="func-card" @click="$router.push('/doctor/chat')">
                <div class="card-icon" style="background:#fef0f0;color:#F56C6C;">&#x1F4AC;</div>
                <h3>医患沟通</h3>
                <p>与患者进行实时在线沟通</p>
            </div>
        </div>
        <!-- 最近挂号 -->
        <div class="content-card">
            <div class="card-title">&#x1F4CB; 最近挂号记录</div>
            <el-table :data="recentRegs" stripe style="width:100%;" empty-text="暂无挂号记录">
                <el-table-column prop="patient_username" label="患者" width="150" />
                <el-table-column prop="examination_time" label="就诊时间" width="180" />
                <el-table-column prop="symptom" label="症状" show-overflow-tooltip />
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === '待就诊' ? 'warning' : row.status === '已完成' ? 'success' : 'info'" size="small">
                            {{ row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </app-layout>
    `,
    setup() {
        const authStore = useAuthStore();
        const chatStore = useChatStore();
        const doctorName = Vue.ref(authStore.username);
        const stats = Vue.reactive({ regCount: 0, pendingCount: 0, prescCount: 0, opinionCount: 0 });
        const recentRegs = Vue.ref([]);

        Vue.onMounted(async () => {
            try {
                // Load doctor profile for real name
                const docRes = await doctorApi.get(authStore.username);
                if (docRes.data.doctor) {
                    doctorName.value = docRes.data.doctor.real_name || authStore.username;
                }
            } catch (e) { /* ignore */ }

            try {
                const [regRes, prescRes, opRes] = await Promise.all([
                    registrationApi.getByDoctor(authStore.username),
                    prescriptionApi.getByDoctor(authStore.username),
                    opinionApi.getByDoctor(authStore.username),
                ]);
                const regs = regRes.data.registrations || [];
                stats.regCount = regs.length;
                stats.pendingCount = regs.filter(r => r.status === '待就诊').length;
                stats.prescCount = (prescRes.data.prescriptions || []).length;
                stats.opinionCount = (opRes.data.opinions || []).length;
                recentRegs.value = regs.slice(0, 10);
            } catch (e) { /* ignore */ }
        });

        return { authStore, chatStore, doctorName, stats, recentRegs };
    },
};
