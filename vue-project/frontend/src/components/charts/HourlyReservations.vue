<template>
    <v-row>
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

        <div ref="chartRef" style="width:100%;height:400px;" />
    </v-row>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as am5 from "@amcharts/amcharts5"
import * as am5xy from "@amcharts/amcharts5/xy"
import Animated from "@amcharts/amcharts5/themes/Animated"

import { useTime } from '@/composables/useTime'
const { parseToStringDate } = useTime()

const emit = defineEmits(['update:date', 'interval-click'])

const props = defineProps({
    overview: {
        type: Array,
        required: true
    }
})

const chartRef = ref(null)
let root, chart, xAxis, yAxis, series

const selectedDate = ref(new Date().toISOString().slice(0, 10))
const formattedDate = ref(parseToStringDate(selectedDate.value))

const data = ref([]);

onMounted(() => {
    updateChart()
})

watch(selectedDate, (newDate) => {
    formattedDate.value = parseToStringDate(newDate)
    selectedDate.value = new Date(newDate).toISOString().slice(0, 10)
    emit('update:date', newDate)
})

watch(() => props.overview, updateChart)

function updateChart() {
    loadDataFromOverview()
    draw()
}

function loadDataFromOverview() {
    data.value = props.overview
        .filter(item => {
            const day = new Date(item.startTime).toISOString().slice(0, 10)
            return day === selectedDate.value
        })
        .map(item => {
            const isSpace = !!item.spaceId
            const resource = isSpace ? item.spaceId : item.materialId
            const resourceKey = (isSpace ? 'space:' : 'material:') + resource._id
            const displayName = resource.name

            return {
                id: item._id,
                resourceKey,
                displayName,
                startDate: new Date(item.startTime).getTime(),
                endDate: new Date(item.endTime).getTime()
            }
        })
}

function draw() {
    const reservations = data.value
    if (root) root.dispose()
    if (reservations.length === 0) {
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
                No hay datos de reservas para este día
            </div>
            `
        return
    }

    chartRef.value.innerHTML = ``

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

    // Eje X
    xAxis = chart.xAxes.push(
        am5xy.DateAxis.new(root, {
            baseInterval: { timeUnit: "minute", count: 1 },
            renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 60 })
        })
    )

    const categoryMap = new Map()
    for (const r of reservations) {
        if (!categoryMap.has(r.resourceKey)) {
            categoryMap.set(r.resourceKey, {
                resourceKey: r.resourceKey,
                displayName: r.displayName
            })
        }
    }
    const categories = Array.from(categoryMap.values())

    // Eje Y
    yAxis = chart.yAxes.push(
        am5xy.CategoryAxis.new(root, {
            categoryField: "resourceKey",
            renderer: am5xy.AxisRendererY.new(root, {
                inversed: true,
                cellStartLocation: 0.2,
                cellEndLocation: 0.8
            })
        })
    )

    yAxis.get("renderer").labels.template.adapters.add("text", (text, target) => {
        const dataItem = target.dataItem
        if (dataItem?.dataContext?.displayName) {
            return dataItem.dataContext.displayName
        }
        return text
    })

    yAxis.data.setAll(categories)

    // Serie
    series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
            xAxis,
            yAxis,
            openValueXField: "startDate",
            valueXField: "endDate",
            categoryYField: "resourceKey",
            clustered: false
        })
    )

    series.columns.template.setAll({
        tooltipText: `[bold]{displayName}[/]\n{openValueX.formatDate("HH:mm")} – {valueX.formatDate("HH:mm")}`,
        interactive: true,
        cursorOverStyle: "pointer",
    })

    console.table(reservations.map(r => ({
        displayName: r.displayName,
        start: new Date(r.startDate).toLocaleTimeString(),
        rawStart: r.startDate,
        end: new Date(r.endDate).toLocaleTimeString()
    })))

    series.data.setAll(reservations)

    series.columns.template.events.on("click", ev => {
        const ctx = ev.target.dataItem.dataContext
        const reservation = props.overview.find(x => x._id === ctx.id)
        emit('interval-click', reservation)
    })

    chart.appear(800, 80)
}
</script>

<style scoped>
#chart-date {
    padding: 0.25rem;
    font-size: 1rem;
}
</style>
