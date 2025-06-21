<template>
    <v-container class="container">
        <v-card class="mx-auto px-3" max-width="450">
            <v-card-title class="my-3">
                <span class="text-h4">Cambia la contraseña</span>
            </v-card-title>
            <v-card-text>
                <v-col>
                    <v-row>
                        <v-text-field v-model="oldPassword" variant="outlined" label="Contraseña actual"
                            :type="oldShow ? 'text' : 'password'" prepend-icon="mdi-lock-outline"
                            :append-inner-icon="oldShow ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append-inner="oldShow = !oldShow" required class="my-1" :rules="passwordRules" />
                    </v-row>
                    <v-row>
                        <v-text-field v-model="newPassword" variant="outlined" label="Nueva contraseña"
                            :type="newShow ? 'text' : 'password'" prepend-icon="mdi-lock-outline"
                            :append-inner-icon="newShow ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append-inner="newShow = !newShow" required class="my-1" :rules="passwordRules" />
                    </v-row>
                </v-col>
            </v-card-text>
            <v-card-actions class="mb-3 mr-2 mt-n5 d-flex justify-end ga-3">
                <TonalButton text="Volver" color="grey" @click="routerBack" />
                <TonalButton color="blue" text="Cambiar contraseña" @click="submit" :disabled="emptyFields()" />
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script>
import TonalButton from '@/components/TonalButton.vue';
import { useUserStore } from '@/store/userStore';
import { authService } from '@/services/authService';
import { useToast } from 'vue-toastification';

export default {
    data() {
        return {
            userStore: null,
            oldPassword: "",
            oldShow: false,
            newPassword: "",
            newShow: false,
            passwordRules: [
                v => !!v || 'La contraseña es requerida',
                v => v.length >= 8 || 'La contraseña debe tener al menos 8 caracteres',
                v => /[A-Z]/.test(v) || 'La contraseña debe incluir al menos una letra mayúscula',
                v => /[a-z]/.test(v) || 'La contraseña debe incluir al menos una letra minúscula',
                v => /\d/.test(v) || 'La contraseña debe incluir al menos un número',
            ],
        };
    },
    mounted() {
        this.userStore = useUserStore();
    },
    components: {
        TonalButton
    },
    methods: {
        differentPasswords() {
            return this.oldPassword === this.newPassword;
        },
        emptyFields() {
            // Verificar que los campos no estén vacíos y que cumplan las reglas de validación
            const oldPasswordValid = this.passwordRules.every(rule => rule(this.oldPassword) === true);
            const newPasswordValid = this.passwordRules.every(rule => rule(this.newPassword) === true);
            return !(this.oldPassword && this.newPassword && oldPasswordValid && newPasswordValid);
        },
        async submit() {
            if (this.differentPasswords()) {
                useToast().error('La nueva contraseña no puede ser la misma que la actual');
                return;
            }
            const toast = useToast();
            console.log(this.oldPassword, this.newPassword, this.userStore.getId);

            authService.changePassword(this.oldPassword, this.newPassword, this.userStore.getId)
                .then(res => {
                    console.log(res.data);
                    toast.success("Contraseña cambiada correctamente");
                    this.userStore.clearStore();
                    this.$router.push('/login');
                })
                .catch(error => {
                    if (error.response && error.response.status === 401) {
                        toast.error("Contraseña actual incorrecta");
                    }
                    console.log(error);
                });
        },
        routerBack() {
            this.$router.push('/Profile');
        },
    }
};
</script>

<style scoped>
.cta-btn {
    font-weight: bold;
    text-transform: uppercase;
}

.custom-disabled-btn:disabled {
    background-color: #bfbfbf;
    color: white !important;
    cursor: not-allowed;
    opacity: 1;
    border: 1px solid #bbb;
}
</style>