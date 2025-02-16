<template>
    <SpaceCard
        :space="this.space"
        :adminActions="userStore.getIsAdmin"
        :cardActions="true"
        @go-back="routerBack"
        @reserve="createReservation"
        @edit-space="openEditSpaceInfo"
        @delete-space="deleteSpace"
    />
</template>

<script>
import { useUserStore } from '@/store/userStore';
import { useSpaceStore } from '@/store/spaceStore';
import { useReservationStore } from '@/store/reservationStore';
import { spaceService } from '@/services/spaceService';
import TonalButton from '@/components/TonalButton.vue'
import AskModal from '@/components/AskModal.vue';
import SpaceCard from '@/components/SpaceCard.vue';

export default {
    data() {
        return {
            spaceStore: null,
            space: null,
            deleteModal: false,

            openingTime: null,
            closingTime: null,
        };
    },
    components: {
        SpaceCard,
        TonalButton,
        AskModal
    },
    computed: {
        userStore() {
            return useUserStore();
        },
    },
    mounted() {
        this.spaceStore = useSpaceStore();
        this.space = this.spaceStore.getSelectedSpace;

        if (!this.space) {
            this.$router.push('/spaces'); // Redirigir al componente padre
        }

        // this.openingTime = this.makeHoursAndMinutes(this.space?.opening);
        // this.closingTime = this.makeHoursAndMinutes(this.space?.closing);

    },
    methods: {
        closeDialog() {
            this.deleteModal = false;
        },
        routerBack() {
            this.$router.push('/spaces');
        },
        openEditSpaceInfo() {
            this.$router.push('/editSpaceInfo');
        },
        createReservation() {
            this.$router.push('/createReservation');
        },
        deleteSpace() {
            spaceService.deleteSpace(this.space._id)
            .then(res => {
                console.log(res.data);
                this.deleteModal = false;
                this.spaceStore.clearSelectedSpace();
                this.routerBack();
            })
            .catch(error => {
                console.log(error);
            });
        },
        makeHoursAndMinutes(minutes) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;

            // Formatea con ceros a la izquierda
            const formattedHours = String(hours).padStart(2, '0');
            const formattedMinutes = String(mins).padStart(2, '0');

            return `${formattedHours}:${formattedMinutes}`;
        },
    },
};
</script>
