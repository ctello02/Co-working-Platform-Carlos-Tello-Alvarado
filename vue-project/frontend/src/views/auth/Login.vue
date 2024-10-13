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
import axios from 'axios'
import { useUserStore } from '@/store/userStore'

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
        try {
          const response = await axios.post('http://localhost:3000/api/auth/login', {
            email: this.email,
            password: this.password
          })

          const _id = response.data._id
          const token = response.data.token
          const isAdmin = response.data.isAdmin          

          const userStore = useUserStore();
          userStore.setId(_id);   
          userStore.setToken(token);   
          userStore.setIsAdmin(isAdmin);

          this.$router.push('/')

        } catch (err) {
          const message = err.response?.data?.message || 'Error occurred during login'
          console.log(message);

        }
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
