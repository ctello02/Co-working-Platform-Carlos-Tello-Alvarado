<template>
  <v-container class="container">
      <v-card v-if="user" class="mx-auto px-2" max-width="550">
        <v-card-title class="my-3">
          <span class="text-h4">Editar perfil</span>
        </v-card-title>
        <v-card-text>
          <v-col>
            <v-row>
              <v-text-field
                v-model="user.name"
                type="text"
                variant="outlined"
                label="Nombre"
                :prepend-icon="user?.isCompany? 'mdi-office-building-outline': 'mdi-account-circle-outline'"
                required
                :rules="nameRules"
                class="my-1"
              />
            </v-row>
            <v-row>
              <v-text-field
                v-model="user.email"
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
                v-model="user.phone"
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
                v-model="user.address"
                variant="outlined"
                label="Dirección"
                :prepend-icon="user?.isCompany? 'mdi-map-marker-outline': 'mdi-home-outline'"
                required
                class="my-1"
                :rules="addressRules"
              />
            </v-row>

            <v-radio-group inline class="ml-3 mt-1 d-flex justify-center" v-model="user.isCompany" label="¿Es empresa?">
              <v-radio label="Si" :value="true"></v-radio>
              <v-radio label="No" :value="false"></v-radio>
            </v-radio-group>

            <v-row>
              <v-text-field
                v-if="user.isCompany"
                variant="outlined"
                v-model="user.cif"
                prepend-icon="mdi-file-document-outline"
                label="CIF"
                required
                :rules="cifRules"
                class="mb-n5 mt-5"
              />
            </v-row>          
          </v-col>
        </v-card-text>

        <v-card-actions class="mb-3 mr-2 d-flex justify-end ga-3">
          <TonalButton 
            color="grey" 
            text="Volver" 
            @click="routerBack"
          />
          <TonalButton 
            text="Cambiar contraseña" 
            color="grey" 
          />
          <TonalButton 
            color="blue" 
            text="Actualizar" 
            @click="submit" 
            :disabled="camposVacios()"
          />
        </v-card-actions>
      </v-card>
  </v-container>
</template>	

<script>
import { useUserStore } from '@/store/userStore';
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { useToast } from 'vue-toastification';
import TonalButton from '@/components/TonalButton.vue'


export default {
  data() {
    return {
        userStore: null,
        user: null,
        success: false,
        successToastId: null,
        nameRules : [
          v => !!v || 'El nombre es requerido',
        ],
        emailRules : [
          v => !!v || 'El email es obligatorio',
          v => /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/i.test(v) || 'El email debe ser válido',
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
    };
  },
  components: {
    TonalButton
  },
  mounted() {
    this.userStore = useUserStore();
    this.getUser();
  },
  methods: {
    routerBack() {
      const toast = useToast();
      if (this.successToastId) {
          toast.dismiss(this.successToastId); // Cierra el toast específico usando el ID
      } else {
          toast.clear(); // Elimina todos los toasts como respaldo
      }
      this.$router.push('/profile');
    },
    camposVacios() {
        // Verificar que los campos no estén vacíos y que cumplan las reglas de validación
        const nameValid = this.nameRules.every(rule => rule(this.user.name) === true);
        const emailValid = this.emailRules.every(rule => rule(this.user.email) === true);
        const phoneValid = this.phoneRules.every(rule => rule(this.user.phone) === true);
        const addressValid = this.addressRules.every(rule => rule(this.user.address) === true);
        const cifValid = this.cifRules.every(rule => rule(this.user.cif) === true);

        if (this.user.isCompany) {
            return !(this.user.name && this.user.email && this.user.cif && this.user.phone && this.user.address && nameValid && emailValid &&  phoneValid &&  addressValid && cifValid);
        }
        return !(this.user.name && this.user.email && this.user.phone && this.user.address && nameValid && emailValid &&  phoneValid &&  addressValid);
    },
    getUser() {
      authService.getUser()
        .then(res => {
          this.user = res.data.user;
        })
        .catch(error => {
          console.log(error);
          this.$router.push("/login");
        });
    },
    async submit() {
      const toast = useToast();
      if (this.user.isCompany == false) {
          this.user.cif = null;
      }

      userService.updateUser(this.user)
          .then(res => {
              console.log(res.data);
              this.userStore.setSelectedUser(this.user);
              this.user = this.userStore.getSelectedUser;
              // Mostrar la alerta de éxito y ocultarla después de 3 segundos
              this.successToastId = toast.success('¡Perfil editado con éxito!');
          })
          .catch(error => {
              console.log(error);
          });
    },
  },
};
</script>
