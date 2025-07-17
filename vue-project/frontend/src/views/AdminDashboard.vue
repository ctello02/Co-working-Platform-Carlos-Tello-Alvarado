<template>
    <v-container fluid>
        <v-col>
            <v-row>
                <span class="text-h4">Bienvenido Administrador,</span>
            </v-row>
            <v-row class="mb-6" align="center">
                <v-col cols="12" sm="4">
                    <v-text-field v-model="from" label="Desde" type="date" :max="to" />
                </v-col>
                <v-col cols="12" sm="4">
                    <v-text-field v-model="to" label="Hasta" type="date" :min="from" />
                </v-col>
                <!-- opcional: selector de recurso -->
                <v-col cols="12" sm="4">
                    <v-select v-model="resourceId" :items="resources" label="Recurso (opcional)" item-text="label"
                        item-value="value" clearable />
                </v-col>
            </v-row>
            <!-- Gráfica 1: Reservas por día -->
            <v-row class="mb-8">
                <v-col>
                    <reservations-by-day-chart :from="from" :to="to" :resource-id="resourceId" />
                </v-col>
            </v-row>
            <!-- Gráfica 2: Top recursos -->
            <v-row class="mb-8">
                <v-col>
                    <top-resources-chart :from="from" :to="to" />
                </v-col>
            </v-row>
            <!-- Gráfica 3: Tasa de pago -->
            <v-row class="mb-8">
                <v-col>
                    <payment-rate-chart :from="from" :to="to" />
                </v-col>
            </v-row>
            <!-- Gráfica 4: Reservas periódicas -->
            <v-row class="mb-8">
                <v-col>
                    <periodic-stats-chart :from="from" :to="to" />
                </v-col>
            </v-row>
            <!-- Gráfica 5: Concurrencia (heatmap) -->
            <v-row class="mb-8">
                <v-col>
                    <concurrency-heatmap-chart :from="from" :to="to" />
                </v-col>
            </v-row>
        </v-col>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { spaceService } from '@/services/spaceService'
import { materialService } from '@/services/materialService'

// Importa tus componentes de gráfico
import ReservationsByDayChart from '@/components/charts/ReservationsByDayChart.vue'
import TopResourcesChart from '@/components/charts/TopResourcesChart.vue'
import PaymentRateChart from '@/components/charts/PaymentRateChart.vue'
import PeriodicStatsChart from '@/components/charts/PeriodicStatsChart.vue'
import ConcurrencyHeatmapChart from '@/components/charts/ConcurrencyHeatmapChart.vue'

import { reservationService } from '@/services/reservationService'

const router = useRouter()

// Filtros
const from = ref('')
const to = ref('')
const resourceId = ref(null)

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
    await Promise.all([
        getSpaces(),    // implementa este endpoint
        getMaterials()  // idem
    ])

    resources.value = spaces.value.map(space => {
        console.log(space);

        return {
            label: space.name,
            value: space._id
        }
    })
    resources.value.push(...materials.value.map(material => {
        console.log(material);

        return {
            label: material.name,
            value: material._id
        }
    }))

    console.log(resources.value);

})

async function getSpaces() {
    try {
        const res = await spaceService.getSpaces()
        spaces.value = res.data.spaces
    } catch (err) {
        console.error(err)
    }
}

async function getMaterials() {
    try {
        const res = await materialService.getMaterials()
        materials.value = res.data.materials
    } catch (err) {
        console.error(err)
    }
}
</script>

<style scoped>
.mb-6 {
    margin-bottom: 24px;
}

.mb-8 {
    margin-bottom: 32px;
}
</style>
