'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Roboto, Roboto_Mono } from 'next/font/google';
import { Asset } from '@/types/asset';

const roboto = Roboto({ weight: ['400'], subsets: ['latin'] });
const robotoMono = Roboto_Mono({ weight: ['400'], subsets: ['latin'] });

const baseDomain: string = process.env.NEXT_PUBLIC_BASE_DOMAIN!;
const tagUrl: string = process.env.NEXT_PUBLIC_TAG_URL!;

declare const DATAMatrix: (opts: { msg: string; dim: number }) => SVGSVGElement;

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

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

      // === Barcode section with consistent size ===
      const BARCODE_BOX = 650; // final size of barcode in pixels
      const BARCODE_X = 50;    // left offset
      const BARCODE_Y = 50;    // top offset

      const svgNode = DATAMatrix({ msg: `${_id}`, dim: 100 });
      const svgPath = svgNode?.querySelector('path')?.getAttribute('d');

      if (svgPath) {
        const path = new Path2D(svgPath);

        // Determine intrinsic size of the Data Matrix
        const vb = svgNode.viewBox.baseVal;
        const scale = BARCODE_BOX / vb.width; // Scale to fit BARCODE_BOX square

        ctx.setTransform(scale, 0, 0, scale, BARCODE_X, BARCODE_Y);
        ctx.fill(path);
      } else {
        console.warn('Barcode path not found');
      }
      // === End barcode section ===

      setIsDrawn(true);
    };

    draw();
  }, [asset]);


  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const filename = `barcode-${asset._id}.png`;
    const dataUrl = canvas.toDataURL('image/png');

    // Check if we're in React Native WebView
    if (window.ReactNativeWebView && /ReactNative/i.test(navigator.userAgent)) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'download',
        filename,
        dataUrl,
      }));
    } else {
      // Standard browser download
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link); // Required for Firefox
      link.click();
      document.body.removeChild(link);
    }
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
    if (!window?.dymo?.label?.framework) {
      alert('DYMO SDK not loaded');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // 1) Load template
      const resp = await fetch('/dymo/30252.label');
      let labelXml = (await resp.text()).trim();

      // 2) Inject base64 image directly into the <Image> node
      const imageData = canvas.toDataURL('image/png').split(',')[1]; // strip prefix
      labelXml = labelXml.replace(
        /(<Data>)([\s\S]*?)(<\/Data>)/,
        `$1${imageData}$3`
      );

      // 3) Pick printer
      const printers: DymoPrinter[] = window.dymo.label.framework.getPrinters();
      const printer = printers.find(p => p.printerType === 'LabelWriterPrinter');
      if (!printer) {
        alert('No DYMO LabelWriter printer found.');
        return;
      }

      // 4) Print (no setObjectImage, we pass the *final* xml)
      const paramsXml = window.dymo.label.framework.createLabelWriterPrintParamsXml({
        copies: 1,
        printQuality: 'BarcodeAndGraphics'
      });
      window.dymo.label.framework.printLabel(printer.name, paramsXml, labelXml);

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
          className="btn btn-primary m-2"
          onClick={downloadImage}
          disabled={!isDrawn}><i className="bi bi-download me-2"></i>Download as PNG</button>
        <button
          className="btn btn-success m-2"
          onClick={printToDYMO}
          disabled={!isDrawn}><i className="bi bi-printer me-2"></i>Print with DYMO</button>
        <button
          className="btn btn-secondary m-2"
          onClick={printWithSystemDialog}
          disabled={!isDrawn}
        ><i className="bi bi-printer-fill me-2"></i>Print with System Dialog</button>
      </div>
    </div>
  );
};

export default BarcodeCanvas;
