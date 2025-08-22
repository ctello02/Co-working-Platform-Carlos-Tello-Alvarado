<template>
    <!-- Barra superior -->
    <v-app-bar app :style="colorNav" density="compact">
        <v-toolbar-title>Co-Working Platform</v-toolbar-title>
    </v-app-bar>

    <!-- Sidebar permanente -->
    <v-navigation-drawer app permanent :color="colorSidebar" :width="160">
        <v-list class="d-flex flex-column h-100" nav>
            <v-list-item :to="{ name: 'home' }" :active="$route.meta.section === 'home'" active-class="active-nav"
                :ripple="false">
                <v-row>
                    <v-col cols="1" class="d-flex align-center">
                        <v-icon size="small" icon="mdi-home-outline"></v-icon>
                    </v-col>
                    <v-col class="d-flex align-center">
                        <span class="item">Vista principal</span>
                    </v-col>
                </v-row>
            </v-list-item>

            <v-list-item :to="{ name: 'reservations' }" :active="$route.meta.section === 'reservations'"
                active-class="active-nav" :ripple="false">
                <v-row>
                    <v-col cols="1" class="d-flex align-center">
                        <v-icon size="small" icon="mdi-calendar-outline"></v-icon>
                    </v-col>
                    <v-col class="d-flex align-center">
                        <span class="item">Reservas</span>
                    </v-col>
                </v-row>
            </v-list-item>

            <v-list-item :to="{ name: 'spaces' }" :active="$route.meta.section === 'spaces'" active-class="active-nav"
                :ripple="false">
                <v-row>
                    <v-col cols="1" class="d-flex align-center">
                        <v-icon size="small" icon="mdi-table-chair"></v-icon>
                    </v-col>
                    <v-col class="d-flex align-center">
                        <span class="item">Espacios</span>
                    </v-col>
                </v-row>
            </v-list-item>

            <v-list-item :to="{ name: 'materials' }" :active="$route.meta.section === 'materials'"
                active-class="active-nav" :ripple="false">
                <v-row>
                    <v-col cols="1" class="d-flex align-center">
                        <v-icon size="small" icon="mdi-tools"></v-icon>
                    </v-col>
                    <v-col class="d-flex align-center">
                        <span class="item">Materiales</span>
                    </v-col>
                </v-row>
            </v-list-item>

            <v-list-item v-if="userStore.getIsAdmin" :to="{ name: 'users' }" :active="$route.meta.section === 'users'"
                active-class="active-nav" :ripple="false">
                <v-row>
                    <v-col cols="1" class="d-flex align-center">
                        <v-icon size="small" icon="mdi-account-group-outline"></v-icon>
                    </v-col>
                    <v-col class="d-flex align-center">
                        <span class="item">Usuarios</span>
                    </v-col>
                </v-row>
            </v-list-item>

            <v-list-item :to="{ path: '/profile' }" :active="$route.meta.section === 'profile'"
                active-class="active-nav" :ripple="false">
                <v-row>
                    <v-col cols="1" class="d-flex align-center">
                        <v-icon size="small" icon="mdi-account-outline"></v-icon>
                    </v-col>
                    <v-col class="d-flex align-center">
                        <span class="item">Perfil</span>
                    </v-col>
                </v-row>
            </v-list-item>

            <v-spacer class="flex-grow-1" />

            <v-list-item :to="{ path: '/legal' }" active-class="active-nav" :ripple="false">
                <v-row>
                    <v-col class="d-flex align-center">
                        <span class="item text-decoration-underline">Aviso legal</span>
                    </v-col>
                </v-row>
            </v-list-item>

        </v-list>
    </v-navigation-drawer>
</template>

<script>
import { useUserStore } from '../store/userStore'

export default {
    data() {
        return {
            // Eliminamos variables drawer y rail
            colorNav: 'color:white; background: rgb(0,45,98); background: linear-gradient(61deg, rgba(0,45,98,1) 75%, rgba(16,86,189,1) 75%);',
            colorSidebar: '#002D62'
        }
    },
    computed: {
        userStore() {
            return useUserStore()
        }
    },
    methods: {
        toHome() {
            this.$router.push('/')
        },
        toSpaces() {
            this.$router.push('/spaces')
        },
        toMaterials() {
            this.$router.push('/materials')
        },
        toUsers() {
            this.$router.push('/users')
        },
        toProfile() {
            this.$router.push('/profile')
        },
        toReservations() {
            this.$router.push('/reservations')
        },
        toLegal() {
            this.$router.push('/legal')
        }
    }
}
</script>

<style scoped>
.item {
    font-size: clamp(8px, 1.2vw, 12px);
}

.active-nav {
    background-color: #0b3b78 !important;
    color: #fff !important;
    border-radius: 8px;
}

.active-nav .v-icon,
.active-nav .item {
    color: #fff !important;
}

.v-list-item:hover {
    background-color: rgba(255, 255, 255, 0.007);
    border-radius: 8px;
}

.v-list-item:active {
    background-color: #093264 !important;
}
</style>
