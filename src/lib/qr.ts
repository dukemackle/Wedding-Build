import QRCode from "qrcode";

/**
 * A QR code as inline SVG markup, in the brand's forest green.
 *
 * SVG rather than a PNG so it prints sharp at any size -- these end up on
 * table cards, and a blurry code is one a phone won't read in dim light.
 */
export function qrSvg(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0b4a3a", light: "#ffffff" },
  });
}
