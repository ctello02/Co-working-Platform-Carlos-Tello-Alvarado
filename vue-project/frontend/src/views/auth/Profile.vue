<template>
  <v-container class="container">
    <v-card v-if="user" class="mx-auto px-2" max-width="500">
      <v-card-text>
        <v-col>
          <v-row cols="12">
            <v-col cols="1" class="d-flex align-center">
              <v-icon size="x-large"
                :icon="user?.isCompany ? 'mdi-office-building-outline' : 'mdi-account-circle-outline'" />
            </v-col>
            <v-col>
              <span class="ml-n1 text-h4">{{ user?.name }}</span>
              <v-spacer />
              <span v-if="user?.isCompany" style="color: grey;" class="text-h6">Empresa, CIF: {{ user?.cif }}</span>
              <span v-else style="color: grey;" class="text-h6">Usuario</span>
            </v-col>
          </v-row>

          <v-row v-if="user?.isAdmin" cols="12">
            <v-col cols="1" class="d-flex align-center">
              <v-icon size="x-large" icon="mdi-account-lock-outline"></v-icon>
            </v-col>
            <v-col>
              <span class="text-h6">Administrador</span>
            </v-col>
          </v-row>

          <v-row cols="12">
            <v-col cols="1" class="d-flex align-center">
              <v-icon size="x-large" icon="mdi-email-outline"></v-icon>
            </v-col>
            <v-col>
              <span class="text-h6">{{ user?.email }}</span>
            </v-col>
          </v-row>

          <v-row cols="12">
            <v-col cols="1" class="d-flex align-center">
              <v-icon size="x-large" icon="mdi-phone-outline"></v-icon>
            </v-col>
            <v-col>
              <span class="text-h6">{{ user?.phone }}</span>
            </v-col>
          </v-row>

          <v-row cols="12">
            <v-col cols="1" class="d-flex align-center">
              <v-icon size="x-large" :icon="user?.isCompany ? 'mdi-map-marker-outline' : 'mdi-home-outline'"
                icon="mdi-map-marker-outline"></v-icon>
            </v-col>
            <v-col>
              <span class="text-h6">{{ user?.address }}</span>
            </v-col>
          </v-row>
        </v-col>
      </v-card-text>

      <v-card-actions class="mt-n3 mb-3 mr-2 d-flex justify-end ga-3">
        <v-btn @click="openEditProfileInfo" variant="tonal" size="small" icon="mdi-pencil" />
        <TonalButton text="Borrar cuenta" prepend-icon="mdi-trash-can-outline" color="red"
          @click="deleteModal = true" />
        <TonalButton text="Cerrar sesión" color="red" prepend-icon="mdi-logout" @click="logOutModal = true" />
      </v-card-actions>
    </v-card>

    <AskModal v-model="logOutModal" :title="'¿Cerrar sesión?'" :message="'¿Estás seguro de que quieres cerrar sesión?'"
      :actionText="'Cerrar sesión'" :closeModal="closeDialog" :action="logOutUser" />

    <AskModal v-model="deleteModal" :title="'¿Borrar cuenta?'"
      :message="'¿Estás seguro de que quieres borrar tu cuenta de la plataforma?'" :actionText="'Borrar cuenta'"
      :closeModal="closeDialog" :action="deleteUser" />

    <AskModal v-model="bulkDeleteModal" :maxWidth="'600px'" :title="'Aún tienes reservas pendientes'"
      :message="'Tienes reservas pendientes, ¿Estás seguro de que quieres borrar tu cuenta?'"
      :actionText="'Borrar cuenta'" :closeModal="closeBulkDeleteDialog" :action="bulkDeleteUser" />

  </v-container>
</template>

<script>
import { useUserStore } from "@/store/userStore";
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { useToast } from 'vue-toastification';
import TonalButton from '@/components/TonalButton.vue'
import AskModal from "@/components/AskModal.vue";

export default {
  name: "Profile",
  data() {
    return {
      userStore: null,
      user: null,
      payment_method: null,
      logOutModal: false,
      deleteModal: false,
      bulkDeleteModal: false,
    };
  },
  components: {
    TonalButton,
    AskModal
  },
  mounted() {
    this.userStore = useUserStore();
    this.user = this.userStore.getUser;
    if (!this.user) {
      this.getUser(); // Redirigir al componente padre
    }
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
    closeDialog() {
      this.logOutModal = false;
      this.deleteModal = false;
    },
    openBulkDeleteModal() {
      this.bulkDeleteModal = true;
    },
    closeBulkDeleteDialog() {
      this.bulkDeleteModal = false;
    },
    logOutUser() {
      this.userStore.clearUsers();
      this.logOutModal = false;
      this.$router.push("/login");
    },
    deleteUser() {
      const toast = useToast();
      userService.deleteUser(this.user._id)
        .then(() => {
          this.userStore.clearUsers();
          this.closeDialog();
          this.$router.push("/login");
          toast.error('Cuenta eliminada con éxito');
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
      userService.bulkDeleteUser(this.user._id)
        .then(() => {
          this.closeBulkDeleteDialog();
          this.userStore.clearUsers();
          this.$router.push("/login");
          toast.error('Cuenta eliminada con éxito');
        })
        .catch(error => {
          console.log(error);
        });
    },
  }
};
</script>