/**
 * Secure encryption using Web Crypto API with AES-GCM
 * This is a strong encryption algorithm used by governments and financial institutions
 */

// Convert string to ArrayBuffer
const str2ab = (str: string) => {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

// Convert ArrayBuffer to string
const ab2str = (buf: ArrayBuffer) => {
  return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)))
}

// Convert ArrayBuffer to Base64 string
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = ""
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Convert Base64 string to ArrayBuffer
const base64ToArrayBuffer = (base64: string) => {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

// Generate a cryptographic key from a password
const getKeyFromPassword = async (password: string, salt: Uint8Array) => {
  // Convert password to buffer
  const passwordBuffer = str2ab(password)

  // Import the password as a key
  const passwordKey = await window.crypto.subtle.importKey("raw", passwordBuffer, { name: "PBKDF2" }, false, [
    "deriveKey",
  ])

  // Derive a key using PBKDF2 (Password-Based Key Derivation Function 2)
  // This makes brute force attacks much more difficult
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000, // High iteration count for security
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

// Encrypt a message with a password
export const encryptMessage = async (message: string, password: string) => {
  try {
    // Generate a random salt for key derivation
    const salt = window.crypto.getRandomValues(new Uint8Array(16))

    // Generate a random initialization vector
    const iv = window.crypto.getRandomValues(new Uint8Array(12))

    // Derive encryption key from password and salt
    const key = await getKeyFromPassword(password, salt)

    // Encrypt the message
    const encodedMessage = new TextEncoder().encode(message)
    const encryptedContent = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encodedMessage,
    )

    // Return the encrypted data, IV, and salt as base64 strings
    return {
      encryptedContent: arrayBufferToBase64(encryptedContent),
      iv: arrayBufferToBase64(iv),
      salt: arrayBufferToBase64(salt),
    }
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt message")
  }
}

// Decrypt a message with a password
export const decryptMessage = async (encryptedContent: string, iv: string, salt: string, password: string) => {
  try {
    // Convert base64 strings back to ArrayBuffers
    const encryptedData = base64ToArrayBuffer(encryptedContent)
    const ivBuffer = base64ToArrayBuffer(iv)
    const saltBuffer = base64ToArrayBuffer(salt)

    // Derive the same key from password and salt
    const key = await getKeyFromPassword(password, new Uint8Array(saltBuffer))

    // Decrypt the message
    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(ivBuffer),
      },
      key,
      encryptedData,
    )

    // Decode and return the decrypted message
    return new TextDecoder().decode(decryptedContent)
  } catch (error) {
    console.error("Decryption error:", error)
    return null
  }
}

