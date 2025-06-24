<template>
    <SpaceCard :space="space" :adminActions="userStore.getIsAdmin" :reserveActions="true" @go-back="routerBack"
        @reserve="toCreateReservation" @edit-space="openEditSpaceInfo" @delete-space="deleteSpace" />

    <AskModal v-model="bulkDeleteModal" :maxWidth="'600px'" :title="'Este espacio tiene reservas pendientes'"
        :message="'Este espacio tiene reservas pendientes, ¿Estás seguro de que quieres borrarlo?'"
        :actionText="'Borrar espacio'" :closeModal="() => bulkDeleteModal = false" :action="bulkDeleteSpace" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { useSpaceStore } from '@/store/spaceStore';
import { spaceService } from '@/services/spaceService';
import SpaceCard from '@/components/SpaceCard.vue';
import AskModal from '@/components/AskModal.vue';

const router = useRouter();
const userStore = useUserStore();
const spaceStore = useSpaceStore();

const space = ref(null);
const bulkDeleteModal = ref(false);

onMounted(() => {
    space.value = spaceStore.getSelectedSpace;
    if (!space.value) {
        router.push('/spaces');
    }
});

function deleteSpace() {
    spaceService
        .deleteSpace(space.value._id)
        .then((res) => {
            spaceStore.clearSelectedSpace();
            routerBack();
        })
        .catch((error) => {
            console.log(error);
            if (error.response.status === 409) {
                bulkDeleteModal.value = true;
            }
        });
}

function bulkDeleteSpace() {
    spaceService.bulkDeleteSpace(space.value._id)
        .then(res => {
            bulkDeleteModal.value = false;
            routerBack();
        })
        .catch(error => {
            console.log(error);
        });
};


function routerBack() {
    router.push('/spaces');
}

function openEditSpaceInfo() {
    router.push('/editSpaceInfo');
}

function toCreateReservation() {
    router.push('/createReservation');
}
</script>