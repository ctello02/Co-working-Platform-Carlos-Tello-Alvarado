<template>
    <v-container class="container main-container">
        <v-col>
            <v-row class="d-flex align-center ma-n5 mt-n7 ">
                <v-col class="d-flex align-center justify-end ga-3">
                    <v-btn @click="() => emit('see-event')" variant="text" size="x-small"
                        icon="mdi-information-outline" />
                    <v-btn v-if="reservation?.canEdit" @click="() => emit('edit-event')" variant="text" size="x-small"
                        icon="mdi-pencil" />
                    <v-btn v-if="reservation?.canEdit" @click="() => emit('delete-event')" variant="text" size="x-small"
                        color="error" icon="mdi-trash-can-outline" />
                    <v-btn @click="() => emit('close')" variant="text" size="x-small" icon="mdi-close" />
                </v-col>
            </v-row>
            <v-row class="mt-n6">
                <v-col>
                    <span class="text-h5">{{ reservation?.spaceId.name }}</span>
                </v-col>
            </v-row>
            <v-row v-if="reservation?.periodicReservationId">
                <v-col class="d-flex align-center ga-1 mt-n5 mb-2">
                    <v-icon size="small" class="text-medium-emphasis">mdi-repeat</v-icon>
                    <small class="text-medium-emphasis">Reserva periódica</small>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" class="mt-n5">
                    <v-row>
                        <v-col style="color: grey">
                            <span>Fecha:
                            </span>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="mt-n7">
                            <span> {{ twoDigitsDate(new
                                Date(reservation?.startTime)) }}
                            </span>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="12" class="mt-n5">
                    <v-row>
                        <v-col style="color: grey">
                            <span>Horas:
                            </span>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="mt-n7">
                            <span>
                                {{
                                    getHoursAndMinsFromDate(reservation?.startTime)
                                }}h
                                -
                                {{
                                    getHoursAndMinsFromDate(reservation?.endTime)
                                }}h
                            </span>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-col>
    </v-container>
</template>


<script setup>
import { useTime } from '@/composables/useTime';

const props = defineProps({
    reservation: { type: Object, required: true },
})

const emit = defineEmits(['see-event', 'edit-event', 'delete-event', 'close']);

// Extraemos funciones del composable useTime
const {
    getHoursAndMinsFromDate,
    twoDigitsDate,
} = useTime();

</script>

<style scoped>
.main-container {
    background-color: #f8f9f9;
    color: black;
    border: 0.5px solid #333ca0;
    border-left: 5px solid #333ca0;
    border-radius: 4px;
}
</style>