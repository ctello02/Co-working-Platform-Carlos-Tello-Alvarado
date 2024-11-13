<template>
    <v-container class="pa-5 container">
        <v-card class="mx-auto" :max-width="max_width">
            <v-card-title class="mt-4">
                <span class="ml-3 text-h4">{{text}} no encontrado</span>
            </v-card-title>
            <v-card-text >
                <span class="ml-3 text-h6">Por favor vuelva atrás</span>
            </v-card-text>
            <v-card-actions class="mt-n2 mb-4">
                <v-spacer></v-spacer>
                <TonalButton
                    class="mr-4"
                    color="grey"
                    text="Volver"
                    @click="routerBack" 
                />               
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script>
import TonalButton from './TonalButton.vue';

export default {
    name: 'InfoNotFound',
    components:{
        TonalButton
    },
    props: {
        max_width:{
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        routeBack: {
            type: String,
            required: true
        }
    },
    methods: {
        routerBack() {
            this.$router.push(this.routeBack);
        }
    },
}
</script>