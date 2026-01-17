import crypto from "crypto";
function encryptPlainText(plainText: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(key, "base64"),
    iv,
  );
  const encrypted = Buffer.concat([
    iv,
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  return encrypted.toString("base64");
}

function decryptCipherText(cipherText: string, key: string): string {
  const ivCiphertext = Buffer.from(cipherText, "base64url");
  const iv = ivCiphertext.subarray(0, 16);
  const ciphertext = ivCiphertext.subarray(16);
  const cipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key, "base64"),
    iv,
  );
  const decrypted = Buffer.concat([cipher.update(ciphertext), cipher.final()]);
  return decrypted.toString("utf-8");
}
export { encryptPlainText, decryptCipherText };
