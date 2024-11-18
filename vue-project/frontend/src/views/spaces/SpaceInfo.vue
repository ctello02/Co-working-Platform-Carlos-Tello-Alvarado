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
                            <span class="text-h6">{{ space?.description }}</span>
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
                            <span class="text-h6">{{space?.seats}} asientos</span>
                        </v-col>
                    </v-row>

                    <v-row class="mt-n1">
                        <v-col>
                            <v-row class="d-flex align-center my-n2">
                                <v-col cols="2">
                                    <v-icon
                                        size="small"
                                        icon="mdi-weather-sunny"
                                    ></v-icon>
                                </v-col>
                                <v-col><span class="pt-2 text-h6">Abre a las {{space?.opening}}</span></v-col>
                            </v-row>
                        </v-col>
                        <v-col>
                            <v-row class="d-flex align-center my-n2">
                                <v-col cols="2">
                                    <v-icon
                                        size="small"
                                        icon="mdi-weather-night"
                                    ></v-icon>
                                </v-col>
                                <v-col><span class="pt-2 text-h6">Cierra a las {{space?.closing}}</span></v-col>
                            </v-row>
                        </v-col>
                    </v-row>

                    <v-row class="mt-n3 mb-n5 d-flex justify-center align-center" cols="12">
                        <v-col>
                            <v-row>
                                <v-col cols="2" class="d-flex align-center">
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
                        <v-col>
                            <v-row>
                                <v-col cols="2" class="d-flex align-center">
                                    <v-icon
                                        icon="mdi-repeat"
                                        size="small"
                                    />
                                </v-col>
                                <v-col>
                                    <span class="pt-2 text-h6"> {{space?.repetition ? 'Permite repetición' : 'No permite repetición'}}</span>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>

            <v-card-actions class="d-flex justify-end ga-3 mt-n3 mb-3 mr-5">
                <TonalButton
                    color="grey"
                    text="Volver"
                    @click="routerBack" 
                />
                <TonalButton
                    class=""
                    color="blue"
                    text="Reservar"
                    @click="createReservation"
                />
            </v-card-actions>
        </v-card>

    </v-container>

    <AskModal
        v-model="deleteModal"
        :title="'¿Borrar espacio?'"
        :message="'¿Estás seguro de que quieres borrar este espacio?'"
        :actionText="'Borrar espacio'"
        :closeModal="closeDialog"
        :action="deleteSpace"
    />

</template>

<script>
import { useUserStore } from '@/store/userStore';
import { useSpaceStore } from '@/store/spaceStore';
import { useReservationStore } from '@/store/reservationStore';
import { spaceService } from '@/services/spaceService';
import TonalButton from '@/components/TonalButton.vue'
import AskModal from '@/components/AskModal.vue';
import CreateReservation from '../reservations/CreateReservation.vue';

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
        AskModal
    },
    computed: {
        userStore() {
            return useUserStore();
        }
    },
    mounted() {
        this.spaceStore = useSpaceStore();
        this.reservationStore = useReservationStore()
        this.space = this.spaceStore.getSelectedSpace;

        if (!this.space) {
            this.$router.push('/spaces'); // Redirigir al componente padre
        }

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
    unmounted() {
        this.spaceStore.clearSelectedSpace();
    },
    methods: {
        routerBack() {
            this.$router.push('/spaces');
        },
        openEditSpaceInfo() {
            this.$router.push('/editSpaceInfo');
        },
        closeDialog() {
            this.deleteModal = false;
        },
        createReservation() {
            this.reservationStore.setSelectedReservedSpace(this.space);
            this.$router.push('/spaceReservation');
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
