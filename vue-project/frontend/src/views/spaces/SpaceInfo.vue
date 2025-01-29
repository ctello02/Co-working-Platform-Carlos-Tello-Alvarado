<template>
    <v-container class="pa-5 container">
        <v-card v-if="space" class="mx-auto" max-width="600" >
            <v-img
                :src="space?.image"
                color="surface-variant"
                height="300px"
                cover  
            />                            
            <v-card-text v-if="space && this.openingTime && this.closingTime">
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
                                <v-col><span class="pt-2 text-h6">Abre a las {{this.openingTime}}</span></v-col>
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
                                <v-col><span class="pt-2 text-h6">Cierra a las {{this.closingTime}}</span></v-col>
                            </v-row>
                        </v-col>
                    </v-row>

                    <v-row class="mt-n3 mb-n5 d-flex justify-center align-center" cols="12">
                        <v-col>
                            <v-row>
                                <v-col cols="2" class="d-flex align-center">
                                    <v-icon
                                        icon="mdi-timer-outline"
                                        size="small"
                                    />
                                </v-col>
                                <v-col>
                                    <span class="pt-2 text-h6" v-if="space.duration < 60">Reservas de {{space.duration}} minutos</span>
                                    <span class="pt-2 text-h6" v-if="space.duration == 60">Reservas de {{space.duration / 60}} hora</span>
                                    <span class="pt-2 text-h6" v-if="space.duration > 60">Reservas de {{space.duration / 60}} horas</span>
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

            openingTime: null,
            closingTime: null,
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

        this.openingTime = this.makeHoursAndMinutes(this.space?.opening);
        this.closingTime = this.makeHoursAndMinutes(this.space?.closing);

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
        makeHoursAndMinutes(minutes) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;

            // Formatea con ceros a la izquierda
            const formattedHours = String(hours).padStart(2, '0');
            const formattedMinutes = String(mins).padStart(2, '0');

            return `${formattedHours}:${formattedMinutes}`;
        },
        createReservation() {
            this.reservationStore.setSelectedReservedSpace(this.space);
            this.$router.push('/createReservation');
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
