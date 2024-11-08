<template>
    <v-container class="pa-5 container">
        <v-card class="mx-auto" max-width="600" >
            <v-img
                v-if="space?.imageUrl"
                :src="space?.imageUrl"
                color="surface-variant"
                height="300px"
                cover  
            />                            

            <v-card-title v-if="!space" class="mt-4">
                <span class="ml-3 text-h4">Espacio no encontrado</span>
            </v-card-title>

            <v-card-text v-if="space">
                <v-col>
                    <v-row class="mt-n5 mb-n3" v-if="space?.name" cols="12">
                        <v-col>
                            <span class="text-h4">{{ space?.name }}</span>
                        </v-col>
                        <v-col class="d-flex align-center justify-end ga-2">
                            <v-btn 
                            v-if="userStore.getIsAdmin && space"
                            @click="openEditSpaceInfo()"
                                variant="tonal"
                                size="small"
                                icon="mdi-pencil" 
                            />
                            <v-btn 
                            v-if="userStore.getIsAdmin && space"
                            @click="this.deleteModal = true"
                                variant="tonal"
                                size="small"
                                icon="mdi-trash-can-outline" 
                            />
                        </v-col>
                    </v-row>

                    <v-row class="my-n3" v-if="space?.description" cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon
                            icon="mdi-text"
                            ></v-icon>
                        </v-col>
                        <v-col>
                            <span class="pt-2 text-h6">{{ space?.description }}</span>
                        </v-col>
                    </v-row>

                    <v-row class="my-n3" cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon
                            icon="mdi-table-chair"
                            size="small"
                            ></v-icon>
                        </v-col>
                        <v-col>
                            <span class="pt-2 text-h6">{{space?.seats}} asientos</span>
                        </v-col>
                    </v-row>

                    <v-row class="mt-n3 mb-n5" cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon
                            icon="mdi-clock-outline"
                            size="small"
                            ></v-icon>
                        </v-col>
                        <v-col>
                            <span class="pt-2 text-h6">Reservas de {{space?.time}}</span>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>

            <v-card-text v-else>
                <span class="ml-3 text-h6">Por favor vuelva a la lista de espacios</span>
            </v-card-text>

            <v-card-actions v-if="space" class="mt-n2 mb-4">
                <TonalButton
                    class="ml-5"
                    color="grey"
                    text="Volver"
                    @click="routerBack" 
                />
                <v-spacer></v-spacer>
                <TonalButton
                    class="mr-5"
                    color="blue"
                    text="Reservar"
                />
            </v-card-actions>
            <v-card-actions v-else class="mt-n2 mb-4">
                <v-spacer></v-spacer>
                <TonalButton
                    class="mr-4"
                    color="grey"
                    text="Volver"
                    @click="routerBack" 
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

        if (this.space?.time) {
            const timeInMinutes = parseFloat(this.space.time);

            if (timeInMinutes >= 60) {
                const timeInHours = timeInMinutes / 60;
                this.space.time = timeInHours === 1 ? '1 hora' : `${timeInHours} horas`;
            } else {
                this.space.time = `${timeInMinutes} minutos`;
            }
        }
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