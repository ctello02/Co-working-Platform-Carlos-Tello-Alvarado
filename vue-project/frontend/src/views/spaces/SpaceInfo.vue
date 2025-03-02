<template>
    <SpaceCard :space="space" :adminActions="userStore.getIsAdmin" :reserveActions="true" @go-back="routerBack"
        @reserve="createReservation" @edit-space="openEditSpaceInfo" @delete-space="deleteSpace" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { useSpaceStore } from '@/store/spaceStore';
import { spaceService } from '@/services/spaceService';
import SpaceCard from '@/components/SpaceCard.vue';

const router = useRouter();
const userStore = useUserStore();
const spaceStore = useSpaceStore();

const space = ref(null);
const deleteModal = ref(false);

onMounted(() => {
    space.value = spaceStore.getSelectedSpace;
    if (!space.value) {
        router.push('/spaces');
    }
});

function routerBack() {
    router.push('/spaces');
}

function openEditSpaceInfo() {
    router.push('/editSpaceInfo');
}

function createReservation() {
    router.push('/createReservation');
}

function deleteSpace() {
    spaceService
        .deleteSpace(space.value._id)
        .then((res) => {
            console.log(res.data);
            deleteModal.value = false;
            spaceStore.clearSelectedSpace();
            routerBack();
        })
        .catch((error) => {
            console.log(error);
        });
}
</script>