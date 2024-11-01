<template>
    <v-container class="pa-10 container">
      <v-card class="pa-3" outlined>
        <v-card-title>
          <span class="text-h4">Crear espacio</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
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
            <v-file-input
              v-model="spaceImage"
              accept="image/*"
              label="Imagen"
              prepend-icon="mdi-camera"
              variant="filled"
              required
              :rules="imageRules"
            />
          </v-form>
  
          <!-- Alerta de éxito -->
          <v-fade-transition>
            <v-alert v-if="success" type="success" border="left">
              ¡Espacio creado con éxito!
            </v-alert>
          </v-fade-transition>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="routerBack">Volver</v-btn>
          <v-btn 
            variant="outlined"
            @click="submit" 
            :disabled="!valid" 
            color="primary"
          >Crear</v-btn>
        </v-card-actions>

      </v-card>
    </v-container>
</template>
  
<script>
import {spaceService} from '@/services/spaceService'; // Asegúrate de tener este servicio
  
export default {
    data() {
      return {
        valid: false,
        spaceName: '',
        spaceDescription: '',
        spaceImage: null, // Nueva variable para la imagen
        success: false,
        textRules: [
          v => !!v || 'El texto es requerido',
        ],
        imageRules: [
          v => !!v || 'La imagen es requerida',
        ]
      };
    },
    methods: {
      routerBack() {
        this.$router.push('/spaces');
      },
      async submit() {
        if (this.$refs.form.validate()) {
            console.log("Datos enviados: ", this.spaceName, this.spaceDescription, this.spaceImage);
            
            const formData = new FormData();
            formData.append('name', this.spaceName);
            formData.append('description', this.spaceDescription);
            formData.append('image', this.spaceImage); // Archivo de imagen

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
</style>
  