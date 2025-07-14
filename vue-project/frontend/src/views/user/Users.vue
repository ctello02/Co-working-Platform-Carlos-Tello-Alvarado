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
          <Table :headers="tableHeaders" :fields="['name', 'email', 'isAdmin']" :items="users"
            :buttons="actionButtons" />
        </v-card>
      </v-row>
    </v-col>

    <AskModal v-model="deleteModal" :title="'¿Borrar usuario?'"
      :message="'¿Estás seguro de que quieres borrar este usuario?'" :actionText="'Borrar usuario'"
      :closeModal="closeDeleteDialog" :action="deleteUser" />

    <AskModal v-model="bulkDeleteModal" :maxWidth="'600px'" :title="'Este usuario tiene reservas pendientes'"
      :message="'Este usuario tiene reservas pendientes, ¿Estás seguro de que quieres borrarlo? Se le devolverá el pago de las reservas que le hayan cobrado.'"
      :actionText="'Borrar usuario'" :closeModal="closeBulkDeleteDialog" :action="bulkDeleteUser" />

  </v-container>
</template>

<script>
import { useUserStore } from '@/store/userStore';
import { userService } from '@/services/userService';
import { useToast } from 'vue-toastification';
import TonalButton from '@/components/TonalButton.vue';
import AskModal from '@/components/AskModal.vue';
import Table from '@/components/Table.vue';

export default {
  name: 'UsersTable',
  data() {
    return {
      userStore: null,
      users: [],
      token: null,
      deleteModal: false,
      bulkDeleteModal: false,
      selectedUser: null,
      currentUserId: null,

      tableHeaders: [
        { label: '#', width: '10%' },
        { label: 'Nombre', width: '20%' },
        { label: 'E-mail', width: '20%' },
        { label: 'Administrador', width: '10%' }
      ],
      actionButtons: [
        {
          icon: 'mdi-account-search-outline',
          action: (user) => this.openUserInfo(user)
        },
        {
          icon: 'mdi-trash-can-outline',
          color: 'error',
          action: (user) => this.openDeleteModal(user)
        }
      ]
    };
  },
  components: {
    TonalButton,
    AskModal,
    Table
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
    closeDeleteDialog() {
      this.deleteModal = false;
    },
    openBulkDeleteModal() {
      this.bulkDeleteModal = true;
    },
    closeBulkDeleteDialog() {
      this.bulkDeleteModal = false;
    },
    getUsers() {
      userService.getUsers()
        .then(res => {
          this.users = (res.data.users || [])
            .filter(user => user._id !== this.currentUserId)
          // console.log(this.users);
        })
        .catch(error => {
          console.log(error);
          this.users = null;
        });
    },
    deleteUser() {
      const toast = useToast();
      userService.deleteUser(this.selectedUser._id)
        .then(() => {
          this.closeDeleteDialog()
          this.getUsers();
          toast.error('Usuario eliminado con éxito');
        })
        .catch(error => {
          console.log(error);
          if (error.response.status === 409) {
            this.openBulkDeleteModal();
          }
        });
    },
    bulkDeleteUser() {
      const toast = useToast();
      userService.bulkDeleteUser(this.selectedUser._id)
        .then(() => {
          this.closeBulkDeleteDialog();
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

th,
td {
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