<template>
    <v-container fluid>
        <v-col>
            <v-row>
                <span class="text-h4">Espacios</span>
                <v-spacer></v-spacer>
                <div class="d-flex align-center">
                    <TonalButton
                        color="blue"
                        text="Crear espacio"
                        class="mr-3"
                        v-if="userStore.getIsAdmin"
                        @click="openCreateSpace"
                    />
                    <v-btn
                        variant="text"
                        :ripple="false"
                        :icon="list ? 'mdi-view-grid-outline' : 'mdi-format-list-bulleted'"
                        @click="list = !list"
                    />
                </div>
            </v-row>

            <v-row v-if="!spaces">
                <span class="text-h5">Aún no hay espacios creados</span>
            </v-row>

            <v-row v-else class="py-3 mx-n11">
                <!-- Vista de lista -->
                <v-col v-if="list">
                    <v-card style="width: 100%;">
                        <v-table class="fixed-table">
                            <thead>
                                <tr>
                                    <th style="width: 10%;">#</th>
                                    <th style="width: 20%;">Nombre</th>
                                    <th style="width: 20%;">Descripción</th>
                                    <th style="width: 30%;">Horario de apertura y cierre</th>
                                    <th v-if="userStore.getIsAdmin" style="width: 10%;">Acciones</th>
                                    <th v-else style="width: 20%;">Duración de las reservas</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(space, index) in spaces" :key="space._id" @click="openSpace(space)" class="cursor-pointer">
                                    <td>{{ index + 1 }}</td>
                                    <td>{{ space.name }}</td>
                                    <td>{{ space.description }}</td>
                                    <td>{{ calcOpeningAndClosing(space) }}</td>
                                    <td v-if="userStore.getIsAdmin">
                                        <v-form class="d-flex align-center">
                                            <v-btn
                                                icon="mdi-pencil"
                                                variant="text"
                                                size="small"
                                                @click.stop="openEditSpaceInfo(space)"
                                            />
                                            <v-btn
                                                color="error"
                                                icon="mdi-trash-can-outline"
                                                variant="text"
                                                size="small"
                                                @click.stop="openDeleteModal(space)"
                                            />
                                        </v-form>
                                    </td>
                                    <td v-else> 
                                        <span v-if="space.duration < 60">Reservas de {{ space.duration }} minutos</span>
                                        <span v-if="space.duration == 60">Reservas de {{ space.duration / 60 }} hora</span>
                                        <span v-if="space.duration > 60">Reservas de {{ space.duration / 60 }} horas</span>
                                    </td>
                                    
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card>
                </v-col>

                <!-- Vista cuadrícula -->
                <v-col v-else class="pa-0" >
                    <v-container fluid>
                        <v-row>
                            <v-col cols="12" sm="6" md="4" lg="3" v-for="space in spaces" :key="space._id">
                                <SpaceCard
                                    v-if="userStore.getIsAdmin"
                                    :space="space"
                                    :adminActions="userStore.getIsAdmin"
                                    :reserveActions="false"
                                    :maxWidth="'300px'"
                                    :isPreview="true"
                                    @edit-space="openEditSpaceInfo(space)"
                                    @delete-space="deleteSpace(space._id)"
                                    @click="openSpace(space)"
                                />
                                <SpaceCard
                                    v-else
                                    :space="space"
                                    :adminActions="false"
                                    :reserveActions="false"
                                    :maxWidth="'300px'"
                                    :isPreview="true"
                                    @edit-space="openEditSpaceInfo(space)"
                                    @delete-space="deleteSpace(space._id)"
                                    @click="openSpace(space)"
                                />
                                
                            </v-col>
                        </v-row>
                    </v-container>
                </v-col>
            </v-row>

            <AskModal
                v-model="deleteModal"
                :title="'¿Borrar espacio?'"
                :message="'¿Estás seguro de que quieres borrar este espacio?'"
                :actionText="'Borrar espacio'"
                :closeModal="closeDialog"
                :action="deleteSpace"
            />

        </v-col>
    </v-container>
</template>

<script>
import { useUserStore } from '@/store/userStore';
import { useSpaceStore } from '@/store/spaceStore';
import { spaceService } from '@/services/spaceService';
import { useToast } from 'vue-toastification';
import TonalButton from '@/components/TonalButton.vue'
import SpaceCard from '@/components/SpaceCard.vue';
import AskModal from '@/components/AskModal.vue';

export default {
    data() {
        return {
            user: null,
            list: false,
            spaces: null,
            spaceStore: null,
            userStore: null,
            selectedSpace: null,
            deleteModal: false,
        };
    },
    components: {
        TonalButton,
        SpaceCard,
        AskModal
    },
    mounted() {
        this.getSpaces();
        this.spaceStore = useSpaceStore();
    },
    computed: {
        userStore() {
            return useUserStore();
        },
    },
    methods: {
        getSpaces() {
            spaceService.getSpaces()
                .then(res => {
                    this.spaces = res.data.spaces;
                })
                .catch(error => {
                    console.log(error);
                    this.spaces = null;
                });
        },
        openSpace(space) {
            this.spaceStore.setSelectedSpace(space); // Guardar el espacio seleccionado en el store
            this.$router.push('/spaceInfo');    // Navegar a la nueva ruta
        },
        openCreateSpace() {
            this.$router.push('/createSpace');
        },
        openEditSpaceInfo(space) {
            this.spaceStore.setSelectedSpace(space); // Guardar el espacio seleccionado en el store
            this.$router.push('/editSpaceInfo');
        },
        openDeleteModal(space) {
            this.selectedSpace = { ...space }; // Hacer una copia del espacio seleccionado
            this.deleteModal = true;
        },
        closeDialog() {
            this.deleteModal = false;
        },
        calcOpeningAndClosing(space) {
            const hoursOpening = Math.floor(space.opening / 60);
            const hoursClosing = Math.floor(space.closing / 60);
            const minsOpening = space.opening % 60;
            const minsClosing = space.closing % 60;

            // Formatea con ceros a la izquierda
            const formattedHoursOpening = String(hoursOpening).padStart(2, '0');
            const formattedMinutesOpening = String(minsOpening).padStart(2, '0');

            const formattedHoursClosing = String(hoursClosing).padStart(2, '0');
            const formattedMinutesClosing = String(minsClosing).padStart(2, '0');

            return `${formattedHoursOpening}:${formattedMinutesOpening}h - ${formattedHoursClosing}:${formattedMinutesClosing}h`;
        },
        deleteSpace() {
            const toast = useToast();
            spaceService.deleteSpace(this.selectedSpace._id)
                .then(res => {
                    this.getSpaces();
                    this.deleteModal = false;
                    toast.error('Espacio eliminado con éxito');
                })
                .catch(error => {
                    console.log(error);
                });
        },
    },
};
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

th, td {
    text-align: left;
    padding: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
