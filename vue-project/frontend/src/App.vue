<template>
  <v-app>
    <NavBar v-if="isLogged"/>
    <v-main class="main-background">
      <v-container fluid class="px-10">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'

export default {
  components: {
    NavBar,
    RouterView
  },
  computed: {
    isLogged() {
        return !['login', 'register', 'forgot_password', 'reset'].includes(this.$route.name);
    } 
  }
}
</script>

<style scoped>
.main-background {
  background-color: #f8f9f9; 
  min-height: 100vh; 
}
</style>
