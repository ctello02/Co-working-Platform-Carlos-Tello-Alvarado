<template>
    <v-container class="pa-10 container">
        <v-card class="pa-3" outlined>
            <v-card-title v-if="user" class="my-2">
                <span class="text-h4">Información del usuario</span>
            </v-card-title>

            <v-card-title v-else>
                <span class="text-h4">Usuario no encontrado</span>
            </v-card-title>

            <v-card-text class="mx-n3" v-if="user">
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

            <v-card-text v-else>
                <span class="text-h6">Por favor vuelva a la lista de usuarios</span>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <TonalButton 
                    color="grey" 
                    text="Volver" 
                    @click="routerBack"
                />
                <TonalButton 
                    v-if="user"
                    color="blue" 
                    text="Editar información" 
                    @click="openEditUserInfo()"
                />
                <TonalButton 
                    v-if="user"
                    color="red" 
                    text="Borrar usuario" 
                    @click="this.deleteModal = true"
                />
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
          <TonalButton color="grey" text="Cancelar" @click="deleteModal = false"/>
          <TonalButton color="red" text="Borrar" @click="deleteUser"/>
        </v-card-actions>
      </v-card>
    </v-dialog>

</template>

<script>
import { useUserStore } from '@/store/userStore';
import { userService } from '@/services/userService';
import TonalButton from '@/components/TonalButton.vue';

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
    components:{
        TonalButton
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

.title {
  font-weight: bold;
  margin-bottom: 20px;
}

</style>