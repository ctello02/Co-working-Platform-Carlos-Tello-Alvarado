<template>
    <v-container class="container">
        <v-card v-if="space" class="mx-auto" max-width="600">
            <v-img
                :src="newSpace?.imageUrl"
                color="surface-variant"
                height="300px"
                cover 
                class="img-container" 
                @click="triggerFileInput"
                style="position: relative; cursor: pointer; border: 0px; border-radius: 0px;"
            >
                <v-icon
                class="mdi-camera camera-icon"
                style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    z-index: 1001;
                "
                >mdi-camera</v-icon>
                <input
                    type="file"
                    ref="fileInput"
                    accept="image/*"
                    @change="onFileChange"
                    style="display: none"
                />
            </v-img>

            <v-card-text class="px-6">
                <v-col>
                    <v-row>
                        <v-text-field
                            v-model="newSpace.name"
                            label="Nombre"
                            variant="outlined"
                            required
                            :rules="[v => !!v || 'El texto es requerido']"
                            class="my-1"
                        />
                    </v-row>
                        
                    <v-row>
                        <v-text-field
                            v-model="newSpace.description"
                            label="Descripción"
                            variant="outlined"
                            prepend-icon="mdi-text"
                            required
                            :rules="[v => !!v || 'El texto es requerido']"
                            class="my-1"
                        />
                    </v-row>

                    <v-row>
                        <v-text-field
                            v-model.number="newSpace.seats"
                            label="Número de asientos"
                            prepend-icon="mdi-table-chair"
                            type="number"
                            variant="outlined"
                            required
                            :rules="[v => !!v || 'El campo es obligatorio']"
                            @input="newSpace.seats = Math.max(0, newSpace.seats)"
                            class="my-1"
                        />
                    </v-row>

                    <v-row>
                        <v-select
                            v-model="selectedTimeFrame"
                            :items="timeFrames"
                            item-title="label"
                            item-value="value"
                            label="Duración de las reservas"
                            prepend-icon="mdi-clock-outline"
                            :rules="[v => !!v || 'El campo es obligatorio']"
                            variant="outlined"
                            class="my-1"
                        ></v-select>
                    </v-row>
                </v-col>
            </v-card-text>

            <v-card-actions class="mt-n9 mb-3 mr-4 d-flex justify-end ga-3">
                <TonalButton 
                    color="grey" 
                    text="Volver" 
                    @click="routerBack"
                />
                <TonalButton 
                    color="blue" 
                    text="Guardar" 
                    @click="submit" 
                    :disabled="camposVacios()"
                />
            </v-card-actions>
        </v-card>

    </v-container>
</template>

<script>
import { useSpaceStore } from '@/store/spaceStore';
import { spaceService } from '@/services/spaceService';
import { useToast } from 'vue-toastification';
import TonalButton from '@/components/TonalButton.vue'

export default {
    data() {
        return {
            spaceStore: null,
            space: null,
            newSpace: null,
            newImageUrl: null,
            isNewImage: false,
            successToastId: null,
            selectedTimeFrame: null,
            timeFrames: [
                { label: '15 mins', value: 15 },
                { label: '20 mins', value: 20 },
                { label: '30 mins', value: 30 },
                { label: '1 hora', value: 60 },
                { label: '1.5 horas', value: 90 },
                { label: '2 horas', value: 120 },
                { label: '3 horas', value: 180 },
                { label: '4 horas', value: 240 },
                { label: '5 horas', value: 300 },
            ],
        };
    },
    components: {
        TonalButton,
    },
    mounted() {
        this.spaceStore = useSpaceStore();
        this.space = this.spaceStore.getSelectedSpace;

        if (!this.space) {
            this.$router.push('/spaces'); // Redirigir al componente padre
        }
        
        this.newSpace = { ...this.space };    // Hacer una copia del objeto space
        this.selectedTimeFrame = this.space?.time;
    },
    methods: {
        routerBack() {
            const toast = useToast();
            if (this.successToastId) {
                toast.dismiss(this.successToastId); // Cierra el toast específico usando el ID
            } else {
                toast.clear(); // Elimina todos los toasts como respaldo
            }
            this.$router.push('/spaceInfo');
        },
        triggerFileInput() {
            this.$refs.fileInput.click();
        },
        onFileChange(e) {
            const file = e.target.files[0];
            if (file) {
                this.isNewImage = true;
                this.newImageUrl = file; // Guardamos el archivo para el FormData

                // Previsualizar la imagen seleccionada
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.newSpace.imageUrl = e.target.result; // Asigna la URL de la imagen previsualizada
                };
                reader.readAsDataURL(file);
            }
        },
        camposVacios() {
            return !this.newSpace.name || !this.newSpace.description || !this.newSpace.seats || !this.selectedTimeFrame;
        },
        async submit() {
            const toast = useToast();
            const formData = new FormData();
            formData.append('id', this.newSpace._id);
            formData.append('name', this.newSpace.name);
            formData.append('description', this.newSpace.description);
            formData.append('seats', this.newSpace.seats);

            const numbersOnly = parseFloat(this.selectedTimeFrame);
            this.newSpace.time = numbersOnly

            formData.append('time', this.newSpace.time);

            if (this.isNewImage && this.newImageUrl) {
                formData.append('image', this.newImageUrl); // Agrega la nueva imagen al FormData
            }

            spaceService.updateSpace(formData)
                .then(res => {
                    console.log(res.data);
                    const newSpaceSelected = { ...this.newSpace };
                    this.spaceStore.setSelectedSpace(newSpaceSelected);
                    // Mostrar la alerta de éxito y ocultarla después de 3 segundos
                    this.successToastId = toast.success('¡Espacio actualizado con éxito!');
                })
                .catch(error => {
                    console.log(error);
                });

        },

    },
}
</script>

<style scoped>
.img-container {
  position: relative;
  border: 1px solid gray;
}

.img-container:hover .camera-icon {
  opacity: 1;
}

.img-container:hover {
  filter: brightness(85%);
  transition: filter 0.3s ease;
}

.camera-icon {
  opacity: 0;
  transition: opacity 0.6s ease;
}
</style>