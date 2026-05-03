// Register Page
const RegisterView = {
    template: `
    <div class="auth-page">
        <div class="auth-card">
            <div class="logo-area">
                <div class="logo-icon">&#x1F3E5;</div>
                <h1>账号注册</h1>
                <p>创建您的智慧医疗账号</p>
            </div>
            <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleRegister">
                <el-form-item prop="username">
                    <el-input v-model="form.username" placeholder="请输入用户名" size="large">
                        <template #prefix><span>&#x1F464;</span></template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="form.password" type="password" placeholder="请输入密码（至少6位）" size="large" show-password>
                        <template #prefix><span>&#x1F512;</span></template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="confirmPassword">
                    <el-input v-model="form.confirmPassword" type="password" placeholder="请确认密码" size="large" show-password>
                        <template #prefix><span>&#x1F512;</span></template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="identity">
                    <el-radio-group v-model="form.identity" size="large" style="width:100%">
                        <el-radio-button label="patient" style="flex:1">我是患者</el-radio-button>
                        <el-radio-button label="doctor" style="flex:1">我是医生</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="large" :loading="loading" @click="handleRegister">
                        {{ loading ? '注册中...' : '注 册' }}
                    </el-button>
                </el-form-item>
            </el-form>
            <div class="auth-links">
                <span style="color:#909399;font-size:14px;">已有账号？</span>
                <a @click="$router.push('/login')">返回登录</a>
            </div>
        </div>
    </div>
    `,
    setup() {
        const router = VueRouter.useRouter();
        const formRef = Vue.ref(null);
        const loading = Vue.ref(false);
        const form = Vue.reactive({
            username: '',
            password: '',
            confirmPassword: '',
            identity: 'patient',
        });

        const validateConfirm = (rule, value, callback) => {
            if (value !== form.password) {
                callback(new Error('两次密码输入不一致'));
            } else {
                callback();
            }
        };

        const rules = {
            username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
            password: [
                { required: true, message: '请输入密码', trigger: 'blur' },
                { min: 6, message: '密码长度至少为6位', trigger: 'blur' },
            ],
            confirmPassword: [
                { required: true, message: '请确认密码', trigger: 'blur' },
                { validator: validateConfirm, trigger: 'blur' },
            ],
            identity: [{ required: true, message: '请选择身份', trigger: 'change' }],
        };

        const handleRegister = async () => {
            try {
                await formRef.value.validate();
            } catch { return; }

            loading.value = true;
            try {
                const res = await authApi.register({
                    username: form.username,
                    password: form.password,
                    identity: form.identity,
                });
                if (res.data.status === 'success') {
                    ElementPlus.ElMessage.success('注册成功，请登录');
                    router.push('/login');
                } else {
                    ElementPlus.ElMessage.error(res.data.message || '注册失败');
                }
            } catch (err) {
                ElementPlus.ElMessage.error(err.response?.data?.message || '注册失败');
            } finally {
                loading.value = false;
            }
        };

        return { form, rules, formRef, loading, handleRegister };
    },
};