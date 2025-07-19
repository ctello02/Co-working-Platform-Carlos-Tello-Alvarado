<template>
    <v-container fluid>
        <v-col>
            <v-row>
                <span class="text-h4">Bienvenido Administrador,</span>
            </v-row>
            <!-- Filtros -->
            <v-row>
                <v-card class="pa-1 mt-4">
                    <v-card-text class="d-flex justify-space-between mb-n5 ml-n1 flex-wrap">
                        <v-col cols="auto">
                            <v-menu :close-on-content-click="false" location="bottom" transition="slide-y-transition">
                                <template v-slot:activator="{ props }">
                                    <v-text-field density="compact" prepend-icon="mdi-calendar-month-outline"
                                        v-bind="props" variant="outlined" :readonly="true">
                                        {{ formattedStartDate }}
                                    </v-text-field>
                                </template>
                                <v-date-picker is-required v-model="startDate" />
                            </v-menu>
                        </v-col>
                        <v-col cols="auto">
                            <span class="text-h6">→</span>
                        </v-col>
                        <v-col cols="auto">
                            <v-menu :close-on-content-click="false" location="bottom" transition="slide-y-transition">
                                <template v-slot:activator="{ props }">
                                    <v-text-field density="compact" v-bind="props" variant="outlined" :readonly="true">
                                        {{ formattedEndDate }}
                                    </v-text-field>
                                </template>
                                <v-date-picker is-required v-model="endDate" />
                            </v-menu>
                        </v-col>
                    </v-card-text>
                </v-card>
            </v-row>

            <v-row v-if="isLoading">
                <div class="loader-overlay">
                    <v-progress-circular indeterminate color="primary" size="50" />
                </div>
            </v-row>

            <v-row v-else-if="overviewData">
                <v-col class="mt-5 pa-0">
                    <!-- 1) Reservas/día -->
                    <ChartCard title="Número de reservas">
                        <ReservationsByDayChart :overview="overviewData[0].reservationsPorDia" :from="from" :to="to"
                            :resource-id="resourceId" />
                    </ChartCard>

                    <!-- 2) Top recursos -->
                    <ChartCard title="Top recursos más reservados">
                        <TopResourcesChart :overview="overviewData[0].topRecursos" />
                    </ChartCard>

                    <!-- 3) Tasa de pago -->
                    <ChartCard title="Porcentaje de reservas pagadas">
                        <PaymentRateChart :overview="overviewData[0].pagoStats" :from="from" :to="to" />
                    </ChartCard>

                    <!-- 4) Estadísticas de periódicas -->
                    <ChartCard title="Reservas periódicas por tipo">
                        <PeriodicStatsChart :overview="overviewData[0].periodicStats" :from="from" :to="to" />
                    </ChartCard>

                    <!-- 5) Reservas por hora -->
                    <ChartCard title="Distribución horaria de reservas">
                        <HourlyReservations :overview="overviewData[1]" @update:date="fetchOneShotCharts"
                            @intervalClick="handleReservaClick" />
                    </ChartCard>
                </v-col>
            </v-row>
        </v-col>
    </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { statService } from '@/services/statService'
import { useRouter } from 'vue-router'
import { useReservationStore } from '@/store/reservationStore'
import { useSpaceStore } from '@/store/spaceStore'
import { useMaterialStore } from '@/store/materialStore'

import { useTime } from '@/composables/useTime'

import ChartCard from '@/components/charts/ChartCardComponent.vue'
import ReservationsByDayChart from '@/components/charts/ReservationsByDayChart.vue'
import TopResourcesChart from '@/components/charts/TopResourcesChart.vue'
import PaymentRateChart from '@/components/charts/PaymentRateChart.vue'
import PeriodicStatsChart from '@/components/charts/PeriodicStatsChart.vue'
import HourlyReservations from '@/components/charts/HourlyReservations.vue'

const { parseToStringDate } = useTime()

const router = useRouter()
const reservationStore = useReservationStore()
const spaceStore = useSpaceStore()
const materialStore = useMaterialStore()

// Filtros
const startDate = ref(new Date());
const formattedStartDate = ref(parseToStringDate(startDate.value));
const endDate = ref(new Date(startDate.value.getTime() + 30 * 24 * 60 * 60 * 1000));
const formattedEndDate = ref(parseToStringDate(endDate.value));

const from = ref('')
const to = ref('')

const isLoading = ref(false)
const resourceId = ref(null)
const overviewData = ref(null)

onMounted(async () => {
    from.value = startDate.value.toISOString().substr(0, 10)
    to.value = endDate.value.toISOString().substr(0, 10)

    await fetchCharts();
})

async function fetchCharts() {
    isLoading.value = true
    try {
        const res = await Promise.all([
            fetchRangeCharts(),
            fetchOneShotCharts(new Date()),
        ])
        overviewData.value = res
    } catch (error) {
        console.error('Error cargando estadísticas:', error)
    } finally {
        isLoading.value = false
    }
}

async function fetchRangeCharts() {
    try {
        const res = await statService.getRangeCharts({
            params: { from: from.value, to: to.value }
        })
        return res.data

    } catch (err) {
        console.error('Error cargando estadísticas:', err)
    }
}

async function fetchOneShotCharts(newDate) {
    const date = new Date(newDate).toISOString().substr(0, 10)
    try {
        const res = await statService.getOneShotCharts({
            params: { date }
        })
        if (overviewData.value != null) {
            overviewData.value[1] = res.data
        }
        return res.data;

    } catch (err) {
        console.error('Error cargando estadísticas:', err)
    }
}

function handleReservaClick(reservation) {
    console.log("Reserva clicada:", reservation)
    if (reservation.spaceId) {
        spaceStore.setSelectedSpace(reservation.spaceId)
    } else {
        materialStore.setSelectedMaterial(reservation.materialId)
    }
    reservationStore.setReservation(reservation)
    router.push('/reservationInfo')
}

watch(startDate, async (newVal) => {
    startDate.value = newVal
    formattedStartDate.value = parseToStringDate(startDate.value)
    from.value = startDate.value.toISOString().substr(0, 10)
    await fetchCharts()
})

watch(endDate, async (newVal) => {
    endDate.value = newVal
    formattedEndDate.value = parseToStringDate(endDate.value)
    to.value = endDate.value.toISOString().substr(0, 10)
    await fetchCharts()
})
</script>
<style scoped>
.loader-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}
</style>