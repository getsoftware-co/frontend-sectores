import { useEffect, useState } from 'react';
import CrearSector from './CrearSector';
import ListarSectores from './ListarSectores';
import axios from 'axios';
import { Sector } from '../types/sector';

const Home = () => {
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [ubicacionUsuario, setUbicacionUsuario] = useState<{ lat: number; lng: number } | null>(null);
  const [sectoresDisponibles, setSectoresDisponibles] = useState<Sector[]>([]);

  // Obtener sectores al cargar
  const fetchSectores = async () => {
    try {
      const res = await axios.get<Sector[]>('http://localhost:3000/api/sectores');
      setSectores(res.data);
    } catch (error) {
      console.error('Error al obtener los sectores', error);
    }
  };

  // Obtener ubicación del usuario
  const obtenerUbicacion = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUbicacionUsuario({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('No se pudo obtener la ubicación:', error);
      }
    );
  };

  // Calcular distancia con fórmula Haversine
  const calcularDistanciaKm = (coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // km

    const dLat = toRad(coord2.lat - coord1.lat);
    const dLng = toRad(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Validar si sector está en horario activo
  const estaEnHorario = (sector: Sector) => {
    const hoy = new Date();
    const diaActual = hoy.toLocaleDateString('es-CO', { weekday: 'long' });
    const horaActual = hoy.toTimeString().slice(0, 5);

    return sector.horarios.some(horario =>
      horario.dia.toLowerCase() === diaActual.toLowerCase() &&
      horario.desde <= horaActual &&
      horaActual <= horario.hasta
    );
  };

  // Filtrar sectores por cercanía y horario
  const filtrarSectoresDisponibles = () => {
    if (!ubicacionUsuario) return;

    const filtrados = sectores.filter(sector => {
      const distancia = calcularDistanciaKm(ubicacionUsuario, sector.coordenadas);
      return distancia <= 5 && estaEnHorario(sector);
    });

    setSectoresDisponibles(filtrados);
  };

  useEffect(() => {
    fetchSectores();
    obtenerUbicacion();
  }, []);

  useEffect(() => {
    if (ubicacionUsuario && sectores.length > 0) {
      filtrarSectoresDisponibles();
    }
  }, [ubicacionUsuario, sectores]);

  return (
    <div className="space-y-12 max-w-5xl mx-auto p-4">
      <CrearSector />
      <hr className="my-8" />
      <ListarSectores />
      <hr className="my-8" />

      <section>
        <h2 className="text-2xl font-bold mb-4">Sectores Disponibles en tu Zona</h2>
        {ubicacionUsuario ? (
          sectoresDisponibles.length > 0 ? (
            <ul className="list-disc list-inside">
              {sectoresDisponibles.map((sector, i) => (
                <li key={i}>
                  <strong>{sector.nombre}</strong> - {sector.direccion}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay servicios disponibles en tu zona en este momento.</p>
          )
        ) : (
          <p>Obteniendo tu ubicación...</p>
        )}
      </section>
    </div>
  );
};

export default Home;
