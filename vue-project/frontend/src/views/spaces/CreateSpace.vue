<template>
  <v-container class="pa-10 container">
    <v-card class="pa-3" outlined>
      <v-card-title class="my-2">
        <span class="text-h4">Crear espacio</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form">
          
          <v-text-field 
            v-model="spaceName" 
            label="Nombre" 
            type="text"
            required
            :rules="textRules"
          />
          <v-text-field 
            v-model="spaceDescription" 
            label="Descripción" 
            type="text"
            required
            :rules="textRules"
          />
        </v-form>

        <!-- Alertas de éxito o error -->
        <v-fade-transition>
          <v-alert v-if="success" type="success" border="left">
            ¡Espacio creado con éxito!
          </v-alert>
          <v-alert v-if="alertModal" type="error" border="left">
            Error, campo obligatorio vacío
          </v-alert>
        </v-fade-transition>
      </v-card-text>

      <v-card-actions class="mt-n2">
        <TonalButton 
          color="grey"
          text="Volver" 
          @click="routerBack"
        />
        <v-spacer></v-spacer>
        <TonalButton 
          color="blue"
          text="Crear"
          @click="submit" 
          :disabled="camposVacios()"  
        />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { spaceService } from '@/services/spaceService'; 
import TonalButton from '@/components/TonalButton.vue'

export default {
  data() {
    return {
      spaceName: '',
      spaceDescription: '',
      newImageUrl: null,
      isNewImage: false,
      spaceImage: null, 
      success: false,
      alertModal: false,
      alertMessage: null,
      textRules: [
        v => !!v || 'El campo es obligatorio',
      ],
      imageRules: [
        v => !!v || 'La imagen es obligatoria',
      ]
    };
  },
  components: {
      TonalButton
  },
  methods: {
    routerBack() {
      this.$router.push('/spaces');
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
      return !this.spaceName || !this.spaceDescription || !this.spaceImage;
    },
    async submit() {
      if (this.$refs.form.validate()) {

        if (this.camposVacios()) {
          setTimeout(() => {
              this.alertModal = false;
          }, 3000);
          return;
        }

        const formData = new FormData();
        formData.append('name', this.spaceName);
        formData.append('description', this.spaceDescription);
        if (this.isNewImage && this.newImageUrl) {
            formData.append('image', this.newImageUrl); // Agrega la nueva imagen al FormData
        }

        spaceService.createSpace(formData)
            .then(res => {
                console.log(res.data);
                this.success = true;
                setTimeout(() => {
                    this.success = false;
                }, 3000);
            })
            .catch(error => {
                console.log(error);
            });

      } else {
        console.log('Formulario inválido');
      }
    }
  }
};
</script>

  
<style scoped> 
.container {
    max-width: 700px;
    margin: 0 auto;
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
  