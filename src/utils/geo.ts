export function calcularDistanciaKm(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
    const R = 6371; // Radio de la tierra en km
    const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
    const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(coord1.lat * Math.PI / 180) *
      Math.cos(coord2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  export function estaDentroDeHorario(horarios: any[]): boolean {
    const ahora = new Date();
    const diaActual = ahora.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    const horaActual = ahora.toTimeString().slice(0, 5); // HH:MM
  
    return horarios.some((h) =>
      h.dia.toLowerCase() === diaActual &&
      h.desde <= horaActual &&
      h.hasta >= horaActual
    );
  }
  