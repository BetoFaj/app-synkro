"use server"

import { prisma } from "../lib/prisma"

export async function guardarRelevamientoBaseDatos(datos: any) {
  try {
    const { tiendaId, observaciones, imagenesAEnviar } = datos;

    // 1. Creamos un nuevo registro para conservar el historial de cada mes
    const survey = await prisma.survey.create({
      data: {
        storeId: tiendaId,
        trafoObs: observaciones.trafo,
        tablerosObs: observaciones.tableros,
        salaFrioElecObs: observaciones.salaFrioElec,
        equiposCentralesObs: observaciones.equiposCentrales,
      }
    });

    // 2. Si hay fotos, las vinculamos al ID de este nuevo relevamiento
    if (imagenesAEnviar && imagenesAEnviar.length > 0) {
      const imagenesParaCrear = imagenesAEnviar.map((img: any) => ({
        url: img.url,
        title: img.titulo,
        description: img.descripcion,
        category: img.categoria,
        surveyId: survey.id
      }));

      await prisma.image.createMany({
        data: imagenesParaCrear
      });
    }

    return { exito: true }
  } catch (error) {
    console.error("Error en la base de datos:", error)
    return { exito: false }
  }
}