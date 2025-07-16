<template>
  <v-container class="container">
    <v-card class="mx-auto px-2" max-width="550">
      <v-card-title class="mt-5">
        <span class="text-h4">Nuevo material</span>
      </v-card-title>
      <v-card-text>
        <v-col>
          <v-row>
            <v-col cols="8">
              <v-text-field v-model="materialName" label="Nombre" type="text" variant="outlined" required
                :rules="[v => !!v || 'El campo es obligatorio']" class="my-1 ml-n3" />
            </v-col>
            <v-col cols="4">
              <v-text-field suffix="€" v-model.number="pricing" label="Precio de reserva"
                prepend-icon="mdi-hand-coin-outline" type="number" variant="outlined" required
                @input="pricing = Math.max(0, pricing)" class="mr-n3" />
            </v-col>
          </v-row>
          <v-row>
            <v-text-field v-model="materialDescription" label="Descripción" prepend-icon="mdi-text" type="text"
              variant="outlined" required :rules="[v => !!v || 'El campo es obligatorio']" class="my-1" />
          </v-row>
          <v-row>
            <v-col>
              <v-file-input v-model="materialImage" accept="image/*" label="Imagen" prepend-icon="mdi-camera"
                variant="outlined" required :rules="[v => !!v || 'La imagen es obligatoria']" class="ml-n3" />
            </v-col>
          </v-row>
          <v-row>
            <v-select v-model="selectedTimeFrame" :items="timeFrames" item-title="label" item-value="value"
              label="Duración de las reservas" prepend-icon="mdi-timer-outline"
              :rules="[v => !!v || 'El campo es obligatorio']" variant="outlined" class="my-1" />
          </v-row>

          <v-row class="mt-1">
            <v-radio-group inline prepend-icon="mdi-repeat" v-model="materialRepetition"
              label="¿Permite repetición de reservas?">
              <v-radio label="Si" :value="true" />
              <v-radio label="No" :value="false" />
            </v-radio-group>
          </v-row>

          <v-row class="mt-n1">
            <v-col cols="6">
              <v-select class="ml-n3" v-model="openingTime" :items="allTimes" label="Hora de apertura"
                prepend-icon="mdi-weather-sunny" variant="outlined"></v-select>
            </v-col>

            <v-col cols="6">
              <v-select class="mr-n3" v-model="closingTime" :items="filteredClosingTimes" label="Hora de cierre"
                prepend-icon="mdi-weather-night" :disabled="!openingTime" variant="outlined"></v-select>
            </v-col>
          </v-row>
        </v-col>
      </v-card-text>

      <v-card-actions class="mt-n9 mb-5 mr-2 d-flex justify-end ga-3">
        <TonalButton color="grey" text="Volver" @click="routerBack" />
        <TonalButton text="Crear" @click="submit" :disabled="emptyFields()" color="blue" />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { materialService } from '@/services/materialService';
import TonalButton from '@/components/TonalButton.vue';
import { useTime } from '@/composables/useTime';

// Router y notificaciones
const router = useRouter();
const toast = useToast();
const successToastId = ref(null);

// Variables reactivas
const materialName = ref(null);
const materialDescription = ref(null);
const materialImage = ref(null);
const pricing = ref(0);
const selectedTimeFrame = ref(null);
const materialRepetition = ref(false);
const openingTime = ref(null);
const closingTime = ref(null);
const allTimes = ref([]);

// Extraemos funciones del composable useTime
const { timeFrames, generateAllTimes, makeMinutes } = useTime();

// Cargar las horas disponibles al montar el componente
onMounted(() => {
  allTimes.value = generateAllTimes();
});

// Computed para filtrar las horas de cierre
const filteredClosingTimes = computed(() => {
  if (!openingTime.value) return allTimes.value;
  const openingIndex = allTimes.value.indexOf(openingTime.value);
  return allTimes.value.slice(openingIndex + 1);
});

// Watch para evitar que la hora de cierre sea menor o igual que la de apertura
watch(openingTime, (newVal) => {
  if (newVal && closingTime.value && newVal >= closingTime.value) {
    closingTime.value = null;
  }
});

// Función para validar campos vacíos
const emptyFields = () => {
  return !materialName.value || !materialDescription.value || !selectedTimeFrame.value ||
    !materialImage.value || !openingTime.value || !closingTime.value;
};

// Limpiar los campos del formulario
const clearFields = () => {
  materialName.value = null;
  materialDescription.value = null;
  materialImage.value = null;
  pricing.value = 0;
  selectedTimeFrame.value = null;
  materialRepetition.value = false;
  openingTime.value = null;
  closingTime.value = null;
};

// Función para manejar la creación del material
const submit = async () => {
  if (emptyFields()) {
    toast.error('Formulario inválido');
    return;
  }

  // Descomposición de las horas y minutos de apertura y cierre
  const openingTimeInMinutes = makeMinutes(openingTime.value);
  const closingTimeInMinutes = makeMinutes(closingTime.value);

  const formData = new FormData();
  formData.append('name', materialName.value);
  formData.append('description', materialDescription.value);
  formData.append('image', materialImage.value);
  formData.append('duration', selectedTimeFrame.value);
  formData.append('admitsRepetition', materialRepetition.value);
  formData.append('opening', openingTimeInMinutes);
  formData.append('closing', closingTimeInMinutes);
  formData.append('pricing', pricing.value);

  try {
    const res = await materialService.createMaterial(formData);
    toast.success('¡Material creado con éxito!');
    clearFields();
  } catch (error) {
    console.error(error);
  }
};

// Función para volver a la vista anterior
const routerBack = () => {
  const toast = useToast();
  if (successToastId.value) {
    toast.dismiss(successToastId);
  } else {
    toast.clear();
  }
  router.go(-1);
};
</script>