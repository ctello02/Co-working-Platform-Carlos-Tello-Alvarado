<template>
    <v-container class="pa-10 container">
        <v-card class="pa-3" outlined>
            <v-card-title >
                <span class="text-h4">Información del espacio</span>
            </v-card-title>

            <v-card-text>
                <v-col>
                    <v-row v-if="space?.name" cols="12" md="6">
                        <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>Nombre del espacio</v-list-item-title>
                            <v-list-item-subtitle>{{ space?.name }}</v-list-item-subtitle>
                        </v-list-item-content>
                        </v-list-item>
                    </v-row>

                    <v-row v-if="space?.description" cols="12" md="6">
                        <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>Descripción del espacio</v-list-item-title>
                            <v-list-item-subtitle>{{ space?.description }}</v-list-item-subtitle>
                        </v-list-item-content>
                        </v-list-item>
                    </v-row>

                    <v-row v-if="space?.imageUrl" cols="12" md="6">
                        <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title class="mb-2">Imagen del espacio</v-list-item-title>
                            <v-img
                                :src="space?.imageUrl"
                                height="150px"
                                contain  
                                class="mb-2"
                            ></v-img>
                        </v-list-item-content>
                        </v-list-item>                        
                    </v-row>
                </v-col>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn 
                    color="primary" 
                    @click="routerBack"
                >Volver</v-btn>
                <div v-if="userStore.getIsAdmin">
                    <v-btn
                        color="primary"
                        @click="openEditSpaceInfo()"
                    >Editar información</v-btn>
                    <v-btn
                        color="error"
                        @click="this.deleteModal = true"
                    >Borrar espacio</v-btn>
                </div>
            </v-card-actions>
        </v-card>
    </v-container>

    <!-- Modal de eliminación -->
    <v-dialog v-model="deleteModal" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h4">Borrar espacio</span>
        </v-card-title>

        <v-card-text>
          <v-col>
            <v-row>
              <h2>¿Estás seguro de que quieres borrar este espacio?</h2>
            </v-row>
            <v-row>
              <h3 style="color: tomato;">Esta acción no se puede deshacer.</h3>
            </v-row>
          </v-col>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="deleteModal = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteSpace">Borrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

</template>

<script>
import { useUserStore } from '@/store/userStore';
import { useSpaceStore } from '@/store/spaceStore';
import { spaceService } from '@/services/spaceService';

export default {
    data() {
        return {
            spaceStore: null,
            space: null,
            deleteModal: false,
        };
    },
    computed: {
        userStore() {
            return useUserStore();
        }
    },
    mounted() {
        this.spaceStore = useSpaceStore();
        this.space = this.spaceStore.getSelectedSpace;
    },
    methods: {
        routerBack() {
            this.$router.push('/spaces');
        },
        openEditSpaceInfo() {
            //this.$router.push('/editSpaceInfo');
        },
        deleteSpace() {
            spaceService.deleteSpace(this.space._id)
            .then(res => {
                console.log(res.data);
                this.deleteModal = false;
                this.spaceStore.clearSelectedSpace();
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