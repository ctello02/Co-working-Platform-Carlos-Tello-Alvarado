<template>
  <v-container fluid class="d-flex gap-4">
    <v-row>
      <v-col cols="12" lg="3" md="3">
        <span class="text-h4">Reservas ({{ reservations.length }})</span>
        <v-card class="pa-2 mt-4">
          <v-list v-if="reservations.length > 0">
            <v-list-item @click="infoEvent(reservation)" v-for="reservation in reservations" :key="reservation._id">
              <v-list-item-content>
                <v-list-item-title>
                  <p>Reserva de espacio</p>
                </v-list-item-title>

                <v-list-item-subtitle>
                  {{ reservation.start }} - {{ reservation.end }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <span class="ml-4" v-else type="info">No hay reservas para mostrar</span>
          <v-card-actions class="d-flex justify-center">
            <TonalButton color="blue" @click="addReservation" text="Añadir reserva" block />
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" lg="9" md="9">
        <ScheduleXCalendar :calendar-app="calendarApp" />
      </v-col>

    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { ScheduleXCalendar } from '@schedule-x/vue';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import {
  createCalendar,
  createViewDay,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar';
import '@schedule-x/theme-default/dist/index.css';
import { useRouter } from 'vue-router';
const router = useRouter()

import { reservationService } from '@/services/reservationService';
import TonalButton from '@/components/TonalButton.vue';

const eventsServicePlugin = createEventsServicePlugin();

var reservations = ref([]);

async function getAllEvents() {
  try {
    const response = await reservationService.getReservations();

    // Mapea las reservas para ajustar los campos al formato del calendario
    reservations.value = response.data.reservations.map(reservation => {
      return {
        id: reservation._id, // Usar el ID de la reserva como identificador único
        // title: `Reserva en ${reservation.space}`, // Personaliza el título
        title: `Reserva HOLA`, // Personaliza el título
        start: `${reservation.date} ${reservation.startTime}`,
        end: `${reservation.date} ${reservation.endTime}`,
        calendarId: reservation.calendarId, // Identificador del calendario
      };
    });

    console.log('Reservas procesadas:', reservations.value);

    // Actualiza los eventos en el plugin del calendario
    eventsServicePlugin.set(reservations.value);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
  }
}

const calendarApp = createCalendar({
  selectedDate: '2025-01-20',
  views: [
    createViewDay(),
    createViewWeek(),
    createViewMonthGrid(),
  ],
  firstDayOfWeek: 1,
  defaultView: createViewWeek().name,
  events: getAllEvents().value,
  weekOptions: {
    gridHeight: 2500,
    timeAxisFormatOptions: { hour: '2-digit', minute: '2-digit' },
  },
  calendars: {
    espacios: {
      colorName: 'espacios',
      lightColors: {
        main: '#1c7df9',
        container: '#d2e7ff',
        onContainer: '#002859',
      },
      darkColors: {
        main: '#c0dfff',
        onContainer: '#dee6ff',
        container: '#426aa2',
      },
    }
  },
  callbacks: {
    /**
    * Is called when an event is clicked
    * */
    onEventClick(calendarEvent) {
      console.log('onEventClick', calendarEvent)
    },

    /**
    * Is called when clicking a date in the month grid
    * */
    onClickDate(date) {
      console.log('onClickDate', date) // e.g. 2024-01-01
      const event = {
        title: 'Evento día ' + date,
        description: 'Descripción ejemplo',
        start: date,
        end: date,
        calendarId: 'espacios'
      }

      addEventMonth(event)
    },

    /**
    * Is called when clicking somewhere in the time grid of a week or day view
    * */
    onClickDateTime(dateTime) {
      console.log('onClickDateTime', dateTime) // e.g. 2024-01-01 12:37
    },
  },

},
  [eventsServicePlugin]
)

function addEventMonth(event) {
  reservationService.createReservation(event).then(res => {
    eventsServicePlugin.add(res.data)
    events.value.push(res.data)
  })
}

function addReservation() {
  router.push({ path: '/createReservation' })
}
</script>

<style>
.sx-vue-calendar-wrapper {
  max-width: 100vw;
  height: 800px;
  max-height: 90vh;
}
</style>