<template>
  <v-card class="pa-10 container" outlined>
    <v-form ref="form" v-model="valid" @submit.prevent="submit">
      <v-row>
        <v-col cols="12">
          <h2 class="title">Iniciar sesión</h2>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-text-field v-model="email" label="Email" type="email" required :rules="emailRules" autocomplete="off"
            outlined />
        </v-col>

        <v-col style="display: flex; flex-direction: column; justify-content: flex-start;" cols="12">
          
          <v-text-field v-model="password" label="Contraseña" type="password" required :rules="passwordRules"
            autocomplete="new-password" outlined />
            <router-link
              style="align-self: flex-end; margin-top: -10px;"
              to="/forgot_password">
              Recuperar contraseña
            </router-link>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-btn class="cta-btn" color="primary" type="submit" :disabled="!valid" block>
            Iniciar sesión
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" class="text-center">
          <p class="subtitle">
            ¿No tienes una cuenta? 
            <router-link to="/register">Regístrate</router-link>
          </p>
        </v-col>
      </v-row>
    </v-form>
  </v-card>
</template>

<script>
import { useUserStore } from '@/store/userStore'
import { authService } from '@/services/authService';


export default {
  data: () => ({
    valid: true,
    email: '',
    password: '',
    emailRules: [
      v => !!v || 'Email is required',
      v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    ],
    passwordRules: [
      v => !!v || 'Password is required',
      v => v.length >= 6 || 'Password must be at least 6 characters',
    ],
  }),
  methods: {
    async submit() {
      if (this.$refs.form.validate()) {
          authService.login(this.email, this.password)              
            .then(res => {
              const userStore = useUserStore();

              const _id = res.data.user._id;
              userStore.setId(_id);
              
              const token = res.data.token;
              userStore.setToken(token); 

              const isAdmin = res.data.user.isAdmin;
              userStore.setIsAdmin(isAdmin);         

              this.$router.push('/')
            })
            .catch(error => {
                console.log(error);
            });
      }
    },
    clear() {
      this.$refs.form.reset()
    }
  }
}
</script>

<style scoped>
.title {
  text-align: center;
  font-weight: bold;
  margin-bottom: 20px;
}

.subtitle {
  margin-top: 10px;
}

.cta-btn {
  font-weight: bold;
  text-transform: uppercase;
}

.container {
  max-width: 500px;
  margin: 0 auto;
  margin-top: 2em;
}
</style>
