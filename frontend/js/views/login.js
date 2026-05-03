// Login Page
const LoginView = {
    template: `
    <div class="auth-page">
        <div class="auth-card">
            <div class="logo-area">
                <div class="logo-icon">&#x1F3E5;</div>
                <h1>智慧医疗管理系统</h1>
                <p>Smart Medical Management System</p>
            </div>
            <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleLogin">
                <el-form-item prop="username">
                    <el-input v-model="form.username" placeholder="请输入用户名" size="large" prefix-icon="User">
                        <template #prefix><span>&#x1F464;</span></template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large" show-password>
                        <template #prefix><span>&#x1F512;</span></template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="large" :loading="loading" @click="handleLogin">
                        {{ loading ? '登录中...' : '登 录' }}
                    </el-button>
                </el-form-item>
            </el-form>
            <div class="auth-links">
                <span style="color:#909399;font-size:14px;">还没有账号？</span>
                <a @click="$router.push('/register')">立即注册</a>
            </div>
        </div>
    </div>
    `,
    setup() {
        const router = VueRouter.useRouter();
        const authStore = useAuthStore();
        const chatStore = useChatStore();
        const formRef = Vue.ref(null);
        const loading = Vue.ref(false);
        const form = Vue.reactive({ username: '', password: '' });
        const rules = {
            username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
            password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        };

        const handleLogin = async () => {
            try {
                await formRef.value.validate();
            } catch { return; }

            loading.value = true;
            try {
                const res = await authApi.login(form);
                const data = res.data;
                if (data.status === 'success') {
                    authStore.setAuth(data.token, data.user);
                    // Init chat socket
                    chatStore.initSocket(data.user.username);
                    ElementPlus.ElMessage.success('登录成功');
                    if (data.user.identity === 'doctor') {
                        router.push('/doctor/dashboard');
                    } else {
                        router.push('/patient/dashboard');
                    }
                } else {
                    ElementPlus.ElMessage.error(data.message || '登录失败');
                }
            } catch (err) {
                const msg = err.response?.data?.message || '网络错误，请稍后重试';
                ElementPlus.ElMessage.error(msg);
            } finally {
                loading.value = false;
            }
        };

        // Redirect if already logged in
        if (authStore.isLoggedIn) {
            if (authStore.isDoctor) router.push('/doctor/dashboard');
            else router.push('/patient/dashboard');
        }

        return { form, rules, formRef, loading, handleLogin };
    },
};
