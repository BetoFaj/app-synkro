import { prisma } from "../../lib/prisma"
import DashboardClient from "./DashboardClient"

export default async function Dashboard() {
  // Le pedimos a la base de datos todos los relevamientos completos
  // incluyendo los datos de la tienda, la provincia y todas las fotos
  const relevamientos = await prisma.survey.findMany({
    include: {
      store: {
        include: {
          province: true
        }
      },
      images: true
    },
    orderBy: {
      updatedAt: 'desc' // Ordenamos para que los más recientes salgan arriba
    }
  })

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <DashboardClient relevamientos={relevamientos} />
    </div>
  )
}