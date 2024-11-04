<template>
    <v-container fluid v-if="user">
        <v-col>
            <v-row>
                <span class="text-h4">Bienvenido {{ user.name }},</span>
            </v-row>
            <v-row class="mt-12">
                <div class="d-flex flex-column ga-4">
                    <span class="text-h5">Aún no tiene reservas</span>
                    <TonalButton
                    color="blue"
                    text="Reservar"
                    size="x-large"
                    />
                </div>
            </v-row>
        </v-col>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/userStore';
import { authService } from '@/services/authService';
import TonalButton from '@/components/TonalButton.vue'

const userStore = useUserStore();
const user = ref(null);

console.log(userStore.getId);

onMounted(() => {
    getUser();
})

function getUser() {
    authService.getUser()
        .then(res => {
            userStore.setSelectedUser(res.data.user);
            user.value = res.data.user;
        })
        .catch(error => {
            console.log(error);
        });
}


</script>