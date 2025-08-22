import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/userStore';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue'),
    meta: { section: 'home' },
  },
  {
    path: '/admin',
    name: 'adminDashboard',
    component: () => import('../views/AdminDashboard.vue'),
    meta: { adminOnly: true, section: 'home' },
  },

  // ---------------------------------------------------------------------------------
  // Sección de USUARIOS
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/Login.vue'),
    meta: { notLoggedUsers: true, gradient: true, section: 'users' }, // Solo accesible para usuarios no autenticados
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/auth/Register.vue'),
    meta: { notLoggedUsers: true, gradient: true, section: 'users' }, // Solo accesible para usuarios no autenticados
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/auth/Profile.vue'),
    meta: { section: 'profile' },
  },
  {
    path: '/editProfileInfo',
    name: 'editProfileInfo',
    component: () => import('../views/auth/EditProfileInfo.vue'),
    meta: { section: 'profile' },
  },
  {
    path: '/changePassword',
    name: 'changePassword',
    component: () => import('../views/auth/ChangePassword.vue'),
    meta: { section: 'profile' },
  },
  {
    path: '/forgot_password',
    name: 'forgot_password',
    component: () => import('../views/auth/ForgotPassword.vue'),
    meta: { notLoggedUsers: true, gradient: true, section: 'users' }, // Solo accesible para usuarios no autenticados
  },
  {
    path: '/reset',
    name: 'reset',
    component: () => import('../views/auth/ResetPassword.vue'),
    meta: { notLoggedUsers: true, gradient: true, section: 'users' }, // Solo accesible para usuarios no autenticados
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../views/user/Users.vue'),
    meta: { adminOnly: true, section: 'users' }, // Solo accesible para usuarios administradores
  },
  {
    path: '/userInfo',
    name: 'userInfo',
    component: () => import('../views/user/UserInfo.vue'),
    meta: { adminOnly: true, section: 'users' }, // Solo accesible para usuarios administradores
  },
  {
    path: '/editUserInfo',
    name: 'editUserInfo',
    component: () => import('../views/user/EditUserInfo.vue'),
    meta: { adminOnly: true, section: 'users' }, // Solo accesible para usuarios administradores
  },
  // ---------------------------------------------------------------------------------
  // Sección de ESPACIOS
  {
    path: '/spaces',
    name: 'spaces',
    component: () => import('../views/spaces/Spaces.vue'),
    meta: { section: 'spaces' },
  },
  {
    path: '/createSpace',
    name: 'createSpace',
    component: () => import('../views/spaces/CreateSpace.vue'),
    meta: { adminOnly: true, section: 'spaces' }, // Solo accesible para usuarios administradores
  },
  {
    path: '/spaceInfo',
    name: 'spaceInfo',
    component: () => import('../views/spaces/SpaceInfo.vue'),
    meta: { section: 'spaces' },
  },
  {
    path: '/editSpaceInfo',
    name: 'editSpaceInfo',
    component: () => import('../views/spaces/EditSpaceInfo.vue'),
    meta: { adminOnly: true, section: 'spaces' }, // Solo accesible para usuarios administradores
  },

  // ---------------------------------------------------------------------------------
  // Sección de MATERIALES
  {
    path: '/materials',
    name: 'materials',
    component: () => import('../views/materials/Materials.vue'),
    meta: { section: 'materials' },
  },
  {
    path: '/createMaterial',
    name: 'createMaterial',
    component: () => import('../views/materials/CreateMaterial.vue'),
    meta: { adminOnly: true, section: 'materials' }, // Solo accesible para usuarios administradores
  },
  {
    path: '/materialInfo',
    name: 'materialInfo',
    component: () => import('../views/materials/MaterialInfo.vue'),
    meta: { section: 'materials' },
  },
  {
    path: '/editMaterialInfo',
    name: 'editMaterialInfo',
    component: () => import('../views/materials/EditMaterialInfo.vue'),
    meta: { adminOnly: true, section: 'materials' }, // Solo accesible para usuarios administradores
  },

  // ---------------------------------------------------------------------------------
  // Sección de RESERVAS
  {
    path: '/reservations',
    name: 'reservations',
    component: () => import('../views/reservations/Reservations.vue'),
    meta: { section: 'reservations' },
  },
  {
    path: '/todayReservations',
    name: 'todayReservations',
    component: () => import('../views/reservations/TodayReservations.vue'),
    meta: { adminOnly: true, section: 'reservations' }, // Solo accesible para usuarios administradores
  },
  {
    path: '/createReservation',
    name: 'createReservation',
    component: () => import('../views/reservations/CreateReservation.vue'),
    meta: { section: 'reservations' },
  },
  {
    path: '/confirmReservation',
    name: 'confirmReservation',
    component: () => import('../views/reservations/ConfirmReservation.vue'),
    meta: { section: 'reservations' },
  },
  {
    path: '/reservationInfo',
    name: 'reservationInfo',
    component: () => import('../views/reservations/ReservationInfo.vue'),
    meta: { section: 'reservations' },
  },
  {
    path: '/editReservationInfo',
    name: 'editReservationInfo',
    component: () => import('../views/reservations/EditReservationInfo.vue'),
    meta: { section: 'reservations' },
  },

  // ---------------------------------------------------------------------------------
  // Sección LEGAL
  {
    path: '/legal',
    name: 'legal',
    component: () => import('../views/Legal.vue'),
    meta: { section: 'legal' },
  },
];

const router = createRouter({
  routes,
  history: createWebHistory(),
});

const publicPages = ['reset', 'login', 'register', 'forgot_password', 'legal'];

//Guard global para manejar autenticación y permisos
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // Cargar datos antes de validar sesión
  if (!userStore.isAuthenticated) {
    userStore.loadFromStorage();
  }

  const isValidSession = await userStore.validateSession();

  if (publicPages.includes(to.name)) {
    return next();
  }

  if (!isValidSession) {
    return next({ name: 'login' });
  }

  const token = userStore.getToken;
  const isAdmin = userStore.getIsAdmin;

  if (to.name === 'home' && isAdmin) {
    return next({ name: 'adminDashboard' });
  }

  if (to.name === 'adminDashboard' && !isAdmin) {
    return next({ name: 'home' });
  }

  if (to.matched.some((record) => record.meta.notLoggedUsers) && token) {
    return next({ name: 'home' });
  }

  if (
    to.matched.some((record) => record.meta.adminOnly) &&
    (!token || !isAdmin)
  ) {
    return next({ name: 'home' });
  }

  return next();
});

export default router;
