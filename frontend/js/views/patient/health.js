// Patient Health Record Page
const PatientHealth = {
    template: `
    <app-layout>
        <h3 class="page-title">健康档案</h3>
        
        <div class="content-card">
            <div class="card-title">&#x1F4CA; 健康数据录入</div>
            <el-form :model="healthForm" label-width="120px" style="max-width:800px;">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="身高 (cm)">
                            <el-input-number v-model="healthForm.height" :min="50" :max="250" :precision="1" style="width:100%" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="体重 (kg)">
                            <el-input-number v-model="healthForm.weight" :min="20" :max="200" :precision="1" style="width:100%" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="肺活量 (ml)">
                            <el-input-number v-model="healthForm.vital_capacity" :min="500" :max="10000" style="width:100%" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="心率 (次/分)">
                            <el-input-number v-model="healthForm.heart_rate" :min="40" :max="200" style="width:100%" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="收缩压 (mmHg)">
                            <el-input-number v-model="healthForm.blood_pressure_high" :min="60" :max="250" style="width:100%" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="舒张压 (mmHg)">
                            <el-input-number v-model="healthForm.blood_pressure_low" :min="40" :max="150" style="width:100%" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="血糖 (mmol/L)">
                            <el-input-number v-model="healthForm.blood_sugar" :min="2" :max="30" :precision="1" style="width:100%" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item>
                    <el-button type="primary" :loading="saving" @click="saveHealth">保存数据</el-button>
                    <el-button @click="calculateBMI">计算BMI</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- BMI 结果 -->
        <div class="content-card bmi-card" v-if="bmiResult !== null">
            <div class="card-title">&#x1F4CA; BMI 指数分析</div>
            <div class="bmi-result" :class="bmiClass">
                <span style="font-size:14px;">BMI</span>
                <span class="bmi-value">{{ bmiResult }}</span>
                <span style="font-size:16px;font-weight:600;">{{ bmiCategory }}</span>
            </div>
            <div class="advice-card">
                <h4>&#x1F4A1; 健康建议</h4>
                <ul class="advice-list">
                    <li v-for="advice in healthAdvice" :key="advice">&#x2714; {{ advice }}</li>
                </ul>
            </div>
        </div>
    </app-layout>
    `,
    setup() {
        const authStore = useAuthStore();
        const saving = Vue.ref(false);
        const bmiResult = Vue.ref(null);
        const bmiCategory = Vue.ref('');
        const bmiClass = Vue.ref('normal');
        const healthAdvice = Vue.ref([]);

        const healthForm = Vue.reactive({
            height: null,
            weight: null,
            vital_capacity: null,
            heart_rate: null,
            blood_pressure_high: null,
            blood_pressure_low: null,
            blood_sugar: null,
        });

        // Load existing health record
        Vue.onMounted(async () => {
            try {
                const res = await healthApi.get(authStore.username);
                if (res.data.health_record) {
                    const record = res.data.health_record;
                    Object.keys(healthForm).forEach(key => {
                        if (record[key] !== null) healthForm[key] = record[key];
                    });
                }
            } catch (e) { /* no existing record */ }
        });

        const calculateBMI = () => {
            if (!healthForm.height || !healthForm.weight) {
                ElementPlus.ElMessage.warning('请先输入身高和体重');
                return;
            }
            const heightM = healthForm.height / 100;
            const bmi = (healthForm.weight / (heightM * heightM)).toFixed(1);
            bmiResult.value = bmi;

            if (bmi < 18.5) {
                bmiCategory.value = '偏瘦';
                bmiClass.value = 'underweight';
                healthAdvice.value = [
                    '建议增加营养摄入，多吃高蛋白食物',
                    '适当进行力量训练，增加肌肉量',
                    '保持规律作息，避免熬夜',
                ];
            } else if (bmi < 24) {
                bmiCategory.value = '正常';
                bmiClass.value = 'normal';
                healthAdvice.value = [
                    '继续保持良好的饮食和运动习惯',
                    '每周至少进行150分钟中等强度运动',
                    '保持心情愉悦，定期体检',
                ];
            } else if (bmi < 28) {
                bmiCategory.value = '偏胖';
                bmiClass.value = 'overweight';
                healthAdvice.value = [
                    '控制饮食热量摄入，减少高脂肪食物',
                    '增加有氧运动，如快走、游泳等',
                    '建议定期监测体重变化',
                ];
            } else {
                bmiCategory.value = '肥胖';
                bmiClass.value = 'obese';
                healthAdvice.value = [
                    '建议咨询营养师制定饮食计划',
                    '每天至少进行30分钟中等强度运动',
                    '定期检查血压、血糖等指标',
                ];
            }
        };

        const saveHealth = async () => {
            saving.value = true;
            try {
                const res = await healthApi.update(authStore.username, healthForm);
                if (res.data.status === 'success') {
                    ElementPlus.ElMessage.success('健康数据保存成功');
                } else {
                    ElementPlus.ElMessage.error(res.data.message || '保存失败');
                }
            } catch (err) {
                ElementPlus.ElMessage.error('保存失败');
            } finally {
                saving.value = false;
            }
        };

        return { healthForm, saving, bmiResult, bmiCategory, bmiClass, healthAdvice, calculateBMI, saveHealth };
    },
};
