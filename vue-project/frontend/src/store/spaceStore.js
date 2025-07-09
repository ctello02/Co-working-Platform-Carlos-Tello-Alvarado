import { defineStore } from 'pinia';

export const useSpaceStore = defineStore({
  id: 'space',
  state: () => ({
    _id: null,
    selectedSpace: null, // Estado para el espacio seleccionado
  }),
  getters: {
    getId: (state) => state._id,
    getSelectedSpace: (state) => state.selectedSpace,
  },
  actions: {
    setId(id) {
      this._id = id;
      localStorage.setItem('space_id', id);
    },
    setSelectedSpace(space) {
      this.selectedSpace = space;
    },
    clearSelectedSpace() {
      this.selectedSpace = null;
    },
    clearStore() {
      this.selectedSpace = null;
      this._id = null;
      localStorage.removeItem('space_id');
    },
  },
});
