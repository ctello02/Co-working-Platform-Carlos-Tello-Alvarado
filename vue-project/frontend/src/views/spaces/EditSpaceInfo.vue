<template>
  <v-container class="container">
    <v-card v-if="space" class="mx-auto" max-width="600">
      <v-img :src="imgSrc" color="surface-variant" :height="smAndDown ? '150px' : '300px'" cover class="img-container"
        @click="triggerFileInput" style="cursor: pointer; border: 0; border-radius: 0">
        <v-icon class="mdi-camera camera-icon">mdi-camera</v-icon>
        <span class="d-flex justify-center " v-if="smAndDown" style="background-color: rgba(0, 0, 0, 0.5);">Cambiar
          imagen</span>
        <input type="file" ref="fileInput" accept="image/*" @change="onFileChange" style="display: none" />
      </v-img>

      <v-card-text>
        <v-col>
          <v-row>
            <v-col :cols="smAndDown ? 12 : ''">
              <v-text-field v-model="newSpace.name" label="Nombre" variant="outlined" required
                :density="smAndDown ? 'compact' : 'default'" :rules="[v => !!v || 'El texto es requerido']"
                class="my-n1" />
            </v-col>
            <v-col :cols="smAndDown ? 12 : 4">
              <v-text-field suffix="€" v-model.number="newSpace.pricing" label="Precio de reserva"
                prepend-icon="mdi-hand-coin-outline" type="number" variant="outlined" required
                @input="newSpace.pricing = Math.max(0, newSpace.pricing)" class="my-n1"
                :density="smAndDown ? 'compact' : 'default'" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field v-model="newSpace.description" label="Descripción" variant="outlined"
                prepend-icon="mdi-text" required :rules="[v => !!v || 'El texto es requerido']" class="my-n1"
                :density="smAndDown ? 'compact' : 'default'" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field v-model.number="newSpace.seats" label="Número de asientos" prepend-icon="mdi-table-chair"
                type="number" variant="outlined" required :rules="[v => !!v || 'El campo es obligatorio']"
                @input="newSpace.seats = Math.max(0, newSpace.seats)" class="my-n1"
                :density="smAndDown ? 'compact' : 'default'" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select v-model="selectedTimeFrame" :items="timeFrames" item-title="label" item-value="value"
                label="Duración de las reservas" prepend-icon="mdi-clock-outline"
                :rules="[v => !!v || 'El campo es obligatorio']" variant="outlined" class="my-n1"
                :density="smAndDown ? 'compact' : 'default'" />
            </v-col>
          </v-row>
          <v-row class="mt-1">
            <v-col>
              <span v-if="smAndDown" class="">¿Permite repetición de reservas?</span>
              <v-radio-group inline prepend-icon="mdi-repeat" v-model="newSpace.admitsRepetition"
                :label="smAndDown ? '' : '¿Permite repetición de reservas?'">
                <v-radio label="Si" :value="true" />
                <v-radio label="No" :value="false" />
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="mt-n1">
            <v-col :cols="smAndDown ? 12 : ''">
              <v-select v-model="openingTime" variant="outlined" :items="allTimes" label="Hora de apertura"
                prepend-icon="mdi-weather-sunny" :density="smAndDown ? 'compact' : 'default'" />
            </v-col>
            <v-col :cols="smAndDown ? 12 : ''">
              <v-select v-model="closingTime" variant="outlined" :items="filteredClosingTimes" label="Hora de cierre"
                prepend-icon="mdi-weather-night" :disabled="!openingTime"
                :density="smAndDown ? 'compact' : 'default'" />
            </v-col>
          </v-row>
        </v-col>
      </v-card-text>

      <v-card-actions class="mt-n8 mb-5 mr-5 d-flex justify-end ga-3">
        <TonalButton color="grey" text="Volver" @click="routerBack" />
        <TonalButton color="blue" text="Guardar" @click="submit" :disabled="emptyFields()" />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useSpaceStore } from '@/store/spaceStore';
import { spaceService } from '@/services/spaceService';
import TonalButton from '@/components/TonalButton.vue';

import { useTime } from '@/composables/useTime';

import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()

const { appContext } = getCurrentInstance();
const resolve = appContext.config.globalProperties.$resolve;

const router = useRouter();
const successToastId = ref(null);
const toast = useToast();
const spaceStore = useSpaceStore();


const space = ref(null);
const newSpace = ref(null);
const newImage = ref(null);
const isNewImage = ref(false);
const previewUrl = ref(null);
const selectedTimeFrame = ref(null);
const openingTime = ref(null);
const closingTime = ref(null);
const fileInput = ref(null);
const allTimes = ref([]);

const {
  timeFrames,
  generateAllTimes,
  makeMinutes,
  makeHoursAndMinutes
} = useTime();

onMounted(() => {
  allTimes.value = generateAllTimes();
  space.value = spaceStore.getSelectedSpace;

  if (!space.value) {
    router.push('/spaces');
  }

  newSpace.value = { ...space.value };
  openingTime.value = makeHoursAndMinutes(space.value?.opening);
  closingTime.value = makeHoursAndMinutes(space.value?.closing);
  selectedTimeFrame.value = space.value?.duration;
});

const filteredClosingTimes = computed(() => {
  if (!openingTime.value) return allTimes.value;
  const openingIndex = allTimes.value.indexOf(openingTime.value);
  return allTimes.value.slice(openingIndex + 1);
});

const imgSrc = computed(() => {
  if (isNewImage.value && previewUrl.value) return previewUrl.value;
  return resolve(newSpace.value?.image);
});

watch(openingTime, (newVal) => {
  if (newVal && closingTime.value && newVal >= closingTime.value) {
    closingTime.value = null;
  }
});

const triggerFileInput = () => {
  fileInput.value.click();
};

const onFileChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
  const maxMB = 2;
  if (!ok) { toast.error('Formato no permitido (JPG/PNG/WebP)'); return; }
  if (file.size > maxMB * 1024 * 1024) { toast.error(`Máximo ${maxMB}MB`); return; }

  isNewImage.value = true;
  newImage.value = file;

  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = URL.createObjectURL(file);
};

const emptyFields = () => {
  return !newSpace.value.name || !newSpace.value.description || !newSpace.value.seats ||
    !selectedTimeFrame.value || !openingTime.value || !closingTime.value;
};

const submit = async () => {
  if (emptyFields()) {
    toast.error('Formulario inválido');
    return;
  }

  newSpace.value.opening = makeMinutes(openingTime.value);
  newSpace.value.closing = makeMinutes(closingTime.value);
  newSpace.value.duration = parseFloat(selectedTimeFrame.value);

  const formData = new FormData();
  formData.append('id', newSpace.value._id);
  formData.append('name', newSpace.value.name);
  formData.append('description', newSpace.value.description);
  formData.append('seats', newSpace.value.seats);
  formData.append('admitsRepetition', newSpace.value.admitsRepetition);
  formData.append('opening', newSpace.value.opening);
  formData.append('closing', newSpace.value.closing);
  formData.append('duration', newSpace.value.duration);
  formData.append('pricing', newSpace.value.pricing);

  if (isNewImage.value && newImage.value) {
    formData.append('image', newImage.value);
  }

  try {
    const res = await spaceService.updateSpace(formData);
    toast.success('¡Espacio actualizado con éxito!');
    newSpace.value = res.data;
    spaceStore.setSelectedSpace(res.data);
    router.go(-1);
  } catch (error) {
    console.error(error);
  }
};

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
