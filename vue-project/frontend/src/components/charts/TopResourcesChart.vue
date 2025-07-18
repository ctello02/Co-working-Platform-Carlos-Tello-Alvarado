<template>
    <v-col cols="12" sm="4">
        <v-select v-model="resourceId" :items="options" label="Recurso" item-title="label" item-value="value"
            variant="outlined" density="compact" clearable />
    </v-col>
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

const options = [
    {
        label: "Espacios",
        value: "space"
    },
    {
        label: "Materiales",
        value: "material"
    }
]
const resourceId = ref(null)
const data = ref([]);

const chartRef = ref(null)
let root, chart, xAxis, yAxis, series

async function loadData() {
    const res = await axios.get("/api/stats/rangeCharts", {
        params: { from: props.from, to: props.to }
    })

    data.value = res.data.topRecursos
}

function draw() {
    if (resourceId.value) data.value = data.value.filter(x => x.resourceType === resourceId.value)

    console.log(resourceId.value)
    console.log(data.value)

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

    yAxis.data.setAll(data.value)
    series.data.setAll(data.value)
}


async function updateChart() {
    await loadData()
    draw()
}

onMounted(updateChart)
watch([() => props.from, () => props.to], updateChart)
watch(resourceId, updateChart)
</script>
