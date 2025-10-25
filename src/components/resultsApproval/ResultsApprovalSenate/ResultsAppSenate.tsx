import React, { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Stroke = Point[];

export default function SignatureBoard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currStroke, setCurrStroke] = useState<Stroke>([]);
  const [dpr, setDpr] = useState(1);

  // Image dropped by user
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [imgPos, setImgPos] = useState<{ x: number; y: number }>({ x: 40, y: 40 });
  const [imgScale, setImgScale] = useState(1);
  const [isDraggingImg, setIsDraggingImg] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas sizing to device pixel ratio for crisp lines
  useEffect(() => {
    const c = canvasRef.current;
    const box = containerRef.current?.getBoundingClientRect();
    if (!c || !box) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    setDpr(ratio);

    c.width = Math.floor(box.width * ratio);
    c.height = Math.floor(box.height * ratio);
    c.style.width = `${Math.floor(box.width)}px`;
    c.style.height = `${Math.floor(box.height)}px`;

    redrawAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef.current]);

  useEffect(() => {
    redrawAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes, currStroke, img, imgPos, imgScale, dpr]);

  const getCtx = () => {
    const c = canvasRef.current;
    if (!c) return null;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // logical pixels
    return ctx;
  };

  const redrawAll = () => {
    const ctx = getCtx();
    const c = canvasRef.current;
    if (!ctx || !c) return;

    // Clear
    ctx.clearRect(0, 0, c.width, c.height);

    // Background (optional grid)
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width / dpr, c.height / dpr);
    ctx.strokeStyle = "#eee";
    for (let x = 0; x < c.width / dpr; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, c.height / dpr);
      ctx.stroke();
    }
    for (let y = 0; y < c.height / dpr; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(c.width / dpr, y);
      ctx.stroke();
    }

    // Draw existing strokes
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;

    strokes.forEach((s) => drawStroke(ctx, s));
    if (currStroke.length > 0) drawStroke(ctx, currStroke);

    // Draw dropped image if present
    if (img) {
      const w = img.width * imgScale;
      const h = img.height * imgScale;
      ctx.drawImage(img, imgPos.x, imgPos.y, w, h);

      // Image boundary (visual handle)
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(imgPos.x, imgPos.y, w, h);
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

  // Helpers to get pointer coords relative to canvas
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const x = (clientX - rect.left);
    const y = (clientY - rect.top);
    return { x, y };
  };

  // Check if pointer is inside image rect (for dragging)
  const hitImg = (p: Point) => {
    if (!img) return false;
    const w = img.width * imgScale;
    const h = img.height * imgScale;
    return p.x >= imgPos.x && p.x <= imgPos.x + w && p.y >= imgPos.y && p.y <= imgPos.y + h;
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const p = getPos(e);
    // If on image -> drag image
    if (img && hitImg(p)) {
      setIsDraggingImg(true);
      setDragOffset({ x: p.x - imgPos.x, y: p.y - imgPos.y });
      return;
    }
    // Else draw
    setIsDrawing(true);
    setCurrStroke([p]);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing && !isDraggingImg) return;
    e.preventDefault();
    const p = getPos(e);
    if (isDraggingImg && img) {
      setImgPos({ x: p.x - dragOffset.x, y: p.y - dragOffset.y });
      return;
    }
    setCurrStroke((s) => [...s, p]);
  };

  const endDrawing = () => {
    if (isDraggingImg) {
      setIsDraggingImg(false);
      return;
    }
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currStroke.length > 0) setStrokes((all) => [...all, currStroke]);
    setCurrStroke([]);
  };

  const clearAll = () => {
    setStrokes([]);
    setCurrStroke([]);
    setImg(null);
  };

  const undo = () => {
    if (currStroke.length > 0) {
      setCurrStroke([]);
      return;
    }
    setStrokes((all) => all.slice(0, -1));
  };

  const exportPNG = () => {
    const c = canvasRef.current!;
    // Use full-res PNG (already DPR-aware)
    const dataUrl = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `signature-${Date.now()}.png`;
    a.click();
  };

  // Drag & drop handlers
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const file = e.dataTransfer.files[0];
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const image = new Image();
      image.onload = () => {
        setImg(image);
        setImgScale(Math.min(1, 400 / image.width)); // initial fit
        setImgPos({ x: 40, y: 40 });
      };
      image.src = url;
    };
    reader.readAsDataURL(file);
  };

  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="signature-wrap" style={{ maxWidth: 900, margin: "24px auto", fontFamily: "system-ui, sans-serif" }}>
      <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Sign Here</h2>
      <p style={{ marginTop: 0, color: "#444" }}>
        Draw with your mouse or finger. Or <strong>drag & drop</strong> a signature image (PNG/JPG) onto the canvas.
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
        <button onClick={undo}>Undo</button>
        <button onClick={clearAll}>Clear</button>
        <button onClick={exportPNG}>Export PNG</button>

        {img && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
            <label htmlFor="scale">Image size</label>
            <input
              id="scale"
              type="range"
              min={0.2}
              max={3}
              step={0.05}
              value={imgScale}
              onChange={(e) => setImgScale(parseFloat(e.target.value))}
            />
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        onDrop={onDrop}
        onDragOver={preventDefaults}
        onDragEnter={preventDefaults}
        onDragLeave={preventDefaults}
        style={{
          border: "2px dashed #bbb",
          borderRadius: 12,
          padding: 8,
          background: "#fafafa",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: 360, display: "block", borderRadius: 8, touchAction: "none", background: "#fff" }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={endDrawing}
        />
      </div>

      <small style={{ color: "#666" }}>
        Tip: Drop a scanned signature PNG with transparent background for best results. You can drag it to position and resize with the slider.
      </small>
    </div>
  );
}
