import { defineStore } from "pinia";

export const useSpaceStore = defineStore({
    id: "space",
    state: () => ({
        _id: localStorage.getItem("space_id") || null,
        selectedSpace: null, // Estado para el espacio seleccionado
    }),
    getters: {
        getId() {
            return this._id;
        },
        getSelectedSpace() {
            return this.selectedSpace;
        }
    },
    actions: {
        setId(id) {
            this._id = id;
            localStorage.setItem('space_id', id); // Sincronizar con localStorage
        },
        setSelectedSpace(space) {
            this.selectedSpace = space;
        },
        clearSelectedSpace() {
            this.selectedSpace = null;
        },
        clearSpace() {
            this.selectedSpace = null;
            localStorage.clear();
        },
    },
});
