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
    to: String
})

const chartRef = ref(null)
let root, chart, xAxis, yAxis, series

async function loadData() {
    const { data } = await axios.get("/api/stats/overview", {
        params: { from: props.from, to: props.to }
    })
    // data = [{ _id, name, count }, …]
    return data.topRecursos
}

function draw(data) {
    if (root) root.dispose()
    root = am5.Root.new(chartRef.value)
    root.setThemes([Animated.new(root)])
    chart = root.container.children.push(
        am5xy.XYChart.new(root, { panY: false, layout: root.verticalLayout })
    )

    xAxis = chart.xAxes.push(
        am5xy.ValueAxis.new(root, {
            renderer: am5xy.AxisRendererX.new(root, {})
        })
    )
    yAxis = chart.yAxes.push(
        am5xy.CategoryAxis.new(root, {
            categoryField: "name",
            renderer: am5xy.AxisRendererY.new(root, { inversed: true })
        })
    )

    series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
            name: "Reservas",
            xAxis,
            yAxis,
            valueXField: "count",
            categoryYField: "name"
        })
    )

    yAxis.data.setAll(data)
    series.data.setAll(data)
}


async function updateChart() {
    const d = await loadData()
    draw(d)
}

onMounted(updateChart)
watch([() => props.from, () => props.to], updateChart)
</script>
