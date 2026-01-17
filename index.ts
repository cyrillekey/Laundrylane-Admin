import crypto from "crypto";
// random 32 character key
export const key = crypto.randomBytes(32).toString("base64");
console.log(key)