<template>
    <MaterialCard :material="material" :adminActions="userStore.getIsAdmin" :reserveActions="true" @go-back="routerBack"
        @reserve="toCreateReservation" @edit-material="openEditMaterialInfo" @delete-material="deleteMaterial" />

    <AskModal v-model="bulkDeleteModal" :maxWidth="'600px'" :title="'Este material tiene reservas pendientes'"
        :message="'Este material tiene reservas pendientes, ¿Estás seguro de que quieres borrarlo?'"
        :actionText="'Borrar material'" :closeModal="() => bulkDeleteModal = false" :action="bulkDeleteMaterial" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { useMaterialStore } from '@/store/materialStore';
import { materialService } from '@/services/materialService';
import MaterialCard from '@/components/MaterialCard.vue';
import AskModal from '@/components/AskModal.vue';

const router = useRouter();
const userStore = useUserStore();
const materialStore = useMaterialStore();

const material = ref(null);
const bulkDeleteModal = ref(false);

onMounted(() => {
    material.value = materialStore.getSelectedMaterial;
    if (!material.value) {
        router.push('/materials');
    }
});

function deleteMaterial() {
    materialService
        .deleteMaterial(material.value._id)
        .then((res) => {
            materialStore.clearSelectedMaterial();
            routerBack();
        })
        .catch((error) => {
            console.log(error);
            if (error.response.status === 409) {
                bulkDeleteModal.value = true;
            }
        });
}

function bulkDeleteMaterial() {
    materialService.bulkDeleteMaterial(material.value._id)
        .then(res => {
            bulkDeleteModal.value = false;
            routerBack();
        })
        .catch(error => {
            console.log(error);
        });
};


function routerBack() {
    router.push('/materials');
}

function openEditMaterialInfo() {
    router.push('/editMaterialInfo');
}

function toCreateReservation() {
    router.push('/createReservation');
}
</script>