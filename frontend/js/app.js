// ========== Main Application ==========

// Make VueRouter globally available BEFORE component files try to use it
window.VueRouter = VueRouter;

const { createApp } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;
const { createPinia } = Pinia;

// Router configuration
const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    {
        path: '/patient/dashboard',
        component: PatientDashboard,
        meta: { requiresAuth: true, identity: 'patient' },
    },
    {
        path: '/patient/register',
        component: PatientRegister,
        meta: { requiresAuth: true, identity: 'patient' },
    },
    {
        path: '/patient/health',
        component: PatientHealth,
        meta: { requiresAuth: true, identity: 'patient' },
    },
    {
        path: '/patient/viewcase',
        component: PatientViewCase,
        meta: { requiresAuth: true, identity: 'patient' },
    },
    {
        path: '/patient/chat',
        component: PatientChat,
        meta: { requiresAuth: true, identity: 'patient' },
    },
    {
        path: '/doctor/dashboard',
        component: DoctorDashboard,
        meta: { requiresAuth: true, identity: 'doctor' },
    },
    {
        path: '/doctor/caseedit',
        component: DoctorCaseEdit,
        meta: { requiresAuth: true, identity: 'doctor' },
    },
    {
        path: '/doctor/profile',
        component: DoctorProfile,
        meta: { requiresAuth: true, identity: 'doctor' },
    },
    {
        path: '/doctor/checkin',
        component: DoctorCheckin,
        meta: { requiresAuth: true, identity: 'doctor' },
    },
    {
        path: '/doctor/chat',
        component: DoctorChat,
        meta: { requiresAuth: true, identity: 'doctor' },
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (to.meta.requiresAuth && !token) {
        next('/login');
        return;
    }

    if (to.meta.identity && user && user.identity !== to.meta.identity) {
        next(user.identity === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
        return;
    }

    next();
});

// Create app
const app = createApp({});
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(ElementPlus, { locale: ElementPlusLocaleZhCn });

// Register Element Plus Icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// Register global components
app.component('app-layout', AppLayout);

// Mount
app.mount('#app');