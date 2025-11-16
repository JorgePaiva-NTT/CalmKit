// Frontend E2EE utilities using Web Crypto API (AES-256-GCM)
// A user-provided passphrase derives a key (PBKDF2). Salt is stored locally.

const LOCAL_SALT_KEY = "CK_LOGS_SALT";
const SESSION_CODE_KEY = "CK_PASSCODE";
const MEMORY = {
  key: null, // CryptoKey in memory
  salt: null, // Uint8Array
};

function toUint8(str) {
  return new TextEncoder().encode(str);
}
function b64encode(arrBuf) {
  const bytes = new Uint8Array(arrBuf);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}
function b64decode(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function getOrCreateSalt() {
  if (MEMORY.salt) return MEMORY.salt;
  const existing = localStorage.getItem(LOCAL_SALT_KEY);
  if (existing) {
    MEMORY.salt = new Uint8Array(b64decode(existing));
    return MEMORY.salt;
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem(LOCAL_SALT_KEY, b64encode(salt));
  MEMORY.salt = salt;
  return salt;
}

export async function setPassphrase(passphrase) {
  const salt = getOrCreateSalt();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    toUint8(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: 200_000,
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  MEMORY.key = key;
}

export function hasKey() {
  return !!MEMORY.key;
}

export function isValidPasscode(code) {
  return typeof code === "string" && /^\d{4}$/.test(code.trim());
}

export function savePasscode(code) {
  if (!isValidPasscode(code)) throw new Error("Invalid passcode");
  sessionStorage.setItem(SESSION_CODE_KEY, code.trim());
}

export function isCorrectPasscode(code) {
  const stored = getPasscode();
  return stored === code;
}

export function getPasscode() {
  return sessionStorage.getItem(SESSION_CODE_KEY);
}

// Expose the local salt (base64) to support backend migration
export function getLocalSaltB64() {
  return localStorage.getItem(LOCAL_SALT_KEY) || null;
}

export async function ensureKeyFromSession() {
  if (MEMORY.key) return true;
  const code = getPasscode();
  if (!isValidPasscode(code || "")) return false;
  await setPassphrase(code);
  return true;
}
