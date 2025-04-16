import { create } from 'zustand';
import axios from 'axios';
import { Sector } from '../types/sector';

interface SectoresState {
  sectores: Sector[];
  fetchSectores: () => Promise<void>;
}

export const useSectoresStore = create<SectoresState>((set) => ({
  sectores: [],
  fetchSectores: async () => {
    try {
      const res = await axios.get<Sector[]>('http://localhost:3000/api/sectores');
      set({ sectores: res.data });
    } catch (error) {
      console.error('Error al cargar sectores', error);
    }
  },
}));

export {};

