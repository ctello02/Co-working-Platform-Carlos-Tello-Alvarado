// composables/useSpaceSlots.js
import { useItemSlots } from './useItemSlots';
import { computed } from 'vue';

export function useSpaceSlots(params) {
  return useItemSlots({
    ...params,
    itemConfig: computed(() => {
      if (!params.space.value) return { id: null };
      return {
        id: params.space.value._id,
        opening: params.space.value.opening,
        closing: params.space.value.closing,
        duration: params.space.value.duration,
        capacity: params.space.value.seats,
      };
    }),
    calcUsedUnits: (r, t) => r.seatsReserved,
    foreignKey: 'spaceId',
  });
}
