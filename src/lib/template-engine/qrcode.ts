import QRCode from "qrcode";

/**
 * Generates a data URL (base64 PNG/SVG) for a given text or URL
 */
export async function generateQRCodeDataUrl(
  text: string,
  options?: {
    darkColor?: string;
    lightColor?: string;
    width?: number;
    margin?: number;
  }
): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: options?.width || 300,
      margin: options?.margin ?? 1,
      color: {
        dark: options?.darkColor || "#000000",
        light: options?.lightColor || "#ffffff00", // Transparent background default
      },
      errorCorrectionLevel: "M",
    });
    return dataUrl;
  } catch (err) {
    console.error("[QRCode] Failed to generate QR code data URL", err);
    return "";
  }
}
