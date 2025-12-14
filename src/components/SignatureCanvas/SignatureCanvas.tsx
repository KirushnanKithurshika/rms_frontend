import React, { useEffect, useRef, useState } from "react";
import { FaUndoAlt, FaBroom, FaImage } from "react-icons/fa";
import "./SignatureCanvas.css";

type Point = { x: number; y: number };
type Stroke = Point[];

export default function SignatureBoard() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currStroke, setCurrStroke] = useState<Stroke>([]);
  const [dpr, setDpr] = useState(1);

  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [imgPos, setImgPos] = useState<{ x: number; y: number }>({ x: 6, y: 6 });
  const [imgScale, setImgScale] = useState(1);
  const [isDraggingImg, setIsDraggingImg] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [finalPngUrl, setFinalPngUrl] = useState<string | null>(null);

  const sizeCanvas = () => {
    const c = canvasRef.current;
    const wrap = wrapRef.current;
    if (!c || !wrap) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    setDpr(ratio);
    const rect = wrap.getBoundingClientRect();
    const cssW = Math.max(1, Math.floor(rect.width));
    const cssH = Math.max(1, Math.floor(rect.height));
    c.width = Math.floor(cssW * ratio);
    c.height = Math.floor(cssH * ratio);
    c.style.width = `${cssW}px`;
    c.style.height = `${cssH}px`;
    redrawAll();
  };

  useEffect(() => {
    sizeCanvas();
    const ro = new ResizeObserver(sizeCanvas);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", sizeCanvas);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sizeCanvas);
    };
  }, []);

  useEffect(() => {
    redrawAll();
  }, [strokes, currStroke, img, imgPos, imgScale, dpr]);

  const getCtx = () => {
    const c = canvasRef.current;
    if (!c) return null;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  const redrawAll = () => {
    const ctx = getCtx();
    const c = canvasRef.current;
    if (!ctx || !c) return;
    ctx.clearRect(0, 0, c.width / dpr, c.height / dpr);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width / dpr, c.height / dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    strokes.forEach((s) => drawStroke(ctx, s));
    if (currStroke.length > 0) drawStroke(ctx, currStroke);
    if (img) {
      const w = img.width * imgScale;
      const h = img.height * imgScale;
      ctx.drawImage(img, imgPos.x, imgPos.y, w, h);
    }
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, s: Stroke) => {
    if (s.length < 2) {
      if (s.length === 1) {
        ctx.beginPath();
        ctx.arc(s[0].x, s[0].y, 1, 0, Math.PI * 2);
        ctx.fillStyle = "#111";
        ctx.fill();
      }
      return;
    }
    ctx.beginPath();
    ctx.moveTo(s[0].x, s[0].y);
    for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x, s[i].y);
    ctx.stroke();
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const hitImg = (p: { x: number; y: number }) => {
    if (!img) return false;
    const w = img.width * imgScale;
    const h = img.height * imgScale;
    return p.x >= imgPos.x && p.x <= imgPos.x + w && p.y >= imgPos.y && p.y <= imgPos.y + h;
  };

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const p = getPos(e);
    if (img && hitImg(p)) {
      setIsDraggingImg(true);
      setDragOffset({ x: p.x - imgPos.x, y: p.y - imgPos.y });
      return;
    }
    setIsDrawing(true);
    setCurrStroke([p]);
  };

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing && !isDraggingImg) return;
    e.preventDefault();
    const p = getPos(e);
    if (isDraggingImg && img) {
      setImgPos({ x: p.x - dragOffset.x, y: p.y - dragOffset.y });
      return;
    }
    setCurrStroke((s) => [...s, p]);
  };

  const onEnd = () => {
    if (isDraggingImg) {
      setIsDraggingImg(false);
      return;
    }
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currStroke.length > 0) setStrokes((all) => [...all, currStroke]);
    setCurrStroke([]);
  };

  // actions
  const undo = () => (currStroke.length ? setCurrStroke([]) : setStrokes((a) => a.slice(0, -1)));
  const clearAll = () => {
    setStrokes([]);
    setCurrStroke([]);
    setImg(null);
  };
  const save = () => {
    const c = canvasRef.current!;
    const url = c.toDataURL("image/png");
    setFinalPngUrl(url);
  };

  // uploads
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const image = new Image();
      image.onload = () => {
        setImg(image);
        const rect = wrapRef.current!.getBoundingClientRect();
        const fit = Math.min(rect.width / image.width, rect.height / image.height, 1);
        setImgScale(fit);
        setImgPos({ x: 4, y: 4 });
      };
      image.src = url;
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.files?.length) return;
    handleFile(e.dataTransfer.files[0]);
  };
  const stop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (finalPngUrl) {
    return (
      <div className="sig-paper sig-paper--final" aria-label="Signature PNG output">
        <img src={finalPngUrl} alt="Signature" className="sig-final-img" />
      </div>
    );
  }

  return (
    <div className="sig-wrap">
      {/* Toolbar OUTSIDE & ABOVE the paper */}
      <div className="sig-toolbar-outside" role="toolbar" aria-label="Signature tools">
        <button className="sig-icon-btn" onClick={undo} title="Undo (Ctrl+Z)">
          <FaUndoAlt />
        </button>
        <button className="sig-icon-btn" onClick={clearAll} title="Clear">
          <FaBroom />
        </button>
        <button
          className="sig-icon-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Upload image"
        >
          <FaImage />
        </button>
        <button className="sig-btn sig-btn--primary" onClick={save} title="Save as PNG">
          Save
        </button>
      </div>

      <div
        ref={wrapRef}
        className="sig-paper"
        onDrop={onDrop}
        onDragOver={stop}
        onDragEnter={stop}
        onDragLeave={stop}
      >
        <canvas
          ref={canvasRef}
          className="sig-canvas"
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onEnd}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
