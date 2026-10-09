import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const provincias = [
    {
      name: 'Buenos Aires',
      stores: [
        '1043 La Ferrere', '1017 La Tablada', '1013 Tigre', 
        '1035 3 de Febrero', '1032 Malvinas', '1014 Luján', 
        '1004 San Fernando', '1116 Morón', '1119 Moreno Derqui'
      ]
    },
    {
      name: 'Salta',
      stores: ['1078 Tartagal', '1052 Orán', '1075 Salta', '1011 Salta']
    },
    {
      name: 'Jujuy',
      stores: ['1031 Jujuy', '1111 San Pedro de Jujuy']
    },
    {
      name: 'Tucumán',
      stores: ['1020 Tucumán', '1106 Tucumán', '1082 Tucumán', '1033 La Banda Río Salí', '1088 Concepción']
    },
    {
      name: 'Catamarca',
      stores: ['1026 Catamarca']
    },
    {
      name: 'Santiago del Estero',
      stores: ['1012 Santiago del Estero', '1080 Santiago del Estero']
    },
    {
      name: 'La Rioja',
      stores: ['1007 La Rioja']
    },
    {
      name: 'Córdoba',
      stores: ['1010 Córdoba', '1060 Córdoba', '1097 Córdoba', '3605 Córdoba', '3606 Córdoba']
    },
    {
      name: 'Entre Ríos',
      stores: ['1059 Paraná', '3604 Hiper Paraná']
    },
    {
      name: 'Santa Fe',
      stores: ['3603 Hiper Santa Fe']
    }
  ]

  for (const prov of provincias) {
    await prisma.province.create({
      data: {
        name: prov.name,
        stores: {
          create: prov.stores.map(storeName => ({
            storeNumber: storeName
          }))
        }
      }
    })
  }

  console.log('¡Base de datos poblada con las tiendas reales!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })