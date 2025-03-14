<template>
    <v-table class="fixed-table">
        <thead>
            <tr>
                <th v-for="(header, index) in headers" :key="index" :style="{ width: header.width }">
                    {{ header.label }}
                </th>
                <!-- Columna de acciones si hay botones -->
                <th v-if="buttons && buttons.length" style="width: 10%;">
                    Acciones
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, rowIndex) in items" :key="item.id || rowIndex" @click="rowClicked(item)"
                :class="clickable ? 'cursor-pointer' : ''">
                <td>{{ rowIndex + 1 }}</td>
                <td v-for="(field, index) in fields" :key="index">
                    {{ item[field] }}
                </td>

                <td v-if="buttons && buttons.length">
                    <v-form style="display: flex; gap: 10px;">
                        <v-btn v-for="(btn, btnIndex) in buttons" :key="btnIndex" :icon="btn.icon" :color="btn.color"
                            variant="text" @click.stop="btn.action(item)" />
                    </v-form>
                </td>
            </tr>
        </tbody>
    </v-table>
</template>

<script setup>
const props = defineProps({
    headers: { type: Array, required: true },
    fields: { type: Array, required: true },
    items: { type: Array, required: true },
    buttons: { type: Array, default: () => [] },
    clickable: { type: Boolean, default: false }
})

const emit = defineEmits(['rowClick'])

function rowClicked(item) {
    emit('rowClick', item)
}
</script>

<style scoped>
thead th {
    text-align: left;
    padding: 10px;
    background-color: #f5f5f5;
}

tbody td {
    padding: 10px;
}

tbody tr {
    transition: background-color 0.3s ease;
}

tbody tr:hover {
    background-color: #efefef;
}

.v-table {
    table-layout: fixed;
    width: 100%;
}

th,
td {
    /*width: 20%;  Ajusta este valor si es necesario */
    text-align: left;
    padding: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

#info-container {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-direction: column;
    gap: 10px;
}
</style>