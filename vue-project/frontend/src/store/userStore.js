import { defineStore } from "pinia";

export const useUserStore = defineStore({
    id: "user",
    state: () => ({
        _id: localStorage.getItem("_id") || null,
        token: localStorage.getItem("token") || null,
        isAdmin: localStorage.getItem("isAdmin") === 'true'
            ? true
            : localStorage.getItem("isAdmin") === 'false'
                ? false
                : null,
        selectedUser: null, // Estado para el usuario seleccionado
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
        getSelectedUser() {
            return this.selectedUser;
        }
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
        setSelectedUser(user) {
            this.selectedUser = user;
        },
        clearSelectedUser() {
            this.selectedUser = null;
        },
        clearUser() {
            this.token = null;
            this.isAdmin = null;
            this.selectedUser = null;
            localStorage.removeItem('token');
            localStorage.removeItem('isAdmin');
            localStorage.clear();
        },
    },
});
