<template>
    <v-tooltip 
        :text="tooltipText" 
        location="bottom"
        max-width="300"
        open-delay="250"
    >
        <template v-slot:activator="{ props }">
            <v-card 
                v-bind="props"
                @click="handleAction"
                :ripple="false"
            >
                <v-card-title class="my-1">
                    <span class="text-h5">{{title}}</span>
                </v-card-title>
                <v-img
                    :src="imageSrc"
                    :class="classStyle"
                    height="250px"
                />
            </v-card>
        </template>
    </v-tooltip>
</template>
<script>
export default {
    props: {
        tooltipText: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        imageSrc: {
            type: String,
            required: true
        },
        classStyle: {
            type: String,
            required: true
        },
        action: {
            type: Function,
            required: true
        }
    },
    methods: {
        handleAction() {
            this.action();
        }
    }
}

</script>