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

const emit = defineEmits(['update:date', 'intervalClick'])

const props = defineProps({
    overview: {
        type: Array,
        required: true
    }
})

const chartRef = ref(null)
let root, chart, xAxis, yAxis, series

const { parseToStringDate } = useTime()

// modelo de la fecha a pintar
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const formattedDate = ref(parseToStringDate(selectedDate.value))

// inicializo al montar
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
    const data = loadDataFromOverview()
    draw(data)
}

function localDateFromUTCString(utcString) {
    const d = new Date(utcString)
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
    return d
}

function loadDataFromOverview() {
    return props.overview
        .filter(item => {
            const day = new Date(item.startTime).toISOString().slice(0, 10)
            return day === selectedDate.value
        })
        .map(item => {
            const start = localDateFromUTCString(item.startTime)
            const end = localDateFromUTCString(item.endTime)

            const isSpace = !!item.spaceId
            const resource = isSpace ? item.spaceId : item.materialId
            const resourceKey = (isSpace ? 'space:' : 'material:') + resource._id
            const displayName = resource.name

            return {
                id: item._id,
                resourceKey,
                displayName,
                startDate: start.getTime(),
                endDate: end.getTime()
            }
        })
}

function draw(reservations) {
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

    // Eje X
    xAxis = chart.xAxes.push(
        am5xy.DateAxis.new(root, {
            baseInterval: { timeUnit: "minute", count: 30 },
            renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 })
        })
    )

    // ---- CATEGORÍAS ÚNICAS ----
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
        cornerRadiusBL: 5,
        cornerRadiusTL: 5,
        tooltipText: `[bold]{displayName}[/]\n{openValueX.formatDate("HH:mm")} – {valueX.formatDate("HH:mm")}`,
        interactive: true,
        cursorOverStyle: "pointer"
    })

    series.data.setAll(reservations)

    series.columns.template.events.on("click", ev => {
        const ctx = ev.target.dataItem.dataContext
        const reservation = props.overview.find(x => x._id === ctx.id)
        emit('intervalClick', reservation)
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
