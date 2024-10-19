<template>
    <v-container class="pa-10 container">
        <!-- Modal de edición -->
        <v-card>
            <v-card-title>
                <span class="text-h5">Editar usuario</span>
            </v-card-title>

            <v-card-text v-if="user">
                <v-form>
                    <v-text-field v-model="user.name" label="Nombre" required></v-text-field>
                    <v-text-field v-model="user.email" label="E-mail" required></v-text-field>
                    <v-text-field v-model="user.phone" label="Teléfono" required></v-text-field>
                    <v-text-field v-model="user.address" label="Dirección" required></v-text-field>

                    <v-radio-group v-model="user.isCompany" label="¿Es empresa?">
                        <v-radio label="Si" :value="true"></v-radio>
                        <v-radio label="No" :value="false"></v-radio>
                    </v-radio-group>

                    <v-text-field v-if="user.isCompany" v-model="user.cif" label="CIF" required></v-text-field>

                    <v-radio-group v-model="user.isAdmin" label="Usuario administrador">
                        <v-radio label="Si" :value="true"></v-radio>
                        <v-radio label="No" :value="false"></v-radio>
                    </v-radio-group>
                </v-form>

                <v-fade-transition>
                    <v-alert v-if="success" type="success" border="left">
                        ¡Usuario actualizado con éxito!
                    </v-alert>
                </v-fade-transition>
            </v-card-text>


            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="routerBack">Volver</v-btn>
                <v-btn color="primary" @click="updateUser">Guardar</v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>	

<script>
import { useUserStore } from '@/store/userStore';
import { userService } from '@/services/userService';

export default {
    data() {
        return {
            userStore: null,
            user: null,
            success: false,
        };
    },
    mounted() {
        this.userStore = useUserStore();
        this.user = this.userStore.getSelectedUser;        
    },
    methods: {
        routerBack() {
            this.$router.push('/userInfo');
        },
        updateUser() {
            if (this.user.isCompany == false) {
                this.user.cif = null;
            }

            userService.updateUser(this.user)
                .then(res => {
                    console.log(res.data);
                    this.userStore.setSelectedUser(this.user);
                    this.user = this.userStore.getSelectedUser;
                    // Mostrar la alerta de éxito y ocultarla después de 3 segundos
                    this.success = true;
                    setTimeout(() => {
                        this.success = false;
                    }, 3000); // 3 segundos
                })
                .catch(error => {
                    console.log(error);
                });
        },
    },
}

</script>

<style scoped>
.container {
    max-width: 700px;
    margin: 0 auto;
}
</style>