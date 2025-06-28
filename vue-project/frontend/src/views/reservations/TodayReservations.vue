<template>
    <v-col v-if="reservations">
        <v-row class="mt-4 mx-1 d-flex ga-3 ">
            <v-btn variant="text" :ripple="false" size="small"
                :icon="list ? 'mdi-format-list-bulleted' : 'mdi-view-grid-outline'"
                @click="list = !list" />
            <v-select variant="outlined" density="compact" label="Mostar reservas" v-model="filter"
                item-title="label" item-value="value" :items="filterItems" style="max-width: 250px;" />
            <v-btn variant="text" :ripple="false" size="small" class="mt-2"
                :prepend-icon="dateDesc ? 'mdi-arrow-down' : 'mdi-arrow-up'"
                @click="dateDesc = !dateDesc">
                {{ dateDesc ? 'Descendente' : 'Ascendente' }}
            </v-btn>
        </v-row>
        <v-row>
            <!-- Mensaje si no hay reservas -->
            <v-col cols="12" v-if="reservations.length === 0" class="text-center mt-3">
                <span class="text-h5">No hay reservas para hoy</span>
            </v-col>
            <!-- Mostrar todas las reservas (sin agrupar) -->
            <v-col v-if="filter === null">
                <!-- Modo tabla -->
                <v-row v-if="list">
                    <v-col>
                        <v-card class="ma-1">
                            <Table :headers="tableHeaders" :fields="['name', 'date', 'schedule']" :items="tableItems"
                                @rowClick="onClick" clickable />
                        </v-card>
                    </v-col>
                </v-row>
                <!-- Modo tarjetas -->
                <v-row v-else>
                    <v-col v-for="reservation in reservations" :key="reservation._id" lg="3" md="4" sm="12" xs="12"
                        class="ma-0 pa-0">
                        <ReservationCard :reservation="reservation" />
                    </v-col>
                </v-row>
            </v-col>
            <!-- Mostrar reservas agrupadas por espacio -->
             <v-col v-else-if="filter === 'itemsName'" class="ma-1">
                <v-row v-for="(reservs, itemName) in groupedByName" :key="itemName">
                    <v-card style="width: 100%; cursor: pointer; border: 1px solid black;" class="ma-4" elevation="0">
                        <v-card-title @click="toggleItem(itemName)" class="d-flex">
                            <h3>{{ itemName }}</h3>
                            <v-spacer />
                            <v-btn :ripple="false" :icon="expandedNames[itemName] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                                variant="text" size="small" />
                        </v-card-title>
                        <v-row v-if="expandedNames[itemName]">
                            <v-col v-if="list">
                                <Table :headers="tableHeaders" :fields="['date', 'schedule']"
                                    :items="tableDropdownItems(reservs)" @rowClick="onRowClick" clickable
                                    style="width: 100%;" />
                            </v-col>
                            <v-col v-else v-for="reservation in reservs" :key="reservation._id" cols="12" sm="6" md="4">
                                <ReservationCard :reservation="reservation" />
                            </v-col>
                        </v-row>
                    </v-card>
                </v-row>
            </v-col>
            <v-col v-else-if="filter === 'date'" class="ma-1">
                <v-row v-for="(reservs, dateKey) in groupedByDate" :key="dateKey">
                    <v-card style="width: 100%; cursor: pointer; border: 1px solid black;" class="ma-4" elevation="0">
                        <v-card-title @click="toggleDate(dateKey)" class="d-flex">
                            <h3>{{ dateKey }}</h3>
                            <v-spacer />
                            <v-btn :ripple="false" :icon="expandedDates[dateKey] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                                variant="text" size="small" />
                        </v-card-title>
                        <v-row v-if="expandedDates[dateKey]">
                            <v-col v-if="list">
                                <Table :headers="tableHeaders" :fields="['name', 'schedule']"
                                    :items="tableDropdownItems(reservs)" @rowClick="onClick" clickable
                                    style="width: 100%;" />
                            </v-col>
                            <v-col v-else v-for="reservation in reservs" :key="reservation._id" cols="12" sm="6" md="4">
                                <ReservationCard :reservation="reservation" />
                            </v-col>
                        </v-row>
                    </v-card>
                </v-row>
            </v-col> 
        </v-row>
    </v-col>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import Table from '@/components/Table.vue';
import ReservationCard from '@/components/ReservationCard.vue';
import { useUserStore } from '@/store/userStore';
import { useReservationStore } from '@/store/reservationStore';
import { useSpaceStore } from '@/store/spaceStore';
import { useMaterialStore } from '@/store/materialStore';
import { useRouter } from 'vue-router';
import { useTime } from '@/composables/useTime';
import TonalButton from '@/components/TonalButton.vue';
import { reservationService } from '@/services/reservationService';

/* ---------------- Instancias de composables --------------- */
const {
    makeMinutes,
    makeHoursAndMinutes,
    parseDateTo_YYYYMMDD_HHMM,
    parseToStringDate,
    calcPastEvents,
    isWithinNext24Hours,
    isToday,
    calcPastDates,
    twoDigitsDate,
    getHoursAndMinsFromDate,
} = useTime();
/* ---------------------------------------------------------- */

const originalReservations = ref(null);
const reservations = ref(null);

const expandedNames = ref({});    // Almacena el estado abierto/cerrado del desplegable de cada nombre del espacio/material. 
const expandedDates = ref({});    // Almacena el estado abierto/cerrado del desplegable de cada fecha.

const filter = ref(null);
const list = ref(false);
const dateDesc = ref(false);
const filterItems = ref([
    { label: 'Todas', value: null },
    { label: 'Por nombre de espacios/materiales', value: 'itemsName' },
    { label: 'Por fecha', value: 'date' },
]);

onMounted(async () => {
    await getTodayReservations();
})

async function getTodayReservations() {
    reservationService.getTodayReservations()
        .then(res => {
            originalReservations.value = res.data.reservations;
            reservations.value = res.data.reservations;
            console.log(reservations.value);
        })
        .catch(error => {
            console.log(error);
            reservations.value = null;
        });
};

const groupedByName = computed(() => {
    const groups = {};

    if (dateDesc.value == true) //Filtrar por fecha descendente
        reservations.value.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    else //Filtrar por fecha ascendente
        reservations.value.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    reservations.value.forEach(reservation => {
        const nameKey = reservation.spaceId?.name || reservation.materialId?.name;
        if (!groups[nameKey]) {
            groups[nameKey] = [];
        }
        groups[nameKey].push(reservation);
    });

    //Ordenamos los nombres de los espacios
    const orderedGroups = {};
    Object.keys(groups).sort().forEach(key => {
        orderedGroups[key] = groups[key];
    });

    return orderedGroups;
});

const groupedByDate = computed(() => {
    const groups = {};

    if (dateDesc.value == true) //Filtrar por fecha descendente
        reservations.value.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    else //Filtrar por fecha ascendente
        reservations.value.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    reservations.value.forEach((reservation) => {
        const dateKey = twoDigitsDate(new Date(reservation.startTime));

        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(reservation);
    });
    return groups;
});

function toggleItem(nameKey) {
    expandedNames.value[nameKey] = !expandedNames.value[nameKey];
};

function toggleDate(dateKey) {
    expandedDates.value[dateKey] = !expandedDates.value[dateKey];
};


/* ------------------------- Objetos de la tabla ------------------------- */
// Encabezados
const headers = [
    { label: '#', width: '10%' },
    { label: 'Nombre', width: '15%' },
    { label: 'Fecha', width: '20%' },
    { label: 'Horario', width: '20%' }
];

const tableHeaders = computed(() => {
    if (filter.value === null) return headers;
    return headers.filter(header => {
        if (filter.value === 'itemsName') {
            if (header.label === 'Nombre') return;
            return {
                label: header.label,
                width: header.width,
                sortable: false,
            };
        }
        else if (filter.value === 'date') {
            if (header.label === 'Fecha') return;
            return {
                label: header.label,
                width: header.width,
                sortable: false,
            };
        }

    })
})

function tableDropdownItems(reservations) {
    return reservations.value.map((reservation, i) => {
        return {
            id: reservation._id,        // key para v-for
            date: `${twoDigitsDate(new Date(reservation.startTime))}`,
            name: reservation.spaceId?.name || reservation.materialId?.name,
            schedule: `${getHoursAndMinsFromDate(reservation.startTime)}h - ${getHoursAndMinsFromDate(reservation.endTime)}h`,
            object: reservation,      // guardamos el objeto para usarlo en las acciones
        }
    })
}

// Transformamos 'nextReservations o pastReservations' en 'tableItems'
const tableItems = computed(() => {

    return reservations.value.map((reservation, i) => {
        return {
            id: reservation._id,        // key para v-for
            date: `${twoDigitsDate(new Date(reservation.startTime))}`,
            name: reservation.spaceId?.name || reservation.materialId?.name,
            schedule: `${getHoursAndMinsFromDate(reservation.startTime)}h - ${getHoursAndMinsFromDate(reservation.endTime)}h`,
            object: reservation,      // guardamos el objeto para usarlo en las acciones
        }
    })
})
</script>
