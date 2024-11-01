<template>
    <v-container fluid>
        <v-col>
            <v-row>
                <span class="text-h4">Espacios</span>
                <v-spacer></v-spacer>
                <div class="d-flex align-center">
                    <v-btn
                        class="mr-3"
                        variant="outlined"
                        v-if="userStore.getIsAdmin"
                        color="primary"
                        @click="openCreateSpace"
                    >Crear espacio</v-btn>
                    <v-btn
                        variant="text"
                        :ripple="false"
                        :icon="list ? 'mdi-view-grid-outline' : 'mdi-format-list-bulleted'"
                        @click="list = !list"
                    ></v-btn>
                </div>
            </v-row>

            <v-row class="py-3">
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
                                    <v-form style="display: flex; gap: 10px;">
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
                            <v-card @click="openSpace(space)" class="pa-5" outlined>
                                <v-img
                                    :src="space.imageUrl"
                                    height="150px"
                                    contain  
                                    class="mb-2"
                                ></v-img>
                                <v-card-title>{{ space.name }}</v-card-title>
                                <v-card-subtitle>{{ space.description }}</v-card-subtitle>

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
                        </v-col>
                    </v-row>
                </v-container>
            </v-row>

            <!-- Modal de eliminación -->
            <v-dialog v-model="deleteModal" max-width="600px">
                <v-card>
                    <v-card-title>
                        <span class="text-h4">Borrar espacio</span>
                    </v-card-title>

                    <v-card-text>
                        <v-col>
                            <v-row>
                                <h2>¿Estás seguro de que quieres borrar este espacio?</h2>
                            </v-row>
                            <v-row>
                                <h3 style="color: tomato;">Esta acción no se puede deshacer.</h3>
                            </v-row>
                            <v-container id="info-container">
                                <p>Nombre: <span class="text-h6">{{ selectedSpace?.name }}</span></p>
                                <p>Descripción: <span class="text-h6">{{ selectedSpace?.description }}</span></p>
                                <p>Imagen: <v-img
                                    :src="selectedSpace?.imageUrl"
                                    height="150px"
                                    contain  
                                    class="mb-2"
                                ></v-img></p>
                            </v-container>
                        </v-col>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="deleteModal = false">Cancelar</v-btn>
                        <v-btn color="error" @click="deleteSpace(this.selectedSpace._id)">Borrar</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-col>
    </v-container>
</template>

<script>
import { useUserStore } from '@/store/userStore';
import { useSpaceStore } from '@/store/spaceStore';
import { spaceService } from '@/services/spaceService';

export default {
    data() {
        return {
            user: null,
            list: true,
            spaces: [],
            spaceStore: null,
            selectedSpace: null,
            deleteModal: false,
        };
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
                });
        },
        openSpace(space) {
            console.log("Información del espacio: ", space.name, space.description, space.imageUrl);
            this.spaceStore.setSelectedSpace(space); // Guardar el espacio seleccionado en el store
            this.$router.push('/spaceInfo');    // Navegar a la nueva ruta
        },
        openCreateSpace() {
            this.$router.push('/createSpace');
        },
        openDeleteModal(space){
            this.selectedSpace = { ...space }; // Hacer una copia del usuario seleccionado
            this.deleteModal = true;
        },
        deleteSpace(id){
            spaceService.deleteSpace(id)
            .then(res => {
                this.getSpaces();
                this.deleteModal = false;
            })
            .catch(error => {
                console.log(error);
            });
        }
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
