import { defineStore } from 'pinia';

export const useMaterialStore = defineStore({
  id: 'material',
  state: () => ({
    _id: null,
    selectedMaterial: null, // Estado para el material seleccionado
  }),
  getters: {
    getId: (state) => state._id,
    getSelectedMaterial: (state) => state.selectedMaterial,
  },
  actions: {
    setId(id) {
      this._id = id;
      localStorage.setItem('material_id', id);
    },
    setSelectedMaterial(material) {
      this.selectedMaterial = material;
    },
    clearSelectedMaterial() {
      this.selectedMaterial = null;
    },
    clearStore() {
      this.selectedMaterial = null;
      this._id = null;
      localStorage.removeItem('material_id');
    },
  },
});
