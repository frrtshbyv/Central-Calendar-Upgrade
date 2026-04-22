import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET ?? "central-calendar-secret-key-change-in-production";
const TTL_MS = 24 * 60 * 60 * 1000;

export function makeAdminToken(email: string): string {
  const exp = Date.now() + TTL_MS;
  const payload = `${email}|${exp}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}|${sig}`, "utf8").toString("base64url");
}

export function verifyAdminToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const idx = decoded.lastIndexOf("|");
    if (idx < 0) return null;
    const payload = decoded.slice(0, idx);
    const sig = decoded.slice(idx + 1);
    const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
    const sigBuf = Buffer.from(sig, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    const pipeIdx = payload.lastIndexOf("|");
    if (pipeIdx < 0) return null;
    const email = payload.slice(0, pipeIdx);
    const exp = Number(payload.slice(pipeIdx + 1));
    if (!Number.isFinite(exp) || Date.now() > exp) return null;
    return email;
  } catch {
    return null;
  }
}
