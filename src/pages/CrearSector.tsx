  import { useForm, useFieldArray } from 'react-hook-form';
  import { yupResolver } from '@hookform/resolvers/yup';
  import * as yup from 'yup';
  import axios from 'axios';

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const schema = yup.object({
    nombre: yup.string().required('El nombre es obligatorio'),
    direccion: yup.string().required('La dirección es obligatoria'),
    coordenadas: yup.object({
      lat: yup.number().required('La latitud es obligatoria'),
      lng: yup.number().required('La longitud es obligatoria'),
    }).required(),
    horarios: yup.array().of(
      yup.object({
        dia: yup.string().required('El día es obligatorio'),
        desde: yup.string().required('La hora de inicio es obligatoria'),
        hasta: yup.string().required('La hora de fin es obligatoria'),
      })
    ).required('Debe agregar al menos un horario').min(1, 'Debe agregar al menos un horario'),
  });

  type FormData = yup.InferType<typeof schema>;

  const CrearSector = () => {
    const { register, control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
      resolver: yupResolver(schema),
      defaultValues: {
        nombre: '',
        direccion: '',
        coordenadas: { lat: 0, lng: 0 },
        horarios: []
      }
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'horarios' });

    const onSubmit = async (data: FormData) => {
      try {
        const res = await axios.post('http://localhost:3000/api/sectores', data);
        console.log(res.data); // si luego quieres mostrar el ID o algo más
        alert('Sector registrado correctamente');
        reset();
      } catch (err) {
        console.error(err);
        alert('Error al registrar el sector');
      }
    };

    return (
      <div className="max-w-3xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Registrar nuevo sector</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <label className="block">Nombre del sector</label>
            <input {...register('nombre')} className="input" />
            <p className="text-red-500 text-sm">{errors.nombre?.message}</p>
          </div>

          <div>
            <label className="block">Dirección</label>
            <input {...register('direccion')} className="input" />
            <p className="text-red-500 text-sm">{errors.direccion?.message}</p>
          </div>

          <div>
            <label className="block">Latitud</label>
            <input type="number" step="any" {...register('coordenadas.lat')} className="input" />
            <p className="text-red-500 text-sm">{errors.coordenadas?.lat?.message}</p>
          </div>

          <div>
            <label className="block">Longitud</label>
            <input type="number" step="any" {...register('coordenadas.lng')} className="input" />
            <p className="text-red-500 text-sm">{errors.coordenadas?.lng?.message}</p>
          </div>

          <div>
            <label className="block mb-2">Horarios de atención</label>
            {fields.map((field, index) => (
              <div key={field.id} className="mb-2 flex gap-2 items-center">
                <select {...register(`horarios.${index}.dia`)} className="input">
                  {diasSemana.map((dia) => (
                    <option key={dia} value={dia}>{dia}</option>
                  ))}
                </select>
                <input type="time" {...register(`horarios.${index}.desde`)} className="input" />
                <input type="time" {...register(`horarios.${index}.hasta`)} className="input" />
                <button type="button" onClick={() => remove(index)} className="text-red-600">✕</button>
              </div>
            ))}
            <button type="button" onClick={() => append({ dia: 'Lunes', desde: '', hasta: '' })} className="btn btn-secondary">
              Agregar horario
            </button>
            <p className="text-red-500 text-sm">{errors.horarios?.message}</p>
          </div>

          <button type="submit" className="btn btn-primary">Registrar sector</button>
        </form>
      </div>
    );
  };

  export default CrearSector;
