// Auth Store (Pinia)
const useAuthStore = Pinia.defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        user: JSON.parse(localStorage.getItem('user') || 'null'),
    }),
    getters: {
        isLoggedIn: (state) => !!state.token,
        isDoctor: (state) => state.user?.identity === 'doctor',
        isPatient: (state) => state.user?.identity === 'patient',
        username: (state) => state.user?.username || '',
        identity: (state) => state.user?.identity || '',
    },
    actions: {
        setAuth(token, user) {
            this.token = token;
            this.user = user;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        },
        logout() {
            this.token = '';
            this.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
});
