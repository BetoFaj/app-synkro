"use client"

import { useState } from "react"
import { LayoutDashboard, Store, MapPin, Zap, Snowflake, Calendar, Image as ImageIcon } from "lucide-react"

export default function DashboardClient({ relevamientos }: { relevamientos: any[] }) {
  // Estado para saber qué relevamiento estamos mirando ahora mismo
  const [seleccionado, setSeleccionado] = useState<any>(relevamientos[0] || null)

  if (relevamientos.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-zinc-500">Todavía no hay ningún relevamiento guardado.</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* BARRA LATERAL (LISTA DE TIENDAS) */}
      <aside className="w-80 overflow-y-auto border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="sticky top-0 border-b border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            <LayoutDashboard className="h-5 w-5 text-blue-600" /> Dashboard Synkro
          </h1>
          <p className="text-sm text-zinc-500">Relevamientos completados</p>
        </div>
        
        <div className="p-2 space-y-1">
          {relevamientos.map((rel) => (
            <button
              key={rel.id}
              onClick={() => setSeleccionado(rel)}
              className={`w-full flex flex-col items-start gap-1 p-3 rounded-lg text-left transition-colors ${
                seleccionado?.id === rel.id 
                  ? "bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" 
                  : "hover:bg-zinc-50 border border-transparent dark:hover:bg-zinc-800/50"
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                <Store className="h-4 w-4 text-zinc-500" />
                Tienda {rel.store.storeNumber}
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <MapPin className="h-3 w-3" /> {rel.store.province.name}
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* PANEL PRINCIPAL (DETALLES Y FOTOS) */}
      <main className="flex-1 overflow-y-auto bg-zinc-50/50 p-6 dark:bg-zinc-950">
        {seleccionado && (
          <div className="mx-auto max-w-5xl space-y-6">
            
            {/* CABECERA DEL RELEVAMIENTO */}
            <header className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Tienda {seleccionado.store.storeNumber} - {seleccionado.store.province.name}
                </h2>
                <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                  <Calendar className="h-4 w-4" />
                  Última actualización: {new Date(seleccionado.updatedAt).toLocaleDateString('es-AR', {
                    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <ImageIcon className="h-4 w-4" />
                {seleccionado.images.length} fotos adjuntas
              </div>
            </header>

            {/* SECCIONES DE TEXTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Parte Eléctrica */}
              <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 border-b pb-3">
                  <Zap className="h-5 w-5 text-yellow-500" /> Parte Eléctrica
                </h3>
                
                <div>
                  <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Sala de Trafo</h4>
                  <p className="text-sm text-zinc-600 bg-zinc-50 p-3 rounded-md border border-zinc-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400">
                    {seleccionado.trafoObs || "Sin observaciones."}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Tableros Generales</h4>
                  <p className="text-sm text-zinc-600 bg-zinc-50 p-3 rounded-md border border-zinc-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400">
                    {seleccionado.tablerosObs || "Sin observaciones."}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Sala de Frío (Tableros)</h4>
                  <p className="text-sm text-zinc-600 bg-zinc-50 p-3 rounded-md border border-zinc-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400">
                    {seleccionado.salaFrioElecObs || "Sin observaciones."}
                  </p>
                </div>
              </div>

              {/* Parte de Frío */}
              <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 border-b pb-3">
                  <Snowflake className="h-5 w-5 text-cyan-500" /> Parte de Frío
                </h3>
                
                <div>
                  <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Equipos Centrales</h4>
                  <p className="text-sm text-zinc-600 bg-zinc-50 p-3 rounded-md border border-zinc-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400">
                    {seleccionado.equiposCentralesObs || "Sin observaciones."}
                  </p>
                </div>
              </div>
            </div>

            {/* GALERÍA DE FOTOS */}
            <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                <ImageIcon className="h-5 w-5 text-blue-500" /> Galería de Imágenes
              </h3>
              
              {seleccionado.images.length === 0 ? (
                <p className="text-zinc-500 text-sm">No se subieron fotos en este relevamiento.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {seleccionado.images.map((img: any) => (
                    <div key={img.id} className="group overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                      {/* Contenedor de la imagen */}
                      <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                        <img 
                          src={img.url} 
                          alt={img.title || "Foto del relevamiento"} 
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      {/* Detalles de la imagen */}
                      <div className="p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300 capitalize">
                            {img.category}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {img.title || "Sin título"}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                          {img.description || "Sin descripción"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  )
}