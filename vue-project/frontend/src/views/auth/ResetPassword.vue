
<template>
  <v-card class="pa-10 container" outlined>
    <v-form
      ref="form"
      @submit.prevent="handleSubmit"
    >
      <v-row>
        <v-col cols="12">
          <h2 class="title">Change Password</h2>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="password"
            label="New Password"
            type="password"
            required
            :rules="passwordRules"
            autocomplete="new-password"
            outlined
          />
        </v-col>
      </v-row>

      <v-row v-if="this.saveButton">
        <v-col cols="12">
          <TonalButton
            class="cta-btn custom-disabled-btn"
            text="Save"
            color="blue"
            type="submit"
            :disabled="camposVacios()"
            block
          />
          
        </v-col>
      </v-row>

      <v-row v-if="this.loginForm">
        <v-col cols="12" class="text-center">
          <TonalButton @click="toLogin" color="blue" text="Iniciar sesión"/>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" class="text-center">
          <p v-if="message">{{ message }}</p>
        </v-col>
      </v-row>
    </v-form>
  </v-card>
</template>

<script>
import TonalButton from '@/components/TonalButton.vue';
import { authService } from '@/services/authService';


export default {
  data() {
    return {
      loginForm: false,
      saveButton: true,
      password: "",
      message: "",
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 6 || 'Password must be at least 6 characters',
      ],
    };
  },
  components:{
    TonalButton
  },
  methods: {
    camposVacios(){
      // Verificar que los campos no estén vacíos y que cumplan las reglas de validación
      const passwordValid = this.passwordRules.every(rule => rule(this.password) === true);

      return !(this.password && passwordValid);
    },
    async handleSubmit() {
      if (this.$refs.form.validate()) {
        authService.updatePassword(this.password, this.$route.query.token)
          .then(res => {
            console.log(res.data);
            this.message = res.data.message;
            this.loginForm = true;
            this.saveButton = false;
          })
          .catch(error => {
            console.log(error);
          });
      }
    },
    clear() {
      this.$refs.form.reset();
    },
    toLogin() {
      this.$router.push("/login");
    }
  }
};
</script>

<style scoped>
.title {
  text-align: center;
  font-weight: bold;
  margin-bottom: 20px;
}

.cta-btn {
  font-weight: bold;
  text-transform: uppercase;
}

.container {
  max-width: 400px;
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
