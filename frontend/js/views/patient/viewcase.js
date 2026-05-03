// Patient View Case (查看病历) Page
const PatientViewCase = {
    template: `
    <app-layout>
        <h3 class="page-title">我的病历</h3>

        <!-- Tabs -->
        <el-tabs v-model="activeTab">
            <!-- 挂号记录 -->
            <el-tab-pane label="挂号记录" name="registrations">
                <div v-if="registrations.length === 0" class="empty-state">
                    <div class="empty-icon">&#x1F4CB;</div>
                    <p>暂无挂号记录</p>
                </div>
                <div v-for="reg in registrations" :key="reg.id" class="record-card">
                    <div class="record-header">
                        <h4>&#x1F3E5; {{ reg.doctor_username }}</h4>
                        <el-tag :type="reg.status === '待就诊' ? 'warning' : reg.status === '已完成' ? 'success' : 'info'" size="small">
                            {{ reg.status }}
                        </el-tag>
                    </div>
                    <div class="record-body">
                        <div><span class="label">就诊时间：</span><span class="value">{{ reg.examination_time }}</span></div>
                        <div><span class="label">诊室：</span><span class="value">{{ reg.room }}</span></div>
                        <div style="grid-column:1/-1;"><span class="label">症状描述：</span><span class="value">{{ reg.symptom }}</span></div>
                        <div><span class="label">挂号时间：</span><span class="value">{{ reg.created_at }}</span></div>
                    </div>
                </div>
            </el-tab-pane>

            <!-- 处方记录 -->
            <el-tab-pane label="处方记录" name="prescriptions">
                <div v-if="prescriptions.length === 0" class="empty-state">
                    <div class="empty-icon">&#x1F48A;</div>
                    <p>暂无处方记录</p>
                </div>
                <div v-for="pre in prescriptions" :key="pre.id" class="record-card" style="border-left-color:#67C23A;">
                    <div class="record-header">
                        <h4>&#x1F48A; 处方 #{{ pre.id }}</h4>
                        <el-tag type="success" size="small">¥{{ pre.total_amount }}</el-tag>
                    </div>
                    <div class="record-body">
                        <div><span class="label">开方医生：</span><span class="value">{{ pre.doctor_username }}</span></div>
                        <div><span class="label">开方时间：</span><span class="value">{{ pre.created_at }}</span></div>
                        <div style="grid-column:1/-1;"><span class="label">处方内容：</span><span class="value">{{ pre.prescription_content }}</span></div>
                        <div style="grid-column:1/-1;"><span class="label">医嘱建议：</span><span class="value">{{ pre.doctor_advice }}</span></div>
                    </div>
                </div>
            </el-tab-pane>

            <!-- 意见反馈 -->
            <el-tab-pane label="意见反馈" name="opinions">
                <div class="content-card" style="margin-bottom:20px;">
                    <div class="card-title">&#x270F; 提交新意见</div>
                    <el-form :model="opinionForm" label-width="100px" style="max-width:600px;">
                        <el-form-item label="选择医生">
                            <el-select v-model="opinionForm.doctor_name" placeholder="请选择医生" style="width:100%;">
                                <el-option v-for="doc in doctorOptions" :key="doc" :label="doc" :value="doc" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="意见内容">
                            <el-input v-model="opinionForm.opinion" type="textarea" :rows="4" placeholder="请输入您的意见或建议..." />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="submitOpinion">提交意见</el-button>
                        </el-form-item>
                    </el-form>
                </div>

                <div v-if="opinions.length === 0" class="empty-state">
                    <div class="empty-icon">&#x1F4AC;</div>
                    <p>暂无意见记录</p>
                </div>
                <div v-for="op in opinions" :key="op.id" class="record-card" style="border-left-color:#E6A23C;">
                    <div class="record-header">
                        <h4>&#x1F4AC; 给 {{ op.doctor_name }} 的意见</h4>
                        <span style="font-size:12px;color:#909399;">{{ op.created_at }}</span>
                    </div>
                    <div style="font-size:14px;color:#606266;line-height:1.6;">{{ op.opinion }}</div>
                </div>
            </el-tab-pane>
        </el-tabs>
    </app-layout>
    `,
    setup() {
        const authStore = useAuthStore();
        const activeTab = Vue.ref('registrations');
        const registrations = Vue.ref([]);
        const prescriptions = Vue.ref([]);
        const opinions = Vue.ref([]);
        const doctorOptions = Vue.ref([]);
        const opinionForm = Vue.reactive({ doctor_name: '', opinion: '' });

        Vue.onMounted(async () => {
            const username = authStore.username;
            try {
                const [regRes, prescRes, opRes, docRes] = await Promise.all([
                    registrationApi.getByPatient(username),
                    prescriptionApi.getByPatient(username),
                    opinionApi.getByPatient(username),
                    doctorApi.getAll(),
                ]);
                registrations.value = regRes.data.registrations || [];
                prescriptions.value = prescRes.data.prescriptions || [];
                opinions.value = opRes.data.opinions || [];
                doctorOptions.value = (docRes.data.doctors || []).map(d => d.username);
            } catch (e) { /* ignore */ }
        });

        const submitOpinion = async () => {
            if (!opinionForm.doctor_name || !opinionForm.opinion) {
                ElementPlus.ElMessage.warning('请填写完整信息');
                return;
            }
            try {
                const res = await opinionApi.create({
                    patient_name: authStore.username,
                    doctor_name: opinionForm.doctor_name,
                    opinion: opinionForm.opinion,
                });
                if (res.data.status === 'success') {
                    ElementPlus.ElMessage.success('意见提交成功');
                    opinions.value.unshift(res.data.opinion);
                    opinionForm.doctor_name = '';
                    opinionForm.opinion = '';
                }
            } catch (err) {
                ElementPlus.ElMessage.error('提交失败');
            }
        };

        return { activeTab, registrations, prescriptions, opinions, doctorOptions, opinionForm, submitOpinion };
    },
};
