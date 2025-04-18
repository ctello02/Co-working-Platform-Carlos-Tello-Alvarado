<template>
    <v-dialog v-model="dialogVisible" max-width="450px">
        <v-card>
            <v-card-title class="ml-2 mt-3">
                <span class="text-h5">{{ title }}</span>
            </v-card-title>

            <v-card-text>
                <v-row>
                    <span class="ml-3" :style="style" v-html="message"></span>
                </v-row>
                <v-row v-if="checkboxAction" class="mb-n4">
                    <v-checkbox label="Borrar todas las reservas periódicas" @click="handleCheckboxAction" />
                </v-row>
            </v-card-text>

            <v-card-actions :class="checkboxAction ? 'mt-n7' : 'mt-n2'" class="mb-3 mr-3 d-flex justify-end ga-3">
                <TonalButton color="grey" text="Cancelar" @click="handleClose" />
                <TonalButton :color="colorButton" :text="actionText" @click="handleAction" />
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import TonalButton from './TonalButton.vue';

export default {
    data() {
        return {
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
