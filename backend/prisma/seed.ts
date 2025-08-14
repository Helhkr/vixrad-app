import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.template.deleteMany({})
  await prisma.templateCategory.deleteMany({})
  await prisma.user.deleteMany({})

  const user = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@vixrad.com',
      password_hash: '$2b$10$G.GZXYiyH.o4/O4.A.rL9u9Y9aJ2.B.e3j.X.d.U.u.I.5.a.b.c.d',
      cpf: '12345678901',
      crm: '123456',
      crm_uf: 'SP',
      is_admin: true,
      is_email_verified: true,
    },
  })

  const category = await prisma.templateCategory.create({
    data: {
      name: 'Ultrassonografia',
    },
  })

  const template = await prisma.template.create({
    data: {
      name: 'Ultrassonografia do Abdome Total',
      created_by_id: user.id,
      category_id: category.id,
      sections: {
        create: [
          {
            title: 'Técnica',
            display_order: 1,
            default_text: 'O exame foi realizado com transdutor convexo de 3,5 MHz.',
            content: {
              options: [
                { label: 'Opção 1', text: 'Texto da opção 1' },
                { label: 'Opção 2', text: 'Texto da opção 2' },
              ]
            }
          },
          {
            title: 'Análise',
            display_order: 2,
            default_text: 'Fígado de dimensões normais, contornos regulares e parênquima homogêneo.',
            content: {
              options: [
                { label: 'Normal', text: 'Fígado com dimensões normais, contornos regulares e parênquima homogêneo.' },
                { label: 'Esteatose', text: 'Fígado com esteatose difusa.' },
              ]
            }
          },
          {
            title: 'Impressão Diagnóstica',
            display_order: 3,
            default_text: 'Exame dentro dos limites da normalidade.',
            content: {}
          },
        ],
      },
    },
  })

  console.log({ user, category, template })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })