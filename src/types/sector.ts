export interface Horario {
  dia: string;
  desde: string;
  hasta: string;
}

export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface Sector {
  nombre: string;
  direccion: string;
  coordenadas: Coordenadas;
  horarios: Horario[];
}
