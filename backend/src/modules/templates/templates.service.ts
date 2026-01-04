import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { TemplateEntity } from "./template.entity";

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(TemplateEntity)
    private readonly templatesRepository: Repository<TemplateEntity>,
  ) {}

  async getById(id: string): Promise<TemplateEntity | null> {
    return this.templatesRepository.findOne({ where: { id } });
  }
}
