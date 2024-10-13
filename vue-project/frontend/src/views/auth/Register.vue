<template>
  <v-card class="pa-10 container" outlined>
    <v-form ref="form" v-model="valid" @submit.prevent="submit">
      <v-row>
        <v-col cols="12">
          <h2 class="title">Registro</h2>
        </v-col>
      </v-row>

        <v-row v-if="!this.isCompany">
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
        <v-col >
          <v-radio-group style="margin-top: -20px;" class="d-flex justify-center" inline v-model="isCompany" label="¿Es empresa?">
              <v-radio label="No" :value="false"></v-radio>
              <v-radio label="Si" :value="true"></v-radio>
            </v-radio-group>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-btn class="cta-btn" color="primary" type="submit" :disabled="!valid" block>
            Registrarse
          </v-btn>
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
import axios from 'axios';

export default {
  data: () => ({
    valid: true,
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    isCompany: false,
    cif: '',
    nameRules: [
      v => !!v || 'El nombre es requerido',
    ],
    emailRules: [
      v => !!v || 'El email es requerido',
      v => /\S+@\S+\.\S+/.test(v) || 'El email debe ser válido',
    ],
    passwordRules: [
      v => !!v || 'La contraseña es requerida',
      v => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres',
    ],
    phoneRules: [
      v => !!v || 'El teléfono de contacto es requerido',
    ],
    addressRules: [
      v => !!v || 'La dirección es requerida',
    ],
    companyNameRules: [
      v => !!v || 'El nombre de la empresa es requerido',
    ],
    cifRules: [
      v => !!v || 'El CIF es requerido',
    ],
    companyEmailRules: [
      v => !!v || 'El email de la empresa es requerido',
      v => /\S+@\S+\.\S+/.test(v) || 'El email debe ser válido',
    ],
    companyAddressRules: [
      v => !!v || 'La dirección de la empresa es requerida',
    ],
  }),
  methods: {
    async submit() {
      if (this.$refs.form.validate()) {
        try {
          const response = await axios.post('http://localhost:3000/api/auth/signup', {
            name: this.name,
            email: this.email,
            password: this.password,
            phone: this.phone,
            address: this.address,
            isCompany: this.isCompany,
            cif: this.cif,
          });

          this.$router.push("/login");
          console.log("Registrado con éxito");
        } catch (err) {
          const message = err.response?.data?.message || 'Ocurrió un error durante el registro';
          console.log(message);
        }
      }
    },
    clear() {
      this.$refs.form.reset();
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
