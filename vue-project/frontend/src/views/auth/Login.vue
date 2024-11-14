<template>
  <v-container class="container">
    <v-card class="mx-auto px-3" max-width="450">
      <v-card-title class="my-3">
        <span class="text-h4"><b>Iniciar sesión</b></span>
      </v-card-title>
      <v-card-text>
        <v-col>
          <v-row>
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              variant="outlined"
              prepend-icon="mdi-email-outline"
              required
              :rules="emailRules"
              autocomplete="off"
              class="my-1"
            />
          </v-row>
          <v-row class="d-flex flex-column justify-start">
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
            <router-link
              class="align-self-end mt-n1 mb-3 routerLink"
              to="/forgot_password">
              Recuperar contraseña
            </router-link>
          </v-row>
          <v-row>
            <TonalButton
              color="blue"
              text="Iniciar sesión"
              class="cta-btn custom-disabled-btn"
              @click="submit" 
              :disabled="camposVacios()"
              block
            />
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
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { useUserStore } from '@/store/userStore'
import { authService } from '@/services/authService';
import TonalButton from '@/components/TonalButton.vue'

export default {
  data () {
    return {
      email: '',
      password: '',
      show: false,
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
    }
  },
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
    },
    clear() {
      this.$refs.form.reset()
    }
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
