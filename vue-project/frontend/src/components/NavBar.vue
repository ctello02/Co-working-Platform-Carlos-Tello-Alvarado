<template>
    <!-- Barra superior -->
    <v-app-bar app :style="colorNav" density="compact">
        <v-toolbar-title>Co-Working Platform</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn class="mx-4" icon="mdi-account-outline" @click="toProfile()"></v-btn>
    </v-app-bar>

    <!-- Sidebar permanente -->
    <v-navigation-drawer app permanent :color="colorSidebar" :width="160">
        <v-list>
            <v-list-item @click="toHome">
                <v-row>
                    <v-col cols="1" class="d-flex align-center">
                        <v-icon size="small" icon="mdi-home-outline"></v-icon>
                    </v-col>
                    <v-col class="d-flex align-center">
                        <span class="item">Vista principal</span>
                    </v-col>
                </v-row>
            </v-list-item>

            <v-list-item @click="toReservations">
                <v-row>
                    <v-col cols="1" class="d-flex align-center">
                        <v-icon size="small" icon="mdi-calendar-outline"></v-icon>
                    </v-col>
                    <v-col class="d-flex align-center">
                        <span class="item">Reservas</span>
                    </v-col>
                </v-row>
            </v-list-item>

            <v-list-item @click="toSpaces">
                <v-row>
                    <v-col cols="1" class="d-flex align-center">
                        <v-icon size="small" icon="mdi-table-chair"></v-icon>
                    </v-col>
                    <v-col class="d-flex align-center">
                        <span class="item">Espacios</span>
                    </v-col>
                </v-row>
            </v-list-item>

            <v-list-item @click="toMaterials">
                <v-row>
                    <v-col cols="1" class="d-flex align-center">
                        <v-icon size="small" icon="mdi-tools"></v-icon>
                    </v-col>
                    <v-col class="d-flex align-center">
                        <span class="item">Materiales</span>
                    </v-col>
                </v-row>
            </v-list-item>

            <v-list-item v-if="userStore.getIsAdmin" @click="toUsers">
                <v-row>
                    <v-col cols="1" class="d-flex align-center">
                        <v-icon size="small" icon="mdi-account-group-outline"></v-icon>
                    </v-col>
                    <v-col class="d-flex align-center">
                        <span class="item">Usuarios</span>
                    </v-col>
                </v-row>
            </v-list-item>

            <v-list-item @click="changeAdmin">
                <v-row>
                    <v-col cols="1" class="d-flex align-center">
                        <v-icon size="small" :icon="userStore.getIsAdmin ? 'mdi-close' : 'mdi-check'"></v-icon>
                    </v-col>
                    <v-col class="d-flex align-center">
                        <span class="item" v-if="userStore.getIsAdmin">Quitar Admin</span>
                        <span class="item" v-else>Hacer Admin</span>
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
        changeAdmin() {
            this.userStore.setIsAdmin(!this.userStore.getIsAdmin)
            localStorage.setItem('isAdmin', this.userStore.getIsAdmin)
        }
    }
}
</script>

<style scoped>
.item {
    font-size: clamp(8px, 1.2vw, 12px);
}
</style>
