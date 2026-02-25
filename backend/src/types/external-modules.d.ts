declare module 'cookie-parser' {
  import type { RequestHandler } from 'express';

  type CookieParser = (
    secret?: string | string[],
    options?: Record<string, unknown>,
  ) => RequestHandler;

  const cookieParser: CookieParser;
  export = cookieParser;
}

declare module 'pdfkit' {
  type PDFImageSource = Buffer | string;

  type PDFTextOptions = {
    align?: 'left' | 'center' | 'right' | 'justify';
    width?: number;
    lineBreak?: boolean;
  };

  type PDFImageOptions = {
    fit?: [number, number];
    align?: 'left' | 'center' | 'right';
    valign?: 'top' | 'center' | 'bottom';
  };

  type PDFDocumentOptions = {
    margin?: number;
  };

  class PDFDocument {
    constructor(options?: PDFDocumentOptions);
    page: {
      width: number;
      height: number;
    };
    on(event: 'data', listener: (chunk: Buffer) => void): this;
    on(event: 'end' | 'error', listener: (...args: unknown[]) => void): this;
    end(): void;
    lineWidth(width: number): this;
    roundedRect(x: number, y: number, width: number, height: number, radius: number): this;
    rect(x: number, y: number, width: number, height: number): this;
    fillAndStroke(fillColor: string, strokeColor: string): this;
    fill(color?: string): this;
    stroke(color?: string): this;
    fillColor(color: string): this;
    strokeColor(color: string): this;
    font(fontName: string): this;
    fontSize(size: number): this;
    text(text: string, options?: PDFTextOptions): this;
    text(text: string, x?: number, y?: number, options?: PDFTextOptions): this;
    moveDown(lines?: number): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    image(src: PDFImageSource, x?: number, y?: number, options?: PDFImageOptions): this;
    widthOfString(text: string): number;
    heightOfString(text: string, options?: PDFTextOptions): number;
  }

  export default PDFDocument;
}
