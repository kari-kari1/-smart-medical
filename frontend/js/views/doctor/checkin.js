// Doctor Check-in Page
const DoctorCheckin = {
    template: `
    <app-layout>
        <h3 class="page-title">签到打卡</h3>
        <div class="content-card checkin-card">
            <div class="checkin-time">{{ currentTime }}</div>
            <div class="checkin-date">{{ currentDate }}</div>
            <div v-if="!checkedIn">
                <el-form :model="checkinForm" label-width="100px" style="max-width:500px;margin:0 auto;">
                    <el-form-item label="今日诊室">
                        <el-input v-model="checkinForm.room" placeholder="如：301诊室" />
                    </el-form-item>
                    <el-form-item label="所属科室">
                        <el-select v-model="checkinForm.department" placeholder="请选择科室" style="width:100%;">
                            <el-option v-for="dept in departments" :key="dept" :label="dept" :value="dept" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="出诊时间">
                        <el-input v-model="checkinForm.consultation_time" placeholder="如：8:00-12:00, 14:00-17:00" />
                    </el-form-item>
                </el-form>
                <el-button type="primary" size="large" :loading="loading" @click="doCheckin" style="margin-top:16px;">
                    &#x2705; 立即签到
                </el-button>
            </div>
            <div v-else class="checkin-success">
                <div style="font-size:48px;margin-bottom:12px;">&#x2705;</div>
                <h3 style="color:#67C23A;margin-bottom:8px;">签到成功！</h3>
                <p style="color:#909399;">诊室：{{ checkinForm.room }} | 科室：{{ checkinForm.department }}</p>
                <p style="color:#909399;margin-top:4px;">出诊时间：{{ checkinForm.consultation_time }}</p>
            </div>
        </div>
    </app-layout>
    `,
    setup() {
        const authStore = useAuthStore();
        const loading = Vue.ref(false);
        const checkedIn = Vue.ref(false);
        const currentTime = Vue.ref('');
        const currentDate = Vue.ref('');
        const departments = ['内科', '外科', '儿科', '妇产科', '眼科', '耳鼻喉科', '口腔科', '皮肤科', '中医科', '急诊科'];
        const checkinForm = Vue.reactive({ room: '', department: '', consultation_time: '' });

        const updateTime = () => {
            const now = new Date();
            currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false });
            currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
        };

        Vue.onMounted(async () => {
            updateTime();
            setInterval(updateTime, 1000);
            // Load existing doctor info
            try {
                const res = await doctorApi.get(authStore.username);
                if (res.data.doctor) {
                    const doc = res.data.doctor;
                    checkinForm.room = doc.room || '';
                    checkinForm.department = doc.department || '';
                    checkinForm.consultation_time = doc.consultation_time || '';
                }
            } catch (e) { /* ignore */ }
        });

        const doCheckin = async () => {
            if (!checkinForm.room || !checkinForm.department) {
                ElementPlus.ElMessage.warning('请填写诊室和科室信息');
                return;
            }
            loading.value = true;
            try {
                const res = await doctorApi.checkin(authStore.username, checkinForm);
                if (res.data.status === 'success') {
                    checkedIn.value = true;
                    ElementPlus.ElMessage.success('签到成功');
                } else {
                    ElementPlus.ElMessage.error(res.data.message || '签到失败');
                }
            } catch (err) {
                ElementPlus.ElMessage.error('签到失败');
            } finally {
                loading.value = false;
            }
        };

        return { authStore, loading, checkedIn, currentTime, currentDate, departments, checkinForm, doCheckin };
    },
};
