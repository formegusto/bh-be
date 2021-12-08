import ARIAEngine from "./ARIAEngine";

export function stringToByte(
  str: string,
  type: "ascii" | "unicode"
): Uint8Array {
  if (type === "unicode") {
    return new TextEncoder().encode(str);
  } else {
    const bytes: Uint8Array = new Uint8Array(str.length);
    Array.from(str).forEach((_, i) => {
      bytes[i] = str.charCodeAt(i);
    });
    return bytes;
  }
}

export function bytesToString(bytes: any, type: "ascii" | "unicode"): string {
  if (type === "unicode") {
    return new TextDecoder().decode(bytes);
  } else {
    return String.fromCharCode.apply(null, bytes);
  }
}

export function encryptProcess(plainText: string): string {
  const adminKey = process.env.INDBARIAKEY!;
  const aria = new ARIAEngine(256);
  const mk = stringToByte(adminKey, "ascii");
  aria.setKey(mk);
  aria.setupRoundKeys();

  const pt = stringToByte(plainText, "unicode");
  const pt16: Uint8Array[] = [];

  pt.forEach((p, i) => {
    if ((i + 1) % 16 === 0 || i + 1 === pt.length) {
      pt16.push(pt.slice(Math.floor(i / 16) * 16, i + 1));
    }
  });

  let cipherText = "";
  pt16.forEach((p) => {
    const c: Uint8Array = new Uint8Array(16);
    aria.encrypt(p, 0, c, 0);
    cipherText += bytesToString(c, "ascii");
  });

  return cipherText;
}

export function decryptProcess(cipherText: string): string {
  const adminKey = process.env.INDBARIAKEY!;
  const aria = new ARIAEngine(256);
  const mk = stringToByte(adminKey, "ascii");
  aria.setKey(mk);
  aria.setupRoundKeys();

  const dt = stringToByte(cipherText, "ascii");
  const dt16: Uint8Array[] = [];

  dt.forEach((d, i) => {
    if ((i + 1) % 16 === 0) {
      dt16.push(dt.slice(Math.floor(i / 16) * 16, i + 1));
    }
  });

  let decodedByte: Uint8Array = new Uint8Array();
  dt16.forEach((d) => {
    const c: Uint8Array = new Uint8Array(16);
    aria.decrypt(d, 0, c, 0);

    const merge = new Uint8Array(decodedByte.length + c.length);

    merge.set(decodedByte);
    merge.set(c, decodedByte.length);

    decodedByte = merge;
  });

  const decodedText = bytesToString(decodedByte, "unicode");
  return decodedText;
}
