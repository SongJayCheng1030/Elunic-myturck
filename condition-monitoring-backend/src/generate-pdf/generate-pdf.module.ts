import { Module } from '@nestjs/common';

import { PdfGeneratorService } from './generate-pdf.controller';
import { GeneratePdfService } from './generate-pdf.service';

@Module({
  imports: [],
  controllers: [PdfGeneratorService],
  providers: [GeneratePdfService],
})
export class PdfGeneratorModule {}
