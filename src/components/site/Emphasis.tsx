/** Ubah teks bertanda *bintang* menjadi <em> (huruf miring berwarna), mis. "untuk *Buah Hati* Tercinta". */
export function Emphasis({ text }: { text: string }) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.length > 2 && part.startsWith("*") && part.endsWith("*") ? <em key={i}>{part.slice(1, -1)}</em> : part,
  );
}

export const stripEmphasis = (text: string) => text.replaceAll("*", "");
