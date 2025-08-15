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
            subsections: {
              create: [
                {
                  title: 'Contraste',
                  display_order: 1,
                  dynamicOptionSets: {
                    create: [
                      {
                        title: 'Uso de Contraste',
                        display_order: 1,
                        elements: {
                          create: [
                            {
                              source_action_id: 'contraste_sem',
                              type: 'button',
                              label: 'Sem Contraste',
                              default_value: 'O exame foi realizado sem contraste.',
                              is_default_selected: true,
                            },
                            {
                              source_action_id: 'contraste_com',
                              type: 'button',
                              label: 'Com Contraste',
                              default_value: 'O exame foi realizado com contraste.',
                              is_default_selected: false,
                            },
                            {
                              source_action_id: 'contraste_nao_citar',
                              type: 'button',
                              label: 'Não Citar Contraste',
                              default_value: '',
                              is_default_selected: false,
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: 'Análise',
            display_order: 2,
            default_text: 'Fígado de dimensões normais, contornos regulares e parênquima homogêneo.',
            subsections: {
              create: [
                {
                  title: 'Fígado',
                  display_order: 1,
                  dynamicOptionSets: {
                    create: [
                      {
                        title: 'Aspecto do Fígado',
                        display_order: 1,
                        elements: {
                          create: [
                            {
                              source_action_id: 'figado_normal',
                              type: 'button',
                              label: 'Normal',
                              default_value: 'Fígado com dimensões normais, contornos regulares e parênquima homogêneo.',
                              is_default_selected: true,
                            },
                            {
                              source_action_id: 'figado_esteatose',
                              type: 'button',
                              label: 'Esteatose',
                              default_value: 'Fígado com esteatose difusa.',
                              is_default_selected: false,
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: 'Impressão Diagnóstica',
            display_order: 3,
            default_text: 'Exame dentro dos limites da normalidade.',
            subsections: {
              create: [
                {
                  title: 'Conclusão',
                  display_order: 1,
                  dynamicOptionSets: {
                    create: [
                      {
                        title: 'Conclusão do Laudo',
                        display_order: 1,
                        elements: {
                          create: [
                            {
                              source_action_id: 'conclusao_normal',
                              type: 'button',
                              label: 'Normal',
                              default_value: 'Exame dentro dos limites da normalidade.',
                              is_default_selected: true,
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
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