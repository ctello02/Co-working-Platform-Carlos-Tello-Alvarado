<template>
    <v-container fluid class="container">
        <v-col>
            <v-row class="d-flex align-end">
                <v-tabs v-model="mainTab" align-tabs="center" slider-color="#1056bd" height="40">
                    <v-tab :ripple="false" value="calendar" class="no-hover text-none v-tab-text">Calendario</v-tab>
                    <v-tab :ripple="false" value="reservations" class="no-hover text-none v-tab-text">Reservas</v-tab>
                </v-tabs>
                <v-tabs v-if="mainTab === 'reservations'" v-model="subTab" slider-color="#87bbca" height="30">
                    <v-tab :ripple="false" value="next" class="no-hover text-none v-subtab-text">Próximas</v-tab>
                    <v-tab :ripple="false" value="past" class="no-hover text-none v-subtab-text">Anteriores</v-tab>
                </v-tabs>
                <v-spacer></v-spacer>
                <TonalButton class="mr-1" color="blue" text="Crear reserva" @click="openCreateReservation" />
            </v-row>

            <v-row>
                <v-tabs-window v-model="mainTab" style="width: 100%;">
                    <v-tabs-window-item value="calendar">
                        <ScheduleXCalendar class="mt-4 mx-1" :calendar-app="calendarApp">
                            <template #timeGridEvent="{ calendarEvent }">
                                <div
                                    :style="calcPastEvents(calendarEvent) ? timeGridEventStyles : timeGridPastEventStyles">
                                    {{ calendarEvent.title }}
                                </div>
                            </template>

                            <template #monthGridEvent="{ calendarEvent }">
                                <div :style="calcPastEvents(calendarEvent) ? eventStyles : pastEventStyles">
                                    {{ calendarEvent.title }}
                                </div>
                            </template>

                            <template #eventModal="{ calendarEvent }">
                                <CustomEventCalendar :reservation="reservationStore.getReservation"
                                    @see-event="openReservation" @close="closeModal" />
                            </template>

                        </ScheduleXCalendar>
                    </v-tabs-window-item>

                    <v-tabs-window-item value="reservations">
                        <!-- Filtro -->
                        <v-row class="mt-4 mx-1 d-flex ga-3">
                            <v-btn variant="text" :ripple="false" size="small"
                                :icon="list ? 'mdi-view-grid-outline' : 'mdi-format-list-bulleted'"
                                @click="list = !list" />
                            <v-select variant="outlined" density="compact" label="Mostar reservas" v-model="filter"
                                item-title="label" item-value="value" :items="filterItems" style="max-width: 250px;" />
                        </v-row>

                        <v-tabs-window v-model="subTab" style="width: 100%;">

                            <v-tabs-window-item value="next">
                                <v-row>
                                    <v-col v-if="nextReservations.length === 0" class="text-center mt-3">
                                        <span class="text-h5">No tiene reservas próximas</span>
                                    </v-col>
                                    <v-col v-else-if="list">
                                        <v-card class="ma-1">
                                            <Table :headers="tableHeaders" :fields="['name', 'date', 'schedule']"
                                                :items="tableNextItems" :buttons="actionButtons"
                                                @rowClick="handleRowClick" :clickable="true" />
                                        </v-card>
                                    </v-col>
                                    <v-col v-else-if="!list && filter === null"
                                        v-for="reservation in filteredNextReservations" :key="reservation._id" lg="3"
                                        md="4" sm="12" xs="12" class="ma-0 pa-0">
                                        <ReservationCard :reservation="reservation" />
                                    </v-col>
                                    <v-col v-if="!list && filter === 'spacesName'" class="ma-1">
                                        <v-expansion-panels multiple v-model="panels">
                                            <v-expansion-panel v-for="(reservations, spaceName) in groupedReservations"
                                                :key="spaceName">
                                                <v-expansion-panel-title>{{ spaceName }}</v-expansion-panel-title>
                                                <v-expansion-panel-text>
                                                    <!-- <ReservationCard v-for="reservation in reservations"
                                                        :key="reservation._id" :reservation="reservation" /> -->
                                                    <Table :headers="tableHeaders"
                                                        :fields="['name', 'date', 'schedule']"
                                                        :items="tableItems(reservations)" :buttons="actionButtons"
                                                        @rowClick="handleRowClick" :clickable="true" />
                                                </v-expansion-panel-text>
                                            </v-expansion-panel>
                                        </v-expansion-panels>
                                    </v-col>
                                </v-row>
                            </v-tabs-window-item>

                            <v-tabs-window-item value="past">
                                <v-row>
                                    <v-col v-if="pastReservations.length === 0" class="mt-4 text-center">
                                        <span class="text-h5">No se encuentran datos</span>
                                    </v-col>
                                    <v-col v-else-if="list">
                                        <v-card class="ma-1">
                                            <Table :headers="tableHeaders" :fields="['name', 'date', 'schedule']"
                                                :items="tablePastItems" :buttons="actionButtons"
                                                @rowClick="handleRowClick" :clickable="true" />
                                        </v-card>
                                    </v-col>
                                    <v-col v-else v-for="reservation in filteredPastReservations" :key="reservation._id"
                                        lg="3" md="4" sm="12" xs="12" class="ma-0 mt-1 pa-0">
                                        <ReservationCard :reservation="reservation" />
                                    </v-col>
                                </v-row>
                            </v-tabs-window-item>
                        </v-tabs-window>
                    </v-tabs-window-item>
                </v-tabs-window>

                <AskModal title="Nueva reserva" :message="message" :modelValue="dialog" actionText="Ir a reservar"
                    colorText="black" colorButton="blue" :closeModal="closeDialog" :action="openCreateReservation" />

            </v-row>
        </v-col>
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import { useUserStore } from '@/store/userStore';
import { useReservationStore } from '@/store/reservationStore';
import { useRouter } from 'vue-router';
import { useTime } from '@/composables/useTime';
import TonalButton from '@/components/TonalButton.vue';
import AskModal from '@/components/AskModal.vue';
import Table from '@/components/Table.vue';
import { reservationService } from '@/services/reservationService';
import ReservationCard from '@/components/ReservationCard.vue';

/* ------------- Importación de librerías para el calendario ---------- */
import { ScheduleXCalendar } from '@schedule-x/vue';
import { createCurrentTimePlugin } from '@schedule-x/current-time'
import CustomEventCalendar from '@/components/CustomModalCalendar.vue';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { createEventModalPlugin } from "@schedule-x/event-modal";
import {
    createCalendar,
    createViewDay,
    createViewMonthGrid,
    createViewWeek,
} from '@schedule-x/calendar';
import '@schedule-x/theme-default/dist/index.css';
/* -------------------------------------------------------------------- */


/* ------------------- Instancias de router, stores y plugins ------------------ */
const userStore = useUserStore();
const router = useRouter();
const reservationStore = useReservationStore();
const eventsServicePlugin = createEventsServicePlugin();
const eventModal = createEventModalPlugin();
const currentTimePlugin = createCurrentTimePlugin();
/* ----------------------------------------------------------------------------- */


/* ---------------- Instancias de composables --------------- */
const {
    makeMinutes,
    makeHoursAndMinutes,
    parseDateTo_YYYYMMDD_HHMM,
    parseToStringDate,
    calcPastEvents,
    calcPastDates,
    twoDigitsDate,
    getHoursAndMinsFromDate
} = useTime();
/* ---------------------------------------------------------- */


/* ------------------- Variables reactivas ------------------ */
const allReservations = ref([]);
const filteredNextReservations = ref([]);
const filteredPastReservations = ref([]);
const nextReservations = ref([]);
const pastReservations = ref([]);
const list = ref(false);
const mainTab = ref(null);
const subTab = ref(null);
const message = ref(null);
const dialog = ref(false);
const filter = ref(null);
const filterItems = ref([
    { label: 'Todas', value: null },
    { label: 'Por nombre de espacios', value: 'spacesName' },
    { label: 'Por fecha', value: 'date' },
]);

const panels = ref([0, 1, 2]);

const groupedReservations = computed(() => {
    const groups = {};
    filteredNextReservations.value.forEach(reservation => {
        const spaceName = reservation.spaceId.name;
        if (!groups[spaceName]) {
            groups[spaceName] = [];
        }
        groups[spaceName].push(reservation);
    });
    return groups;
});

/* ---------------------------------------------------------- */


/* ------------------------- Ciclo de vida ------------------------- */
onMounted(() => {
    if (!allReservations.value) {
        router.push('/reservations');
    }
    getWindowParams();
});

onUnmounted(() => {
    setWindowParams();
})
/*------------------------------------------------------------------ */


/* ------------------- Instancias del calendario ------------------ */
const calendarApp = createCalendar({
    locale: 'es-ES',
    views: [
        createViewDay(),
        createViewWeek(),
        createViewMonthGrid(),
    ],
    firstDayOfWeek: 1,
    defaultView: createViewMonthGrid().name,
    events: getAllEvents(),
    weekOptions: {
        gridHeight: 1600,
        timeAxisFormatOptions: { hour: '2-digit', minute: '2-digit' },
    },
    monthGridOptions: { //Número de eventos a mostrar en un día antes de mostrar '+ eventos'
        nEventsPerDay: 2,
    },
    callbacks: {
        onEventClick(calendarEvent) {
            const selectedReservation = allReservations.value.find(reservation => reservation._id === calendarEvent.id);
            reservationStore.setReservation(selectedReservation);
        },
        onClickDate(date) { // p.e. YYYY-MM-DD
            if (!calcPastDates(new Date(date))) return;      // Si se hace clic en una fecha pasada, se ignora

            const stringDate = parseToStringDate(new Date(date));

            reservationStore.setCalendarDate(date);

            // Mostramos el diálogo con la fecha seleccionada
            message.value = `
                Desea reservar en esta fecha?<br>
                <b>${stringDate}</b>
            `;
            dialog.value = true;
        },
        onClickDateTime(dateTime) {
            if (!calcPastEvents(dateTime)) return;      // Si se hace clic en una fecha pasada, se ignora

            // Se dividen las fechas y horas en partes separadas
            let [datePart, timePart] = dateTime.split(" ");

            let roundedTimeString = roundToNearestQuarterHour(timePart); // Se redondean los minutos a 15 minutos arriba o abajo
            const storeDate = datePart + ' ' + roundedTimeString;
            reservationStore.setCalendarDate(storeDate);            // Se almacena la fecha en el store

            // Mostramos el diálogo con la fecha seleccionada
            let selectedDateString = parseToStringDate(new Date(datePart));
            message.value = `
                ¿Desea reservar en esta fecha?<br>
                <b>${selectedDateString}</b><br>
                <b>Hora: ${roundedTimeString}</b>
            `;
            dialog.value = true;
        },
    },
    plugins: [
        eventsServicePlugin,
        currentTimePlugin,
        eventModal,
    ],

})
/* ---------------------------------------------------------------------------- */


/* ------------------------- Funciones del componente ------------------------- */
function getAllEvents() {
    try {
        reservationService.getUserReservations(userStore.getId)
            .then(res => {
                allReservations.value = res.data.reservations;

                nextReservations.value = res.data.nextReservations;
                pastReservations.value = res.data.pastReservations;

                filteredNextReservations.value = nextReservations.value;
                filteredPastReservations.value = pastReservations.value;

                eventsServicePlugin.set(addCalendarEvents(allReservations.value));
            })
            .catch(error => {
                console.error('Error al obtener reservas:', error);
            });
    } catch (error) {
        console.error(error);
    }
};

function addCalendarEvents(reservations) {
    return reservations.map(reservation => {
        // Usamos la función del composable useTime para transformar startTime y endTime
        const formattedStart = parseDateTo_YYYYMMDD_HHMM(reservation.startTime);
        const formattedEnd = parseDateTo_YYYYMMDD_HHMM(reservation.endTime);

        return {
            id: reservation._id, // Usar el ID de la reserva como identificador único
            title: `Reserva en ${reservation.spaceId.name}`,
            start: formattedStart,  // start: '2024-06-28 08:00',
            end: formattedEnd,      // end: '2024-06-28 10:00',
        };
    });
};

/* ------------------------- Watchers ------------------------- */
watch(filter, (newValue) => {
    if (subTab.value === 'next') {
        if (newValue == null) {
            filteredNextReservations.value = nextReservations.value;
            return;
        }
        filteredNextReservations.value = filterReservations(nextReservations.value, newValue);
    } else if (subTab.value === 'past') {
        if (newValue == null) {
            filteredPastReservations.value = pastReservations.value;
            return;
        }
        filteredPastReservations.value = filterReservations(pastReservations.value, newValue);
    }
});

// watch(subTab, () => {
//     clearFilters();
// });
/* ------------------------------------------------------------ */


/* ------------------------- Funciones auxiliares ------------------------- */
function filterReservations(reservations, filter) {
    let reservationsFiltered = nextReservations.value;

    if (filter === 'spacesName') {
        // Filtrar por nombre de espacio
    } else if (filter === 'date') {
        // Filtrar por fecha
    }

    return reservationsFiltered;
}

function roundToNearestQuarterHour(timeString) {
    let totalMinutes = makeMinutes(timeString); // Convertir HH:MM a minutos totales
    let roundedMinutes = Math.round(totalMinutes / 15) * 15; // Redondear a múltiplo de 15

    return makeHoursAndMinutes(roundedMinutes); // Convertir de nuevo a HH:MM
};


function getWindowParams() {
    const window = reservationStore.getWindow;
    if (window) {
        mainTab.value = window.mainTab;
        subTab.value = window.subTab;
        list.value = window.list;
        filter.value = window.filter;
    }
};

function setWindowParams() {
    const window = {
        mainTab: mainTab.value,
        subTab: subTab.value,
        list: list.value,
        filter: filter.value,
    }
    reservationStore.setWindow(window);
};

function clearFilters() {
    filter.value = null;
    filteredNextReservations.value = nextReservations.value;
    filteredPastReservations.value = pastReservations.value;
};

// Cuando se hace click en una fila, abrimos la reserva
function handleRowClick(item) {
    reservationStore.setReservation(item.object)
    router.push('/reservationInfo')
};

function openCreateReservation() {
    router.push('/createReservation');
};

function openReservation() {
    router.push('/reservationInfo');
};

const closeModal = () => {
    eventModal.close();
};

function closeDialog() {
    dialog.value = false;
};
/* ------------------------------------------------------------------------- */

/* ------------------------- Objetos de la tabla ------------------------- */
// Encabezados
let tableHeaders = [
    { label: '#', width: '10%' },
    { label: 'Nombre', width: '15%' },
    { label: 'Fecha', width: '20%' },
    { label: 'Horario', width: '20%' }
];

function tableItems(reservations) {
    return reservations.map((reservation, i) => {
        return {
            id: reservation._id,        // key para v-for
            date: `${twoDigitsDate(new Date(reservation.startTime))}`,
            name: reservation.spaceId.name,
            schedule: `${getHoursAndMinsFromDate(reservation.startTime)}h - ${getHoursAndMinsFromDate(reservation.endTime)}h`,
            object: reservation,      // guardamos el objeto para usarlo en las acciones
        }
    })
}

// Transformamos 'nextReservations' en 'tableNextItems'
const tableNextItems = computed(() => {
    return (nextReservations.value || []).map((reservation, i) => {
        return {
            id: reservation._id,        // key para v-for
            date: `${twoDigitsDate(new Date(reservation.startTime))}`,
            name: reservation.spaceId.name,
            schedule: `${getHoursAndMinsFromDate(reservation.startTime)}h - ${getHoursAndMinsFromDate(reservation.endTime)}h`,
            object: reservation,      // guardamos el objeto para usarlo en las acciones
        }
    })
})

// Transformamos 'pastReservations' en 'tablePastItems'
const tablePastItems = computed(() => {
    return (pastReservations.value || []).map((reservation, i) => {
        return {
            id: reservation._id,        // key para v-for
            date: `${twoDigitsDate(new Date(reservation.startTime))}`,
            name: reservation.spaceId.name,
            schedule: `${getHoursAndMinsFromDate(reservation.startTime)}h - ${getHoursAndMinsFromDate(reservation.endTime)}h`,
            object: reservation,      // guardamos el objeto para usarlo en las acciones
        }
    })
})

/* -------------------------------- Estilos -------------------------------- */
const baseEventStyles = {
    width: '100%',
    height: '100%',
    color: '#f8f9f9',
    borderRadius: '4px',
    padding: '0 4px',
    'margin-left': '2px'
};

const timeGridEventStyles = {
    ...baseEventStyles,
    backgroundColor: '#1f66cd',
    border: '2px solid #333ca0',
    'border-left': '5px solid #333ca0',
};

const timeGridPastEventStyles = {
    ...baseEventStyles,
    backgroundColor: '#737272',
    opacity: 0.5,
    border: '2px dashed black',
};

const eventStyles = {
    ...baseEventStyles,
    backgroundColor: '#1f66cd',
    'border-left': '5px solid #333ca0',
};

const pastEventStyles = {
    ...baseEventStyles,
    backgroundColor: '#737272',
    opacity: 0.5,
    border: '2px dashed black',
};
/* ------------------------------------------------------------------------- */

</script>

<style scoped>
.sx-vue-calendar-wrapper {
    max-width: 100vw;
    height: 490px;
    max-height: 90vh;
}

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