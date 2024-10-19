<template>
    <v-container class="pa-10 container">
        <v-card>
            <v-card-title>
                <span class="text-h5">Información del usuario</span>
            </v-card-title>

            <v-card-text>
                <v-col>
                    <v-row v-if="user?.isCompany" cols="12" md="6">
                        <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>Empresa</v-list-item-title>
                            <v-list-item-subtitle>{{ user?.name }}</v-list-item-subtitle>
                        </v-list-item-content>
                        </v-list-item>
                    </v-row>

                    <v-row v-if="user?.isCompany" cols="12" md="6">
                        <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>CIF</v-list-item-title>
                            <v-list-item-subtitle>{{ user?.cif }}</v-list-item-subtitle>
                        </v-list-item-content>
                        </v-list-item>
                    </v-row>

                    <v-row v-if="!user?.isCompany" cols="12" md="6">
                        <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>Nombre</v-list-item-title>
                            <v-list-item-subtitle>{{ user?.name }}</v-list-item-subtitle>
                        </v-list-item-content>
                        </v-list-item>
                    </v-row>

                    <v-row cols="12" md="6">
                        <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>Email</v-list-item-title>
                            <v-list-item-subtitle>{{ user?.email }}</v-list-item-subtitle>
                        </v-list-item-content>
                        </v-list-item>
                    </v-row>

                    <v-row cols="12" md="6">
                        <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>Teléfono</v-list-item-title>
                            <v-list-item-subtitle>{{ user?.phone }}</v-list-item-subtitle>
                        </v-list-item-content>
                        </v-list-item>
                    </v-row>

                    <v-row cols="12" md="6">
                        <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>Dirección</v-list-item-title>
                            <v-list-item-subtitle>{{ user?.address }}</v-list-item-subtitle>
                        </v-list-item-content>
                        </v-list-item>
                    </v-row>

                    <v-row cols="12" md="6">
                        <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>Administrador</v-list-item-title>
                            <v-list-item-subtitle>{{ user?.isAdmin ? 'Si' : 'No' }}</v-list-item-subtitle>
                        </v-list-item-content>
                        </v-list-item>
                    </v-row>
                </v-col>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="routerBack">Volver</v-btn>
                <v-btn color="primary" @click="openEditUserInfo()">Editar información</v-btn>
                <v-btn color="error" @click="this.deleteModal = true">Borrar usuario</v-btn>
            </v-card-actions>
        </v-card>
    </v-container>

    <!-- Modal de eliminación -->
    <v-dialog v-model="deleteModal" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h4">Borrar usuario</span>
        </v-card-title>

        <v-card-text>
          <v-col>
            <v-row>
              <h2>¿Estás seguro de que quieres borrar este usuario?</h2>
            </v-row>
            <v-row>
              <h3 style="color: tomato;">Esta acción no se puede deshacer.</h3>
            </v-row>
          </v-col>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="deleteModal = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteUser">Borrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

</template>

<script>
import { useUserStore } from '@/store/userStore';
import { userService } from '@/services/userService';

export default {
    data() {
        return {
            userStore: null,
            user: null,
            deleteModal: false,
        };
    },
    mounted() {
        this.userStore = useUserStore();
        this.user = this.userStore.getSelectedUser;
    },
    methods: {
        routerBack() {
            this.$router.push('/users');
        },
        openEditUserInfo() {
            this.$router.push('/editUserInfo');
        },
        deleteUser() {
            userService.deleteUser(this.user._id)
            .then(res => {
                console.log(res.data);
                this.deleteModal = false;
                this.userStore.clearSelectedUser();
                this.routerBack();
            })
            .catch(error => {
                console.log(error);
            });
        }
    },
};
</script>

<style scoped>  
.container {
    max-width: 700px;
    margin: 0 auto;
}

.v-list-item-subtitle{
  margin-bottom: 5px;
  padding-bottom: 3px;
}

</style>