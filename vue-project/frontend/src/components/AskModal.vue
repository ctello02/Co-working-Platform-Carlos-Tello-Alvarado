<template>
    <v-dialog v-model="dialogVisible" :max-width="maxWidth">
        <v-card>
            <v-card-title class="ml-2 mt-3">
                <span class="text-h5">{{ title }}</span>
            </v-card-title>

            <v-card-text>
                <v-row>
                    <span class="ml-3" :style="style" v-html="message"></span>
                </v-row>
                <v-row v-if="checkboxAction" class="mb-n4">
                    <v-checkbox v-model="isChecked" label="Borrar todas las reservas periódicas"
                        @click="handleCheckboxAction" />
                </v-row>
            </v-card-text>

            <v-fade-transition v-if="warnPaymentRefund && isChecked">
                <v-row class="mt-n8 mb-9 mx-5">
                    <v-alert type="warning" density="compact" variant="tonal">
                        Si has pagado alguna reserva periódica, se te devolverá el pago.
                    </v-alert>
                </v-row>
            </v-fade-transition>

            <v-card-actions :class="[
                checkboxAction ? 'mt-n7' : 'mt-n2',
                'mb-3 mr-3 d-flex ga-3',
                xs ? 'justify-center flex-column' : 'justify-end'
            ]">
                <TonalButton color="grey" text="Cancelar" @click="handleClose" />
                <TonalButton :color="colorButton" :text="actionText" @click="handleAction" />
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { useDisplay } from 'vuetify'
const { xs } = useDisplay()
</script>

<script>
import TonalButton from './TonalButton.vue';

export default {
    data() {
        return {
            isChecked: false,
            style: {
                color: this.colorText,
            },
        }
    },
    props: {
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        actionText: {
            type: String,
            default: "Aceptar"
        },
        colorText: {
            type: String,
            default: "#EF0107"
        },
        modelValue: {
            type: Boolean,
            required: true
        },
        closeModal: {
            type: Function,
            required: true
        },
        action: {
            type: Function,
            required: true
        },
        checkboxAction: {
            type: Function,
            required: false,
        },
        colorButton: {
            type: String,
            default: 'red'
        },
        maxWidth: {
            type: String,
            default: '450px'
        },
        warnPaymentRefund: {
            type: Boolean,
            default: false
        },
    },
    components: {
        TonalButton
    },
    computed: {
        dialogVisible: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit('update:modelValue', value);
            }
        }
    },
    watch: {
        modelValue(newVal) {
            if (newVal) {
                this.isChecked = false;
            }
        }
    },
    methods: {
        handleClose() {
            this.closeModal();
            this.dialogVisible = false;
        },
        handleAction() {
            this.action();
            this.dialogVisible = false;
        },
        handleCheckboxAction() {
            this.checkboxAction();
        },
    }
};
</script>
