<template>
  <v-card class="pa-10 container" outlined>
    <v-form ref="form" @submit.prevent="submit">
      <v-row>
        <v-col cols="12">
          <h2 class="title">Registro</h2>
        </v-col>
      </v-row>

      <v-row v-if="!isCompany">
        <v-col cols="12">
          <v-text-field
            v-model="name"
            label="Nombre"
            type="text"
            required
            :rules="nameRules"
            autocomplete="off"
            outlined
          />
        </v-col>
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
        <v-col cols="12">
          <v-text-field
            v-model="password"
            label="Contraseña"
            type="password"
            required
            :rules="passwordRules"
            autocomplete="new-password"
            outlined
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="phone"
            label="Teléfono"
            type="tel"
            required
            :rules="phoneRules"
            autocomplete="off"
            outlined
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="address"
            label="Dirección"
            type="text"
            required
            :rules="addressRules"
            autocomplete="off"
            outlined
          />
        </v-col>
      </v-row>

      <v-row v-if="isCompany">
        <v-col cols="12">
          <v-text-field
            v-model="name"
            label="Nombre de la empresa"
            type="text"
            required
            :rules="companyNameRules"
            autocomplete="off"
            outlined
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="email"
            label="Email de la empresa"
            type="email"
            required
            :rules="companyEmailRules"
            autocomplete="off"
            outlined
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="cif"
            label="CIF"
            type="text"
            required
            :rules="cifRules"
            autocomplete="off"
            outlined
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="password"
            label="Contraseña"
            type="password"
            required
            :rules="passwordRules"
            autocomplete="new-password"
            outlined
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="phone"
            label="Teléfono de contacto"
            type="tel"
            required
            :rules="phoneRules"
            autocomplete="off"
            outlined
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="address"
            label="Dirección de la empresa"
            type="text"
            required
            :rules="companyAddressRules"
            autocomplete="off"
            outlined
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-radio-group
            style="margin-top: -20px;"
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
        <v-col cols="12">
          <TonalButton
            color="primary"
            text="Registrarse"
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
            ¿Tienes una cuenta?
            <router-link to="/login">Inicia sesión</router-link>
          </p>
        </v-col>
      </v-row>
    </v-form>
  </v-card>
</template>

<script>
import { authService } from '@/services/authService';
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
    isCompany: false,
    cif: '',
    nameRules: [v => !!v || 'El nombre es requerido'],
    emailRules: [
      v => !!v || 'El email es obligatorio',
      v => /.+@.+\..+/.test(v) || 'El email debe ser válido',
    ],
    passwordRules: [
      v => !!v || 'La contraseña es requerida',
      v => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres',
    ],
    phoneRules: [v => !!v || 'El teléfono de contacto es requerido'],
    addressRules: [v => !!v || 'La dirección es requerida'],
    companyNameRules: [v => !!v || 'El nombre de la empresa es requerido'],
    cifRules: [v => !!v || 'El CIF es requerido'],
    companyEmailRules: [
      v => !!v || 'El email de la empresa es requerido',
      v => /\S+@\S+\.\S+/.test(v) || 'El email debe ser válido',
    ],
    companyAddressRules: [v => !!v || 'La dirección de la empresa es requerida'],
  }),
  methods: {
    camposVacios() {
      // Verificar que los campos no estén vacíos y que cumplan las reglas de validación
      const nameValid = this.nameRules.every(rule => rule(this.name) === true);
      const emailValid = this.emailRules.every(rule => rule(this.email) === true);
      const passwordValid = this.passwordRules.every(rule => rule(this.password) === true);
      const phoneValid = this.phoneRules.every(rule => rule(this.phone) === true);
      const addressValid = this.addressRules.every(rule => rule(this.address) === true);
      const companyNameValid = this.companyNameRules.every(rule => rule(this.name) === true);
      const cifValid = this.cifRules.every(rule => rule(this.cif) === true);
      const companyEmailValid = this.companyEmailRules.every(rule => rule(this.email) === true);
      const companyAddressValid = this.companyAddressRules.every(rule => rule(this.address) === true);

      if (this.isCompany) {
        return !(this.name && this.email && this.cif && this.password && this.phone && this.address && companyNameValid &&  companyEmailValid && cifValid && passwordValid &&  phoneValid &&  companyAddressValid);
      }
      return !(this.name && this.email && this.password && this.phone && this.address && nameValid &&  emailValid &&  passwordValid &&  phoneValid &&  addressValid);
    },
    async submit() {
      if (!this.camposVacios()) {
        authService
          .signUp(this.name, this.email, this.password, this.phone, this.address, this.isCompany, this.cif)
          .then(res => {
            console.log(res.data);
            this.$router.push("/login");
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        console.log("Error en validación");
      }
    },
  },
};
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

.custom-disabled-btn:disabled {
  background-color: #bfbfbf; 
  color: white !important; 
  cursor: not-allowed; 
  opacity: 1; 
  border: 1px solid #bbb; 
}
</style>
