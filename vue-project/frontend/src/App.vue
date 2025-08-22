<template>
  <v-app>
    <NavBar v-if="isLogged" />
    <v-main :class="{ 'main-gradient': showGradient, 'main-background': !showGradient }">
      <v-container fluid class="px-10">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import { useUserStore } from './store/userStore';
import { authService } from './services/authService';

export default {
  data() {
    return {
      userStore: null,
      gradient_color: 'color: white; background: rgb(0,45,98); background: linear-gradient(61deg, rgba(0,45,98,1) 75%, rgba(16,86,189,1) 75%);',
    }
  },
  components: {
    NavBar,
    RouterView
  },
  async mounted() {
    this.userStore = useUserStore();
    authService.getUser()
      .then(res => this.userStore.setThisUser(res.data.user))
      .catch(console.error);
  },
  computed: {
    isLogged() {
      return !['login', 'register', 'forgot_password', 'reset', 'legal'].includes(this.$route.name);
    },
    showGradient() {
      return this.$route.meta.gradient;
    }
  }
}
</script>

<style scoped>
.main-background {
  background-color: #f8f9f9;
  min-height: 100vh;
}

.main-gradient {
  background: rgb(0, 45, 98);
  background: linear-gradient(61deg, rgba(0, 45, 98, 1) 75%, rgba(16, 86, 189, 1) 75%);
  min-height: 100vh;
}
</style>
