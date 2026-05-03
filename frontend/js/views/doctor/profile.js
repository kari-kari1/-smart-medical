// Doctor Profile Page
const DoctorProfile = {
    template: `
    <app-layout>
        <h3 class="page-title">个人信息</h3>
        <div class="content-card">
            <div class="card-title">&#x1F464; 医生资料</div>
            <el-form :model="profileForm" label-width="120px" style="max-width:700px;">
                <el-form-item label="用户名">
                    <el-input :value="authStore.username" disabled />
                </el-form-item>
                <el-form-item label="真实姓名">
                    <el-input v-model="profileForm.real_name" placeholder="请输入真实姓名" />
                </el-form-item>
                <el-form-item label="所属科室">
                    <el-select v-model="profileForm.department" placeholder="请选择科室" style="width:100%;">
                        <el-option v-for="dept in departments" :key="dept" :label="dept" :value="dept" />
                    </el-select>
                </el-form-item>
                <el-form-item label="诊室">
                    <el-input v-model="profileForm.room" placeholder="如：301诊室" />
                </el-form-item>
                <el-form-item label="出诊时间">
                    <el-input v-model="profileForm.consultation_time" placeholder="如：周一至周五 8:00-12:00" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :loading="saving" @click="saveProfile">保存修改</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 我的统计 -->
        <div class="content-card">
            <div class="card-title">&#x1F4CA; 我的工作统计</div>
            <div class="stat-cards">
                <div class="stat-card">
                    <div class="stat-icon blue">&#x1F4CB;</div>
                    <div class="stat-info">
                        <h3>{{ stats.totalRegs }}</h3>
                        <p>总挂号数</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">&#x1F48A;</div>
                    <div class="stat-info">
                        <h3>{{ stats.totalPresc }}</h3>
                        <p>总处方数</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange">&#x1F4AC;</div>
                    <div class="stat-info">
                        <h3>{{ stats.totalOpinions }}</h3>
                        <p>收到意见</p>
                    </div>
                </div>
            </div>
        </div>
    </app-layout>
    `,
    setup() {
        const authStore = useAuthStore();
        const saving = Vue.ref(false);
        const departments = ['内科', '外科', '儿科', '妇产科', '眼科', '耳鼻喉科', '口腔科', '皮肤科', '中医科', '急诊科'];
        const profileForm = Vue.reactive({
            real_name: '',
            department: '',
            room: '',
            consultation_time: '',
        });
        const stats = Vue.reactive({ totalRegs: 0, totalPresc: 0, totalOpinions: 0 });

        Vue.onMounted(async () => {
            try {
                const [docRes, regRes, prescRes, opRes] = await Promise.all([
                    doctorApi.get(authStore.username),
                    registrationApi.getByDoctor(authStore.username),
                    prescriptionApi.getByDoctor(authStore.username),
                    opinionApi.getByDoctor(authStore.username),
                ]);
                const doc = docRes.data.doctor;
                if (doc) {
                    profileForm.department = doc.department || '';
                    profileForm.room = doc.room || '';
                    profileForm.consultation_time = doc.consultation_time || '';
                    profileForm.real_name = doc.real_name || '';
                }
                stats.totalRegs = (regRes.data.registrations || []).length;
                stats.totalPresc = (prescRes.data.prescriptions || []).length;
                stats.totalOpinions = (opRes.data.opinions || []).length;
            } catch (e) { /* ignore */ }
        });

        const saveProfile = async () => {
            saving.value = true;
            try {
                const res = await doctorApi.update(authStore.username, profileForm);
                if (res.data.status === 'success') {
                    ElementPlus.ElMessage.success('个人信息保存成功');
                } else {
                    ElementPlus.ElMessage.error(res.data.message || '保存失败');
                }
            } catch (err) {
                ElementPlus.ElMessage.error('保存失败');
            } finally {
                saving.value = false;
            }
        };

        return { authStore, departments, profileForm, saving, stats, saveProfile };
    },
};
