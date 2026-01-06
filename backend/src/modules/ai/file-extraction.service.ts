import { Injectable } from '@nestjs/common';
import * as pdf from 'pdf-parse';
import { createWorker } from 'tesseract.js';

@Injectable()
export class FileExtractionService {
  async extractTextFromFile(file: Express.Multer.File): Promise<string> {
    const mimeType = file.mimetype;

    if (mimeType === 'application/pdf') {
      return this.extractTextFromPDF(file.buffer);
    } else if (mimeType.startsWith('image/')) {
      return this.extractTextFromImage(file.buffer);
    }

    throw new Error('Tipo de arquivo não suportado');
  }

  private async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`Erro ao extrair texto do PDF: ${error.message}`);
    }
  }

  private async extractTextFromImage(buffer: Buffer): Promise<string> {
    try {
      const worker = await createWorker('por');
      const { data } = await worker.recognize(buffer);
      await worker.terminate();
      return data.text;
    } catch (error) {
      throw new Error(`Erro ao extrair texto da imagem: ${error.message}`);
    }
  }
}
