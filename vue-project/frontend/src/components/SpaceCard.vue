<template>
    <v-container class="pa-5 container">
        <v-card v-if="space" class="mx-auto" :max-width="maxWidth" :class="isPreview ? 'spaceCardPreview' : ''">
            <v-img :src="$resolve(space.image)" color="surface-variant"
                :height="isPreview ? (smAndDown ? '120px' : '150px') : (smAndDown ? '200px' : '300px')" cover
                :gradient="isPreview ? 'to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)' : ''" class="align-end">
                <v-card-title v-if="isPreview" class="overflow-text" :class="smAndDown ? 'text-h6' : 'text-h5'">
                    {{ space.name }}
                </v-card-title>
            </v-img>

            <v-card-text v-if="space && openingTime && closingTime">
                <v-col>
                    <v-row class="mt-n5 mb-n6" cols="12" v-if="!isPreview">
                        <v-col>
                            <span :class="smAndDown ? 'text-h5' : 'text-h4'">{{ space.name }}</span>
                        </v-col>
                        <v-col class="d-flex align-center justify-end ga-3">
                            <v-btn v-if="adminActions" @click="() => emit('edit-space')" variant="tonal"
                                :size="smAndDown ? 'x-small' : 'small'" icon="mdi-pencil" />
                            <v-btn v-if="adminActions" @click="() => (deleteModal = true)" variant="tonal"
                                :size="smAndDown ? 'x-small' : 'small'" icon="mdi-trash-can-outline" />
                        </v-col>
                    </v-row>

                    <v-row cols="12" :class="isPreview ? 'mt-n7' : ''">
                        <v-col cols="1" class="d-flex align-center" :class="isPreview ? 'ml-n3 mt-2' : ''">
                            <v-icon icon="mdi-text" />
                        </v-col>
                        <v-col cols="10">
                            <span :class="isPreview ? 'overflow-text ml-2 mt-2' : (smAndDown ? '' : 'text-h6')">
                                {{ space.description }}
                            </span>
                        </v-col>
                    </v-row>

                    <v-row class="my-n3" cols="12" v-if="isPreview">
                        <v-col cols="1" class="d-flex align-center ml-n3">
                            <v-icon icon="mdi-clock-outline" />
                        </v-col>
                        <v-col cols="10">
                            <span class="ml-2">
                                {{ openingTime }}h - {{ closingTime }}h
                            </span>
                        </v-col>
                    </v-row>

                    <v-row class="my-n3" cols="12" v-if="isPreview">
                        <v-col cols="1" class="d-flex align-center ml-n3">
                            <v-icon icon="mdi-hand-coin-outline" />
                        </v-col>
                        <v-col cols="10">
                            <span class="ml-2" v-if="space.pricing > 0">
                                {{ space.pricing }}€ por reserva
                            </span>
                            <span class="ml-2" v-else>
                                Reserva gratis
                            </span>
                        </v-col>
                    </v-row>

                    <v-row v-if="!isPreview" :class="!smAndDown ? 'my-n3' : ''" cols="12">
                        <v-col :cols="smAndDown ? 12 : ''">
                            <v-row class="d-flex align-center" :class="smAndDown ? '' : 'my-n2'">
                                <v-col :cols="smAndDown ? 1 : 2" class="d-flex align-center">
                                    <v-icon icon="mdi-table-chair" size="small" />
                                </v-col>
                                <v-col>
                                    <span :class="smAndDown ? '' : 'pt-2 text-h6'">{{ space.seats }} asientos</span>
                                </v-col>
                            </v-row>
                        </v-col>

                        <v-col :cols="smAndDown ? 12 : ''">
                            <v-row class="d-flex align-center" :class="smAndDown ? '' : 'my-n2'">
                                <v-col :cols="smAndDown ? 1 : 2" class="d-flex align-center">
                                    <v-icon size="small" icon="mdi-hand-coin-outline" />
                                </v-col>
                                <v-col>
                                    <span :class="smAndDown ? '' : 'pt-2 text-h6'">
                                        <template v-if="space.pricing > 0">{{ space.pricing }}€ por reserva</template>
                                        <template v-else>Reserva gratis</template>
                                    </span>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>

                    <v-row v-if="!isPreview" :class="!smAndDown ? 'my-n3' : ''">
                        <v-col :cols="smAndDown ? 12 : ''">
                            <v-row class="d-flex align-center" :class="smAndDown ? '' : 'my-n2'">
                                <v-col :cols="smAndDown ? 1 : 2" class="d-flex align-center">
                                    <v-icon size="small" icon="mdi-weather-sunny" />
                                </v-col>
                                <v-col>
                                    <span :class="smAndDown ? '' : 'pt-2 text-h6'">Abre a las {{ openingTime }}</span>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col :cols="smAndDown ? 12 : ''">
                            <v-row class="d-flex align-center" :class="smAndDown ? '' : 'my-n2'">
                                <v-col :cols="smAndDown ? 1 : 2" class="d-flex align-center">
                                    <v-icon size="small" icon="mdi-weather-night" />
                                </v-col>
                                <v-col>
                                    <span :class="smAndDown ? '' : 'pt-2 text-h6'">Cierra a las {{ closingTime }}</span>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>

                    <v-row v-if="!isPreview" class="d-flex justify-center align-center"
                        :class="!smAndDown ? 'my-n3' : ''" cols="12">
                        <v-col :cols="smAndDown ? 12 : ''">
                            <v-row>
                                <v-col :cols="smAndDown ? 1 : 2" class="d-flex align-center">
                                    <v-icon icon="mdi-timer-outline" size="small" />
                                </v-col>
                                <v-col>
                                    <span :class="smAndDown ? '' : 'pt-2 text-h6'">
                                        <template v-if="space.duration < 60">Reservas de {{ space.duration }}
                                            minutos</template>
                                        <template v-else-if="space.duration === 60">Reservas de {{ space.duration / 60
                                        }} hora</template>
                                        <template v-else>Reservas de {{ space.duration / 60 }} horas</template>
                                    </span>
                                </v-col>
                            </v-row>
                        </v-col>

                        <v-col :cols="smAndDown ? 12 : ''">
                            <v-row>
                                <v-col :cols="smAndDown ? 1 : 2" class="d-flex align-center">
                                    <v-icon icon="mdi-repeat" size="small" />
                                </v-col>
                                <v-col>
                                    <span :class="smAndDown ? '' : 'pt-2 text-h6'">
                                        {{ space.admitsRepetition ? 'Permite repetición' : 'No permite repetición' }}
                                    </span>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>

            <v-card-actions v-if="reserveActions" class="d-flex justify-end ga-3"
                :class="smAndDown ? 'mt-2 mb-3 mr-3' : 'mt-n3 mb-3 mr-5'">
                <TonalButton color="grey" text="Volver" @click="() => emit('go-back')" />
                <TonalButton color="blue" text="Reservar" @click="() => emit('reserve')" />
            </v-card-actions>

            <v-card-actions v-if="isPreview && adminActions"
                class="d-flex align-center justify-space-between ga-3 mx-3 mb-3 mt-n3">
                <v-btn @click.stop="() => emit('edit-space')" variant="tonal" size="small" icon="mdi-pencil" />
                <v-btn @click.stop="() => openDeleteSpace()" variant="tonal" size="small" icon="mdi-trash-can-outline"
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
import { useSpaceStore } from '@/store/spaceStore';

import { useDisplay } from 'vuetify'

// Breakpoints de Vuetify
const { smAndDown } = useDisplay()

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

const spaceStore = useSpaceStore();
const deleteModal = ref(false);

function closeDialog() {
    deleteModal.value = false;
}

function openDeleteSpace() {
    spaceStore.setSelectedSpace(props.space);
    deleteModal.value = true;
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
