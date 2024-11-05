<template>
    <v-container class="pa-10 container">
        <v-card class="pa-3" outlined>
            <v-card-title v-if="space" class="my-2">
                <span class="text-h4">Información del espacio</span>
            </v-card-title>

            <v-card-title v-else>
                <span class="text-h4">Espacio no encontrado</span>
            </v-card-title>

            <v-card-text class="mx-n3" v-if="space">
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

            <v-card-text v-else>
                <span class="text-h6">Por favor vuelva a la lista de espacios</span>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <TonalButton
                    color="grey"
                    text="Volver"
                    @click="routerBack" 
                />
                <TonalButton
                    v-if="userStore.getIsAdmin && space"
                    color="blue"
                    text="Editar información"
                    @click="openEditSpaceInfo()"
                />
                <TonalButton
                    v-if="userStore.getIsAdmin && space"
                    color="red"
                    text="Borrar espacio"
                    @click="this.deleteModal = true"
                />
            </v-card-actions>
        </v-card>
    </v-container>

    <!-- Modal de eliminación -->
    <v-dialog v-model="deleteModal" max-width="450px">
      <v-card>
        <v-card-title class="ml-2 mt-3">
          <span class="text-h4">Borrar espacio</span>
        </v-card-title>

        <v-card-text>
            <v-row>
              <span class="ml-3 text-h6" style="color: tomato;">Esta acción no se puede deshacer.</span>
            </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <TonalButton color="grey" text="Cancelar" @click="deleteModal = false"/>
          <TonalButton color="red" text="Borrar" @click="deleteSpace"/>
        </v-card-actions>
      </v-card>
    </v-dialog>

</template>

<script>
import { useUserStore } from '@/store/userStore';
import { useSpaceStore } from '@/store/spaceStore';
import { spaceService } from '@/services/spaceService';
import TonalButton from '@/components/TonalButton.vue'


export default {
    data() {
        return {
            spaceStore: null,
            space: null,
            deleteModal: false,
        };
    },
    components: {
        TonalButton
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
            this.$router.push('/editSpaceInfo');
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