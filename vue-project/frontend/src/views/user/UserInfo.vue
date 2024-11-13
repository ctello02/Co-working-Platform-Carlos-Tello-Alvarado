<template>
    <v-container class="pa-5 container">
        <v-card v-if="user" class="mx-auto" max-width="500">
            <v-card-text>
                <v-col>
                    <v-row cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon
                                size="x-large"
                                :icon="user?.isCompany? 'mdi-office-building-outline': 'mdi-account-circle-outline'"
                            />
                        </v-col>
                        <v-col>
                            <span class="pt-2 text-h4">{{ user?.name }}</span>
                            <v-spacer/>
                            <span v-if="user?.isCompany" style="color: grey;" class="text-h6">Empresa, CIF: {{ user?.cif }}</span>
                            <span v-else style="color: grey;" class="text-h6">Usuario</span>
                        </v-col>
                        
                    </v-row>

                    <v-row v-if="user?.isAdmin" cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon
                            size="x-large"
                            icon="mdi-account-lock-outline"
                            ></v-icon>
                        </v-col>
                        <v-col>
                            <span class="text-h6">Administrador</span>
                        </v-col>
                    </v-row>

                    <v-row cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon
                            size="x-large"
                            icon="mdi-email-outline"
                            ></v-icon>
                        </v-col>
                        <v-col>
                            <span class="text-h6">{{ user?.email }}</span>
                        </v-col>
                    </v-row>

                    <v-row cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon
                            size="x-large"
                            icon="mdi-phone-outline"
                            ></v-icon>
                        </v-col>
                        <v-col>
                            <span class="text-h6">{{ user?.phone }}</span>
                        </v-col>
                    </v-row>

                    <v-row cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon
                                size="x-large"
                                :icon="user?.isCompany? 'mdi-map-marker-outline': 'mdi-home-outline'"
                                icon="mdi-map-marker-outline"
                            ></v-icon>
                        </v-col>
                        <v-col>
                            <span class="text-h6">{{ user?.address }}</span>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>

            <v-card-actions v-if="user" class="mt-n3 mb-3 mr-3 d-flex justify-end ga-3">
                <v-btn 
                    v-if="this.userStore.getIsAdmin"
                    @click="openEditUserInfo()"
                    variant="tonal"
                    size="small"
                    icon="mdi-pencil" 
                />
                <v-btn 
                    v-if="this.userStore.getIsAdmin"
                    @click="this.deleteModal = true"
                    variant="tonal"
                    size="small"
                    icon="mdi-trash-can-outline" 
                />
                <TonalButton 
                    color="grey" 
                    text="Volver" 
                    @click="routerBack"
                />
            </v-card-actions>
        </v-card>

        <InfoNotFound v-else max_width="500" text="Usuario" routeBack="/users"/>
    </v-container>

    <!-- Modal de eliminación -->
    <v-dialog v-model="deleteModal" max-width="450px">
      <v-card>
        <v-card-title class="ml-2 mt-3">
          <span class="text-h4">Borrar usuario</span>
        </v-card-title>

        <v-card-text>
            <v-row>
              <span class="ml-3 text-h6" style="color: #EF0107;">Esta acción no se puede deshacer.</span>
            </v-row>
        </v-card-text>

        <v-card-actions class="mt-n2 mb-3 mr-3 d-flex justify-end ga-3">
          <TonalButton 
            color="grey" 
            text="Cancelar" 
            @click="deleteModal = false"
          />
          <TonalButton 
            color="red" 
            text="Borrar" 
            @click="deleteUser"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

</template>

<script>
import { useUserStore } from '@/store/userStore';
import { userService } from '@/services/userService';
import TonalButton from '@/components/TonalButton.vue';
import InfoNotFound from '@/components/InfoNotFound.vue';

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
        TonalButton,
        InfoNotFound
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