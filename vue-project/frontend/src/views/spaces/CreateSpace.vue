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
              prepend-icon="mdi-timer-outline"
              :rules="[v => !!v || 'El campo es obligatorio']"
              variant="outlined"
              class="my-1"
            />
          </v-row>

          <v-row class="mt-1">
            <v-radio-group 
              inline 
              prepend-icon="mdi-repeat"
              v-model="spaceRepetition" 
              label="¿Permite repetición de reservas?"
            >
              <v-radio label="Si" :value="true"/>
              <v-radio label="No" :value="false"/>
            </v-radio-group>
          </v-row>

          <v-row class="mt-n1">
            <v-col cols="6">
              <v-select
                v-model="openingTime"
                :items="allTimes"
                label="Hora de apertura"
                prepend-icon="mdi-weather-sunny"
                variant="outlined"
              ></v-select>
            </v-col>

            <v-col cols="6">
              <v-select
                v-model="closingTime"
                :items="filteredClosingTimes"
                label="Hora de cierre"
                prepend-icon="mdi-weather-night"
                :disabled="!openingTime"
                variant="outlined"
              ></v-select>
            </v-col>
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
      spaceRepetition: false,

      openingTime: null,
      closingTime: null,
      allTimes: [],

      timeFrames: [
        { label: '15 mins', value: 15 },
        { label: '20 mins', value: 20 },
        { label: '30 mins', value: 30 },
        { label: '1 hora', value: 60 },
        { label: '2 horas', value: 120 },
        { label: '3 horas', value: 180 },
      ],
    };
  },
  components: {
    TonalButton,
  },
  mounted() {
    this.generateAllTimes();
  },
  computed: {
    filteredClosingTimes() {
      if (!this.openingTime) return this.allTimes;
      const openingIndex = this.allTimes.indexOf(this.openingTime);
      return this.allTimes.slice(openingIndex + 1);
    },
  },
  watch: {
    openingTime(newVal) {
      if (newVal && this.closingTime && newVal >= this.closingTime) {
        this.closingTime = null;
      }
    },
  },
  methods: {
    routerBack() {
      const toast = useToast();
      if (this.successToastId) {
        toast.dismiss(this.successToastId); 
      } else {
        toast.clear(); 
      }
      this.$router.push('/spaces');
    },
    generateAllTimes() {
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          this.allTimes.push(formattedTime);
        }
      }
    },
    camposVacios() {
      return !this.spaceName || !this.spaceDescription || !this.selectedTimeFrame || !this.spaceImage || !this.spaceSeats || !this.openingTime || !this.closingTime;
    },
    clearFields() {
      this.spaceName = null;
      this.spaceDescription = null;
      this.spaceImage = null;
      this.spaceSeats = null;
      this.selectedTimeFrame = null;
      this.spaceRepetition = false;
      this.openingTime = null;
      this.closingTime = null;
    },
    decomposeHoursAndMinutes(time) {
      const [hour, minute] = time.split(':').map(Number);
      const hourInMinutes = hour * 60 + minute;
      return hourInMinutes;
    },
    async submit() {
      const toast = useToast();
      if (this.camposVacios()) {
        this.successToastId = toast.error('Formulario inválido');
        return;
      }

      // Descomposición de las horas y minutos de apertura y cierre
      const openingTimeInMinutes = this.decomposeHoursAndMinutes(this.openingTime);
      const closingTimeInMinutes = this.decomposeHoursAndMinutes(this.closingTime);

      const formData = new FormData();
      formData.append('name', this.spaceName);
      formData.append('description', this.spaceDescription);
      formData.append('image', this.spaceImage); 
      formData.append('seats', this.spaceSeats);
      formData.append('duration', this.selectedTimeFrame);
      formData.append('repetition', this.spaceRepetition);
      formData.append('opening', openingTimeInMinutes); 
      formData.append('closing', closingTimeInMinutes); 

      try {
        const res = await spaceService.createSpace(formData);
        console.log(res.data);
        this.successToastId = toast.success('¡Espacio creado con éxito!');
        this.clearFields();
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>  