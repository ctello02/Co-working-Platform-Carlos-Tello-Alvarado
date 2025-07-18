<template>
    <v-row>
        <!-- date‑picker estándar HTML -->
        <!-- <div class="mb-4">
            <label for="chart-date">Selecciona día:</label>
            <input id="chart-date" type="date" v-model="selectedDate" @change="updateChart" />
        </div> -->
        <v-col cols="auto">
            <v-menu :close-on-content-click="false" location="bottom" transition="slide-y-transition">
                <template v-slot:activator="{ props }">
                    <v-text-field density="compact" prepend-icon="mdi-calendar-month-outline" v-bind="props"
                        variant="outlined" :readonly="true">
                        {{ formattedDate }}
                    </v-text-field>
                </template>
                <v-date-picker is-required v-model="selectedDate" />
            </v-menu>
        </v-col>

        <!-- Aquí se monta amCharts -->
        <div ref="chartRef" style="width:100%;height:400px;"></div>
    </v-row>
</template>

<script setup>
import { ref, onMounted, watch, toRef } from 'vue'
import axios from 'axios'
import * as am5 from "@amcharts/amcharts5"
import * as am5xy from "@amcharts/amcharts5/xy"
import Animated from "@amcharts/amcharts5/themes/Animated"

import { useTime } from '@/composables/useTime'

// recibimos por props todo el overview, que incluye hourlyReservations
const props = defineProps({
    overview: {
        type: Object,
        required: true
    }
})

const chartRef = ref(null)
let root, chart, xAxis, yAxis, series

const { parseToStringDate } = useTime()

// modelo de la fecha a pintar
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const formattedDate = ref(parseToStringDate(selectedDate.value))

async function fetchOneShotCharts() {
    try {
        const res = await axios.get('/api/stats/oneShotCharts', {
            params: { from: selectedDate.value, to: selectedDate.value }
        })
        return res.data;

    } catch (err) {
        console.error('Error cargando estadísticas:', err)
    }
}


// toma props.overview.hourlyReservations, filtra por selectedDate
// y pivot 0–23h
function loadDataFromOverview() {
    // overview es array de
    // { _id: { date:'YYYY-MM-DD', hour:0–23 }, count }
    const raw = props.overview || []

    // inicializamos pivot
    const pivot = []
    for (let h = 0; h < 24; h++) {
        pivot.push({
            hour: String(h).padStart(2, '0') + ":00",
            count: 0
        })
    }

    // rellenamos sólo las de la fecha seleccionada
    raw.forEach(item => {
        const { date, hour } = item._id
        if (date === selectedDate.value && pivot[hour]) {
            pivot[hour].count = item.count
        }
    })

    return pivot
}

function draw(data) {
    if (!chartRef.value) return

    if (root) {
        root.dispose()
    }
    root = am5.Root.new(chartRef.value)
    root.setThemes([Animated.new(root)])

    chart = root.container.children.push(
        am5xy.XYChart.new(root, {
            panX: true,
            panY: true,
            wheelX: "panX",
            wheelY: "zoomX"
        })
    )

    // eje X: horas
    xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
            categoryField: "hour",
            renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 30 })
        })
    )

    // eje Y: número de reservas
    yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
            renderer: am5xy.AxisRendererY.new(root, {})
        })
    )

    xAxis.data.setAll(data)

    series = chart.series.push(
        am5xy.LineSeries.new(root, {
            name: selectedDate.value,
            xAxis,
            yAxis,
            valueYField: "count",
            categoryXField: "hour",
            tooltip: am5.Tooltip.new(root, {
                labelText: "{categoryX}: {valueY}"
            })
        })
    )
    series.data.setAll(data)

    // leyenda centrada
    const legend = chart.children.push(
        am5.Legend.new(root, {
            centerX: am5.percent(50),
            x: am5.percent(50)
        })
    )
    legend.data.setAll([series])
}

function updateChart() {
    const data = loadDataFromOverview()
    draw(data)
}

// inicializo al montar
onMounted(() => {
    updateChart()
})

// si cambian props.overview o selectedDate, redibujo
watch(
    [() => props.overview, selectedDate],
    updateChart
)
</script>

<style scoped>
.mb-4 {
    margin-bottom: 1rem;
}

#chart-date {
    padding: 0.25rem;
    font-size: 1rem;
}
</style>
