<template>
    <div ref="chartRef" style="width:100%;height:400px;"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import * as am5 from "@amcharts/amcharts5"
import * as am5percent from "@amcharts/amcharts5/percent"
import Animated from "@amcharts/amcharts5/themes/Animated"

const props = defineProps({
    from: String,
    to: String
})

const chartRef = ref(null)
let root, chart, series

async function loadData() {
    const { data } = await axios.get("/api/stats/rangeCharts", {
        params: { from: props.from, to: props.to }
    })
    // { daily, weekly, monthly }
    return [
        { category: "Diario", value: data.periodicStats.daily },
        { category: "Semanal", value: data.periodicStats.weekly },
        { category: "Mensual", value: data.periodicStats.monthly }
    ]
}

function draw(data) {
    if (root) root.dispose()
    root = am5.Root.new(chartRef.value)
    root.setThemes([Animated.new(root)])

    chart = root.container.children.push(
        am5percent.PieChart.new(root, {})
    )

    series = chart.series.push(
        am5percent.PieSeries.new(root, {
            nameField: "category",
            valueField: "value"
        })
    )

    series.data.setAll(data)
}

async function updateChart() {
    const d = await loadData()
    draw(d)
}

onMounted(updateChart)
watch([() => props.from, () => props.to], updateChart)
</script>
