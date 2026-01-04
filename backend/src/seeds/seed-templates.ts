import "reflect-metadata";

import { DataSource } from "typeorm";

import { getTypeOrmOptions } from "../common/database";
import { TemplateEntity } from "../modules/templates/template.entity";
import { TEMPLATE_SEEDS } from "./templates.seed";

async function run() {
  const options = getTypeOrmOptions([TemplateEntity]);
  const dataSource = new DataSource({
    ...(options as any),
    entities: [TemplateEntity],
  });

  await dataSource.initialize();

  try {
    const repo = dataSource.getRepository(TemplateEntity);

    for (const seed of TEMPLATE_SEEDS) {
      await repo.upsert(seed, ["id"]);
    }
  } finally {
    await dataSource.destroy();
  }
}

run()
  .then(() => {
    process.stdout.write("Seed de templates concluído.\n");
  })
  .catch((err: unknown) => {
    process.stderr.write("Falha ao rodar seed de templates.\n");
    process.stderr.write(String(err));
    process.stderr.write("\n");
    process.exitCode = 1;
  });
