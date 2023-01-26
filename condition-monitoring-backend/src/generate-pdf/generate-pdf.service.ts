import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

import { GenerateQRCodePdfDto } from './dto/generate-qr-code-pdf.dto';

const QR_CODE_WIDTH = 400;

@Injectable()
export class GeneratePdfService {
  async generateQRCodePdf(data: GenerateQRCodePdfDto): Promise<Buffer> {
    const created = await QRCode.toDataURL(data.url, { width: QR_CODE_WIDTH });

    const pdfBuffer: Buffer = await new Promise(resolve => {
      const doc = new PDFDocument({
        size: 'LETTER',
        bufferPages: true,
      });

      doc.text(data.text, 125, 80);
      doc.image(created, 100, 100);
      doc.end();

      const buffer: any = [];
      doc.on('data', buffer.push.bind(buffer));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffer);
        resolve(pdfData);
      });
    });

    return pdfBuffer;
  }
}
