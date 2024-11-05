<template>
  <v-container fluid v-if="users">
    <v-col>
      <v-row cols="12">
        <span class="text-h4">Usuarios</span>
      </v-row>

      <v-row v-if="!users">
          <span class="text-h5">Aún no hay más usuarios en la plataforma</span>
      </v-row>

      <v-row v-else class="py-5">
        <v-card style="width: 100%;">
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
                    <v-btn @click="openUserInfo(user)" icon="mdi-account-search-outline" variant="text">
                    </v-btn>
                    <v-btn @click="openDeleteModal(user)" color="error" icon="mdi-trash-can-outline" variant="text">
                    </v-btn>
                  </v-form>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-row>
      
    </v-col>

    <!-- Modal de eliminación -->
    <v-dialog v-model="deleteModal" max-width="600px">
      <v-card>
        <v-card-title class="mt-3 mb-n3">
          <span class="ml-2 text-h4">Borrar usuario</span>
        </v-card-title>

        <v-card-text>
          <v-col>
            <v-row>
              <h2>¿Estás seguro de que quieres borrar este usuario?</h2>
            </v-row>
            <v-row>
              <h3 style="color: tomato;">Esta acción no se puede deshacer.</h3>
            </v-row>
            <v-container id="info-container">
              <p>Nombre: <span class="text-h6">{{ selectedUser?.name }}</span></p>
              <p>Email: <span class="text-h6">{{ selectedUser?.email }}</span></p>
              <p>Teléfono: <span class="text-h6">{{ selectedUser?.phone }}</span></p>
              <p>Dirección: <span class="text-h6">{{ selectedUser?.address }}</span></p>
              <p>¿Es empresa?: <span class="text-h6">{{ selectedUser?.isCompany ? 'Si' : 'No' }}</span></p>
              <p v-if="selectedUser.isCompany" class="text-h6">CIF: <span class="text-h6">{{ selectedUser?.cif }}</span>
              </p>
              <p>¿Es administrador?: <span class="text-h6">{{ selectedUser?.isAdmin ? 'Si' : 'No' }}</span></p>
            </v-container>
          </v-col>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <TonalButton color="grey" text="Cancelar" @click="deleteModal = false"/>
          <TonalButton color="red" text="Borrar" @click="deleteUser"/>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import { useUserStore } from '@/store/userStore';
import { userService } from '@/services/userService';
import TonalButton from '@/components/TonalButton.vue';

export default {
  name: 'UsersTable',
  data() {
    return {
      userStore: null,
      users: null,
      token: null,
      deleteModal: false,
      selectedUser: null,
      currentUserId: null
    };
  },
  components: {
    TonalButton
  },
  computed: {
  },
  mounted() {
    this.userStore = useUserStore();
    this.currentUserId = this.userStore.getId;
    this.getUsers();
  },
  methods: {
    openUserInfo(user) {
      this.userStore.setSelectedUser(user); // Guardar el usuario seleccionado en el store
      this.$router.push('/userInfo'); // Navegar a la nueva ruta
    },
    openDeleteModal(user) {
      this.selectedUser = { ...user }; // Hacer una copia del usuario seleccionado
      this.deleteModal = true;
    },
    getUsers() {
      userService.getUsers()
        .then(res => {
          //console.log(res.data);
          this.users = res.data.users.filter(user => user._id !== this.currentUserId);
        })
        .catch(error => {
          console.log(error);
          this.users = null;
        });
    },
    deleteUser() {
      userService.deleteUser(this.selectedUser._id)
        .then(res => {
          //console.log(res.data);
          this.deleteModal = false;
          this.getUsers();
        })
        .catch(error => {
          console.log(error);
        });
    },
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