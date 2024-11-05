<template>
  <v-container class="pa-10 container">
    <v-card class="pa-3" outlined>
      <v-card-title>
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

      <v-card-actions>
        <v-spacer></v-spacer>
        <TonalButton color="grey" text="Volver" @click="routerBack"/>
        <TonalButton 
          text="Crear"
          @click="submit" 
          :disabled="camposVacios()"  
          color="blue"
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
        formData.append('image', this.spaceImage); 

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
  