// Doctor Case Edit Page
const DoctorCaseEdit = {
    template: `
    <app-layout>
        <h3 class="page-title">病历处方管理</h3>

        <el-tabs v-model="activeTab">
            <!-- 挂号管理 -->
            <el-tab-pane label="挂号患者" name="registrations">
                <div class="content-card">
                    <el-table :data="registrations" stripe empty-text="暂无挂号记录">
                        <el-table-column prop="patient_username" label="患者" width="120" />
                        <el-table-column prop="examination_time" label="就诊时间" width="150" />
                        <el-table-column prop="symptom" label="症状" show-overflow-tooltip />
                        <el-table-column prop="status" label="状态" width="100">
                            <template #default="{ row }">
                                <el-tag :type="row.status === '待就诊' ? 'warning' : row.status === '已完成' ? 'success' : 'info'" size="small">
                                    {{ row.status }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="200">
                            <template #default="{ row }">
                                <el-button size="small" type="primary" @click="openPrescForm(row)">开处方</el-button>
                                <el-button size="small" type="success" @click="completeRegistration(row)" :disabled="row.status === '已完成'">完成</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-tab-pane>

            <!-- 开处方 -->
            <el-tab-pane label="开具处方" name="prescription">
                <div class="content-card">
                    <div class="card-title">&#x1F4DD; 开具处方</div>
                    <el-form :model="prescForm" label-width="120px" style="max-width:700px;">
                        <el-form-item label="选择患者">
                            <el-select v-model="prescForm.patient_username" placeholder="选择患者" style="width:100%;" filterable>
                                <el-option v-for="p in patientOptions" :key="p" :label="p" :value="p" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="处方内容">
                            <el-input v-model="prescForm.prescription_content" type="textarea" :rows="5" placeholder="请输入处方内容（药品名称、用量、用法等）" />
                        </el-form-item>
                        <el-form-item label="医嘱建议">
                            <el-input v-model="prescForm.doctor_advice" type="textarea" :rows="3" placeholder="请输入医嘱和建议" />
                        </el-form-item>
                        <el-form-item label="费用金额 (¥)">
                            <el-input-number v-model="prescForm.total_amount" :min="0" :precision="2" style="width:100%;" />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" :loading="submitting" @click="submitPrescription">提交处方</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </el-tab-pane>

            <!-- 处方记录 -->
            <el-tab-pane label="处方记录" name="records">
                <div class="content-card">
                    <el-table :data="prescriptions" stripe empty-text="暂无处方记录">
                        <el-table-column prop="id" label="处方ID" width="80" />
                        <el-table-column prop="patient_username" label="患者" width="120" />
                        <el-table-column prop="prescription_content" label="处方内容" show-overflow-tooltip />
                        <el-table-column prop="doctor_advice" label="医嘱" show-overflow-tooltip />
                        <el-table-column prop="total_amount" label="金额" width="100">
                            <template #default="{ row }">¥{{ row.total_amount }}</template>
                        </el-table-column>
                        <el-table-column prop="created_at" label="时间" width="160" />
                    </el-table>
                </div>
            </el-tab-pane>

            <!-- 意见管理 -->
            <el-tab-pane label="收到的意见" name="opinions">
                <div v-if="opinions.length === 0" class="empty-state">
                    <div class="empty-icon">&#x1F4AC;</div>
                    <p>暂无收到的意见</p>
                </div>
                <div v-for="op in opinions" :key="op.id" class="record-card" style="border-left-color:#E6A23C;">
                    <div class="record-header">
                        <h4>&#x1F4AC; 来自 {{ op.patient_name }} 的意见</h4>
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
        const patientOptions = Vue.ref([]);
        const submitting = Vue.ref(false);

        const prescForm = Vue.reactive({
            patient_username: '',
            prescription_content: '',
            doctor_advice: '',
            total_amount: 0,
        });

        Vue.onMounted(async () => {
            await loadData();
        });

        const loadData = async () => {
            try {
                const [regRes, prescRes, opRes, patRes] = await Promise.all([
                    registrationApi.getByDoctor(authStore.username),
                    prescriptionApi.getByDoctor(authStore.username),
                    opinionApi.getByDoctor(authStore.username),
                    patientApi.getAll(),
                ]);
                registrations.value = regRes.data.registrations || [];
                prescriptions.value = prescRes.data.prescriptions || [];
                opinions.value = opRes.data.opinions || [];
                patientOptions.value = (patRes.data.patients || []).map(p => p.username);
            } catch (e) { /* ignore */ }
        };

        const openPrescForm = (reg) => {
            prescForm.patient_username = reg.patient_username;
            activeTab.value = 'prescription';
        };

        const submitPrescription = async () => {
            if (!prescForm.patient_username || !prescForm.prescription_content || !prescForm.doctor_advice) {
                ElementPlus.ElMessage.warning('请填写完整的处方信息');
                return;
            }
            submitting.value = true;
            try {
                const res = await prescriptionApi.create({
                    ...prescForm,
                    doctor_username: authStore.username,
                });
                if (res.data.status === 'success') {
                    ElementPlus.ElMessage.success('处方提交成功');
                    prescForm.patient_username = '';
                    prescForm.prescription_content = '';
                    prescForm.doctor_advice = '';
                    prescForm.total_amount = 0;
                    await loadData();
                } else {
                    ElementPlus.ElMessage.error(res.data.message || '提交失败');
                }
            } catch (err) {
                ElementPlus.ElMessage.error(err.response?.data?.message || '提交失败');
            } finally {
                submitting.value = false;
            }
        };

        const completeRegistration = async (reg) => {
            try {
                await registrationApi.update(reg.id, { status: '已完成' });
                ElementPlus.ElMessage.success('已标记为完成');
                await loadData();
            } catch (err) {
                ElementPlus.ElMessage.error('操作失败');
            }
        };

        return { activeTab, registrations, prescriptions, opinions, patientOptions, prescForm, submitting, openPrescForm, submitPrescription, completeRegistration };
    },
};
