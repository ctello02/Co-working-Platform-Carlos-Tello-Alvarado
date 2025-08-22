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
        { category: "Diario", value: overview.daily },
        { category: "Semanal", value: overview.weekly },
        { category: "Mensual", value: overview.monthly }
    ]
}

function draw() {
    if (root) root.dispose()
    if (data.value[0].value === 0 && data.value[1].value === 0 && data.value[2].value === 0) {
        if (root) {
            root = null
        }
        chartRef.value.innerHTML = `
            <div style="
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #666;
                font-size: 1.2rem;
                margin-top: -1rem;
            ">
                No hay datos de reservas durante este periodo
            </div>
            `
        return
    }
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

    series.data.setAll(data.value)
}
</script>
