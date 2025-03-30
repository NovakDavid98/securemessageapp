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

// Generate a key from password
const getKeyFromPassword = async (password: string) => {
  // Convert password to buffer
  const passwordBuffer = str2ab(password)
  
  // Import the password as a key
  const key = await window.crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  )
  
  return key
}

// Encrypt a message with a password
export const encryptMessage = async (message: string, password: string) => {
  try {
    // Generate a random initialization vector
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    
    // Get key from password
    const key = await getKeyFromPassword(password)
    
    // Encrypt the message
    const encodedMessage = new TextEncoder().encode(message)
    const encryptedContent = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encodedMessage
    )
    
    // Return the encrypted data and IV as base64 strings
    return {
      encryptedContent: arrayBufferToBase64(encryptedContent),
      iv: arrayBufferToBase64(iv),
    }
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt message")
  }
}

// Decrypt a message with a password
export const decryptMessage = async (encryptedContent: string, iv: string, password: string) => {
  try {
    // Convert base64 strings back to ArrayBuffers
    const encryptedData = base64ToArrayBuffer(encryptedContent)
    const ivBuffer = base64ToArrayBuffer(iv)
    
    // Get key from password
    const key = await getKeyFromPassword(password)
    
    // Decrypt the message
    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(ivBuffer),
      },
      key,
      encryptedData
    )
    
    // Decode and return the decrypted message
    return new TextDecoder().decode(decryptedContent)
  } catch (error) {
    console.error("Decryption error:", error)
    return null
  }
}

