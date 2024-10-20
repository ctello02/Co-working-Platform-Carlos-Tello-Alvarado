<template>
  <v-app>
    <NavBar v-if="isLogged"/>
    <v-main>
      <v-container>
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
        if (this.$route.name === 'login' || this.$route.name === 'register' || this.$route.name === 'forgot_password' || this.$route.name === 'reset') {
          return false;
        } else {
          return true;
        }
    } 
  }
}
</script>
