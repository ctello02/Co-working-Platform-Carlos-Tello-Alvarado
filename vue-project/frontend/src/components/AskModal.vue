<template>
    <v-dialog v-model="dialogVisible" max-width="450px">
        <v-card>
            <v-card-title class="ml-2 mt-3">
                <span class="text-h4">{{ title }}</span>
            </v-card-title>

            <v-card-text>
                <v-row>
                    <span class="ml-3 text-h6" style="color: #EF0107;">{{ message }}</span>
                </v-row>
            </v-card-text>

            <v-card-actions class="mt-n2 mb-3 mr-3 d-flex justify-end ga-3">
                <v-btn
                    color="#444444"
                    variant="tonal"
                    @click="handleClose"
                ><b>Cancelar</b></v-btn>
                <v-btn
                    color="#EF0107"
                    variant="tonal"
                    @click="handleAction"
                ><b>{{ actionText }}</b></v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
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
        }
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
        }
    }
};
</script>
