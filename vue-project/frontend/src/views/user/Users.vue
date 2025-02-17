<template>
  <v-container fluid>
    <v-col>
      <v-row cols="12">
        <span class="text-h4">Usuarios</span>
      </v-row>

      <v-row v-if="this.users.length === 0" class="mt-8">
          <span class="text-h5">Aún no hay más usuarios en la plataforma</span>
      </v-row>

      <v-row v-else class="py-5">
        <v-card style="width: 100%;">
          <v-table class="fixed-table">
            <thead>
              <tr>
                <th style="width: 10%;">#</th>
                <th style="width: 20%;">Nombre</th>
                <th style="width: 20%;">E-mail</th>
                <th style="width: 20%;">Administrador</th>
                <th style="width: 10%;">Acciones</th>
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

    <AskModal
      v-model="deleteModal"
      :title="'¿Borrar usuario?'"
      :message="'¿Estás seguro de que quieres borrar este usuario?'"
      :actionText="'Borrar usuario'"
      :closeModal="closeDialog"
      :action="deleteUser"
    />

  </v-container>
</template>

<script>
import { useUserStore } from '@/store/userStore';
import { userService } from '@/services/userService';
import { useToast } from 'vue-toastification';
import TonalButton from '@/components/TonalButton.vue';
import AskModal from '@/components/AskModal.vue';

export default {
  name: 'UsersTable',
  data() {
    return {
      userStore: null,
      users: [],
      token: null,
      deleteModal: false,
      selectedUser: null,
      currentUserId: null
    };
  },
  components: {
    TonalButton,
    AskModal
  },
  computed: {
  },
  mounted() {
    this.userStore = useUserStore();
    this.currentUserId = this.userStore.getId;
    this.getUsers();    

    console.log(this.users);
    
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
    closeDialog() {
      this.deleteModal = false;
    },
    getUsers() {
      userService.getUsers()
        .then(res => {
          //console.log(res.data);
          this.users = res.data.users.filter(user => user._id !== this.currentUserId) || [];
        })
        .catch(error => {
          console.log(error);
          this.users = null;
        });
    },
    deleteUser() {
      const toast = useToast();
      userService.deleteUser(this.selectedUser._id)
        .then(res => {
          //console.log(res.data);
          this.deleteModal = false;
          this.getUsers();
          toast.error('Usuario eliminado con éxito');
        })
        .catch(error => {
          console.log(error);
        });
    },
  },

};
</script>

<style scoped>
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

.v-table {
    table-layout: fixed;
    width: 100%;
}

th, td {
    /*width: 20%;  Ajusta este valor si es necesario */
    text-align: left;
    padding: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

#info-container {
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  gap: 10px;
}
</style>