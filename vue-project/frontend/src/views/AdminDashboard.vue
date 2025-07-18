<template>
    <v-container fluid>
        <v-col>
            <v-row>
                <span class="text-h4">Bienvenido Administrador,</span>
            </v-row>
            <!-- Filtros -->
            <v-row>
                <v-card class="pa-2 mt-4">
                    <v-card-text class="d-flex justify-space-between mb-n5 flex-wrap">
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
                    <v-progress-circular indeterminate color="primary" size="50"></v-progress-circular>
                </div>
            </v-row>


            <!-- Gráficas -->
            <v-row v-else-if="overviewData">
                <v-col>
                    <v-row class="mb-8">
                        <v-col>
                            <ReservationsByDayChart :overview="overviewData[0]" :from="from" :to="to"
                                :resource-id="resourceId" />
                        </v-col>
                    </v-row>
                    <v-row class="mb-8">
                        <v-col>
                            <TopResourcesChart :overview="overviewData[0]" />
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
import { ref, onMounted, watchEffect, watch } from 'vue'
import axios from 'axios'

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
            fetchOneShotCharts(),
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
        const res = await axios.get('/api/stats/rangeCharts', {
            params: { from: from.value, to: to.value }
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

watch(startDate, async (newVal) => {
    console.log(newVal)
    startDate.value = newVal
    formattedStartDate.value = parseToStringDate(startDate.value)
    from.value = startDate.value.toISOString().substr(0, 10)
    await fetchCharts()
})

watch(endDate, async (newVal) => {
    console.log(newVal)
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