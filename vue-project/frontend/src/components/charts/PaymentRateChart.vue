<template>
    <div ref="chartRef" style="width:100%;height:400px;" />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as am5 from "@amcharts/amcharts5"
import * as am5percent from "@amcharts/amcharts5/percent"
import Animated from "@amcharts/amcharts5/themes/Animated"

const props = defineProps({
    overview: {
        type: Object,
        required: true
    }
})

const chartRef = ref(null)
let root, chart, series

const data = ref([]);

onMounted(async () => {
    data.value = await parseData()
    draw()
})

watch(props.overview, async () => {
    data.value = await parseData()
    draw()
})

async function parseData() {
    const overview = props.overview
    return [
        { category: "Pagadas", value: overview.completed },
        { category: "No pagadas", value: overview.total - overview.completed }
    ]
}

function draw() {
    if (root) root.dispose()
    root = am5.Root.new(chartRef.value)
    root.setThemes([Animated.new(root)])

    chart = root.container.children.push(
        am5percent.PieChart.new(root, {})
    )

    series = chart.series.push(
        am5percent.PieSeries.new(root, {
            nameField: "category",
            valueField: "value",
            alignLabels: true
        })
    )

    series.data.setAll(data.value)
}
</script>
