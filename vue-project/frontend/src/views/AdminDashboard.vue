<template>
    <v-container fluid>
        <v-col>
            <v-row>
                <span class="text-h4">Bienvenido Administrador,</span>
            </v-row>
            <!-- Filtros -->
            <v-row align="center">
                <v-col cols="auto" class="mt-2">
                    <v-text-field v-model="from" label="Desde" type="date" :max="to" variant="outlined"
                        density="compact" />
                </v-col>
                <v-col cols="auto" class="mt-2">
                    <v-text-field v-model="to" label="Hasta" type="date" :min="from" variant="outlined"
                        density="compact" />
                </v-col>
            </v-row>

            <v-row>
                <v-col>
                    <v-menu :close-on-content-click="false" location="bottom" transition="slide-y-transition">
                        <template v-slot:activator="{ props }">
                            <v-text-field density="compact" prepend-icon="mdi-calendar-month-outline" v-bind="props"
                                variant="outlined" class="ml-n3" :readonly="true">
                                {{ formattedStartDate }}
                            </v-text-field>
                        </template>
                        <v-date-picker class="ml-10" :min-date="new Date()" is-required v-model="startDate" />
                    </v-menu>
                </v-col>
                <v-col>
                    <v-menu :close-on-content-click="false" location="bottom" transition="slide-y-transition">
                        <template v-slot:activator="{ props }">
                            <v-text-field density="compact" prepend-icon="mdi-calendar-month-outline" v-bind="props"
                                variant="outlined" class="ml-n3" :readonly="true">
                                {{ formattedEndDate }}
                            </v-text-field>
                        </template>
                        <v-date-picker class="ml-10" is-required v-model="endDate" />
                    </v-menu>
                </v-col>
            </v-row>

            <!-- Gráficas -->
            <v-row v-if="overviewData">
                <v-col>
                    <v-row class="mb-8">
                        <v-col>
                            <ReservationsByDayChart :overview="overviewData[0]" :from="from" :to="to"
                                :resource-id="resourceId" />
                        </v-col>
                    </v-row>
                    <v-row class="mb-8">
                        <v-col>
                            <TopResourcesChart :overview="overviewData[0]" :from="from" :to="to" />
                        </v-col>
                    </v-row>
                    <v-row class="mb-8">
                        <v-col>
                            <PaymentRateChart :overview="overviewData[0]" :from="from" :to="to" />
                        </v-col>
                    </v-row>
                    <v-row class="mb-8">
                        <v-col>
                            <PeriodicStatsChart :overview="overviewData[0]" :from="from" :to="to" />
                        </v-col>
                    </v-row>
                    <v-row class="mb-8">
                        <v-col>
                            <HourlyReservations :overview="overviewData[1]" :from="from" :to="to" />
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-col>
    </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

import { useRouter } from 'vue-router'
import { spaceService } from '@/services/spaceService'
import { materialService } from '@/services/materialService'

import { useTime } from '@/composables/useTime'

import ReservationsByDayChart from '@/components/charts/ReservationsByDayChart.vue'
import TopResourcesChart from '@/components/charts/TopResourcesChart.vue'
import PaymentRateChart from '@/components/charts/PaymentRateChart.vue'
import PeriodicStatsChart from '@/components/charts/PeriodicStatsChart.vue'
import HourlyReservations from '@/components/charts/HourlyReservations.vue'
import { start } from '@popperjs/core'

const { parseToStringDate } = useTime()

// Filtros
const startDate = ref(new Date());
const formattedStartDate = ref(parseToStringDate(startDate.value));
const endtDate = ref(new Date(startDate.value.getTime() + 30 * 24 * 60 * 60 * 1000));
const formattedEndDate = ref(parseToStringDate(endtDate.value));
const from = ref('')
const to = ref('')
const resourceId = ref(null)
const overviewData = ref(null)

// Opcional: lista de espacios/materiales para filtrar
const spaces = ref([])
const materials = ref([])
const resources = ref([])

onMounted(async () => {
    // Inicializa 'from' a 7 días atrás, 'to' a hoy
    const today = new Date()
    const month = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    from.value = today.toISOString().substr(0, 10)
    to.value = month.toISOString().substr(0, 10)

    // Si quieres cargar un dropdown de recursos:
    const res = await Promise.all([
        fetchRangeCharts(),
        fetchOneShotCharts(),
    ])

    console.log(res)

    overviewData.value = res
})

async function fetchRangeCharts() {
    try {
        const res = await axios.get('/api/stats/rangeCharts', {
            params: { from: from.value, to: to.value, resourceId: resourceId.value }
        })
        return res.data

    } catch (err) {
        console.error('Error cargando estadísticas:', err)
    }
}

async function fetchOneShotCharts() {
    try {
        const res = await axios.get('/api/stats/oneShotCharts', {
            params: { from: from.value, to: to.value }
        })
        return res.data;

    } catch (err) {
        console.error('Error cargando estadísticas:', err)
    }
}

watch([from, to, resourceId], () => {
    fetchRangeCharts()
    fetchOneShotCharts()
})

</script>
