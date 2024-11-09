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
            variant="outlined"
            required
            :rules="[v => !!v || 'El campo es obligatorio']"
          />
          <v-text-field 
            v-model="spaceDescription" 
            label="Descripción"
            prepend-icon="mdi-text" 
            type="text"
            variant="outlined"
            required
            :rules="[v => !!v || 'El campo es obligatorio']"
          />
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
              /> 
            </v-col>
          </v-row>
          <v-select
            v-model="selectedTimeFrame"
            :items="timeFrames"
            item-title="label"
            item-value="value"
            label="Duración de las reservas"
            prepend-icon="mdi-clock-outline"
            :rules="[v => !!v || 'El campo es obligatorio']"
            variant="outlined"
          ></v-select>
        </v-form>

        <!-- Alertas de éxito o error -->
        <v-fade-transition>
          <v-alert v-if="success" type="success">
            ¡Espacio creado con éxito!
          </v-alert>
          <v-alert v-if="alertModal" type="error">
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
      spaceName: null,
      spaceDescription: null,
      spaceImage: null, 
      spaceSeats: null,
      success: false,
      alertModal: false,
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
      this.$router.push('/spaces');
    },
    camposVacios() {
      return !this.spaceName || !this.spaceDescription || !this.selectedTimeFrame || !this.spaceImage || !this.spaceSeats;
    },
    async submit() {
      if (this.$refs.form.validate()) {

        if (this.camposVacios()) {
          setTimeout(() => {
              this.alertModal = false;
          }, 3000);
          return;
        }

        console.log(this.selectedTimeFrame + ' es un ' + typeof this.selectedTimeFrame);

        const formData = new FormData();
        formData.append('name', this.spaceName);
        formData.append('description', this.spaceDescription);
        formData.append('image', this.spaceImage); 
        formData.append('seats', this.spaceSeats);
        formData.append('time', this.selectedTimeFrame);

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
  