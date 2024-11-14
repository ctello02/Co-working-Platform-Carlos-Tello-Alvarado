<template>
  <v-container class="container">
    <v-card class="mx-auto px-2" max-width="550">
      <v-card-title class="my-3">
        <span class="text-h4">Nuevo espacio</span>
      </v-card-title>
      <v-card-text>
        <v-col>
          <v-row>
            <v-text-field
              v-model="spaceName"
              label="Nombre"
              type="text"
              variant="outlined"
              required
              :rules="[v => !!v || 'El campo es obligatorio']"
              class="my-1"
            />
          </v-row>
          <v-row>
            <v-text-field
              v-model="spaceDescription"
              label="Descripción"
              prepend-icon="mdi-text"
              type="text"
              variant="outlined"
              required
              :rules="[v => !!v || 'El campo es obligatorio']"
              class="my-1"
            />
          </v-row>
          <v-row>
            <v-col>
              <v-file-input
                v-model="spaceImage"
                accept="image/*"
                label="Imagen"
                prepend-icon="mdi-camera"
                variant="outlined"
                required
                :rules="[v => !!v || 'La imagen es obligatoria']"
                class="ml-n3"
              />
            </v-col>
            <v-col>
              <v-text-field 
                v-model.number="spaceSeats" 
                label="Número de asientos"
                prepend-icon="mdi-table-chair" 
                type="number"
                variant="outlined"
                required
                :rules="[v => !!v || 'El campo es obligatorio']"
                @input="spaceSeats = Math.max(0, spaceSeats)"
                class="mr-n3"
              /> 
            </v-col>
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
            />
          </v-row>
        </v-col>
      </v-card-text>

      <v-card-actions class="mt-n9 mb-3 mr-2 d-flex justify-end ga-3">
        <TonalButton 
          color="grey" 
          text="Volver" 
          @click="routerBack"
        />
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
import { useToast } from 'vue-toastification';
import { spaceService } from '@/services/spaceService'; 
import TonalButton from '@/components/TonalButton.vue'

export default {
  data() {
    return {
      spaceName: null,
      spaceDescription: null,
      spaceImage: null, 
      spaceSeats: null,
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
      TonalButton
  },
  methods: {
    routerBack() {
      const toast = useToast();
      if (this.successToastId) {
          toast.dismiss(this.successToastId); // Cierra el toast específico usando el ID
      } else {
          toast.clear(); // Elimina todos los toasts como respaldo
      }
      this.$router.push('/spaces');
    },
    camposVacios() {
      return !this.spaceName || !this.spaceDescription || !this.selectedTimeFrame || !this.spaceImage || !this.spaceSeats;
    },
    clearFields() {
      this.spaceName = null;
      this.spaceDescription = null;
      this.spaceImage = null;
      this.spaceSeats = null;
      this.selectedTimeFrame = null;
    },
    async submit() {
        const toast = useToast();
        if (this.camposVacios()) {
          this.successToastId = toast.error('Formulario inválido');
          return;
        }

        const formData = new FormData();
        formData.append('name', this.spaceName);
        formData.append('description', this.spaceDescription);
        formData.append('image', this.spaceImage); 
        formData.append('seats', this.spaceSeats);
        formData.append('time', this.selectedTimeFrame);

        spaceService.createSpace(formData)
            .then(res => {
                console.log(res.data);
                this.successToastId = toast.success('¡Espacio creado con éxito!');
                this.clearFields();
            })
            .catch(error => {
                console.log(error);
            });
    }
  }
};
</script>

  