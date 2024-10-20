<template>
    <v-app-bar prominent app>
        <v-app-bar-nav-icon @click.stop="rail = !rail"></v-app-bar-nav-icon>
        <v-toolbar-title>Co-Working Platform</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn class="ma-2" icon="mdi-account" @click="toProfile()"></v-btn>
    </v-app-bar>

    <v-navigation-drawer permanent :rail="rail" v-model="drawer" app>
        <v-list>
            <v-list-item prepend-icon="mdi-home-outline" @click="toHome">
                Vista principal
            </v-list-item>
            <v-list-item prepend-icon="mdi-table-chair" @click="toSpaces">
                Espacios
            </v-list-item>
            <!-- Mostramos el link a "Usuarios" solo si el usuario es admin -->
            <v-list-item v-if="userStore.getIsAdmin" prepend-icon="mdi-account-group-outline" @click="toUsers">
                Usuarios
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<script>
import { useUserStore } from '../store/userStore'

export default {
    data() {
        return {
            drawer: true,
            rail: false,
        }
    },
    computed: {
        userStore() {
            return useUserStore(); 
        }
    },
    methods: {
        toHome() {
            this.$router.push('/')
        },
        toSpaces() {
            this.$router.push('/spaces')
        },
        toUsers() {
            this.$router.push('/users')
        },
        toProfile() {
            this.$router.push('/profile')
        }
    }
}
</script>

<style scooped>
.hamburger {
    font-size: 24px;
    cursor: pointer;
    background: none;
    border: none;
    position: fixed;
    top: 10px;
    left: 10px;
    z-index: 1000;
    color: black;
    /* Color por defecto del icono */
    transition: color 0.3s;
    /* Transición suave para el cambio de color */
}

.white-icon {
    color: white;
    /* Color del icono cuando el menú está abierto */
}

.side-menu {
    position: fixed;
    top: 0;
    left: -250px;
    width: 250px;
    height: 100%;
    background-color: #333;
    padding-top: 60px;
    transition: 0.3s;
    z-index: 999;
}

.side-menu a {
    padding: 10px 15px;
    text-decoration: none;
    font-size: 18px;
    color: white;
    display: block;
    transition: 0.3s;
}

.side-menu a:hover {
    background-color: #575757;
}

.side-menu.open {
    left: 0;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 500;
}

.link {
    margin: 15px;
    border-radius: 10px;
    border: 1px solid #585858;

}
</style>
