<template>
  <v-container class="container">
    <v-card class="mx-auto px-3" max-width="450">
      <v-card-title class="my-3">
        <span class="text-h4"><b>Recuperar contraseña</b></span>
      </v-card-title>
      <v-card-text>
        <v-col>
          <v-row>
            <v-text-field v-model="email" label="Email" type="email" variant="outlined" prepend-icon="mdi-email-outline"
              required :rules="emailRules" autocomplete="off" class="my-1" />
          </v-row>

          <v-row>
            <v-btn class="cta-btn custom-disabled-btn" color="#1056bd" variant="tonal" @click="submit"
              :disabled="emptyFields() || loading" block>
              <template v-if="loading">
                <v-progress-circular indeterminate size="20" color="white" />
              </template>
              <template v-else>
                <b>Enviar correo</b>
              </template>
            </v-btn>

          </v-row>
          <v-row>
            <v-col class="text-center">
              <p class="subtitle">
                ¿Prefiere volver?
                <router-link class="routerLink" to="/login">Inicia sesión</router-link>
              </p>
            </v-col>
          </v-row>
        </v-col>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { authService } from '@/services/authService';
import { useToast } from 'vue-toastification';
import TonalButton from '@/components/TonalButton.vue';


export default {
  data() {
    return {
      email: "",
      loading: false, // Estado de carga
      emailRules: [
        v => !!v || 'El email es obligatorio',
        v => /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/i.test(v) || 'El email debe ser válido',
      ],
    };
  },
  components: {
    TonalButton,
  },
  methods: {
    emptyFields() {
      // Verificar que los campos no estén vacíos y que cumplan las reglas de validación
      const emailValido = this.emailRules.every(rule => rule(this.email) === true);
      return !(this.email && emailValido);
    },
    async submit() {
      this.loading = true; // Activa el estado de carga
      const toast = useToast();
      console.log(this.email);

      authService.forgotPassword({ email: this.email })
        .then(res => {
          toast.success(res.data.message);
          this.email = null;
        })
        .catch(error => {
          this.toast.error(error.response.data.message);
          console.log(error);
        })
        .finally(() => {
          this.loading = false; // Desactiva el estado de carga
        });
    },
  }
};
</script>

<style scoped>
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