import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../store/userStore";

const routes = [
    {
        path: "/",
        name: "home",
        component: () => import("../views/Home.vue")
    },
    {
        path: "/login",
        name: "login",
        component: () => import("../views/auth/Login.vue"),
        meta: { notLoggedUsers: true } // Solo accesible para usuarios no autenticados
    },
    {
        path: "/register",
        name: "register",
        component: () => import("../views/auth/Register.vue"),
        meta: { notLoggedUsers: true } // Solo accesible para usuarios no autenticados
    },
    {
        path: "/profile",
        name: "profile",
        component: () => import("../views/auth/Profile.vue")
    },
    {
        path: "/editProfileInfo",
        name: "editProfileInfo",
        component: () => import("../views/auth/EditProfileInfo.vue"),
    },
    {
        path: "/forgot_password",
        name: "forgot_password",
        component: () => import("../views/auth/ForgotPassword.vue"),
        meta: { notLoggedUsers: true } // Solo accesible para usuarios no autenticados
    },
    {
        path: "/reset",
        name: "reset",
        component: () => import("../views/auth/ResetPassword.vue"),
        meta: { notLoggedUsers: true } // Solo accesible para usuarios no autenticados
    },
    {
        path: "/users",
        name: "users",
        component: () => import("../views/user/Users.vue"),
        meta: { adminOnly: true } // Solo accesible para usuarios administradores
    },
    {
        path: "/userInfo",
        name: "userInfo",
        component: () => import("../views/user/UserInfo.vue"),
        meta: { adminOnly: true }, // Solo accesible para usuarios administradores
    },
    {
        path: "/editUserInfo",
        name: "editUserInfo",
        component: () => import("../views/user/EditUserInfo.vue"),
        meta: { adminOnly: true }, // Solo accesible para usuarios administradores
    },
    {
        path: "/spaces",
        name: "spaces",
        component: () => import("../views/spaces/Spaces.vue"),
    },
    {
        path: "/createSpace",
        name: "createSpace",
        component: () => import("../views/spaces/CreateSpace.vue"),
    },
];

const router = createRouter({
    routes,
    history: createWebHistory()
});

// Guard global para manejar autenticación y permisos
router.beforeEach((to, from, next) => {
    const userStore = useUserStore(); // Accede al store de Pinia
    const token = userStore.getToken; // Obtén el token desde el store
    const isAdmin = userStore.getIsAdmin; // Obtén el estado de admin desde el store

    // Verificar si la ruta es solo para invitados
    if (to.matched.some(record => record.meta.notLoggedUsers)) {
        if (token) {
            // Si el usuario está autenticado, redirige a la página de inicio
            next({ name: "home" });
        } else {
            next();
        }
    } else if (to.matched.some(record => record.meta.adminOnly)) {
        // Verificar si la ruta es solo para administradores
        if (token && isAdmin) {
            next(); // Si el usuario es admin, permite el acceso
        } else {
            next({ name: "home" }); // Si no es admin, redirige a la página de inicio
        }
    } else {
        // Para todas las demás rutas, verificar autenticación
        if (!token) {
            // Si no está autenticado, redirige al login
            next({ name: "login" });
        } else {
            next();
        }
    }
});

export default router;
