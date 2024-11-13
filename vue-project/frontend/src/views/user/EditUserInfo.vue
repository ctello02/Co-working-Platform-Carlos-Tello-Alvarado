<template>
    <v-container class="pa-5 container">
        <v-card v-if="user" class="mx-auto pa-3" max-width="500">
            <v-card-title class="my-2">
                <span class="text-h4">Editar usuario</span>
            </v-card-title>
            <v-card-text>
                <v-form ref="form">
                    <v-text-field 
                        v-model="newUser.name"
                        type="text"
                        variant="outlined"
                        label="Nombre" 
                        :prepend-icon="newUser?.isCompany? 'mdi-office-building-outline': 'mdi-account-circle-outline'"
                        required
                        :rules="nameRules"
                        class="my-2"
                    />

                    <v-text-field 
                        v-model="newUser.email"
                        variant="outlined" 
                        label="E-mail" 
                        prepend-icon="mdi-email-outline"
                        required
                        :rules="emailRules"
                        class="my-2"
                    />
            
                    <v-text-field
                        v-model="newUser.phone"
                        variant="outlined"
                        label="Teléfono"
                        prepend-icon="mdi-phone-outline"
                        required
                        :rules="phoneRules"
                        class="my-2"
                    />

                    <v-text-field
                        v-model="newUser.address"
                        variant="outlined"
                        label="Dirección"
                        :prepend-icon="newUser?.isCompany? 'mdi-map-marker-outline': 'mdi-home-outline'"
                        required
                        :rules="addressRules"
                        class="my-2"
                    />

                        
                    <v-row class="">
                        <v-col>
                            <v-radio-group v-model="newUser.isCompany" label="¿Es empresa?">
                                <v-radio label="Si" :value="true"></v-radio>
                                <v-radio label="No" :value="false"></v-radio>
                            </v-radio-group>
                        </v-col>
                        <v-col>
                            <v-radio-group v-model="newUser.isAdmin" label="Usuario administrador">
                                <v-radio label="Si" :value="true"></v-radio>
                                <v-radio label="No" :value="false"></v-radio>
                            </v-radio-group>
                        </v-col>
                    </v-row>

                    <v-text-field
                        v-if="newUser.isCompany"
                        variant="outlined"
                        v-model="newUser.cif"
                        label="CIF"
                        required
                        :rules="cifRules"
                        class="mt-n5 mb-2"
                    />
                </v-form>

                <v-fade-transition >
                    <v-alert class="mt-n4 mb-5" v-if="success" type="success" border="left">
                        ¡Usuario actualizado con éxito!
                    </v-alert>
                </v-fade-transition>
            </v-card-text>

            <v-card-actions class="mt-n8 mr-2 d-flex justify-end ga-3">
                <TonalButton 
                    color="grey" 
                    text="Volver" 
                    @click="routerBack"
                />
                <TonalButton 
                    color="blue" 
                    text="Guardar" 
                    @click="submit" 
                    :disabled="camposVacios()"
                />
            </v-card-actions>
        </v-card>

        <InfoNotFound v-else max_width="500" text="Usuario" routeBack="/users"/>

    </v-container>
</template>

<script>
import { useUserStore } from '@/store/userStore';
import { userService } from '@/services/userService';
import TonalButton from '@/components/TonalButton.vue';
import InfoNotFound from '@/components/InfoNotFound.vue';

export default {
    data() {
        return {
            userStore: null,
            user: null,
            newUser: null,
            success: false,
            nameRules : [
                v => !!v || 'El nombre es requerido',
            ],
            emailRules : [
                v => !!v || 'El email es obligatorio',
                v => /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/i.test(v) || 'El email debe ser válido',
            ],
            phoneRules : [
                v => !!v || 'El teléfono de contacto es requerido',
                v => /^[6-9]\d{8}$/.test(v) || 'El teléfono debe tener 9 dígitos y empezar con un número válido (6-9)',
            ],
            addressRules : [
                v => !!v || 'La dirección es requerida',
            ],
            cifRules : [
                v => !!v || 'El CIF es requerido',
                v => /^[A-HJNP-SUVW]\d{7}[A-J]$/i.test(v) || 'El CIF debe ser válido y comenzar con una letra válida',
            ],
        };
    },
    components:{
        TonalButton,
        InfoNotFound
    },
    mounted() {
        this.userStore = useUserStore();
        this.user = this.userStore.getSelectedUser; 
        this.newUser = { ...this.user };    // Hacer una copia del objeto user
    },
    methods: {
        routerBack() {
            this.$router.push('/userInfo');
        },
        camposVacios() {
            // Verificar que los campos no estén vacíos y que cumplan las reglas de validación
            const nameValid = this.nameRules.every(rule => rule(this.newUser.name) === true);
            const emailValid = this.emailRules.every(rule => rule(this.newUser.email) === true);
            const phoneValid = this.phoneRules.every(rule => rule(this.newUser.phone) === true);
            const addressValid = this.addressRules.every(rule => rule(this.newUser.address) === true);
            const cifValid = this.cifRules.every(rule => rule(this.newUser.cif) === true);

            if (this.newUser.isCompany) {
                return !(this.newUser.name && this.newUser.email && this.newUser.cif && this.newUser.phone && this.newUser.address && nameValid && emailValid &&  phoneValid &&  addressValid && cifValid);
            }
            return !(this.newUser.name && this.newUser.email && this.newUser.phone && this.newUser.address && nameValid && emailValid &&  phoneValid &&  addressValid);
        },
        async submit() {
            if (this.$refs.form.validate()) {
                if (this.newUser.isCompany === false) {
                    this.newUser.cif = null;
                }

                userService.updateUser(this.newUser)
                    .then(res => {
                        console.log(res.data);
                        const newUserSelected = { ...this.newUser };
                        this.userStore.setSelectedUser(newUserSelected);
                        // Mostrar la alerta de éxito y ocultarla después de 3 segundos
                        this.success = true;
                        setTimeout(() => {
                            this.success = false;
                        }, 3000);
                    })
                    .catch(error => {
                        console.log(error);
                    });
                
            }else {
                console.log('Formulario inválido');
            }
        },
    },
}
</script>

<style scoped>
.container {
    max-width: 700px;
    margin: 0 auto;
}

.title {
  font-weight: bold;
  margin-bottom: 20px;
}
</style>