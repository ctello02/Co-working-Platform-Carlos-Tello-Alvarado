<template>
  <v-card class="pa-10 container" outlined>
    <v-form
      ref="form"
      @submit.prevent="handleSubmit"
    >
      <v-row>
        <v-col cols="12">
          <h2 class="title">Forgot Password</h2>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="email"
            label="Enter email"
            type="email"
            required
            :rules="emailRules"
            autocomplete="off"
            outlined
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <TonalButton
            class="cta-btn custom-disabled-btn"
            text="Send"
            color="blue"
            type="submit"
            :disabled="camposVacios()"
            block
          />
            
          
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
import { authService } from '@/services/authService';
import TonalButton from '@/components/TonalButton.vue';


export default {
  data() {
    return {
      email: "",
      message: "",
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /\S+@\S+\.\S+/.test(v) || 'E-mail must be valid',
      ]
    };
  },
  components: {
    TonalButton,
  },
  methods: {
    camposVacios() {
      // Verificar que los campos no estén vacíos y que cumplan las reglas de validación
      const emailValido = this.emailRules.every(rule => rule(this.email) === true);

      return !(this.email && emailValido);
    },
    async handleSubmit() {
      if (this.$refs.form.validate()) {

        authService.forgotPassword(this.email)
          .then(res => {
            console.log(res.data);
            this.message = res.data.message;
          })
          .catch(error => {
            console.log(error);
          });
      }
    },
    clear() {
      this.$refs.form.reset();
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
  