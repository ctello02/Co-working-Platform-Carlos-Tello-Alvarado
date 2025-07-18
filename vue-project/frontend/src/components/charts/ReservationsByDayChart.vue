<template>
    <div ref="chartRef" style="width:100%;height:400px;"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import * as am5 from "@amcharts/amcharts5"
import * as am5xy from "@amcharts/amcharts5/xy"
import Animated from "@amcharts/amcharts5/themes/Animated"

const props = defineProps({
    from: String,
    to: String,
    resourceId: { type: String, default: null }
})

const chartRef = ref(null)
let root, chart, xAxis, yAxis, series

async function loadData() {
    const params = { from: props.from, to: props.to }
    if (props.resourceId) params.resourceId = props.resourceId
    const { data } = await axios.get("/api/stats/rangeCharts", { params })
    return data.reservationsPorDia // { labels: [...], data: [...] }
}

function draw(data) {
    // si ya existía un root, lo limpiamos
    if (root) root.dispose()
    root = am5.Root.new(chartRef.value)
    root.setThemes([Animated.new(root)])
    chart = root.container.children.push(
        am5xy.XYChart.new(root, { panX: true, panY: true })
    )

    xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
            categoryField: "date",
            renderer: am5xy.AxisRendererX.new(root, {})
        })
    )
    yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
            renderer: am5xy.AxisRendererY.new(root, {})
        })
    )

    series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
            name: "Reservas",
            xAxis, yAxis,
            valueYField: "count",
            categoryXField: "date"
        })
    )

    const chartData = data.labels.map((lab, i) => ({
        date: lab,
        count: data.data[i]
    }))

    xAxis.data.setAll(chartData)
    series.data.setAll(chartData)
}

async function updateChart() {
    const d = await loadData()
    draw(d)
}

onMounted(updateChart)
watch([() => props.from, () => props.to, () => props.resourceId], updateChart)
</script>
