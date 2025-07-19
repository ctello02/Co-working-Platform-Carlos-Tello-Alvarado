// composables/useMaterialSlots.js
import { useItemSlots } from './useItemSlots';
import { computed } from 'vue';

export function useMaterialSlots(params) {
  return useItemSlots({
    ...params,
    itemConfig: computed(() => {
      if (!params.material.value) return { id: null };
      return {
        id: params.material.value._id,
        opening: params.material.value.opening,
        closing: params.material.value.closing,
        duration: params.material.value.duration,
        capacity: Infinity,
      };
    }),
    // Los materiales no tienen asientos:
    calcUsedUnits: () => 0,
    foreignKey: 'materialId',
  });
}
