import { defineStore } from "pinia";

export const useUserStore = defineStore({
    id: "user",
    state: () => ({
        _id: localStorage.getItem("_id") || null,
        token: localStorage.getItem("token") || null,
        // Comprobación precisa de 'true', 'false', o null
        isAdmin: localStorage.getItem("isAdmin") === 'true'
            ? true
            : localStorage.getItem("isAdmin") === 'false'
                ? false
                : null,
    }),
    getters: {
        getId() {
            return this._id;
        },
        getToken() {
            return this.token;
        },
        getIsAdmin() {
            return this.isAdmin;
        },
    },
    actions: {
        setId(id) {
            this._id = id;
            localStorage.setItem('_id', id); // Sincronizar con localStorage
        },
        setToken(token) {
            this.token = token;
            localStorage.setItem('token', token); // Sincronizar con localStorage
        },
        setIsAdmin(isAdmin) {
            this.isAdmin = isAdmin;
            localStorage.setItem('isAdmin', isAdmin); // Sincronizar con localStorage
        },
        clearUser() {
            this.token = null;
            this.isAdmin = null;
            localStorage.removeItem('token');
            localStorage.removeItem('isAdmin');
            localStorage.clear();
        },
    },
});
