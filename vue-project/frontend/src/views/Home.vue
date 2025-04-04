<template>
    <v-container fluid v-if="user">
        <v-col>
            <v-row>
                <span class="text-h4">Bienvenido {{ user.name }},</span>
            </v-row>
            <v-row class="mt-12">
                <div class="d-flex flex-column ga-4">
                    <span class="text-h5">Aún no tiene reservas</span>
                    <TonalButton color="blue" text="Reservar" size="x-large"
                        @click="this.$router.push('/createReservation')" />
                </div>
            </v-row>
        </v-col>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authService } from '@/services/authService';
import TonalButton from '@/components/TonalButton.vue'

const user = ref(null);

onMounted(() => {
    authService.getUser()
        .then(res => {
            user.value = res.data.user;
        })
        .catch(error => {
            console.log(error);
        });
})


</script>