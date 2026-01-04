import { TemplateStatus, type TemplateEntity } from "../modules/templates/template.entity";

export type TemplateSeed = Pick<TemplateEntity, "id" | "modality" | "region" | "baseText" | "version" | "status">;

export const TEMPLATE_SEEDS: TemplateSeed[] = [
  {
    id: "ct-head-normal-v1",
    modality: "CT",
    region: "HEAD",
    version: "v1",
    status: TemplateStatus.ACTIVE,
    baseText:
      "Técnica: Tomografia computadorizada de crânio sem contraste.\n\n"
      + "Achados:\n"
      + "- Parênquima encefálico sem áreas de hemorragia, hipodensidade aguda ou efeito de massa.\n"
      + "- Sistema ventricular e cisternas da base de morfologia e dimensões preservadas.\n"
      + "- Linhas da foice e tenda em posição habitual.\n"
      + "- Calota craniana sem fraturas.\n\n"
      + "Impressão: Exame dentro dos limites da normalidade."
  }
];
