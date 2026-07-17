import bnBijoy2Unicode from "@codesigntheory/bnbijoy2unicode";

const unicodeBangla = /[\u0980-\u09FF]/;
// Characteristic glyphs produced when SutonnyMJ/Bijoy ANSI text is extracted from a PDF.
const bijoyMarkers = /[†‡ˆ‰Š‹›œ]/;

function convertBijoySegment(segment: string): string {
  if (unicodeBangla.test(segment) || !bijoyMarkers.test(segment))
    return segment;
  return bnBijoy2Unicode(segment).normalize("NFC");
}

/** Preserves Unicode Bangla and English, converting only confidently detected Bijoy ANSI text. */
export function normalizeBanglaText(text: string): string {
  return text
    .split(/(\r?\n)/)
    .map(convertBijoySegment)
    .join("")
    .normalize("NFC");
}
