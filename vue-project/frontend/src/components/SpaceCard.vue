<template>
    <v-container class="pa-5 container">
        <v-card v-if="space" class="mx-auto" :max-width="maxWidth" :class="isPreview ? 'spaceCardPreview' : ''">
            <v-img :src="space.image" color="surface-variant" :height="isPreview ? '150px' : '300px'" cover />

            <v-card-text v-if="space && openingTime && closingTime">
                <v-col>
                    <v-row class="mt-n5 mb-n3" cols="12">
                        <v-col>
                            <span :class="isPreview ? 'overflow-text text-h5' : 'text-h4'">{{ space.name }}</span>
                        </v-col>
                        <v-col v-if="!isPreview" class="d-flex align-center justify-end ga-3">
                            <v-btn v-if="adminActions" @click="() => emit('edit-space')" variant="tonal" size="small"
                                icon="mdi-pencil" />
                            <v-btn v-if="adminActions" @click="() => deleteModal = true" variant="tonal" size="small"
                                icon="mdi-trash-can-outline" />
                        </v-col>
                    </v-row>

                    <v-row class="my-n3" cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon icon="mdi-text" />
                        </v-col>
                        <v-col cols="10">
                            <span class="text-h6" :class="isPreview ? 'overflow-text' : ''">{{ space.description
                                }}</span>
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
                                    <v-icon size="small" icon="mdi-weather-sunny" />
                                </v-col>
                                <v-col>
                                    <span class="pt-2 text-h6">Abre a las {{ openingTime }}</span>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col>
                            <v-row class="d-flex align-center my-n2">
                                <v-col cols="2">
                                    <v-icon size="small" icon="mdi-weather-night" />
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
                                    <span class="pt-2 text-h6" v-if="space.duration < 60">
                                        Reservas de {{ space.duration }} minutos
                                    </span>
                                    <span class="pt-2 text-h6" v-if="space.duration === 60">
                                        Reservas de {{ space.duration / 60 }} hora
                                    </span>
                                    <span class="pt-2 text-h6" v-if="space.duration > 60">
                                        Reservas de {{ space.duration / 60 }} horas
                                    </span>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col>
                            <v-row>
                                <v-col cols="2" class="d-flex align-center">
                                    <v-icon icon="mdi-repeat" size="small" />
                                </v-col>
                                <v-col>
                                    <span class="pt-2 text-h6">
                                        {{ space.repetition ? 'Permite repetición' : 'No permite repetición' }}
                                    </span>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>

            <v-card-actions v-if="reserveActions" class="d-flex justify-end ga-3 mt-n3 mb-3 mr-5">
                <TonalButton color="grey" text="Volver" @click="() => emit('go-back')" />
                <TonalButton color="blue" text="Reservar" @click="() => emit('reserve')" />
            </v-card-actions>

            <v-card-actions v-if="isPreview && adminActions"
                class="d-flex align-center justify-space-between ga-3 mx-3 mb-3 mt-n3">
                <v-btn @click.stop="() => emit('edit-space')" variant="tonal" size="small" icon="mdi-pencil" />
                <v-btn @click.stop="() => deleteModal = true" variant="tonal" size="small" icon="mdi-trash-can-outline"
                    color="error" />
            </v-card-actions>
        </v-card>

        <AskModal v-model="deleteModal" title="¿Borrar espacio?"
            message="¿Estás seguro de que quieres borrar este espacio?" actionText="Borrar espacio"
            :closeModal="closeDialog" :action="() => emit('delete-space')" />
    </v-container>
</template>

<script setup>
import { computed, ref } from 'vue';
import TonalButton from '@/components/TonalButton.vue';
import AskModal from '@/components/AskModal.vue';
import { useTime } from '@/composables/useTime';

const props = defineProps({
    space: { type: Object, required: true },
    adminActions: { type: Boolean, default: false },
    reserveActions: { type: Boolean, default: false },
    isPreview: { type: Boolean, default: false },
    maxWidth: { type: String, default: '600px' }
});

const emit = defineEmits(['edit-space', 'delete-space', 'go-back', 'reserve']);

const {
    makeHoursAndMinutes
} = useTime();

const deleteModal = ref(false);

function closeDialog() {
    deleteModal.value = false;
}

const openingTime = computed(() => {
    return makeHoursAndMinutes(props.space?.opening);
});

const closingTime = computed(() => {
    return makeHoursAndMinutes(props.space?.closing);
});
</script>


<style scoped>
.spaceCardPreview {
    cursor: pointer;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.spaceCardPreview:hover {
    background-color: rgba(0, 0, 0, 0.01);
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

.overflow-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    width: 100%;
}
</style>
