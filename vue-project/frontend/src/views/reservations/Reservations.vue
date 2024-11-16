<template>
  <v-container fluid class="d-flex gap-4">
    <v-row>
      <v-col cols="12" lg="3">
        <span class="text-h4">Reservas ({{ events.length }})</span>
        <v-card class="pa-2 mt-4">
            <v-list v-if="events.length > 0">
              <v-list-item
                @click="infoEvent(event)"
                v-for="event in events"
                :key="event.id"
              >
                <v-list-item-content>
                  <v-list-item-title>
                    <p>{{ event.title }}</p>
                  </v-list-item-title>

                  <v-list-item-subtitle v-if="event.start === event.end">
                    {{ event.start }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle v-else>
                    {{ event.start }} - {{ event.end }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <span class="ml-4" v-else type="info">No hay eventos para mostrar</span>
            <v-card-actions class="d-flex justify-center">
              <TonalButton 
                color="blue"
                @click="addEvent"
                text="Añadir reserva"
                block
              />
            </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" lg="9">
        <ScheduleXCalendar
          :calendar-app="calendarApp"
        />
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


import { reservationsService } from '@/services/reservationService';
import TonalButton from '@/components/TonalButton.vue';

const eventsServicePlugin = createEventsServicePlugin();
const router = useRouter()
var events = ref([]);

async function getAllEvents() {
  const response = await reservationsService.getReservations();
  events.value = response.data.reservations;
  eventsServicePlugin.set(response.data.reservations)
}

const calendarApp = createCalendar({
  selectedDate: '2024-11-03',
  views: [
    createViewDay(),
    createViewWeek(),
    createViewMonthGrid(),
  ],
  firstDayOfWeek: 1,
  defaultView: createViewMonthGrid().name,
  events: getAllEvents().value,
  weekOptions: {
    gridHeight: 2500,
    timeAxisFormatOptions: { hour: '2-digit', minute: '2-digit' },
  },
  calendars: {
    espacios:{
      colorName: 'espacios',
      lightColors:{
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
        start : date,
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
  reservationsService.createReservation(event).then(res => {
    eventsServicePlugin.add(res.data)
    events.value.push(res.data)
  })
}

function addEvent() {
  // const data = {
  //   title: 'Evento 1',
  //   description: 'Descripción ejemplo',
  //   start : '2024-11-07',
  //   end: '2024-11-07',
  //   calendarId: 'espacios'
  // }
  // reservationsService.createReservation(data).then(res => {
  //   eventsServicePlugin.add(res.data)
  //   events.value.push(res.data)
  // })
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