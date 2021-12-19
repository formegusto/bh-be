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

export function encryptProcess(plainText: string, encryptKey?: string): string {
  const adminKey = encryptKey || process.env.SELF_SYM_KEY!;
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

export function decryptProcess(
  cipherText: string,
  decryptKey?: string
): string {
  const adminKey = decryptKey || process.env.SELF_SYM_KEY!;
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
  dt16.forEach((d, idx) => {
    const c: Uint8Array = new Uint8Array(16);
    aria.decrypt(d, 0, c, 0);

    const merge = new Uint8Array(decodedByte.length + c.length);

    merge.set(decodedByte);
    merge.set(c, decodedByte.length);

    decodedByte = merge;
  });

  const isExistZero = decodedByte.indexOf(0);
  if (isExistZero > -1) {
    decodedByte = decodedByte.slice(0, isExistZero);
  }

  const decodedText = bytesToString(decodedByte, "unicode");
  return decodedText;
}

export function requestBodyEncrypt(
  body: any,
  encryptKey?: string,
  exclude?: string[]
) {
  Object.keys(body).forEach((_, i) => {
    if (_ !== "id" && _ !== "createdAt" && _ !== "updatedAt") {
      if (Array.isArray(body[_])) {
        for (let i = 0; i < body[_].length; i++) {
          if (typeof body[_][i] === "object") {
            requestBodyEncrypt(body[_][i], encryptKey, exclude);
          } else {
            body[_][i] = encryptProcess(body[_][i], encryptKey);
          }
        }
      } else if (typeof body[_] === "object") {
        requestBodyEncrypt(body[_], encryptKey, exclude);
      } else {
        if (!exclude || !exclude.includes(_))
          body[_] = encryptProcess(body[_], encryptKey);
      }
    }
  });
}

export function requestBodyDecrypt(encryptBody: any, decryptKey?: string) {
  Object.keys(encryptBody).forEach((_) => {
    if (typeof encryptBody[_] !== "object") {
      encryptBody[_] = decryptProcess(
        encryptBody[_],
        decryptKey || process.env.COMMUNITY_KEY
      );
    } else {
      requestBodyDecrypt(encryptBody[_], decryptKey);
    }
  });
}
