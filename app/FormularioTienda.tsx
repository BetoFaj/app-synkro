"use client"

import { useState, useEffect } from "react"
import { MapPin, Store as StoreIcon, Zap, Snowflake, Camera, ImagePlus, Loader2, CheckCircle2, WifiOff, UploadCloud } from "lucide-react"
import { supabase } from "../lib/supabase"
import { guardarRelevamientoBaseDatos } from "./actions"
import imageCompression from 'browser-image-compression'
import { get, set } from 'idb-keyval'

// Agregamos un valor por defecto (provinces = []) por si la red móvil demora la carga
export default function FormularioTienda({ provinces = [] }: { provinces: any[] }) {
  // Escudo de seguridad: aseguramos que siempre sea un array para evitar crasheos en celulares
  const safeProvinces = Array.isArray(provinces) ? provinces : []

  const [provinciaId, setProvinciaId] = useState("")
  const [tiendaId, setTiendaId] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [guardadoExitoso, setGuardadoExitoso] = useState(false)
  
  const [isOnline, setIsOnline] = useState(true)
  const [pendientes, setPendientes] = useState<any[]>([])
  const [sincronizando, setSincronizando] = useState(false)

  const [observaciones, setObservaciones] = useState({
    trafo: "", tableros: "", salaFrioElec: "", equiposCentrales: ""
  })

  const [fotos, setFotos] = useState<Record<string, any[]>>({
    trafo: [], tableros: [], salaFrioElec: [], equiposCentrales: []
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine)
      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)
      
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      
      cargarPendientes()

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  const cargarPendientes = async () => {
    try {
      // Bloque try/catch clave: Evita que el celular congele la app si estamos en incógnito o WebView
      const datos = await get('relevamientos_pendientes')
      if (datos) setPendientes(datos)
    } catch (error) {
      console.warn("Almacenamiento offline bloqueado por el navegador móvil:", error)
    }
  }

  const provinciaSeleccionada = safeProvinces.find((p: any) => String(p.id) === String(provinciaId))
  const tiendasDisponibles = Array.isArray(provinciaSeleccionada?.stores) ? provinciaSeleccionada.stores : []
  const tiendaSeleccionada = tiendasDisponibles.find((t: any) => String(t.id) === String(tiendaId))

  const handleAgregarFoto = async (e: any, categoria: string) => {
    if (e.target.files && e.target.files[0]) {
      const fileOriginal = e.target.files[0]
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true }

      try {
        const fileComprimido = await imageCompression(fileOriginal, options)
        const nuevaFoto = { file: fileComprimido, titulo: "", descripcion: "" }
        setFotos(prev => ({ ...prev, [categoria]: [...prev[categoria], nuevaFoto] }))
      } catch (error) {
        alert("Hubo un problema al procesar la imagen en tu dispositivo.")
      }
    }
  }

  const actualizarInfoFoto = (categoria: string, index: number, campo: string, valor: string) => {
    const nuevasFotos = [...fotos[categoria]]
    nuevasFotos[index][campo] = valor
    setFotos(prev => ({ ...prev, [categoria]: nuevasFotos }))
  }

  const resetearFormulario = () => {
    setFotos({ trafo: [], tableros: [], salaFrioElec: [], equiposCentrales: [] })
    setObservaciones({ trafo: "", tableros: "", salaFrioElec: "", equiposCentrales: "" })
    setTiendaId("")
    setGuardadoExitoso(true)
    setTimeout(() => setGuardadoExitoso(false), 4000)
  }

  const procesarSubidaRelevamiento = async (datos: any) => {
    const imagenesAEnviar = []
    for (const categoria of Object.keys(datos.fotos)) {
      for (const fotoObj of datos.fotos[categoria]) {
        const file = fotoObj.file
        const fileExt = file.name.split('.').pop() || "jpg"
        const fileName = `${datos.tiendaId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${categoria}/${fileName}`
        
        const { error: uploadError } = await supabase.storage.from('relevamientos').upload(filePath, file)
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage.from('relevamientos').getPublicUrl(filePath)
        imagenesAEnviar.push({ url: publicUrl, titulo: fotoObj.titulo, descripcion: fotoObj.descripcion, categoria: categoria })
      }
    }
    const resultado = await guardarRelevamientoBaseDatos({ tiendaId: datos.tiendaId, observaciones: datos.observaciones, imagenesAEnviar })
    if (!resultado.exito) throw new Error("Error en la base de datos")
  }

  const handleGuardarRelevamiento = async () => {
    setGuardando(true)
    const datosActuales = { tiendaId, observaciones, fotos, id: Date.now() }

    try {
      if (!isOnline) {
        try {
          const nuevosPendientes = [...pendientes, datosActuales]
          await set('relevamientos_pendientes', nuevosPendientes)
          setPendientes(nuevosPendientes)
          resetearFormulario()
        } catch (error) {
          alert("Tu navegador móvil bloqueó el guardado offline. Intentá no usar el modo incógnito.")
        }
        return
      }
      await procesarSubidaRelevamiento(datosActuales)
      resetearFormulario()
    } catch (error) {
      alert("Hubo un error al guardar.")
      console.error(error)
    } finally {
      setGuardando(false)
    }
  }

  const handleSincronizarPendientes = async () => {
    setSincronizando(true)
    try {
      for (const relevamiento of pendientes) {
        await procesarSubidaRelevamiento(relevamiento)
      }
      await set('relevamientos_pendientes', [])
      setPendientes([])
      alert("¡Todos los relevamientos atrasados se subieron al Dashboard!")
    } catch (error) {
      alert("Se cortó la conexión mientras se subían. Volvé a intentar luego.")
    } finally {
      setSincronizando(false)
    }
  }

  const renderSubseccion = (titulo: string, categoria: keyof typeof observaciones, placeholder: string) => (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <h3 className="mb-3 font-semibold text-zinc-800 dark:text-zinc-200">{titulo}</h3>
      <textarea
        placeholder={placeholder}
        value={observaciones[categoria]}
        onChange={(e) => setObservaciones(prev => ({ ...prev, [categoria]: e.target.value }))}
        className="mb-3 min-h-[80px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950"
      />
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-white py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400 transition-colors">
        <Camera className="h-5 w-5" /> Sacar o elegir foto
        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAgregarFoto(e, categoria)} />
      </label>
      {fotos[categoria].length > 0 && (
        <div className="mt-4 space-y-3">
          {fotos[categoria].map((foto: any, idx: number) => (
            <div key={idx} className="flex flex-col gap-2 rounded-md border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                <ImagePlus className="h-4 w-4" /> Imagen lista ({idx + 1})
              </div>
              <input
                type="text"
                placeholder="Título de la imagen..."
                value={foto.titulo}
                onChange={(e) => actualizarInfoFoto(categoria, idx, 'titulo', e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-600"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      
      {!isOnline && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-red-100 p-3 text-red-700 font-semibold border border-red-200">
          <WifiOff className="h-5 w-5" /> Estás sin internet. Los datos se guardarán en tu celular.
        </div>
      )}

      {isOnline && pendientes.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/50">
          <div className="mb-3 flex items-center gap-2 font-bold text-orange-800 dark:text-orange-200">
            <UploadCloud className="h-5 w-5" />
            Tenés {pendientes.length} relevamiento(s) sin subir
          </div>
          <button onClick={handleSincronizarPendientes} disabled={sincronizando} className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-3 text-sm font-semibold text-white shadow hover:bg-orange-700 disabled:opacity-70">
            {sincronizando ? <><Loader2 className="h-5 w-5 animate-spin" /> Subiendo a la nube...</> : "Sincronizar ahora"}
          </button>
        </div>
      )}

      <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
          1. <MapPin className="h-5 w-5 text-blue-600" />Buscar Tienda
        </h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Provincia</label>
            <select
              className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:border-blue-600 focus:outline-none dark:border-zinc-700"
              value={provinciaId}
              onChange={(e) => { setProvinciaId(e.target.value); setTiendaId(""); }}
            >
              <option value="">Elegí una provincia...</option>
              {safeProvinces.map((prov: any) => (
                <option key={prov.id} value={String(prov.id)}>{prov.name}</option>
              ))}
            </select>
          </div>
          {provinciaId && (
            <div>
              <label className="mb-1.5 mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Número de Tienda</label>
              <div className="relative">
                <StoreIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <select
                  className="w-full rounded-md border border-zinc-300 bg-transparent py-2 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none dark:border-zinc-700"
                  value={tiendaId}
                  onChange={(e) => setTiendaId(e.target.value)}
                >
                  <option value="">Seleccioná la tienda...</option>
                  {tiendasDisponibles.map((tienda: any) => (
                    <option key={tienda.id} value={String(tienda.id)}>{tienda.storeNumber}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {tiendaSeleccionada && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-blue-800 border border-blue-100 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200 shadow-sm">
            <StoreIcon className="h-5 w-5" />
            <span className="font-medium">Tienda seleccionada: {tiendaSeleccionada.storeNumber}</span>
          </div>

          <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
              <Zap className="h-5 w-5 text-yellow-500" /> Parte Eléctrica
            </h2>
            <div className="space-y-4">
              {renderSubseccion("Sala de Trafo", "trafo", "Observaciones de la sala de trafo...")}
              {renderSubseccion("Tableros Generales", "tableros", "Observaciones de los tableros generales...")}
              {renderSubseccion("Sala de Frío (Tableros)", "salaFrioElec", "Observaciones de tableros en sala de frío...")}
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
              <Snowflake className="h-5 w-5 text-cyan-500" /> Parte de Frío
            </h2>
            <div className="space-y-4">
              {renderSubseccion("Equipos Centrales", "equiposCentrales", "Observaciones de equipos centrales...")}
            </div>
          </section>

          {guardadoExitoso && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700 border border-green-200 dark:bg-green-950/50 dark:border-green-900 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-medium">¡Guardado con éxito! {isOnline ? "Ya está en el Dashboard." : "Quedó en la memoria del celular."}</p>
            </div>
          )}

          <button type="button" onClick={handleGuardarRelevamiento} disabled={guardando} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-70 transition-all">
            {guardando ? <><Loader2 className="h-5 w-5 animate-spin" /> Procesando información...</> : (isOnline ? "Guardar y Subir a la Nube" : "Guardar en el Celular (Offline)")}
          </button>
        </div>
      )}
    </div>
  )
}