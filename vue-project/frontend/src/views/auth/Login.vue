<template>
  <v-container class="container">
    <v-card class="mx-auto px-3" max-width="450">
      <v-card-title class="my-3">
        <span class="text-h4"><b>Iniciar sesión</b></span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="submit">
          <v-col>
            <v-row>
              <v-text-field v-model.trim="email" label="Email" type="email" variant="outlined"
                prepend-icon="mdi-email-outline" required :rules="emailRules" autocomplete="off" class="my-1"
                :maxlength="MAX_EMAIL" :counter="MAX_EMAIL" />
            </v-row>
            <v-row class="d-flex flex-column justify-start">
              <v-text-field v-model.trim="password" variant="outlined" label="Contraseña"
                :type="show ? 'text' : 'password'" prepend-icon="mdi-lock-outline"
                :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="show = !show" required
                class="my-1" :rules="passwordRules" :maxlength="MAX_PASSWORD" :counter="MAX_PASSWORD" />
              <router-link class="align-self-end mt-n1 mb-3 routerLink" to="/forgot_password">
                Recuperar contraseña
              </router-link>
            </v-row>
            <v-row>
              <TonalButton type="submit" color="blue" text="Iniciar sesión" class="cta-btn custom-disabled-btn"
                @click="submit" :disabled="emptyFields() || loading" block />
            </v-row>
            <v-row>
              <v-col class="text-center">
                <p class="subtitle">
                  ¿No tienes una cuenta?
                  <router-link class="routerLink" to="/register">Regístrate</router-link>
                </p>
              </v-col>
            </v-row>

          </v-col>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { useUserStore } from '@/store/userStore'
import { authService } from '@/services/authService';
import { useToast } from 'vue-toastification';
import TonalButton from '@/components/TonalButton.vue'

export default {
  data() {
    return {
      MAX_EMAIL: 254,        // estándar RFC
      MAX_PASSWORD: 72,      // bcrypt recomienda <= 72 bytes
      email: '',
      password: '',
      show: false,
      emailRules: [
        v => !!v || 'El email es obligatorio',
        v => v.length <= 254 || 'Máximo 254 caracteres',
        v => /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/i.test(v) || 'El email debe ser válido',
      ],
      passwordRules: [
        v => !!v || 'La contraseña es requerida',
        v => v.length >= 8 || 'La contraseña debe tener al menos 8 caracteres',
        v => v.length <= 72 || 'Máximo 72 caracteres',
        v => /[A-Z]/.test(v) || 'Debe incluir al menos una mayúscula',
        v => /[a-z]/.test(v) || 'Debe incluir al menos una minúscula',
        v => /\d/.test(v) || 'Debe incluir al menos un número',
      ],
    }
  },
  components: {
    TonalButton
  },
  methods: {
    emptyFields() {
      // Verificar que los campos no estén vacíos y que cumplan las reglas de validación
      const emailValido = this.emailRules.every(rule => rule(this.email) === true);
      const passwordValido = this.passwordRules.every(rule => rule(this.password) === true);

      return !(this.email && this.password && emailValido && passwordValido);
    },
    async submit() {
      authService.login(this.email, this.password)
        .then(res => {
          const userStore = useUserStore();

          userStore.setId(res.data.user._id);
          userStore.setToken(res.data.token);
          userStore.setIsAdmin(res.data.user.isAdmin);

          this.$router.push('/')
        })
        .catch(error => {
          const toast = useToast();
          if (error.response && error.response.status === 401) {
            toast.error("Contraseña incorrecta");
          } else if (error.response && error.response.status === 404) {
            toast.error("Usuario no econtrado");
          } else {
            toast.error(error.response.data.message);
          }
          console.log(error);
        });
    },
  }
}
</script>

<style scoped>
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

.routerLink {
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
  color: rgb(16, 86, 189);
  font-size: medium;
}

.routerLink:hover {
  text-decoration: underline;
}

.routerLink:visited {
  color: rgb(16, 86, 189);
}
</style>
