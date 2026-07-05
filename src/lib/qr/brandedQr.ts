import { toDataURL } from "qrcode";

export async function generateTrackingQR(
  trackingNumber: string
): Promise<string> {
  const url = `https://civicsetu.app/track/${trackingNumber}`;

  const dataUrl = await toDataURL(url, {
    width: 256,
    margin: 2,
    color: {
      dark: "#FF9933",
    },
  });

  return dataUrl;
}
