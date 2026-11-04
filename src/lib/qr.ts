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
    color: { dark: "#14203d", light: "#ffffff" },
  });
}

/** The same code in a card's own colours (dark modules on a light ground). */
export function qrSvgColors(url: string, dark: string, light: string): Promise<string> {
  return QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark, light } });
}
