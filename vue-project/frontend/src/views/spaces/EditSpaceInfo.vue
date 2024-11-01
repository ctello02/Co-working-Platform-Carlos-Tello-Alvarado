<template>
    <v-container class="pa-10 container">
        <!-- Modal de edición -->
        <v-card class="pa-3" outlined>
            <v-card-title>
                <span class="text-h4">Editar espacio</span>
            </v-card-title>

            <v-card-text v-if="newSpace">
                <v-form>
                    <v-text-field 
                        v-model="newSpace.name" 
                        label="Nombre" 
                        required
                        :rules="textRules"
                    />
                    <v-text-field 
                        v-model="newSpace.description" 
                        label="Descripción" 
                        required
                        :rules="textRules"
                    />
                    <div class="d-flex justify-center">
                        <v-avatar 
                        @click="triggerFileInput"
                        class="my-2 avatar-container" 
                        size="200"
                        style="position: relative; cursor: pointer; border: 0px; border-radius: 0px;"
                        >
                            <img 
                            style="object-fit: cover;  border-radius: 0px"
                            :src="newSpace?.imageUrl" 
                            height="200px" 
                            contain />
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
                        </v-avatar>
                    </div>
                </v-form>

                <v-fade-transition>
                    <v-alert v-if="success" type="success" border="left">
                        ¡Espacio actualizado con éxito!
                    </v-alert>
                </v-fade-transition>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="routerBack">Volver</v-btn>
                <v-btn color="primary" @click="updateSpace">Guardar</v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script>
import { useSpaceStore } from '@/store/spaceStore';
import { spaceService } from '@/services/spaceService';

export default {
    data() {
        return {
            spaceStore: null,
            space: null,
            newSpace: null,
            success: false,
            newImageUrl: null,
            isNewImage: false,
            textRules: [
                v => !!v || 'El texto es requerido',
            ],
            imageRules: [
                v => !!v || 'La imagen es requerida',
            ]
        };
    },
    mounted() {
        this.spaceStore = useSpaceStore();
        this.space = this.spaceStore.getSelectedSpace;
        this.newSpace = { ...this.space };    // Hacer una copia del objeto space
    },
    methods: {
        routerBack() {
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

        updateSpace() {
            const formData = new FormData();
            formData.append('id', this.newSpace._id);
            formData.append('name', this.newSpace.name);
            formData.append('description', this.newSpace.description);

            if (this.isNewImage && this.newImageUrl) {
                formData.append('image', this.newImageUrl); // Agrega la nueva imagen al FormData
            }

            spaceService.updateSpace(formData)
                .then(res => {
                    console.log(res.data);
                    this.spaceStore.setSelectedSpace(this.newSpace);

                    // Mostrar la alerta de éxito y ocultarla después de 3 segundos
                    this.success = true;
                    setTimeout(() => {
                        this.success = false;
                    }, 3000);
                })
                .catch(error => {
                    console.log(error);
                });
        },

    },
}
</script>

<style scoped>
.container {
    max-width: 700px;
    margin: 0 auto;
}

.title {
  font-weight: bold;
  margin-bottom: 20px;
}

.avatar-container {
  position: relative;
  border: 1px solid gray;
}

.avatar-container:hover .camera-icon {
  opacity: 1;
}

.avatar-container img {
  transition: filter 0.3s ease;
}

.avatar-container:hover img {
  filter: brightness(50%);
}

.camera-icon {
  opacity: 0;
  transition: opacity 0.3s ease;
}
</style>