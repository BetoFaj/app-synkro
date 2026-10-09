import { Wrench } from "lucide-react"
import { prisma } from "../lib/prisma"
import FormularioTienda from "./FormularioTienda"

export default async function Home() {
  const provinces = await prisma.province.findMany({
    orderBy: { name: 'asc' },
    include: {
      stores: { orderBy: { storeNumber: 'asc' } }
    }
  })

  return (
    <main className="min-h-screen bg-zinc-50 p-4 dark:bg-zinc-950 sm:p-6">
      <div className="mx-auto max-w-md space-y-6 pb-20">
        <header className="flex items-center gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="rounded-lg bg-blue-600 p-2 shadow-sm">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Synkro</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Relevamiento técnico</p>
          </div>
        </header>
        <FormularioTienda provinces={provinces} />
      </div>
    </main>
  )
}