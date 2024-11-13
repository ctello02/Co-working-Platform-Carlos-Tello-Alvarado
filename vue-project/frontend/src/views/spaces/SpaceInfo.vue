<template>
    <v-container class="pa-5 container">
        <v-card v-if="space" class="mx-auto" max-width="600" >
            <v-img
                :src="space?.imageUrl"
                color="surface-variant"
                height="300px"
                cover  
            />                            
            <v-card-text v-if="this.timeFrame">
                <v-col>
                    <v-row class="mt-n5 mb-n3" cols="12">
                        <v-col cols="9">
                            <span class="text-h4">{{ space?.name }}</span>
                        </v-col>
                        <v-col class="d-flex align-center justify-end ga-3">
                            <v-btn 
                            v-if="userStore.getIsAdmin"
                            @click="openEditSpaceInfo()"
                                variant="tonal"
                                size="small"
                                icon="mdi-pencil" 
                            />
                            <v-btn 
                            v-if="userStore.getIsAdmin"
                            @click="this.deleteModal = true"
                                variant="tonal"
                                size="small"
                                icon="mdi-trash-can-outline" 
                            />
                        </v-col>
                    </v-row>

                    <v-row class="my-n3" cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon
                                icon="mdi-text"
                            />
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
                            />
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
                            />
                        </v-col>
                        <v-col>
                            <span class="pt-2 text-h6">Reservas de {{timeFrame}}</span>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>

            <v-card-actions class="mt-n2 mb-4">
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
        </v-card>

        <InfoNotFound v-else max_width="600" text="Espacio" routeBack="/spaces"/>
    </v-container>

    <!-- Modal de eliminación -->
    <v-dialog v-model="deleteModal" max-width="450px">
      <v-card>
        <v-card-title class="ml-2 mt-3">
          <span class="text-h4">Borrar espacio</span>
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
            @click="deleteSpace"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

</template>

<script>
import { useUserStore } from '@/store/userStore';
import { useSpaceStore } from '@/store/spaceStore';
import { spaceService } from '@/services/spaceService';
import TonalButton from '@/components/TonalButton.vue'
import InfoNotFound from '@/components/InfoNotFound.vue';

export default {
    data() {
        return {
            spaceStore: null,
            space: null,
            deleteModal: false,
            timeFrame: null,
        };
    },
    components: {
        TonalButton,
        InfoNotFound
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
                this.timeFrame = timeInHours === 1 ? '1 hora' : `${timeInHours} horas`;
            } else {
                this.timeFrame = `${timeInMinutes} minutos`;
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