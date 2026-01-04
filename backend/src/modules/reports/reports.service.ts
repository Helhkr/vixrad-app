import { BadRequestException, Injectable } from "@nestjs/common";

type StaticTemplate = {
  id: string;
  examType: string;
  baseText: string;
};

const STATIC_TEMPLATES: StaticTemplate[] = [
  {
    id: "ct-head-normal-v1",
    examType: "CT",
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

@Injectable()
export class ReportsService {
  generateStructuredBaseReport(params: { examType: string; templateId: string }) {
    const template = STATIC_TEMPLATES.find((t) => t.id === params.templateId);
    if (!template) {
      throw new BadRequestException("templateId inválido");
    }
    if (template.examType !== params.examType) {
      throw new BadRequestException("templateId incompatível com examType");
    }

    return {
      reportText: template.baseText,
    };
  }
}
