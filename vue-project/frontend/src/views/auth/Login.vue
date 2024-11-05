<template>
  <v-container fluid>
    <v-card class="pa-10 container" outlined>
      <v-form ref="form" @submit.prevent="submit">
        <v-row>
          <v-col cols="12">
            <span class="text-h4"><b>Iniciar sesión</b></span>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              required
              :rules="emailRules"
              autocomplete="off"
              outlined
            />
          </v-col>
          <v-col style="display: flex; flex-direction: column; justify-content: flex-start;" cols="12">
            <v-text-field
              v-model="password"
              label="Contraseña"
              type="password"
              required
              :rules="passwordRules"
              autocomplete="new-password"
              outlined
            />
            <router-link
              style="align-self: flex-end; margin-top: -10px;"
              to="/forgot_password">
              Recuperar contraseña
            </router-link>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <TonalButton
              color="blue"
              text="Iniciar sesión"
              class="cta-btn custom-disabled-btn"
              type="submit"
              :disabled="camposVacios()"
              block
            />
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
  </v-container>
</template>

<script>
import { useUserStore } from '@/store/userStore'
import { authService } from '@/services/authService';
import TonalButton from '@/components/TonalButton.vue'

export default {
  data: () => ({
    
    email: '',
    password: '',
    emailRules: [
      v => !!v || 'El email es obligatorio',
      v => /.+@.+\..+/.test(v) || 'El email debe ser válido',
    ],
    passwordRules: [
      v => !!v || 'La contraseña es obligatoria',
      v => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres',
    ],
  }),
  components: {
    TonalButton
  },
  methods: {
    camposVacios() {
      // Verificar que los campos no estén vacíos y que cumplan las reglas de validación
      const emailValido = this.emailRules.every(rule => rule(this.email) === true);
      const passwordValido = this.passwordRules.every(rule => rule(this.password) === true);

      return !(this.email && this.password && emailValido && passwordValido);
    },
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

.custom-disabled-btn:disabled {
  background-color: #bfbfbf; 
  color: white !important; 
  cursor: not-allowed; 
  opacity: 1; 
  border: 1px solid #bbb; 
}

.container {
  max-width: 500px;
  margin: 0 auto;
  margin-top: 2em;
}
</style>
