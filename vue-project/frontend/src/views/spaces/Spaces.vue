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
                    ></v-btn>
                </div>
            </v-row>

            <v-row v-if="!spaces">
                <span class="text-h5">Aún no hay espacios creados</span>
            </v-row>

            <v-row v-else class="py-3">
                <!-- Vista de lista -->
                <v-card v-if="list" style="width: 100%;">
                    <v-table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(space, index) in spaces" :key="space._id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ space.name }}</td>
                                <td>{{ space.description }}</td>

                                <td>
                                    <v-form class="d-flex">
                                        <v-btn 
                                        icon="mdi-magnify" 
                                        variant="text"
                                        @click="openSpace(space)"
                                        ></v-btn> 
                                        <v-btn 
                                        v-if="userStore.getIsAdmin" 
                                        color="error" 
                                        icon="mdi-trash-can-outline" 
                                        variant="text"
                                        @click="openDeleteModal(space)"
                                        ></v-btn>
                                    </v-form>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card>

                <!-- Vista cuadrícula -->
                <v-container class="pa-0" v-else style="width: 100%;">
                    <v-row>
                        <v-col cols="12" sm="6" md="4" lg="3" v-for="space in spaces" :key="space._id">
                            <v-card v-if="userStore.getIsAdmin" class="pa-5" outlined>
                                <v-img
                                    :src="space.imageUrl"
                                    height="150px"
                                    contain  
                                    class="mb-2"
                                ></v-img>
                                <v-card-title class="ml-n3 text-h5">{{ space.name }}</v-card-title>
                                <v-card-subtitle class="ml-n3">{{ space.description }}</v-card-subtitle>

                                <v-card-actions v-if="userStore.getIsAdmin" class="mt-n1 mb-n4">
                                    <v-btn 
                                    icon="mdi-magnify" 
                                    variant="text"
                                    @click="openSpace(space)"
                                    ></v-btn>
                                    <v-spacer></v-spacer>
                                    <v-btn 
                                    v-if="userStore.getIsAdmin" 
                                    color="error" 
                                    icon="mdi-trash-can-outline" 
                                    variant="text"
                                    @click="openDeleteModal(space)"
                                    ></v-btn>
                                </v-card-actions>
                            </v-card>
                            <v-card v-else @click="openSpace(space)" class="pa-5" outlined>
                                <v-img
                                    :src="space.imageUrl"
                                    height="150px"
                                    contain  
                                    class="mb-2"
                                ></v-img>
                                <v-card-title class="ml-n3 text-h5">{{ space.name }}</v-card-title>
                                <v-card-subtitle class="ml-n3">{{ space.description }}</v-card-subtitle>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
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
import AskModal from '@/components/AskModal.vue';

export default {
    data() {
        return {
            user: null,
            list: false,
            spaces: null,
            spaceStore: null,
            selectedSpace: null,
            deleteModal: false,
        };
    },
    components: {
        TonalButton,
        AskModal
    },
    mounted() {
        this.getSpaces();
        this.spaceStore = useSpaceStore();
    },
    computed: {
        userStore() {
            return useUserStore();
        }
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
        openDeleteModal(space) {
            this.selectedSpace = { ...space }; // Hacer una copia del usuario seleccionado
            this.deleteModal = true;
        },
        closeDialog() {
            this.deleteModal = false;
        },
        deleteSpace() {
            const toast = useToast();
            spaceService.deleteSpace(this.selectedSpace?._id)
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
</style>
