<template>
  <v-container class="container">
    <v-card class="mx-auto px-3" max-width="450">
      <v-card-title class="my-3">
        <span class="text-h4"><b>Registro</b></span>
      </v-card-title>
      <v-card-text>
        <v-col>
          <v-row>
            <v-text-field
              v-model="name"
              type="text"
              variant="outlined"
              label="Nombre"
              :prepend-icon="isCompany? 'mdi-office-building-outline': 'mdi-account-circle-outline'"
              required
              :rules="nameRules"
              class="my-1"
            />
          </v-row>
          <v-row>
            <v-text-field
              v-model="email"
              variant="outlined"
              label="E-mail"
              prepend-icon="mdi-email-outline"
              required
              class="my-1"
              :rules="emailRules"
            />
          </v-row>
          <v-row>
            <v-text-field
              v-model="password"
              variant="outlined"
              label="Contraseña"
              :type="show ? 'text' : 'password'"
              prepend-icon="mdi-lock-outline"
              :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"  
              @click:append-inner="show = !show"
              required
              class="my-1"
              :rules="passwordRules"
            />
          </v-row>
          <v-row>
            <v-text-field
              v-model="phone"
              variant="outlined"
              label="Teléfono"
              prepend-icon="mdi-phone-outline"
              required
              class="my-1"
              :rules="phoneRules"
            />
          </v-row>
          <v-row>
            <v-text-field
              v-model="address"
              variant="outlined"
              label="Dirección"
              :prepend-icon="isCompany? 'mdi-map-marker-outline': 'mdi-home-outline'"
              required
              class="my-1"
              :rules="addressRules"
            />
          </v-row>

          <v-row class="mt-n4">
            <v-col>
              <v-radio-group
                class="d-flex justify-center"
                inline
                v-model="isCompany"
                label="¿Es empresa?"
              >
                <v-radio label="No" :value="false"></v-radio>
                <v-radio label="Si" :value="true"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>

          <v-row>
            <v-text-field
              v-if="isCompany"
              variant="outlined"
              v-model="cif"
              label="CIF"
              prepend-icon="mdi-file-document-outline"
              required
              :rules="cifRules"
              class="my-1"
            />
          </v-row>

          <v-row>
            <TonalButton
                color="primary"
                text="Registrarse"
                class="cta-btn custom-disabled-btn"
                @click="submit" 
                :disabled="camposVacios()"
                block
              />
          </v-row>

          <v-row>
            <v-col class="text-center">
              <p class="subtitle">
                ¿Tienes una cuenta?
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
  components: {
    TonalButton,
  },
  data: () => ({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    show: false,
    isCompany: false,
    cif: '',
    nameRules : [v => !!v || 'El nombre es requerido'],
    emailRules : [
        v => !!v || 'El email es obligatorio',
        v => /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/i.test(v) || 'El email debe ser válido',
    ],
    passwordRules: [
      v => !!v || 'La contraseña es requerida',
      v => v.length >= 8 || 'La contraseña debe tener al menos 8 caracteres',
      v => /[A-Z]/.test(v) || 'La contraseña debe incluir al menos una letra mayúscula',
      v => /[a-z]/.test(v) || 'La contraseña debe incluir al menos una letra minúscula',
      v => /\d/.test(v) || 'La contraseña debe incluir al menos un número',
    ],
    phoneRules : [
        v => !!v || 'El teléfono de contacto es requerido',
        v => /^[6-9]\d{8}$/.test(v) || 'El teléfono debe tener 9 dígitos y empezar con un número válido (6-9)',
    ],
    addressRules : [
        v => !!v || 'La dirección es requerida',
    ],
    cifRules : [
        v => !!v || 'El CIF es requerido',
        v => /^[A-HJNP-SUVW]\d{7}[A-J]$/i.test(v) || 'El CIF debe ser válido y comenzar con una letra válida',
    ],
  }),
  methods: {
    camposVacios() {
      // Verificar que los campos no estén vacíos y que cumplan las reglas de validación
      const nameValid = this.nameRules.every(rule => rule(this.name) === true);
      const emailValid = this.emailRules.every(rule => rule(this.email) === true);
      const passwordValid = this.passwordRules.every(rule => rule(this.password) === true);
      const phoneValid = this.phoneRules.every(rule => rule(this.phone) === true);
      const addressValid = this.addressRules.every(rule => rule(this.address) === true);
      const cifValid = this.cifRules.every(rule => rule(this.cif) === true);

      if (this.isCompany) {
        return !(this.name && this.email && this.cif && this.password && this.phone && this.address && nameValid &&  emailValid && cifValid && passwordValid &&  phoneValid &&  addressValid);
      }
      return !(this.name && this.email && this.password && this.phone && this.address && nameValid &&  emailValid && passwordValid &&  phoneValid &&  addressValid);
    },
    async submit() {
      const toast = useToast();
      if (!this.camposVacios()) {
        authService
          .signUp(this.name, this.email, this.password, this.phone, this.address, this.isCompany, this.cif)
          .then((res) => {
            console.log(res.data);
            toast.success("¡Usuario registrado con éxito!");
            this.$router.push("/login");
          })
          .catch((error) => {
            // Verifica si el código de estado es 500
            if (error.response && error.response.status === 409) {
              toast.error("El correo ya está en uso");
            } else {
              toast.error("Error al registrar el usuario");
            }
            console.log(error);
          });
      } else {
        toast.error("Error en validación");
      }
    },

  },
};
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
