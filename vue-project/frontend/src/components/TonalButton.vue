<template>
    <v-btn :color="computedColor" variant="tonal">
        <b>{{ text }}</b>
    </v-btn>
</template>

<script>
export default {
    props: {
        text: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        }
    },
    computed: {
        computedColor() {
            const colorMap = {
                blue: '#1056bd',
                red: '#EF0107',
                grey: '#444444',
            };
            return colorMap[this.color] || this.color;
        }
    }
}
</script>
