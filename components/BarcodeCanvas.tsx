'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Roboto, Roboto_Mono } from 'next/font/google';
import { Asset } from '@/types/asset';

const roboto = Roboto({ weight: ['400'], subsets: ['latin'] });
const robotoMono = Roboto_Mono({ weight: ['400'], subsets: ['latin'] });

const baseDomain:string  = process.env.NEXT_PUBLIC_BASE_DOMAIN!;
const tagUrl:string  = process.env.NEXT_PUBLIC_TAG_URL!;

declare const DATAMatrix: (opts: { msg: string; dim: number }) => SVGSVGElement;

interface Props {
  asset: Asset;
}

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

  return (
    <div
      className="text-center container"
    >
      <canvas
        ref={canvasRef}
        className="col-md-8"
        width={1575}
        height={600}
        style={{ border: '1px solid #ccc', maxWidth: '100%' }}
        id="barcodeCanvas"
      />
      <div>
        <button
          className="btn btn-primary"
          onClick={downloadImage}
          disabled={!isDrawn}
        >
          Download as PNG
        </button>
      </div>
    </div>
  );
};

export default BarcodeCanvas;
