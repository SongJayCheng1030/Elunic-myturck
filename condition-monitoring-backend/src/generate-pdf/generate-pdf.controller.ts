import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { GenerateQRCodePdfDto } from './dto/generate-qr-code-pdf.dto';
import { GeneratePdfService } from './generate-pdf.service';

@Controller('generate-pdf')
export class PdfGeneratorService {
  constructor(private generatePdfService: GeneratePdfService) {}

  @Post('/qr-code')
  async getCurrentStates(@Res() res: Response, @Body() data: GenerateQRCodePdfDto): Promise<void> {
    const buffer = await this.generatePdfService.generateQRCodePdf(data);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
