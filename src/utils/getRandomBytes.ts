import { bytesToString } from "./ARIAUtils";

export default function getRandomBytes(length: number): string {
  const buffer = new Int8Array(length);

  for (let i = 0; i < length; i++)
    buffer[i] = Math.floor(Math.random() * (128 - 33) + 33);

  return bytesToString(buffer, "ascii");
}
