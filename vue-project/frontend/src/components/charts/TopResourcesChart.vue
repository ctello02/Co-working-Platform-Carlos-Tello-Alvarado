<template>
    <v-col cols="12" sm="4">
        <v-select v-model="resourceId" :items="options" label="Recurso" item-title="label" item-value="value"
            variant="outlined" density="compact" clearable />
    </v-col>
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

const resourceId = ref(null)
const data = ref([]);
const filteredData = ref([]);

const chartRef = ref(null)
let root, chart, xAxis, yAxis, series

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

onMounted(() => {
    data.value = props.overview.topRecursos
    filteredData.value = data.value
    draw()
});

function draw() {

    if (filteredData.value.length === 0) {
        if (root) {
            root.dispose()
            root = null
        }
        let resourceLabel = resourceId.value.value === "space" ? "espacios" : "materiales"
        chartRef.value.innerHTML = `
            <div style="
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #666;
                font-size: 1.2rem;
            ">
                No hay ${resourceLabel} disponibles para este periodo
            </div>
            `
        return
    }

    chartRef.value.innerHTML = ``

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

    yAxis.data.setAll(filteredData.value)
    series.data.setAll(filteredData.value)
}


watch(resourceId, (newVal) => {
    if (newVal != null) filteredData.value = data.value.filter(x => x.resourceType === resourceId.value)
    else filteredData.value = data.value
    draw()
})
</script>
