import dotenv from "dotenv";

dotenv.config();

import crypto from "crypto";

// SECRETS ENCRYPTION ==========================================================

const algorithm = "aes-256-gcm";
const key = Buffer.from(process.env.TOTP_SECRET, "hex");

// encrypt secrets with crypto + AES-GCM ---------------------------------------
export function encrypt(text) {
	const iv = crypto.randomBytes(12); // 96-bit nonce for GCM
	const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

	const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
	const tag = cipher.getAuthTag();

	return {
		iv: iv.toString("hex"),
		content: encrypted.toString("hex"),
		tag: tag.toString("hex")
	};
}

// decrypt secrets -------------------------------------------------------------
export function decrypt({ iv, content, tag }) {
	const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, "hex"));
	decipher.setAuthTag(Buffer.from(tag, "hex"));

	const decrypted = Buffer.concat([
		decipher.update(Buffer.from(content, "hex")),
		decipher.final()
	]);

	return decrypted.toString("utf8");
}

// DEFAULT EXPORT ==============================================================

export default {
	encrypt,
	decrypt
};