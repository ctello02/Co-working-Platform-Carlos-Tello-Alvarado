<template>
    <v-container fluid>
        <v-col>
            <v-row>
                <span class="text-h4">Espacios</span>
                <v-spacer />
                <div class="d-flex align-center">
                    <TonalButton color="blue" text="Crear espacio" class="mr-3" v-if="userStore.getIsAdmin"
                        @click="openCreateSpace" />
                    <v-btn variant="text" :ripple="false"
                        :icon="list ? 'mdi-format-list-bulleted' : 'mdi-view-grid-outline'" @click="list = !list" />
                </div>
            </v-row>

            <v-row v-if="!spaces">
                <span class="text-h5">Aún no hay espacios creados</span>
            </v-row>

            <v-row v-else class="py-3 mx-n11">
                <!-- Vista de lista -->
                <v-col v-if="list">
                    <v-card style="width: 100%;">
                        <Table :headers="tableHeaders" :fields="tableFields" :items="tableItems"
                            :buttons="userStore.getIsAdmin ? actionButtons : ''" @rowClick="handleRowClick"
                            :clickable="true" />
                    </v-card>
                </v-col>

                <!-- Vista cuadrícula -->
                <v-col v-else class="pa-0">
                    <v-container fluid>
                        <v-row>
                            <v-col cols="12" sm="6" md="4" lg="3" v-for="space in spaces" :key="space._id">
                                <SpaceCard :space="space" :adminActions="userStore.getIsAdmin" :reserveActions="false"
                                    :maxWidth="'300px'" :isPreview="true" @edit-space="openEditSpaceInfo(space)"
                                    @delete-space="deleteSpace()" @click="openSpace(space)" />
                            </v-col>
                        </v-row>
                    </v-container>
                </v-col>
            </v-row>

            <AskModal v-model="deleteModal" :title="'¿Borrar espacio?'"
                :message="'¿Estás seguro de que quieres borrar este espacio?'" :actionText="'Borrar espacio'"
                :closeModal="closeDialog" :action="deleteSpace" />

            <AskModal v-model="bulkDeleteModal" :maxWidth="'600px'" :title="'Este espacio tiene reservas pendientes'"
                :message="'Este espacio tiene reservas pendientes, ¿Estás seguro de que quieres borrarlo? Se devolverá el pago de las reservas que se hayan cobrado.'"
                :actionText="'Borrar espacio'" :closeModal="closeBulkDeleteDialog" :action="bulkDeleteSpace" />

        </v-col>
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { useSpaceStore } from '@/store/spaceStore';
import { spaceService } from '@/services/spaceService';
import { useToast } from 'vue-toastification';
import TonalButton from '@/components/TonalButton.vue'
import SpaceCard from '@/components/SpaceCard.vue';
import AskModal from '@/components/AskModal.vue';
import Table from '@/components/Table.vue';
import { useTime } from '@/composables/useTime';

// Router, notificaciones y stores
const router = useRouter();
const toast = useToast();
const spaceStore = useSpaceStore();
const userStore = computed(() => {
    return useUserStore();
});
// Computed para saber si el usuario es admin
const isAdmin = computed(() => userStore.value.getIsAdmin)


// Variables reactivas
const list = ref(false);
const spaces = ref(null);
//const selectedSpace = ref(null);
const deleteModal = ref(false);
const bulkDeleteModal = ref(false);

//Variables para la Tabla

// Extraemos función del composable useTime
const {
    makeHoursAndMinutes
} = useTime();


/* ------------------------- Ciclo de vida ------------------------- */
onMounted(() => {
    // Llamamos a getSpaces para obtener los espacios al montar el componente
    getSpaces();
})

/* ------------------------- Funciones del componente ------------------------- */
// Obtiene los espacios a través del servicio
function getSpaces() {
    spaceService.getSpaces()
        .then(res => {
            spaces.value = res.data.spaces;
        })
        .catch(error => {
            console.log(error);
            spaces.value = null;
        });
};


// Borrar el espacio. Si se pasa el id, se borra ese espacio, 
// si no, se borra el espacio seleccionado de la SpaceStore
const deleteSpace = (id) => {
    spaceService.deleteSpace(id ? id : spaceStore.getSelectedSpace._id)
        .then(res => {
            getSpaces();
            deleteModal.value = false;
            toast.error('Espacio eliminado con éxito');
        })
        .catch(error => {
            console.log(error);
            if (error.response.status === 409) {
                bulkDeleteModal.value = true;
            }
        });
};

// Borrar el espacio y todas sus reservas. Se borra el espacio seleccionado de la SpaceStore
const bulkDeleteSpace = () => {
    spaceService.bulkDeleteSpace(spaceStore.getSelectedSpace._id)
        .then(res => {
            getSpaces();
            bulkDeleteModal.value = false;
            toast.error('Espacio eliminado con éxito');
        })
        .catch(error => {
            console.log(error);
        });
};


//Funciones auxiliares para acciones como ver, crear o editar el espacio
const openSpace = (space) => {
    spaceStore.setSelectedSpace(space); // Guardar el espacio seleccionado en el store
    router.push('/spaceInfo');    // Navegar a la nueva ruta
};
const openCreateSpace = () => {
    router.push('/createSpace');
};
const openEditSpaceInfo = (space) => {
    spaceStore.setSelectedSpace(space); // Guardar el espacio seleccionado en el store
    router.push('/editSpaceInfo');
};
const openDeleteModal = (space) => {
    //selectedSpace.value = { ...space }; // Hacer una copia del espacio seleccionado
    spaceStore.setSelectedSpace(space);
    deleteModal.value = true;
};
const closeDialog = () => {
    deleteModal.value = false;
};
const closeBulkDeleteDialog = () => {
    bulkDeleteModal.value = false;
};

/* ------------------------- Objetos de la tabla ------------------------- */
// Encabezados
const tableHeaders = computed(() => {
    let headers = [
        { label: '#', width: '10%' },
        { label: 'Nombre', width: '15%' },
        { label: 'Descripción', width: '20%' },
        { label: 'Horario', width: '20%' }
    ]
    if (!isAdmin.value) {
        headers.push({ label: 'Duración de las reservas', width: '20%' })
    }
    return headers
});

// Campos que se mostrarán en cada fila
const tableFields = computed(() => {
    let fields = ['name', 'description', 'schedule']

    if (!isAdmin.value) {
        fields.push('duration')
    }
    return fields
});

// Transformamos 'spaces' en 'tableItems'
const tableItems = computed(() => {
    return (spaces.value || []).map((space, i) => {
        const item = {
            id: space._id,        // key para v-for
            name: space.name,
            description: space.description,
            schedule: `${makeHoursAndMinutes(space.opening)}h - ${makeHoursAndMinutes(space.closing)}h`,
            object: space,      // guardamos el objeto para usarlo en las acciones
        }

        // Si NO es admin, mostramos la duración en la última columna
        if (!isAdmin.value) {
            if (space.duration < 60) {
                item.duration = `Reservas de ${space.duration} minutos`
            } else if (space.duration === 60) {
                item.duration = `Reservas de ${space.duration / 60} hora`
            } else {
                item.duration = `Reservas de ${space.duration / 60} horas`
            }
        }
        return item
    })
})

// Botones de acción si es admin
const actionButtons = [
    {
        icon: 'mdi-pencil',
        action: (item) => openEditSpaceInfo(item.object)
    },
    {
        icon: 'mdi-trash-can-outline',
        color: 'error',
        action: (item) => openDeleteModal(item.object)
    }
];


// Cuando se hace click en una fila, abrimos el espacio
function handleRowClick(item) {
    openSpace(item.object)
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
    text-align: left;
    padding: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
