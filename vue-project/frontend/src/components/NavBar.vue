<template>
    <!-- Barra superior -->
    <v-app-bar :style="colorNav" density="comfortable" app>
        <template #prepend>
            <!-- Hamburguesa solo en móvil -->
            <v-app-bar-nav-icon v-if="mdAndDown" @click="drawer = !drawer" />

            <!-- Logo a la izquierda -->
            <RouterLink to="/" class="d-flex align-center text-decoration-none">
                <img src="/logos/logo_horizontal_blanco.png" alt="Co-Working Platform"
                    style="height:32px; display:block" />
            </RouterLink>
        </template>

        <v-spacer />
    </v-app-bar>

    <!-- Sidebar permanente -->
    <v-navigation-drawer v-model="drawer" app :temporary="mdAndDown" :permanent="lgAndUp" :width="mdAndDown ? 280 : 180"
        :color="colorSidebar">
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

<script setup>
import { useUserStore } from '../store/userStore'
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'

// Breakpoints de Vuetify
const { mdAndDown, lgAndUp } = useDisplay()

const colorNav = 'color:white; background: rgb(0,45,98); background: linear-gradient(61deg, rgba(0,45,98,1) 75%, rgba(16,86,189,1) 75%);'
const colorSidebar = '#002D62'

const userStore = useUserStore()

const drawer = ref(lgAndUp.value)


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
