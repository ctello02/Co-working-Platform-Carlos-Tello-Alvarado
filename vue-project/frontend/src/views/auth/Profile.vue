<template>
  <v-container class="pa-10 container" v-if="user">
    <v-card class="pa-3" outlined>
      <v-card-title class="my-2">
        <span class=" text-h4">Perfil</span>
      </v-card-title>

      <v-card-text class="mx-n3">
        <v-col>
          <v-row v-if="user.isCompany" cols="12" md="6">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Empresa</v-list-item-title>
                <v-list-item-subtitle>{{ user.name }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-row>

          <v-row v-if="user.isCompany" cols="12" md="6">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>CIF</v-list-item-title>
                <v-list-item-subtitle>{{ user.cif }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-row>

          <v-row v-if="!user.isCompany" cols="12" md="6">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Nombre</v-list-item-title>
                <v-list-item-subtitle>{{ user.name }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-row>

          <v-row cols="12" md="6">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Email</v-list-item-title>
                <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-row>

          <v-row cols="12" md="6">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Teléfono</v-list-item-title>
                <v-list-item-subtitle>{{ user.phone }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-row>

          <v-row cols="12" md="6">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Dirección</v-list-item-title>
                <v-list-item-subtitle>{{ user.address }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-row>

          <v-row cols="12" md="6">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Métodos de pago</v-list-item-title>
                <v-list-item-subtitle v-if="payment_method"></v-list-item-subtitle>
                <v-list-item-subtitle v-else>Sin configurar</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-row>
        </v-col>
      </v-card-text>

      <v-card-actions>
        <TonalButton text="Editar información" color="blue" @click="openEditProfileInfo()"/>
        <TonalButton text="Cambiar contraseña" color="grey" @click="changePassword" />
        <TonalButton text="Cerrar sesión" color="red" @click="logOutModal = true" />
      </v-card-actions>
    </v-card>

    <v-dialog v-model="logOutModal" max-width="450px">
      <v-card>
        <v-card-title class="ml-2 mt-3">
          <span class="text-h4">¿Cerrar sesión?</span>
        </v-card-title>

        <v-card-text>
            <v-row>
              <span class="ml-3 text-h6" style="color: tomato;">¿Estás seguro de que quieres cerrar sesión?</span>
            </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <TonalButton color="grey" text="Cancelar" @click="logOutModal=false" />
          <TonalButton color="red" text="Cerrar sesión" @click="logoutUser" />
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import { useUserStore } from "@/store/userStore";
import { authService } from '@/services/authService';
import TonalButton from '@/components/TonalButton.vue'

export default {
  name: "Profile",
  data() {
    return {
      user: null,
      payment_method: null, 
      logOutModal: false,
    };
  },
  components: {
    TonalButton
  },
  mounted() {
    this.getUser();
  },
  methods: {
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
    openEditProfileInfo() {
      this.$router.push('/editProfileInfo');
    },
    logoutUser() {
      const userStore = useUserStore();
      userStore.clearUser();
      this.$router.push("/login");
    },
    changePassword() {
      //Abrir modal de cambio de contraseña
    },
  }
};
</script>

<style scoped>
.title {
  margin-bottom: 20px;
}

.v-card-actions {
  margin-top: 0em;
  justify-content: flex-end;
}

.v-list-item-subtitle{
  margin-bottom: 5px;
  padding-bottom: 3px;
}

.container {
  max-width: 700px;
  margin: 0 auto;
}
</style>