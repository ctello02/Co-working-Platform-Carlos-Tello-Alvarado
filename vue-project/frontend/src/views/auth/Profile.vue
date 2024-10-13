<template>
  <v-container class="pa-10 container">
    <v-card outlined>
      <v-card-title>
        <h2 class="title">Perfil</h2>
      </v-card-title>

      <v-card-text>
        <v-col>
          <v-row v-if="isCompany" cols="12" md="6">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Empresa</v-list-item-title>
                <v-list-item-subtitle>{{ name }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-row>

          <v-row v-if="isCompany" cols="12" md="6">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>CIF</v-list-item-title>
                <v-list-item-subtitle>{{ cif }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-row>

          <v-row v-if="!isCompany" cols="12" md="6">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Nombre</v-list-item-title>
                <v-list-item-subtitle>{{ name }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-row>

          <v-row cols="12" md="6">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Email</v-list-item-title>
                <v-list-item-subtitle>{{ email }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-row>

          <v-row cols="12" md="6">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Teléfono</v-list-item-title>
                <v-list-item-subtitle>{{ phone }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-row>

          <v-row cols="12" md="6">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Dirección</v-list-item-title>
                <v-list-item-subtitle>{{ address }}</v-list-item-subtitle>
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
        <v-btn @click="editModal = true" color="primary">Actualizar información</v-btn>
        <v-btn @click="changePassword">Cambiar contraseña</v-btn>
        <v-btn @click="logout" color="error">Cerrar sesión</v-btn>
      </v-card-actions>
    </v-card>

    <!-- Modal de edición -->
    <v-dialog v-model="editModal" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Editar usuario</span>
        </v-card-title>

        <v-card-text>
          <v-form>
            <v-text-field v-model="user.name" label="Nombre" required></v-text-field>
            <v-text-field v-model="user.email" label="E-mail" required></v-text-field>
            <v-text-field v-model="user.phone" label="Teléfono" required></v-text-field>
            <v-text-field v-model="user.address" label="Dirección" required></v-text-field>

            <v-radio-group v-model="user.isCompany" label="¿Es empresa?">
              <v-radio label="Si" :value="true"></v-radio>
              <v-radio label="No" :value="false"></v-radio>
            </v-radio-group>

            <v-text-field v-if="user.isCompany" v-model="user.cif" label="CIF" required></v-text-field>
          </v-form>
        </v-card-text>


        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="editModal = false">Cancelar</v-btn>
          <v-btn color="primary" @click="updateUser">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


  </v-container>
</template>

<script>
import axios from "axios";
import { useUserStore } from "@/store/userStore";

export default {
  name: "Profile",
  data() {
    return {
      user: null,
      name: '',
      email: '',
      phone: '',
      address: '',
      isCompany: '',
      cif: '',
      token: null,
      payment_method: null,
      editModal: false,
    };
  },
  mounted() {
    const userStore = useUserStore();
    this.token = userStore.getToken;
    this.getUser();
  },
  methods: {
    getUser() {
      axios
        .get("http://localhost:3000/api/auth/user", {
          headers: {
            Authorization: "Bearer " + this.token,
            "x-access-token": this.token
          }
        })
        .then(res => {
          this.user = res.data.user;
          this.name = this.user.name;
          this.email = this.user.email;
          this.phone = this.user.phone;
          this.address = this.user.address;
          this.cif = this.user.cif;
          this.isCompany = this.user.isCompany;
        })
        .catch(error => {
          console.log(error);
          this.$router.push("/login");
        });
    },
    updateUser() {
      if (this.user.isCompany == false) {
        this.user.cif = null;
      }

      axios
        .put(
          "http://localhost:3000/api/users/updateUser",
          this.user, // Usar los datos del usuario seleccionado
          {
            headers: {
              Authorization: "Bearer " + this.token,
              "x-access-token": this.token
            }
          }
        )
        .then(res => {
          console.log(res.data);
          this.editModal = false;
        })
        .catch(error => {
          console.log(error);
        });

        this.getUser();
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