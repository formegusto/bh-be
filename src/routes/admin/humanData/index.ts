import { Request, Response, Router } from "express";
import ARIAEngine from "../../../utils/ARIAEngine";
import { bytesToString, stringToByte } from "../../../utils/ARIAUtils";
import { HumanDataBody } from "./types";

const HumanDataRoutes = Router();

HumanDataRoutes.post("/", (req: Request, res: Response) => {
  const body = <HumanDataBody>req.body;

  const adminKey = process.env.INDBARIAKEY!;
  console.log(adminKey);
  const mk = stringToByte(adminKey, "ascii");
  console.log(mk);
  console.log(bytesToString(<any>mk, "ascii"));

  const aria = new ARIAEngine(256);
  aria.setKey(mk);
  aria.setupRoundKeys();

  console.log("plain");
  const plainText = body.building.name;
  console.log(plainText);
  const pt = stringToByte(plainText, "unicode");
  console.log(pt);
  console.log(bytesToString(<any>pt, "unicode"));

  const pt16: Uint8Array[] = [];
  pt.forEach((p, i) => {
    if ((i + 1) % 16 === 0 || i + 1 === pt.length) {
      pt16.push(pt.slice(Math.floor(i / 16) * 16, i + 1));
      // if (i + 1 === pt.length) {
      //   const j = Math.floor(i / 16) * 16;
      //   const tmp_pt = new Uint8Array(16);
      //   for (let z = 0; j + z < pt.length; z++) tmp_pt[z] = pt[z];

      //   pt16.push(tmp_pt);
      // } else {
      //   pt16.push(pt.slice(Math.floor(i / 16) * 16, i + 1));
      // }
    }
  });
  console.log(pt16);

  console.log("cipher");
  let cipherText = "";
  pt16.forEach((p) => {
    const c: Uint8Array = new Uint8Array(16);
    aria.encrypt(p, 0, c, 0);
    console.log(c);
    cipherText += bytesToString(c, "ascii");
  });
  console.log(cipherText);

  console.log("decoded");
  const dt = stringToByte(cipherText, "ascii");
  console.log(dt);
  const dt16: Uint8Array[] = [];
  dt.forEach((d, i) => {
    if ((i + 1) % 16 === 0) {
      dt16.push(dt.slice(Math.floor(i / 16) * 16, i + 1));
    }
  });

  console.log(dt16);

  let decodedByte: Uint8Array = new Uint8Array();
  let decodedText = "";
  dt16.forEach((d) => {
    const c: Uint8Array = new Uint8Array(16);
    aria.decrypt(d, 0, c, 0);

    const merge = new Uint8Array(decodedByte.length + c.length);

    merge.set(decodedByte);
    merge.set(c, decodedByte.length);

    decodedByte = merge;
  });
  console.log(decodedByte);
  console.log(bytesToString(decodedByte, "unicode"));

  return res.status(200).json({
    status: true,
  });
});

export default HumanDataRoutes;
