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
                                <th v-if="userStore.getIsAdmin">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(space, index) in spaces" :key="space._id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ space.name }}</td>
                                <td>{{ space.description }}</td>

                                <td>
                                    <v-form style="display: flex; gap: 10px;">
                                        <v-btn icon="mdi-magnify" variant="text"></v-btn>
                                        <v-btn v-if="userStore.getIsAdmin" color="error" icon="mdi-trash-can-outline" variant="text"></v-btn>
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
                                    <v-btn icon="mdi-magnify" variant="text"></v-btn>
                                    <v-spacer></v-spacer>
                                    <v-btn v-if="userStore.getIsAdmin" color="error" icon="mdi-trash-can-outline" variant="text"></v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
            </v-row>
        </v-col>
    </v-container>
</template>

<script>
import { useUserStore } from '@/store/userStore';
import { spaceService } from '@/services/spaceService';

export default {
    data() {
        return {
            spaces: [],
            list: true,
            user: null,
        };
    },
    mounted() {
        this.getSpaces();
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
        },
        openCreateSpace() {
            this.$router.push('/createSpace');
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
