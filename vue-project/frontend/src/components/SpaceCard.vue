<template>
    <v-container class="pa-5 container">
        <v-card 
            v-if="space" 
            class="mx-auto" 
            :max-width="maxWidth"
        >
            <v-img 
                :src="space.image"
                color="surface-variant"
                :height="isPreview ? '150px' : '300px'"
                cover  
            />

            <v-card-text v-if="space && openingTime && closingTime">
                <v-col>
                    <v-row class="mt-n5 mb-n3" cols="12">
                        <v-col cols="9">
                            <span :class="isPreview ? 'text-h5' : 'text-h4'">{{ space.name }}</span>
                        </v-col>
                        <v-col v-if="!isPreview" class="d-flex align-center justify-end ga-3">
                            <v-btn 
                                v-if="adminActions"
                                @click="$emit('edit-space')"
                                variant="tonal"
                                size="small"
                                icon="mdi-pencil"           
                            />
                            <v-btn 
                                v-if="adminActions"
                                @click="deleteModal = true"
                                variant="tonal"
                                size="small"
                                icon="mdi-trash-can-outline" 
                            />
                        </v-col>
                    </v-row>

                    <v-row class="my-n3" cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon icon="mdi-text" />
                        </v-col>
                        <v-col>
                            <span class="text-h6">{{ space.description }}</span>
                        </v-col>
                    </v-row>

                    <v-row v-if="!isPreview" class="my-n3" cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon icon="mdi-table-chair" size="small" />
                        </v-col>
                        <v-col>
                            <span class="text-h6">{{ space.seats }} asientos</span>
                        </v-col>
                    </v-row>

                    <v-row v-if="!isPreview" class="mt-n1">
                        <v-col>
                            <v-row class="d-flex align-center my-n2">
                                <v-col cols="2">
                                    <v-icon size="small" icon="mdi-weather-sunny"></v-icon>
                                </v-col>
                                <v-col>
                                    <span class="pt-2 text-h6">Abre a las {{ openingTime }}</span>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col>
                            <v-row class="d-flex align-center my-n2">
                                <v-col cols="2">
                                    <v-icon size="small" icon="mdi-weather-night"></v-icon>
                                </v-col>
                                <v-col>
                                    <span class="pt-2 text-h6">Cierra a las {{ closingTime }}</span>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>

                    <v-row v-if="!isPreview" class="mt-n3 mb-n5 d-flex justify-center align-center" cols="12">
                        <v-col>
                            <v-row>
                                <v-col cols="2" class="d-flex align-center">
                                    <v-icon icon="mdi-timer-outline" size="small" />
                                </v-col>
                                <v-col>
                                    <span class="pt-2 text-h6" v-if="space.duration < 60">Reservas de {{ space.duration }} minutos</span>
                                    <span class="pt-2 text-h6" v-if="space.duration == 60">Reservas de {{ space.duration / 60 }} hora</span>
                                    <span class="pt-2 text-h6" v-if="space.duration > 60">Reservas de {{ space.duration / 60 }} horas</span>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col>
                            <v-row>
                                <v-col cols="2" class="d-flex align-center">
                                    <v-icon icon="mdi-repeat" size="small" />
                                </v-col>
                                <v-col>
                                    <span class="pt-2 text-h6"> {{ space.repetition ? 'Permite repetición' : 'No permite repetición' }}</span>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>

            <v-card-actions v-if="reserveActions" class="d-flex justify-end ga-3 mt-n3 mb-3 mr-5">
                <TonalButton color="grey" text="Volver" @click="$emit('go-back')" />
                <TonalButton color="blue" text="Reservar" @click="$emit('reserve')" />
            </v-card-actions>

            <v-card-actions v-if="isPreview && adminActions" class="d-flex align-center justify-space-between ga-3 mx-3 mb-3 mt-n3">
                <v-btn 
                    @click.stop="$emit('edit-space')"
                    variant="tonal"
                    size="small"
                    icon="mdi-pencil"           
                />
                <v-btn 
                    @click.stop="deleteModal = true"
                    variant="tonal"
                    size="small"
                    icon="mdi-trash-can-outline" 
                />
            </v-card-actions>
        </v-card>

        <AskModal
            v-model="deleteModal"
            title="¿Borrar espacio?"
            message="¿Estás seguro de que quieres borrar este espacio?"
            actionText="Borrar espacio"
            :closeModal="() => (deleteModal = false)"
            :action="() => $emit('delete-space')"
        />
    </v-container>
</template>

<script>
import TonalButton from '@/components/TonalButton.vue';
import AskModal from '@/components/AskModal.vue';

export default {
    components: {
        TonalButton,
        AskModal
    },
    props: {
        space: { type: Object, required: true },
        adminActions: { type: Boolean, default: false },
        reserveActions: { type: Boolean, default: false},
        isPreview: { type: Boolean, default: false },
        maxWidth: { type: String, default: '600px' }
    },
    data() {
        return {
            deleteModal: false
        };
    },
    computed: {
        openingTime() {
            return this.makeHoursAndMinutes(this.space?.opening);
        },
        closingTime() {
            return this.makeHoursAndMinutes(this.space?.closing);
        }
    },
    methods: {
        makeHoursAndMinutes(minutes) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;

            // Formatea con ceros a la izquierda
            const formattedHours = String(hours).padStart(2, '0');
            const formattedMinutes = String(mins).padStart(2, '0');

            return `${formattedHours}:${formattedMinutes}`;
        },
    }
};
</script>
