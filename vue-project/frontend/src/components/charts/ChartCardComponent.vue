<template>
    <v-row class="mb-8">
        <v-col>
            <v-card class="pa-4" style="width: 100%">
                <template v-if="title">
                    <v-card-title>
                        <span class="text-h5">{{ title }}</span>
                    </v-card-title>
                </template>
                <v-card-text class="my-2">
                    <slot />
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup>
const props = defineProps({
    title: { type: String, default: "" }
})
</script>
