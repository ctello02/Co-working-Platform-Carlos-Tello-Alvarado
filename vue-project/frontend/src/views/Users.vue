<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1>Usuarios</h1>
        <!-- Tabla de Usuarios dentro de una tarjeta para mejor manejo del ancho -->
        <v-card>
          <v-table class="full-width-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>E-mail</th>
                <th>Administrador</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in users" :key="user._id">
                <td>{{ index + 1 }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.isAdmin ? 'Si' : 'No' }}</td>


                <td>
                  <v-form style="display: flex; gap: 10px;">
                    <v-btn @click="openInfoModal(user)" icon="mdi-account-search-outline" variant="text"></v-btn>
                    <v-btn @click="openEditModal(user)" color="primary" icon="mdi-account-edit-outline" variant="text"></v-btn>
                    <v-btn @click="openDeleteModal(user)" color="error" icon="mdi-trash-can-outline" variant="text"></v-btn>
                  </v-form>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal de información -->
    <v-dialog v-model="infoModal" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Información del usuario</span>
        </v-card-title>

        <v-card-text id="info-container">
            <p>ID: <span class="text-h6">{{ selectedUser?._id }}</span></p>
            <p>Nombre: <span class="text-h6">{{ selectedUser?.name }}</span></p>
            <p>Email: <span class="text-h6">{{ selectedUser?.email }}</span></p>
            <p>Teléfono: <span class="text-h6">{{ selectedUser?.phone }}</span></p>
            <p>Dirección: <span class="text-h6">{{ selectedUser?.address }}</span></p>
            <p>¿Es empresa?: <span class="text-h6">{{ selectedUser?.isCompany ? 'Si' : 'No' }}</span></p>
            <p v-if="selectedUser.isCompany" class="text-h6">CIF: <span class="text-h6">{{ selectedUser?.cif }}</span></p>
            <p>¿Es administrador?: <span class="text-h6">{{ selectedUser?.isAdmin ? 'Si' : 'No' }}</span></p>
        </v-card-text>


        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="infoModal = false">Cancelar</v-btn>
          <v-btn color="primary" @click="openEditModal(selectedUser)">Editar información</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de edición -->
    <v-dialog v-model="editModal" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Editar usuario</span>
        </v-card-title>

        <v-card-text>
          <v-form>
            <v-text-field v-model="selectedUser.name" label="Nombre" required></v-text-field>
            <v-text-field v-model="selectedUser.email" label="E-mail" required></v-text-field>
            <v-text-field v-model="selectedUser.phone" label="Teléfono" required></v-text-field>
            <v-text-field v-model="selectedUser.address" label="Dirección" required></v-text-field>

            <v-radio-group v-model="selectedUser.isCompany" label="¿Es empresa?">
              <v-radio label="Si" :value="true"></v-radio>
              <v-radio label="No" :value="false"></v-radio>
            </v-radio-group>

            <v-text-field v-if="selectedUser.isCompany" v-model="selectedUser.cif" label="CIF" required></v-text-field>

            <v-radio-group v-model="selectedUser.isAdmin" label="Usuario administrador">
              <v-radio label="Si" :value="true"></v-radio>
              <v-radio label="No" :value="false"></v-radio>
            </v-radio-group>
          </v-form>
        </v-card-text>


        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="editModal = false">Cancelar</v-btn>
          <v-btn color="primary" @click="updateUser">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de eliminación -->
    <v-dialog v-model="deleteModal" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h4">Borrar usuario</span>
        </v-card-title>

        <v-card-text>
          <v-col>
            <v-row><h2>¿Estás seguro de que quieres borrar este usuario?</h2></v-row>
            <v-row><h3 style="color: tomato;">Esta acción no se puede deshacer.</h3></v-row>
              <v-container id="info-container">
                <p>ID: <span class="text-h6">{{ selectedUser?._id }}</span></p>
                <p>Nombre: <span class="text-h6">{{ selectedUser?.name }}</span></p>
                <p>Email: <span class="text-h6">{{ selectedUser?.email }}</span></p>
                <p>Teléfono: <span class="text-h6">{{ selectedUser?.phone }}</span></p>
                <p>Dirección: <span class="text-h6">{{ selectedUser?.address }}</span></p>
                <p>¿Es empresa?: <span class="text-h6">{{ selectedUser?.isCompany ? 'Si' : 'No' }}</span></p>
                <p v-if="selectedUser.isCompany" class="text-h6">CIF: <span class="text-h6">{{ selectedUser?.cif }}</span></p>
                <p>¿Es administrador?: <span class="text-h6">{{ selectedUser?.isAdmin ? 'Si' : 'No' }}</span></p>
            </v-container>
          </v-col>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="deleteModal = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteUser">Borrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


  </v-container>
</template>

<script>
import axios from 'axios';
import { useUserStore } from '@/store/userStore';

export default {
  name: 'UsersTable',
  data() {
    return {
      users: null,
      token: null,
      infoModal: false,
      editModal: false,
      deleteModal: false,
      selectedUser: null,
      currentUserId: null
    };
  },
  computed: {
  },
  mounted() {
    const userStore = useUserStore();
    this.token = userStore.getToken;
    this.currentUserId = userStore.getId;
    
    if (this.token) {
      this.getUsers();
    } else {
      console.log('Error al obtener usuarios');
    }
  },
  methods: {
    openInfoModal(user) {
      this.selectedUser = { ...user }; // Hacer una copia del usuario seleccionado
      this.infoModal = true;
    },
    openEditModal(user) {
      this.infoModal = false;
      this.selectedUser = { ...user }; // Hacer una copia del usuario seleccionado
      this.editModal = true;
    },
    openDeleteModal(user) {
      this.selectedUser = { ...user }; // Hacer una copia del usuario seleccionado
      this.deleteModal = true;
    },
    getUsers() {
      axios
        .get("http://localhost:3000/api/users/getUsers", {
          headers: {
            Authorization: "Bearer " + this.token,
            "x-access-token": this.token
          }
        })
        .then(res => {
          // Verificar la estructura de los datos
          this.users = res.data.users.filter(user => user._id !== this.currentUserId);
        })
        .catch(error => {
          console.log(error);
        });
    },
    updateUser() {
      if (this.selectedUser.isCompany == false) {
        this.selectedUser.cif = null;
      }

      axios
        .put(
          "http://localhost:3000/api/users/updateUser",
          this.selectedUser, // Usar los datos del usuario seleccionado
          {
            headers: {
              Authorization: "Bearer " + this.token,
              "x-access-token": this.token
            }
          }
        )
        .then(res => {
          console.log(res.data);
          this.getUsers();
          this.editModal = false;
        })
        .catch(error => {
          console.log(error);
        });
    },
    deleteUser() {
      axios
        .delete(
          "http://localhost:3000/api/users/deleteUser",
          {
            headers: {
              Authorization: "Bearer " + this.token,
              "x-access-token": this.token
            }
          },
          {
            data: this.selectedUser // Usar los datos del usuario seleccionado
          }
        )
        .then(res => {
          console.log(res.data);
          this.deleteModal = false;
          // Actualizar la lista de usuarios si es necesario
        })
        .catch(error => {
          console.log(error);
        });
    }
  },
  
};
</script>

<style scoped>
.full-width-table {
  width: 100%;
}

thead th {
  text-align: left;
  padding: 10px;
  background-color: #f5f5f5;
}

tbody td {
  padding: 10px;
}

tbody tr {
  transition: background-color 0.3s ease;
}

tbody tr:hover {
  background-color: #efefef;
}

#info-container {
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  gap: 10px;
}

</style>