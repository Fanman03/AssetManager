'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Roboto, Roboto_Mono } from 'next/font/google';
import { Asset } from '@/types/asset';

const roboto = Roboto({ weight: ['400'], subsets: ['latin'] });
const robotoMono = Roboto_Mono({ weight: ['400'], subsets: ['latin'] });

const baseDomain: string = process.env.NEXT_PUBLIC_BASE_DOMAIN!;
const tagUrl: string = process.env.NEXT_PUBLIC_TAG_URL!;

declare const DATAMatrix: (opts: { msg: string; dim: number }) => SVGSVGElement;

interface Props {
  asset: Asset;
}

declare global {
  interface Window {
    dymo: any;
  }
}

type DymoPrinter = {
  name: string;
  printerType: string;
  isConnected: boolean;
};


const BarcodeCanvas: React.FC<Props> = ({ asset }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawn, setIsDrawn] = useState(false);

  useEffect(() => {
    const draw = async () => {
      const canvas = canvasRef.current;
      if (!canvas || typeof window === 'undefined') return;

      const ctx = canvas.getContext('2d');
      if (!ctx || typeof DATAMatrix !== 'function') return;

      await document.fonts.ready; // Ensure fonts are loaded

      const { _id, Brand, Model } = asset;

      // Prepare canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Text styling
      ctx.fillStyle = 'black';

      ctx.font = '150px "Roboto Mono"';
      ctx.fillText(_id, 640, 170);

      ctx.font = '100px "Roboto"';
      ctx.fillText(Brand, 640, 280);
      ctx.fillText(Model, 640, 380);
      ctx.fillText(tagUrl, 640, 530);

      // Barcode path
      const svgNode = DATAMatrix({ msg: `${baseDomain}/${_id}`, dim: 100 });
      const svgPath = svgNode?.querySelector('path')?.getAttribute('d');

      if (svgPath) {
        const path = new Path2D(svgPath);
        ctx.setTransform(23, 0, 0, 23, 70, 50); // Scale + Translate
        ctx.fill(path);
      } else {
        console.warn('Barcode path not found');
      }

      setIsDrawn(true);
    };

    draw();
  }, [asset]);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `barcode-${asset._id}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const printWithSystemDialog = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const win = window.open('', '_blank');
    if (!win) return;

    const imageUrl = canvas.toDataURL('image/png');
    win.document.write(`
    <html>
      <head><title>Print Barcode</title></head>
      <body style="margin:0; text-align:left;">
        <img src="${imageUrl}" style="width:3.5in"/>
        <script>window.onload = () => window.print();</script>
      </body>
    </html>
  `);
    win.document.close();
  };

  const printToDYMO = async () => {
    if (typeof window.dymo === 'undefined') {
      alert('DYMO SDK not loaded');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');

    const labelXml = `
  <?xml version="1.0" encoding="utf-8"?>
  <DieCutLabel Version="8.0" Units="twips">
    <PaperOrientation>Landscape</PaperOrientation>
    <Id>Address</Id>
    <PaperName>30252 Address</PaperName>
    <DrawCommands/>
    <ObjectInfo>
      <ImageObject>
        <Name>Image</Name>
        <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
        <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
        <ImageFormat>PNG</ImageFormat>
        <Image>${imageData}</Image>
        <ScaleMode>Fit</ScaleMode>
        <HorizontalAlignment>Center</HorizontalAlignment>
        <VerticalAlignment>Center</VerticalAlignment>
      </ImageObject>
      <Bounds X="0" Y="0" Width="5040" Height="1620"/>
    </ObjectInfo>
  </DieCutLabel>`;

    try {
      const printers: DymoPrinter[] = window.dymo.label.framework.getPrinters();
      const labelPrinter = printers.find(p => p.printerType === 'LabelWriterPrinter');

      if (!labelPrinter) {
        alert('No DYMO label printer found.');
        return;
      }

      const label = window.dymo.label.framework.openLabelXml(labelXml);
      label.print(labelPrinter.name);
    } catch (err) {
      console.error('DYMO printing failed:', err);
    }
  };

  return (
    <div
      className="text-center container"
    >
      <canvas
        ref={canvasRef}
        className="col-md-8"
        width={1866}
        height={600}
        style={{ border: '1px solid #ccc', maxWidth: '100%' }}
        id="barcodeCanvas"
      />
      <div>
        <button
          className="btn btn-primary mx-1"
          onClick={downloadImage}
          disabled={!isDrawn}><i className="bi bi-download me-2"></i>Download as PNG</button>
        <button
          className="btn btn-success mx-1"
          onClick={printToDYMO}
          disabled={!isDrawn}><i className="bi bi-printer me-2"></i>Print with DYMO</button>
        <button
          className="btn btn-secondary mx-1"
          onClick={printWithSystemDialog}
          disabled={!isDrawn}
        ><i className="bi bi-printer-fill me-2"></i>Print with System Dialog</button>
      </div>
    </div>
  );
};

export default BarcodeCanvas;
