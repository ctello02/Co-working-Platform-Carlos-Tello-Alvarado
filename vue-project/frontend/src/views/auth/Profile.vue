<template>
  <v-container class="pa-10 container">
    <v-card outlined>
      <v-card-title>
        <h2 class="title">Perfil</h2>
      </v-card-title>

      <v-card-text v-if="user">
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
        <v-btn @click="openEditProfileInfo()" color="primary">Actualizar información</v-btn>
        <v-btn @click="changePassword">Cambiar contraseña</v-btn>
        <v-btn @click="logout" color="error">Cerrar sesión</v-btn>
      </v-card-actions>
    </v-card>

  </v-container>
</template>

<script>
import { useUserStore } from "@/store/userStore";
import { authService } from '@/services/authService';

export default {
  name: "Profile",
  data() {
    return {
      user: null,
      payment_method: null,
    };
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
    logout() {
      const userStore = useUserStore();
      userStore.clearUser();
      this.$router.push("/login");
    },
    changePassword() {
      //Abrir modal de cambio de contraseña
    }
  }
};
</script>

<style scoped>
.title {
  font-weight: bold;
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