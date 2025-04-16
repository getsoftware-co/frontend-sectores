import { useEffect, useState } from 'react';
import axios from 'axios';
import { Sector } from '../types/sector';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { calcularDistanciaKm, estaDentroDeHorario } from '../utils/geo';

const containerStyle = {
  width: '100%',
  height: '300px',
};

const ListarSectores = () => {
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [ubicacionUsuario, setUbicacionUsuario] = useState<{ lat: number; lng: number } | null>(null);
  const [cargando, setCargando] = useState(true);
  const [sectoresFiltrados, setSectoresFiltrados] = useState<Sector[]>([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''
  });

  // 1. Obtener ubicación del usuario
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacionUsuario({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => {
        console.error('No se pudo obtener la ubicación', err);
        alert('No se pudo obtener tu ubicación actual.');
      }
    );
  }, []);

  // 2. Traer sectores desde el backend
  useEffect(() => {
    const fetchSectores = async () => {
      try {
        const res = await axios.get<Sector[]>('http://localhost:3000/api/sectores');
        setSectores(res.data);
      } catch (error) {
        console.error('Error al obtener los sectores', error);
      } finally {
        setCargando(false);
      }
    };

    fetchSectores();
  }, []);

  useEffect(() => {
    if (!ubicacionUsuario || sectores.length === 0) return;
  
      const filtrados = sectores.filter((sector) => {

        if (!sector.coordenadas || typeof sector.coordenadas.lat !== 'number' || typeof sector.coordenadas.lng !== 'number') {
          console.warn(`⚠️ Coordenadas inválidas para el sector: ${sector.nombre}`);
          return false;
        }

        
      const distancia = calcularDistanciaKm(ubicacionUsuario, sector.coordenadas);
      console.log(`✅ Evaluando sector ${sector.nombre}: distancia = ${distancia.toFixed(2)} km`);

      const disponible = estaDentroDeHorario(sector.horarios);
      console.log(`🕒 Horario válido: ${disponible}`);
      
  
      console.log(`🛰️ ${sector.nombre} está a ${distancia.toFixed(2)} km y está ${disponible ? 'disponible' : 'cerrado'}`);
  
      return distancia <= 5 && disponible;
    });
  
    setSectoresFiltrados(filtrados);
  }, [ubicacionUsuario, sectores]);

  if (!isLoaded || cargando) return <p className="text-center">Cargando...</p>;

  return (
    <div className="border p-4 rounded bg-white">
      <p className="text-center text-sm text-gray-500 mb-4">
       Tu ubicación: {ubicacionUsuario?.lat.toFixed(5)}, {ubicacionUsuario?.lng.toFixed(5)}
</p>

      <h1 className="text-2xl font-bold text-center mb-4">Sectores disponibles cerca de ti</h1>

      {!ubicacionUsuario ? (
        <p className="text-center">Esperando ubicación del usuario...</p>
      ) : sectoresFiltrados.length === 0 ? (
        <p className="text-center text-gray-500">No hay sectores disponibles en tu zona en este momento.</p>
      ) : (
        sectoresFiltrados.map((sector, index) => (      
          <div key={index} className="mb-8 p-4 rounded shadow bg-white border">
            <h3 className="text-xl font-semibold">{sector.nombre}</h3>
            <p className="text-sm text-gray-600">{sector.direccion}</p>

            <div className="mt-2">
              <h4 className="font-medium">Horarios:</h4>
              <ul className="list-disc list-inside text-sm">
                {sector.horarios.map((horario, i) => (
                  <li key={i}>{horario.dia}: {horario.desde} - {horario.hasta}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={sector.coordenadas}
                zoom={15}
              >
                <Marker position={sector.coordenadas} />
              </GoogleMap>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ListarSectores;
