import { defineStore } from "pinia";
import axios from "axios";
import { authService } from "@/services/authService";

export const useUserStore = defineStore({
    id: "user",
    state: () => ({
        _id: null,
        token: null,
        isAdmin: null,
        selectedUser: null,
    }),
    getters: {
        getId: (state) => state._id,
        getToken: (state) => state.token,
        getIsAdmin: (state) => state.isAdmin,
        getSelectedUser: (state) => state.selectedUser,
        isAuthenticated: (state) => !!state.token,              // Retorna true si hay token
    },
    actions: {
        setId(id) {
            this._id = id;
            localStorage.setItem("user_id", id);
        },
        setToken(token) {
            this.token = token;
            localStorage.setItem("token", token);
        },
        setIsAdmin(isAdmin) {
            this.isAdmin = isAdmin;
            localStorage.setItem("isAdmin", isAdmin.toString());
        },
        setSelectedUser(user) {
            this.selectedUser = user;
        },
        clearSelectedUser() {
            this.selectedUser = null;
        },
        clearUser() {
            this._id = null;
            this.token = null;
            this.isAdmin = null;
            this.selectedUser = null;

            localStorage.removeItem("user_id");
            localStorage.removeItem("token");
            localStorage.removeItem("isAdmin");
        },
        loadFromStorage() {
            this._id = localStorage.getItem("user_id") || null;
            this.token = localStorage.getItem("token") || null;
            const storedIsAdmin = localStorage.getItem("isAdmin");
            this.isAdmin = storedIsAdmin ? storedIsAdmin === "true" : null;
        },
        async validateSession() {
            const token = localStorage.getItem("token");

            if (!token) {
                return false;
            }

            try {
                // Verificar el token con el backend
                const response = await axios.get("/api/auth/validate", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                authService.getUser()
                .then(res => {
                    this.selectedUser = res.data.user;
                })
                .catch(error => {
                    console.log(error);
                });

                if (response.data.valid) return true;
                else {
                    this.clearUser();
                    return false;
                }
            } catch (error) {
                console.error("Error validating session:", error);
                this.clearUser();
                return false;
            }
        }
    },
});
