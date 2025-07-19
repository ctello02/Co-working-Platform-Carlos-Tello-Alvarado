<template>
    <div ref="chartRef" style="width:100%;height:400px;" />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as am5 from "@amcharts/amcharts5"
import * as am5xy from "@amcharts/amcharts5/xy"
import Animated from "@amcharts/amcharts5/themes/Animated"

const props = defineProps({
    overview: {
        type: Object,
        required: true
    }
})

const chartRef = ref(null)
let root, chart, xAxis, yAxis, series

const data = ref([]);

onMounted(() => {
    data.value = props.overview
    draw()
})

watch(props.overview, (newVal) => {
    data.value = newVal
    draw()
})

function draw() {
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

    const chartData = data.value.labels.map((lab, i) => ({
        date: lab,
        count: data.value.data[i]
    }))

    xAxis.data.setAll(chartData)
    series.data.setAll(chartData)
}
</script>
