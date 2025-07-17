<template>
    <div>
        <!-- date‑picker estándar HTML, podrías sustituirlo por un <v-date-picker> si usas Vuetify -->
        <div class="mb-4">
            <label for="chart-date">Selecciona día:</label>
            <input id="chart-date" type="date" v-model="selectedDate" @change="updateChart" />
        </div>

        <!-- Aquí se monta amCharts -->
        <div ref="chartRef" style="width:100%;height:400px;"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import * as am5 from "@amcharts/amcharts5"
import * as am5xy from "@amcharts/amcharts5/xy"
import Animated from "@amcharts/amcharts5/themes/Animated"

const chartRef = ref(null)
let root, chart, xAxis, yAxis, series

// fecha seleccionada en formato YYYY-MM-DD
const selectedDate = ref(new Date().toISOString().slice(0, 10))

// construye ISO inicio/fin de la jornada
function isoRangeForDay(day) {
    const from = new Date(`${day}T00:00:00.000Z`)
    const to = new Date(`${day}T23:59:59.999Z`)
    return { from: from.toISOString(), to: to.toISOString() }
}

async function loadData() {
    const { from, to } = isoRangeForDay(selectedDate.value)
    const { data } = await axios.get("/api/stats/overview", {
        params: { from, to }
    })
    // data = [ { _id:{hour,dow}, count }, … ]

    // pivot 0–23 horas
    const pivot = []
    for (let h = 0; h < 24; h++) {
        pivot.push({
            hour: String(h).padStart(2, "0") + ":00",
            count: 0
        })
    }

    data.hourlyReservations.forEach(({ _id: { hour }, count }) => {
        if (pivot[hour]) pivot[hour].count = count
    })

    return pivot
}

function draw(data) {
    // limpiar cualquier root anterior
    if (root) root.dispose()

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

    // eje X: horas como categorías
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

    // serie de línea única
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

    // leyenda opcional
    const legend = chart.children.push(
        am5.Legend.new(root, {
            centerX: am5.percent(50),
            x: am5.percent(50)
        })
    )
    legend.data.setAll([series])
}

async function updateChart() {
    const d = await loadData()
    draw(d)
}

onMounted(updateChart)
// si algun día cambias selectedDate por código
watch(selectedDate, updateChart)
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
