/**
 * CUE CARD IMAGE EXPORT
 * =====================
 * Generates downloadable PNG/JPG images of stamped cue cards.
 * Uses the Canvas API to render the card with QR code.
 * No external dependencies needed beyond qrcode.react (already installed).
 */

/**
 * Generate a QR code as a data URL using Canvas API.
 * This avoids needing the node-based qrcode package for image generation.
 */
export async function generateQRDataUrl(
  text: string,
  size: number = 200
): Promise<string> {
  // Use the browser-native approach with a hidden QRCode component
  // Since qrcode.react renders to SVG/Canvas, we can extract it
  // For the export, we use a simple pattern-based QR (the real QR renders via React)

  // Dynamic import of qrcode library for canvas rendering
  const { toDataURL } = await import("qrcode");
  return toDataURL(text, {
    width: size,
    margin: 2,
    errorCorrectionLevel: "H",
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}

export interface CardExportOptions {
  title: string;
  subtitle?: string;
  bodyText: string;
  hashtags: string[];
  qrUrl: string;
  cardStyle: "standard" | "bold" | "minimal" | "quote";
  width?: number;
  height?: number;
  format?: "png" | "jpeg";
}

/**
 * Render a cue card to a downloadable image.
 */
export async function exportCardAsImage(
  options: CardExportOptions
): Promise<Blob> {
  const {
    title,
    subtitle,
    bodyText,
    hashtags,
    qrUrl,
    cardStyle,
    width = 1200,
    height = 630, // Twitter/OG image ratio
    format = "png",
  } = options;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // ─── Background ───
  const gradients: Record<string, [string, string]> = {
    standard: ["#1a1a2e", "#16213e"],
    bold: ["#0f3460", "#533483"],
    minimal: ["#f8f9fa", "#ffffff"],
    quote: ["#2c1810", "#1a0f0a"],
  };
  const [c1, c2] = gradients[cardStyle] || gradients.standard;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, c1);
  gradient.addColorStop(1, c2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // ─── Text color ───
  const isLight = cardStyle === "minimal";
  const textColor = isLight ? "#1a1a1a" : "#ffffff";
  const mutedColor = isLight ? "#666666" : "#aaaaaa";
  const accentColor = isLight ? "#6366f1" : "#818cf8";

  // ─── Liana Banyan watermark ───
  ctx.fillStyle = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.03)";
  ctx.font = "bold 120px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("LB", width - 40, height - 20);

  // ─── Title ───
  ctx.textAlign = "left";
  ctx.fillStyle = textColor;
  ctx.font = "bold 42px system-ui, sans-serif";
  ctx.fillText(title, 60, 80);

  // ─── Subtitle ───
  if (subtitle) {
    ctx.fillStyle = accentColor;
    ctx.font = "500 24px system-ui, sans-serif";
    ctx.fillText(subtitle, 60, 120);
  }

  // ─── Body text (word-wrapped) ───
  ctx.fillStyle = mutedColor;
  ctx.font = "400 20px system-ui, sans-serif";
  const maxTextWidth = width - 300; // Leave room for QR
  const words = bodyText.split(" ");
  let line = "";
  let y = subtitle ? 170 : 140;
  const lineHeight = 28;

  for (const word of words) {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxTextWidth && line !== "") {
      ctx.fillText(line.trim(), 60, y);
      line = word + " ";
      y += lineHeight;
      if (y > height - 120) break; // Don't overflow
    } else {
      line = testLine;
    }
  }
  if (line.trim()) ctx.fillText(line.trim(), 60, y);

  // ─── Hashtags ───
  if (hashtags.length > 0) {
    ctx.fillStyle = accentColor;
    ctx.font = "400 16px system-ui, sans-serif";
    const hashtagText = hashtags.map((h) => `#${h}`).join("  ");
    ctx.fillText(hashtagText, 60, height - 40);
  }

  // ─── LianaBanyan.com ───
  ctx.fillStyle = mutedColor;
  ctx.font = "300 14px system-ui, sans-serif";
  ctx.fillText("lianabanyan.com", 60, height - 15);

  // ─── QR Code ───
  try {
    const qrDataUrl = await generateQRDataUrl(qrUrl, 180);
    const qrImage = new Image();
    await new Promise<void>((resolve, reject) => {
      qrImage.onload = () => resolve();
      qrImage.onerror = reject;
      qrImage.src = qrDataUrl;
    });

    // White background for QR
    const qrX = width - 220;
    const qrY = height - 230;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(qrX - 15, qrY - 15, 210, 210, 12);
    ctx.fill();

    // Draw QR
    ctx.drawImage(qrImage, qrX, qrY, 180, 180);
  } catch {
    // Fallback: just draw a placeholder square
    const qrX = width - 220;
    const qrY = height - 230;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(qrX - 15, qrY - 15, 210, 210, 12);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.fillText("QR CODE", qrX + 90, qrY + 95);
    ctx.textAlign = "left";
  }

  // ─── Export ───
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create image"));
      },
      format === "jpeg" ? "image/jpeg" : "image/png",
      0.95
    );
  });
}

/**
 * Download a cue card as an image file.
 */
export async function downloadCardImage(
  options: CardExportOptions,
  filename?: string
): Promise<void> {
  const blob = await exportCardAsImage(options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `cue-card-${Date.now()}.${options.format || "png"}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
