<template>
    <v-row>
        <!-- Mensaje si no hay reservas -->
        <v-col cols="12" v-if="reservations.length === 0" class="text-center mt-3">
            <span class="text-h5">{{ noReservationsMessage }}</span>
        </v-col>

        <!-- Mostrar todas las reservas (sin agrupar) -->
        <v-col v-if="filter === null">
            <!-- Modo tabla -->
            <v-row v-if="list">
                <v-col>
                    <v-card class="ma-1">
                        <Table :headers="tableHeaders" :fields="['name', 'date', 'schedule']" :items="tableItems"
                            @rowClick="onRowClick" clickable />
                    </v-card>
                </v-col>
            </v-row>

            <!-- Modo tarjetas -->
            <v-row v-else>
                <v-col v-for="reservation in filteredReservations" :key="reservation._id" lg="3" md="4" sm="12" xs="12"
                    class="ma-0 pa-0">
                    <ReservationCard :reservation="reservation" />
                </v-col>
            </v-row>
        </v-col>

        <!-- Mostrar reservas agrupadas por espacio -->
        <v-col v-else-if="filter === 'itemsName'" class="ma-1">
            <v-row v-for="(reservs, itemName) in groupedByName" :key="itemName">
                <v-card style="width: 100%; cursor: pointer; border: 1px solid black;" class="ma-4" elevation="0">
                    <v-card-title @click="() => $emit('toggleItem', itemName)" class="d-flex">
                        <h3>{{ itemName }}</h3>
                        <v-spacer />
                        <v-btn :ripple="false" :icon="expandedNames[itemName] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                            variant="text" size="small" />
                    </v-card-title>

                    <!-- Contenido expandido/colapsado -->
                    <v-row v-if="expandedNames[itemName]">
                        <!-- Modo tabla -->
                        <v-col v-if="list">
                            <Table :headers="tableHeaders" :fields="['date', 'schedule']"
                                :items="tableDropdownItems(reservs)" @rowClick="onRowClick" clickable
                                style="width: 100%;" />
                        </v-col>
                        <!-- Modo tarjetas -->
                        <v-col v-else v-for="reservation in reservs" :key="reservation._id" cols="12" sm="6" md="4">
                            <ReservationCard :reservation="reservation" />
                        </v-col>
                    </v-row>
                </v-card>
            </v-row>
        </v-col>

        <!-- Mostrar reservas agrupadas por fecha -->
        <v-col v-else-if="filter === 'date'" class="ma-1">
            <v-row v-for="(reservs, dateKey) in groupedByDate" :key="dateKey">
                <v-card style="width: 100%; cursor: pointer; border: 1px solid black;" class="ma-4" elevation="0">
                    <!-- Encabezado -->
                    <v-card-title @click="() => $emit('toggleDate', dateKey)" class="d-flex">
                        <h3>{{ dateKey }}</h3>
                        <v-spacer />
                        <v-btn :ripple="false" :icon="expandedDates[dateKey] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                            variant="text" size="small" />
                    </v-card-title>

                    <!-- Contenido expandido/colapsado -->
                    <v-row v-if="expandedDates[dateKey]">
                        <!-- Modo tabla -->
                        <v-col v-if="list">
                            <Table :headers="tableHeaders" :fields="['name', 'schedule']"
                                :items="tableDropdownItems(reservs)" @rowClick="onRowClick" clickable
                                style="width: 100%;" />
                        </v-col>

                        <!-- Modo tarjetas -->
                        <v-col v-else v-for="reservation in reservs" :key="reservation._id" cols="12" sm="6" md="4">
                            <ReservationCard :reservation="reservation" />
                        </v-col>
                    </v-row>
                </v-card>
            </v-row>
        </v-col>
    </v-row>
</template>

<script setup>
import Table from './Table.vue';
import ReservationCard from './ReservationCard.vue';

// Props que el padre le enviará a este componente
const props = defineProps({
    reservations: { type: Array, default: () => [] },
    noReservationsMessage: { type: String, default: '' },
    filteredReservations: { type: Array, default: () => [] },
    groupedByDate: { type: Object, default: () => ({}) },
    groupedByName: { type: Object, default: () => ({}) },
    expandedNames: { type: Object, default: () => ({}) },
    expandedDates: { type: Object, default: () => ({}) },
    list: { type: Boolean, default: false },
    filter: { type: String, default: null },
    tableHeaders: { type: Array, default: () => [] },
    tableItems: { type: Array, default: () => [] },
    tableDropdownItems: { type: Function, default: () => [] },
});

const emits = defineEmits(['toggleSpace', 'rowClick', 'toggleDate']);

function onRowClick(item) {
    emits('rowClick', item);
}
</script>
