<template>
    <v-container class="container">
        <v-card v-if="user" class="mx-auto" max-width="500">
            <v-card-text>
                <v-col>
                    <v-row cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon size="x-large"
                                :icon="user?.isCompany ? 'mdi-office-building-outline' : 'mdi-account-circle-outline'" />
                        </v-col>
                        <v-col>
                            <span class="ml-n1 text-h4">{{ user?.name }}</span>
                            <v-spacer />
                            <span v-if="user?.isCompany" style="color: grey;" class="text-h6">Empresa, CIF: {{ user?.cif
                                }}</span>
                            <span v-else style="color: grey;" class="text-h6">Usuario</span>
                        </v-col>
                    </v-row>

                    <v-row v-if="user?.isAdmin" cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon size="x-large" icon="mdi-account-lock-outline"></v-icon>
                        </v-col>
                        <v-col>
                            <span class="text-h6">Administrador</span>
                        </v-col>
                    </v-row>

                    <v-row cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon size="x-large" icon="mdi-email-outline"></v-icon>
                        </v-col>
                        <v-col>
                            <span class="text-h6">{{ user?.email }}</span>
                        </v-col>
                    </v-row>

                    <v-row cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon size="x-large" icon="mdi-phone-outline"></v-icon>
                        </v-col>
                        <v-col>
                            <span class="text-h6">{{ user?.phone }}</span>
                        </v-col>
                    </v-row>

                    <v-row cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon size="x-large" :icon="user?.isCompany ? 'mdi-map-marker-outline' : 'mdi-home-outline'"
                                icon="mdi-map-marker-outline"></v-icon>
                        </v-col>
                        <v-col>
                            <span class="text-h6">{{ user?.address }}</span>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>

            <v-card-actions class="mt-n3 mb-3 mr-3 d-flex justify-end ga-3">
                <v-btn v-if="this.userStore.getIsAdmin" @click="openEditUserInfo()" variant="tonal" size="small"
                    icon="mdi-pencil" />
                <v-btn v-if="this.userStore.getIsAdmin" @click="this.deleteModal = true" variant="tonal" size="small"
                    icon="mdi-trash-can-outline" />
                <TonalButton color="grey" text="Volver" @click="routerBack" />
            </v-card-actions>
        </v-card>

        <AskModal v-model="deleteModal" :title="'¿Borrar usuario?'"
            :message="'¿Estás seguro de que quieres borrar este usuario?'" :actionText="'Borrar usuario'"
            :closeModal="closeDialog" :action="deleteUser" />
    </v-container>

</template>

<script>
import { useUserStore } from '@/store/userStore';
import { userService } from '@/services/userService';
import { useToast } from 'vue-toastification';
import TonalButton from '@/components/TonalButton.vue';
import AskModal from '@/components/AskModal.vue';

export default {
    data() {
        return {
            userStore: null,
            user: null,
            deleteModal: false,
            successToastId: null,
        };
    },
    mounted() {
        this.userStore = useUserStore();
        this.user = this.userStore.getSelectedUser;

        if (!this.user) {
            this.$router.push('/users'); // Redirigir al componente padre
        }
    },
    components: {
        TonalButton,
        AskModal
    },
    methods: {
        routerBack() {
            const toast = useToast();
            if (this.successToastId) {
                toast.dismiss(this.successToastId); // Cierra el toast específico usando el ID
            } else {
                toast.clear(); // Elimina todos los toasts como respaldo
            }
            this.$router.push('/users');
        },
        openEditUserInfo() {
            this.$router.push('/editUserInfo');
        },
        closeDialog() {
            this.deleteModal = false;
        },
        deleteUser() {
            const toast = useToast();
            userService.deleteUser(this.user._id)
                .then(res => {
                    console.log(res.data);
                    this.deleteModal = false;
                    this.userStore.clearSelectedUser();
                    this.routerBack();
                    this.successToastId = toast.error('Usuario eliminado con éxito');
                })
                .catch(error => {
                    console.log(error);
                });
        }
    },
};
</script>
