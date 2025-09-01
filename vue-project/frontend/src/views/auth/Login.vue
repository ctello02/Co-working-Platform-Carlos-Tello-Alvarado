<template>
  <v-container class="container">
    <v-card class="mx-auto px-3" max-width="450">
      <v-card-title class="d-flex justify-center align-center flex-column">
        <v-img src="/logos/logo_completo_azul.svg" height="160px" width="360px" cover class="align-end" />
        <span class="text-h5 mt-n3" style="color: #002D62"><b>Iniciar sesión</b></span>
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
              <router-link class="align-self-end mt-n1 mb-3 routerLink" to="/forgot_password" v-if="enableRegister">
                Recuperar contraseña
              </router-link>
            </v-row>
            <v-row>
              <TonalButton type="submit" color="blue" text="Iniciar sesión" class="cta-btn custom-disabled-btn"
                @click="submit" :disabled="emptyFields() || loading" block />
            </v-row>
            <v-row v-if="enableRegister">
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
      registerAllowed: false,
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
  computed: {
    enableRegister() {
      return (import.meta.env.VITE_ENABLE_REGISTER ?? 'true') === 'true'
    }
  },
  mounted() {
    const toast = useToast();
    const status = this.$route?.query?.verified;

    if (status) {
      const messages = {
        '1': { text: 'Tu cuenta ha sido verificada. Ya puedes iniciar sesión', type: 'success' },
        'already': { text: 'Tu cuenta ya estaba verificada', type: 'info' },
        'expired': { text: 'El enlace ha caducado. Solicita uno nuevo', type: 'warning' },
        'invalid': { text: 'Enlace de verificación no válido', type: 'error' },
        'notfound': { text: 'No se ha podido verificar el correo', type: 'error' },
        'error': { text: 'No se ha podido verificar el correo', type: 'error' },
      };

      const m = messages[status] ?? { text: 'Error desconocido', type: 'info' };
      // Mostrar toast según el tipo
      if (m.type === 'success') toast.success(m.text);
      else if (m.type === 'warning') toast.warning?.(m.text) || toast.info(m.text);
      else if (m.type === 'error') toast.error(m.text);
      else toast.info(m.text);
    }
  },
  methods: {
    emptyFields() {
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
          } else if (error.response && error.response.status === 403) {
            toast.error("Debes verificar tu correo antes de iniciar sesión");
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
