<template>
    <v-container fluid class="container">
        <v-col v-if="reservations">
            <v-row>
                <v-tabs class="mb-5" v-model="todaysTab" align-tabs="center" slider-color="#1056bd" height="40">
                    <v-tab :ripple="false" value="all" class="no-hover text-none v-tab-text">Todos</v-tab>
                    <v-tab :ripple="false" value="spaces" class="no-hover text-none v-tab-text">Espacios</v-tab>
                    <v-tab :ripple="false" value="materials" class="no-hover text-none v-tab-text">Materiales</v-tab>
                </v-tabs>
            </v-row>
            <v-row class="mt-3 mx-n2 d-flex ga-3 ">
                <v-btn variant="text" :ripple="false" size="small"
                    :icon="list ? 'mdi-format-list-bulleted' : 'mdi-view-grid-outline'" @click="list = !list" />
                <v-select variant="outlined" density="compact" label="Mostar reservas" v-model="filter"
                    item-title="label" item-value="value" :items="filterItems" style="max-width: 250px;" />
                <v-btn variant="text" :ripple="false" size="small" class="mt-2"
                    :prepend-icon="dateDesc ? 'mdi-arrow-down' : 'mdi-arrow-up'" @click="dateDesc = !dateDesc">
                    {{ dateDesc ? 'Descendente' : 'Ascendente' }}
                </v-btn>
            </v-row>

            <v-row class="mt-n6 mx-n5">
                <!-- Mensaje si no hay reservas -->
                <v-col cols="12" v-if="reservations.length === 0" class="text-center mt-10">
                    <span class="text-h5">No hay reservas para hoy</span>
                </v-col>

                <v-tabs-window v-model="todaysTab" style="width: 100%;">
                    <!--─── Todas las reservas ───-->
                    <v-tabs-window-item value="all">
                        <!-- Mostrar todas las reservas (sin agrupar) -->
                        <!-- Modo tabla -->
                        <v-col cols="12" v-if="filter === null">
                            <v-row v-if="list">
                                <v-col>
                                    <v-card class="ma-1">
                                        <Table :headers="tableHeaders" :fields="['name', 'user', 'date', 'schedule']"
                                            :items="tableItems" @rowClick="onClick" clickable />
                                    </v-card>
                                </v-col>
                            </v-row>
                            <!-- Modo tarjetas -->
                            <v-row v-else>
                                <v-col v-for="reservation in displayedReservations" :key="reservation._id" lg="3" md="4"
                                    sm="12" xs="12" class="ma-0 pa-0">
                                    <ReservationCard :reservation="reservation" :showMoreDetails="true" />
                                </v-col>
                            </v-row>
                        </v-col>
                        <!-- Mostrar reservas agrupadas por espacio -->
                        <v-col cols="12" v-else-if="filter === 'itemsName'" class="ma-1">
                            <v-row v-for="(reservs, itemName) in groupedByName" :key="itemName">
                                <v-card style="width: 100%; cursor: pointer; border: 1px solid black;" class="ma-4"
                                    elevation="0">
                                    <v-card-title @click="toggleItem(itemName)" class="d-flex">
                                        <h3>{{ itemName }}</h3>
                                        <v-spacer />
                                        <v-btn :ripple="false"
                                            :icon="expandedNames[itemName] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                                            variant="text" size="small" />
                                    </v-card-title>
                                    <v-row v-if="expandedNames[itemName]">
                                        <v-col v-if="list">
                                            <Table :headers="tableHeaders" :fields="['user', 'date', 'schedule']"
                                                :items="tableDropdownItems(reservs)" @rowClick="onClick" clickable
                                                style="width: 100%;" />
                                        </v-col>
                                        <v-col v-else v-for="reservation in reservs" :key="reservation._id" cols="12"
                                            sm="6" md="4">
                                            <ReservationCard :reservation="reservation" :showMoreDetails="true" />
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </v-row>
                        </v-col>
                        <!-- Mostrar reservas agrupadas por tiempo -->
                        <v-col cols="12" v-else-if="filter === 'date'" class="ma-1">
                            <v-row v-for="(reservs, dateKey) in groupedByTime" :key="dateKey">
                                <v-card style="width: 100%; cursor: pointer; border: 1px solid black;" class="ma-4"
                                    elevation="0">
                                    <v-card-title @click="toggleDate(dateKey)" class="d-flex">
                                        <h3>{{ dateKey }}</h3>
                                        <v-spacer />
                                        <v-btn :ripple="false"
                                            :icon="expandedDates[dateKey] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                                            variant="text" size="small" />
                                    </v-card-title>
                                    <v-row v-if="expandedDates[dateKey]">
                                        <v-col v-if="list">
                                            <Table :headers="tableHeaders" :fields="['name', 'user', 'schedule']"
                                                :items="tableDropdownItems(reservs)" @rowClick="onClick" clickable
                                                style="width: 100%;" />
                                        </v-col>
                                        <v-col v-else v-for="reservation in reservs" :key="reservation._id" cols="12"
                                            sm="6" md="4">
                                            <ReservationCard :reservation="reservation" :showMoreDetails="true" />
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </v-row>
                        </v-col>
                    </v-tabs-window-item>

                    <!--─── Solo Espacios ───-->
                    <v-tabs-window-item value="spaces">
                        <!-- Modo tabla -->
                        <v-col cols="12" v-if="filter === null">

                            <v-row v-if="list">
                                <v-col>
                                    <v-card class="ma-1">
                                        <Table :headers="tableHeaders" :fields="['name', 'user', 'date', 'schedule']"
                                            :items="tableItems" @rowClick="onClick" clickable />
                                    </v-card>
                                </v-col>
                            </v-row>
                            <!-- Modo tarjetas -->
                            <v-row v-else>
                                <v-col v-for="reservation in displayedReservations" :key="reservation._id" lg="3" md="4"
                                    sm="12" xs="12" class="ma-0 pa-0">
                                    <ReservationCard :reservation="reservation" :showMoreDetails="true" />
                                </v-col>
                            </v-row>
                        </v-col>
                        <!-- Mostrar reservas agrupadas por espacio -->
                        <v-col cols="12" v-else-if="filter === 'itemsName'" class="ma-1">
                            <v-row v-for="(reservs, itemName) in groupedByName" :key="itemName">
                                <v-card style="width: 100%; cursor: pointer; border: 1px solid black;" class="ma-4"
                                    elevation="0">
                                    <v-card-title @click="toggleItem(itemName)" class="d-flex">
                                        <h3>{{ itemName }}</h3>
                                        <v-spacer />
                                        <v-btn :ripple="false"
                                            :icon="expandedNames[itemName] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                                            variant="text" size="small" />
                                    </v-card-title>
                                    <v-row v-if="expandedNames[itemName]">
                                        <v-col v-if="list">
                                            <Table :headers="tableHeaders" :fields="['user', 'date', 'schedule']"
                                                :items="tableDropdownItems(reservs)" @rowClick="onClick" clickable
                                                style="width: 100%;" />
                                        </v-col>
                                        <v-col v-else v-for="reservation in reservs" :key="reservation._id" cols="12"
                                            sm="6" md="4">
                                            <ReservationCard :reservation="reservation" :showMoreDetails="true" />
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </v-row>
                        </v-col>
                        <!-- Mostrar reservas agrupadas por tiempo -->
                        <v-col cols="12" v-else-if="filter === 'date'" class="ma-1">
                            <v-row v-for="(reservs, dateKey) in groupedByTime" :key="dateKey">
                                <v-card style="width: 100%; cursor: pointer; border: 1px solid black;" class="ma-4"
                                    elevation="0">
                                    <v-card-title @click="toggleDate(dateKey)" class="d-flex">
                                        <h3>{{ dateKey }}</h3>
                                        <v-spacer />
                                        <v-btn :ripple="false"
                                            :icon="expandedDates[dateKey] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                                            variant="text" size="small" />
                                    </v-card-title>
                                    <v-row v-if="expandedDates[dateKey]">
                                        <v-col v-if="list">
                                            <Table :headers="tableHeaders" :fields="['name', 'user', 'schedule']"
                                                :items="tableDropdownItems(reservs)" @rowClick="onClick" clickable
                                                style="width: 100%;" />
                                        </v-col>
                                        <v-col v-else v-for="reservation in reservs" :key="reservation._id" cols="12"
                                            sm="6" md="4">
                                            <ReservationCard :reservation="reservation" :showMoreDetails="true" />
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </v-row>
                        </v-col>
                    </v-tabs-window-item>

                    <!--─── Solo Materiales ───-->
                    <v-tabs-window-item value="materials">
                        <!-- Modo tabla -->
                        <v-col cols="12" v-if="filter === null">
                            <v-row v-if="list">
                                <v-col>
                                    <v-card class="ma-1">
                                        <Table :headers="tableHeaders" :fields="['name', 'user', 'date', 'schedule']"
                                            :items="tableItems" @rowClick="onClick" clickable />
                                    </v-card>
                                </v-col>
                            </v-row>
                            <!-- Modo tarjetas -->
                            <v-row v-else>
                                <v-col v-for="reservation in displayedReservations" :key="reservation._id" lg="3" md="4"
                                    sm="12" xs="12" class="ma-0 pa-0">
                                    <ReservationCard :reservation="reservation" :showMoreDetails="true" />
                                </v-col>
                            </v-row>
                        </v-col>
                        <!-- Mostrar reservas agrupadas por espacio -->
                        <v-col cols="12" v-else-if="filter === 'itemsName'" class="ma-1">
                            <v-row v-for="(reservs, itemName) in groupedByName" :key="itemName">
                                <v-card style="width: 100%; cursor: pointer; border: 1px solid black;" class="ma-4"
                                    elevation="0">
                                    <v-card-title @click="toggleItem(itemName)" class="d-flex">
                                        <h3>{{ itemName }}</h3>
                                        <v-spacer />
                                        <v-btn :ripple="false"
                                            :icon="expandedNames[itemName] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                                            variant="text" size="small" />
                                    </v-card-title>
                                    <v-row v-if="expandedNames[itemName]">
                                        <v-col v-if="list">
                                            <Table :headers="tableHeaders" :fields="['user', 'date', 'schedule']"
                                                :items="tableDropdownItems(reservs)" @rowClick="onClick" clickable
                                                style="width: 100%;" />
                                        </v-col>
                                        <v-col v-else v-for="reservation in reservs" :key="reservation._id" cols="12"
                                            sm="6" md="4">
                                            <ReservationCard :reservation="reservation" :showMoreDetails="true" />
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </v-row>
                        </v-col>
                        <!-- Mostrar reservas agrupadas por tiempo -->
                        <v-col cols="12" v-else-if="filter === 'date'" class="ma-1">
                            <v-row v-for="(reservs, dateKey) in groupedByTime" :key="dateKey">
                                <v-card style="width: 100%; cursor: pointer; border: 1px solid black;" class="ma-4"
                                    elevation="0">
                                    <v-card-title @click="toggleDate(dateKey)" class="d-flex">
                                        <h3>{{ dateKey }}</h3>
                                        <v-spacer />
                                        <v-btn :ripple="false"
                                            :icon="expandedDates[dateKey] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                                            variant="text" size="small" />
                                    </v-card-title>
                                    <v-row v-if="expandedDates[dateKey]">
                                        <v-col v-if="list">
                                            <Table :headers="tableHeaders" :fields="['name', 'user', 'schedule']"
                                                :items="tableDropdownItems(reservs)" @rowClick="onClick" clickable
                                                style="width: 100%;" />
                                        </v-col>
                                        <v-col v-else v-for="reservation in reservs" :key="reservation._id" cols="12"
                                            sm="6" md="4">
                                            <ReservationCard :reservation="reservation" :showMoreDetails="true" />
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </v-row>
                        </v-col>
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-row>
        </v-col>
    </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import Table from '@/components/Table.vue';
import ReservationCard from '@/components/ReservationCard.vue';
// import { useUserStore } from '@/store/userStore';
import { useReservationStore } from '@/store/reservationStore';
// import { useSpaceStore } from '@/store/spaceStore';
// import { useMaterialStore } from '@/store/materialStore';
import { useRouter } from 'vue-router';
import { useTime } from '@/composables/useTime';
//import TonalButton from '@/components/TonalButton.vue';
import { reservationService } from '@/services/reservationService';

/* ---------------- Instancias de composables --------------- */
const {
    twoDigitsDate,
    getHoursAndMinsFromDate,
} = useTime();
/* ---------------------------------------------------------- */

const router = useRouter();
const reservationStore = useReservationStore();

const originalReservations = ref(null);
const reservations = ref(null);

const expandedNames = ref({});    // Almacena el estado abierto/cerrado del desplegable de cada nombre del espacio/material. 
const expandedDates = ref({});    // Almacena el estado abierto/cerrado del desplegable de cada fecha.
const todaysTab = ref('all');

const filter = ref(null);
const list = ref(false);
const dateDesc = ref(false);
const filterItems = ref([
    { label: 'Todas', value: null },
    { label: 'Por nombre de espacios/materiales', value: 'itemsName' },
    { label: 'Por hora', value: 'date' },
]);

onMounted(async () => {
    await getTodayReservations();
    getWindowParams();
});

onUnmounted(() => {
    setWindowParams();
})

async function getTodayReservations() {
    reservationService.getTodayReservations()
        .then(res => {
            originalReservations.value = res.data.reservations;
            reservations.value = res.data.reservations;
            //console.log(reservations.value);
        })
        .catch(error => {
            console.log(error);
            reservations.value = null;
        });
};

const displayedReservations = computed(() => {
    if (todaysTab.value === 'spaces') {
        return reservations.value.filter(r => !!r.spaceId);
    } else if (todaysTab.value === 'materials') {
        return reservations.value.filter(r => !!r.materialId);
    } else {
        return reservations.value;
    }
});

const groupedByName = computed(() => {
    const groups = {};

    const reservationsToSearch = displayedReservations.value;

    if (dateDesc.value == true) //Filtrar por fecha descendente
        reservationsToSearch.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    else //Filtrar por fecha ascendente
        reservationsToSearch.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    reservationsToSearch.forEach(reservation => {
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

const groupedByTime = computed(() => {
    const groups = {};

    const reservationsToSearch = displayedReservations.value;

    if (dateDesc.value == true) //Filtrar por fecha descendente
        reservationsToSearch.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    else //Filtrar por fecha ascendente
        reservationsToSearch.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    reservationsToSearch.forEach((reservation) => {
        const dateKey = getHoursAndMinsFromDate(reservation.startTime);

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
    { label: 'Usuario', width: '20%' },
    { label: 'Fecha', width: '15%' },
    { label: 'Horario', width: '15%' }
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
    return reservations.map((reservation, i) => {
        return {
            id: reservation._id,        // key para v-for
            date: `${twoDigitsDate(new Date(reservation.startTime))}`,
            name: reservation.spaceId?.name || reservation.materialId?.name,
            user: reservation.userId?.name + ', ' + reservation.userId?.email,
            schedule: `${getHoursAndMinsFromDate(reservation.startTime)}h - ${getHoursAndMinsFromDate(reservation.endTime)}h`,
            object: reservation,      // guardamos el objeto para usarlo en las acciones
        }
    })
}

// Transformamos 'nextReservations o pastReservations' en 'tableItems'
const tableItems = computed(() => {
    return displayedReservations.value.map((reservation, i) => {
        return {
            id: reservation._id,        // key para v-for
            date: `${twoDigitsDate(new Date(reservation.startTime))}`,
            name: reservation.spaceId?.name || reservation.materialId?.name,
            user: reservation.userId?.name + ', ' + reservation.userId?.email,
            schedule: `${getHoursAndMinsFromDate(reservation.startTime)}h - ${getHoursAndMinsFromDate(reservation.endTime)}h`,
            object: reservation,      // guardamos el objeto para usarlo en las acciones
        }
    })
});

function getWindowParams() {
    const storedWindow = reservationStore.getWindowParams;
    if (storedWindow) {
        todaysTab.value = storedWindow.todaysTab;
        list.value = storedWindow.list;
        filter.value = storedWindow.filter;
        dateDesc.value = storedWindow.dateDesc;
        if (storedWindow.expandedNames) {
            expandedNames.value = storedWindow.expandedNames;
        }
        if (storedWindow.expandedDates) {
            expandedDates.value = storedWindow.expandedDates;
        }
    }
}

function setWindowParams() {
    const storedWindow = {
        ...reservationStore.getWindowParams,
        todaysTab: todaysTab.value,
        list: list.value,
        filter: filter.value,
        dateDesc: dateDesc.value,
        expandedNames: expandedNames.value,
        expandedDates: expandedDates.value
    };
    reservationStore.setWindowParams(storedWindow);
};

function onClick(item) {
    reservationStore.setReservation(item.object)
    router.push('/reservationInfo')
};
</script>

<style scoped>
.v-tab-text {
    font-size: clamp(14px, 1.4vw, 20px);
    letter-spacing: normal;

}

.v-subtab-text {
    font-size: clamp(10px, 1.2vw, 18px);
    letter-spacing: normal;
    color: rgb(92, 92, 92);
}
</style>
