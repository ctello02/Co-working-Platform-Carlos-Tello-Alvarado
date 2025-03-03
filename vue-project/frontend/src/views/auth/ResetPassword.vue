<template>
  <v-container class="container">
    <v-card class="mx-auto px-3" max-width="450">
      <v-card-title class="my-3">
        <span class="text-h4"><b>Cambia la contraseña</b></span>
      </v-card-title>
      <v-card-text>
        <v-col>
          <v-row>
            <v-text-field v-model="password" variant="outlined" label="Contraseña" :type="show ? 'text' : 'password'"
              prepend-icon="mdi-lock-outline" :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="show = !show" required class="my-1" :rules="passwordRules" />
          </v-row>
          <v-row>
            <TonalButton v-if="this.saveButton" class="cta-btn custom-disabled-btn" text="Guardar" color="blue"
              @click="submit" :disabled="emptyFields()" block />
            <TonalButton v-else @click="toLogin" color="blue" text="Iniciar sesión" block />
          </v-row>
        </v-col>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import TonalButton from '@/components/TonalButton.vue';
import { authService } from '@/services/authService';
import { useToast } from 'vue-toastification';

export default {
  data() {
    return {
      saveButton: true,
      password: "",
      show: false,
      passwordRules: [
        v => !!v || 'La contraseña es requerida',
        v => v.length >= 8 || 'La contraseña debe tener al menos 8 caracteres',
        v => /[A-Z]/.test(v) || 'La contraseña debe incluir al menos una letra mayúscula',
        v => /[a-z]/.test(v) || 'La contraseña debe incluir al menos una letra minúscula',
        v => /\d/.test(v) || 'La contraseña debe incluir al menos un número',
      ],
    };
  },
  components: {
    TonalButton
  },
  methods: {
    emptyFields() {
      // Verificar que los campos no estén vacíos y que cumplan las reglas de validación
      const passwordValid = this.passwordRules.every(rule => rule(this.password) === true);
      return !(this.password && passwordValid);
    },
    async submit() {
      const toast = useToast();
      authService.resetPassword(this.password, this.$route.query.token)
        .then(res => {
          console.log(res.data);
          toast.success(res.data.message);
          this.password = null;
          this.saveButton = false;
        })
        .catch(error => {
          console.log(error);
        });
    },
    toLogin() {
      this.$router.push("/login");
    }
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
</style>
