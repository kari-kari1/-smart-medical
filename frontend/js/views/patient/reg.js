// Patient Registration (挂号) Page
const PatientRegister = {
    template: `
    <app-layout>
        <h3 class="page-title">预约挂号</h3>

        <!-- 步骤条 -->
        <div class="content-card">
            <div class="reg-steps">
                <div class="step-item">
                    <div class="step-circle" :class="{ active: step >= 1, done: step > 1 }">{{ step > 1 ? '✓' : '1' }}</div>
                    <span class="step-label" :class="{ active: step === 1 }">选择科室</span>
                </div>
                <div class="step-line" :class="{ done: step > 1 }"></div>
                <div class="step-item">
                    <div class="step-circle" :class="{ active: step >= 2, done: step > 2 }">{{ step > 2 ? '✓' : '2' }}</div>
                    <span class="step-label" :class="{ active: step === 2 }">选择医生</span>
                </div>
                <div class="step-line" :class="{ done: step > 2 }"></div>
                <div class="step-item">
                    <div class="step-circle" :class="{ active: step >= 3, done: step > 3 }">{{ step > 3 ? '✓' : '3' }}</div>
                    <span class="step-label" :class="{ active: step === 3 }">填写信息</span>
                </div>
                <div class="step-line" :class="{ done: step > 3 }"></div>
                <div class="step-item">
                    <div class="step-circle" :class="{ active: step >= 4 }">4</div>
                    <span class="step-label" :class="{ active: step === 4 }">确认提交</span>
                </div>
            </div>
        </div>

        <!-- Step 1: 选择科室 -->
        <div class="content-card" v-if="step === 1">
            <div class="card-title">&#x1F3E5; 选择就诊科室</div>
            <div class="func-cards">
                <div v-for="dept in departments" :key="dept" class="func-card" @click="selectDepartment(dept)">
                    <h3>{{ dept }}</h3>
                    <p>点击选择{{ dept }}</p>
                </div>
            </div>
        </div>

        <!-- Step 2: 选择医生 -->
        <div class="content-card" v-if="step === 2">
            <div class="card-title">&#x2695; 选择医生（{{ selectedDept }}）</div>
            <div v-if="doctors.length === 0" class="empty-state">
                <p>该科室暂无医生，请返回选择其他科室</p>
            </div>
            <div class="func-cards" v-else>
                <div v-for="doc in doctors" :key="doc.username" class="func-card" @click="selectDoctor(doc)">
                    <div class="card-icon" style="background:#ecf5ff;color:#409EFF;">&#x1F468;&#x200D;&#x2695;</div>
                    <h3>{{ doc.real_name || doc.username }}</h3>
                    <p>诊室：{{ doc.room || '未设置' }}</p>
                    <p>出诊时间：{{ doc.consultation_time || '未设置' }}</p>
                </div>
            </div>
            <el-button @click="step = 1" style="margin-top:16px;">返回</el-button>
        </div>

        <!-- Step 3: 填写信息 -->
        <div class="content-card" v-if="step === 3">
            <div class="card-title">&#x1F4DD; 填写挂号信息</div>
            <el-form :model="regForm" label-width="100px" style="max-width:600px;">
                <el-form-item label="就诊科室">
                    <el-input :value="selectedDept" disabled />
                </el-form-item>
                <el-form-item label="就诊医生">
                    <el-input :value="selectedDoctor?.real_name || selectedDoctor?.username" disabled />
                </el-form-item>
                <el-form-item label="就诊时间">
                    <el-input v-model="regForm.examination_time" placeholder="如：2026-05-03 上午" />
                </el-form-item>
                <el-form-item label="症状描述">
                    <el-input v-model="regForm.symptom" type="textarea" :rows="4" placeholder="请详细描述您的症状..." />
                </el-form-item>
                <el-form-item>
                    <el-button @click="step = 2">上一步</el-button>
                    <el-button type="primary" @click="step = 4">下一步</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- Step 4: 确认 -->
        <div class="content-card" v-if="step === 4">
            <div class="card-title">&#x2705; 确认挂号信息</div>
            <el-descriptions :column="1" border>
                <el-descriptions-item label="就诊科室">{{ selectedDept }}</el-descriptions-item>
                <el-descriptions-item label="就诊医生">{{ selectedDoctor?.real_name || selectedDoctor?.username }}</el-descriptions-item>
                <el-descriptions-item label="诊室">{{ selectedDoctor?.room || '未设置' }}</el-descriptions-item>
                <el-descriptions-item label="就诊时间">{{ regForm.examination_time }}</el-descriptions-item>
                <el-descriptions-item label="症状描述">{{ regForm.symptom }}</el-descriptions-item>
            </el-descriptions>
            <div style="margin-top:24px;display:flex;gap:12px;">
                <el-button @click="step = 3">返回修改</el-button>
                <el-button type="primary" :loading="submitting" @click="submitRegistration">确认挂号</el-button>
            </div>
        </div>

        <!-- 成功提示 -->
        <div class="content-card" v-if="step === 5" style="text-align:center;padding:60px;">
            <div style="font-size:64px;margin-bottom:16px;">&#x2705;</div>
            <h2 style="color:#67C23A;margin-bottom:8px;">挂号成功！</h2>
            <p style="color:#909399;margin-bottom:24px;">您的预约挂号已成功提交，请按时就诊</p>
            <el-button type="primary" @click="$router.push('/patient/viewcase')">查看我的挂号</el-button>
            <el-button @click="resetForm">继续挂号</el-button>
        </div>
    </app-layout>
    `,
    setup() {
        const authStore = useAuthStore();
        const step = Vue.ref(1);
        const departments = ['内科', '外科', '儿科', '妇产科', '眼科', '耳鼻喉科', '口腔科', '皮肤科', '中医科', '急诊科'];
        const selectedDept = Vue.ref('');
        const doctors = Vue.ref([]);
        const selectedDoctor = Vue.ref(null);
        const submitting = Vue.ref(false);
        const regForm = Vue.reactive({ examination_time: '', symptom: '' });

        const selectDepartment = async (dept) => {
            selectedDept.value = dept;
            try {
                const res = await doctorApi.getByDepartment(dept);
                doctors.value = res.data.doctors || [];
            } catch (e) {
                doctors.value = [];
            }
            step.value = 2;
        };

        const selectDoctor = (doc) => {
            selectedDoctor.value = doc;
            step.value = 3;
        };

        const submitRegistration = async () => {
            if (!regForm.examination_time || !regForm.symptom) {
                ElementPlus.ElMessage.warning('请填写完整信息');
                return;
            }
            submitting.value = true;
            try {
                const res = await registrationApi.create({
                    username: authStore.username,
                    doctor_username: selectedDoctor.value.username,
                    examination_time: regForm.examination_time,
                    symptom: regForm.symptom,
                    room: selectedDoctor.value.room,
                });
                if (res.data.status === 'success') {
                    step.value = 5;
                } else {
                    ElementPlus.ElMessage.error(res.data.message || '挂号失败');
                }
            } catch (err) {
                ElementPlus.ElMessage.error(err.response?.data?.message || '挂号失败');
            } finally {
                submitting.value = false;
            }
        };

        const resetForm = () => {
            step.value = 1;
            selectedDept.value = '';
            doctors.value = [];
            selectedDoctor.value = null;
            regForm.examination_time = '';
            regForm.symptom = '';
        };

        return { step, departments, selectedDept, doctors, selectedDoctor, regForm, submitting, selectDepartment, selectDoctor, submitRegistration, resetForm };
    },
};
