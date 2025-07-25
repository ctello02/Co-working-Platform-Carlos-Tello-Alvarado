<template>
    <v-container fluid>
        <v-col>
            <v-row>
                <span class="text-h4">Materiales</span>
                <v-spacer />
                <div class="d-flex align-center">
                    <TonalButton color="blue" text="Crear material" class="mr-3" v-if="userStore.getIsAdmin"
                        @click="openCreateMaterial" />
                    <v-btn variant="text" :ripple="false"
                        :icon="list ? 'mdi-format-list-bulleted' : 'mdi-view-grid-outline'" @click="list = !list" />
                </div>
            </v-row>

            <v-row v-if="!materials">
                <span class="text-h5">Aún no hay materiales creados</span>
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
                            <v-col cols="12" sm="6" md="4" lg="3" v-for="material in materials" :key="material._id">
                                <MaterialCard :material="material" :adminActions="userStore.getIsAdmin"
                                    :reserveActions="false" :maxWidth="'300px'" :isPreview="true"
                                    @edit-material="openEditMaterialInfo(material)" @delete-material="deleteMaterial()"
                                    @click="openMaterial(material)" />
                            </v-col>
                        </v-row>
                    </v-container>
                </v-col>
            </v-row>

            <AskModal v-model="deleteModal" :title="'¿Borrar material?'"
                :message="'¿Estás seguro de que quieres borrar este material?'" :actionText="'Borrar material'"
                :closeModal="closeDialog" :action="deleteMaterial" />

            <AskModal v-model="bulkDeleteModal" :maxWidth="'600px'" :title="'Este material tiene reservas pendientes'"
                :message="'Este material tiene reservas pendientes, ¿Estás seguro de que quieres borrarlo? Se devolverá el pago de las reservas que se hayan cobrado.'"
                :actionText="'Borrar material'" :closeModal="closeBulkDeleteDialog" :action="bulkDeleteMaterial" />

        </v-col>
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { useMaterialStore } from '@/store/materialStore';
import { materialService } from '@/services/materialService';
import { useToast } from 'vue-toastification';
import TonalButton from '@/components/TonalButton.vue'
import MaterialCard from '@/components/MaterialCard.vue';
import AskModal from '@/components/AskModal.vue';
import Table from '@/components/Table.vue';
import { useTime } from '@/composables/useTime';

// Router, notificaciones y stores
const router = useRouter();
const toast = useToast();
const materialStore = useMaterialStore();
const userStore = computed(() => {
    return useUserStore();
});
// Computed para saber si el usuario es admin
const isAdmin = computed(() => userStore.value.getIsAdmin)


// Variables reactivas
const list = ref(false);
const materials = ref(null);
const deleteModal = ref(false);
const bulkDeleteModal = ref(false);

//Variables para la Tabla

// Extraemos función del composable useTime
const {
    makeHoursAndMinutes
} = useTime();


/* ------------------------- Ciclo de vida ------------------------- */
onMounted(() => {
    // Llamamos a getMaterials para obtener los materiales al montar el componente
    getMaterials();
})

/* ------------------------- Funciones del componente ------------------------- */
// Obtiene los materiales a través del servicio
function getMaterials() {
    materialService.getMaterials()
        .then(res => {
            materials.value = res.data.materials;
        })
        .catch(error => {
            console.log(error);
            materials.value = null;
        });
};


// Borrar el material. Si se pasa el id, se borra ese material, 
// si no, se borra el material seleccionado de la MaterialStore
const deleteMaterial = (id) => {
    materialService.deleteMaterial(id ? id : materialStore.getSelectedMaterial._id)
        .then(res => {
            getMaterials();
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

// Borrar el material y todas sus reservas. Se borra el material seleccionado de la MaterialStore
const bulkDeleteMaterial = () => {
    materialService.bulkDeleteMaterial(materialStore.getSelectedMaterial._id)
        .then(res => {
            getMaterials();
            bulkDeleteModal.value = false;
            toast.error('Espacio eliminado con éxito');
        })
        .catch(error => {
            console.log(error);
        });
};


//Funciones auxiliares para acciones como ver, crear o editar el material
const openMaterial = (material) => {
    materialStore.setSelectedMaterial(material); // Guardar el material seleccionado en el store
    router.push('/materialInfo');    // Navegar a la nueva ruta
};
const openCreateMaterial = () => {
    router.push('/createMaterial');
};
const openEditMaterialInfo = (material) => {
    materialStore.setSelectedMaterial(material); // Guardar el material seleccionado en el store
    router.push('/editMaterialInfo');
};
const openDeleteModal = (material) => {
    materialStore.setSelectedMaterial(material);
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

// Transformamos 'materials' en 'tableItems'
const tableItems = computed(() => {
    return (materials.value || []).map((material, i) => {
        const item = {
            id: material._id,        // key para v-for
            name: material.name,
            description: material.description,
            schedule: `${makeHoursAndMinutes(material.opening)}h - ${makeHoursAndMinutes(material.closing)}h`,
            object: material,      // guardamos el objeto para usarlo en las acciones
        }

        // Si NO es admin, mostramos la duración en la última columna
        if (!isAdmin.value) {
            if (material.duration < 60) {
                item.duration = `Reservas de ${material.duration} minutos`
            } else if (material.duration === 60) {
                item.duration = `Reservas de ${material.duration / 60} hora`
            } else {
                item.duration = `Reservas de ${material.duration / 60} horas`
            }
        }
        return item
    })
})

// Botones de acción si es admin
const actionButtons = [
    {
        icon: 'mdi-pencil',
        action: (item) => openEditMaterialInfo(item.object)
    },
    {
        icon: 'mdi-trash-can-outline',
        color: 'error',
        action: (item) => openDeleteModal(item.object)
    }
];


// Cuando se hace click en una fila, abrimos el material
function handleRowClick(item) {
    openMaterial(item.object)
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
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
