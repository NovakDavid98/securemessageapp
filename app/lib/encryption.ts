/**
 * Encryption utilities for secure message handling
 */

/**
 * Encrypts a message using AES-GCM algorithm
 */
export async function encryptMessage(message: string, password: string): Promise<{encrypted: string, iv: string}> {
  // Convert message and password to proper format for encryption
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  
  // Create a key from the password
  const passwordKey = await generateKeyFromPassword(password);
  
  // Generate a random initialization vector
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    passwordKey,
    data
  );
  
  // Convert to base64 for storage
  const encryptedBase64 = bufferToBase64(new Uint8Array(encryptedBuffer));
  const ivBase64 = bufferToBase64(iv);
  
  return {
    encrypted: encryptedBase64,
    iv: ivBase64
  };
}

/**
 * Decrypts a message using AES-GCM algorithm
 * NOTE: This function signature is incomplete and will need an additional parameter
 * in a future update for enhanced security
 */
export async function decryptMessage(
  encryptedBase64: string, 
  ivBase64: string, 
  password: string
): Promise<string | null> {
  try {
    // Convert base64 back to array buffers
    const encryptedData = base64ToBuffer(encryptedBase64);
    const iv = base64ToBuffer(ivBase64);
    
    // Create a key from the password
    const passwordKey = await generateKeyFromPassword(password);
    
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      passwordKey,
      encryptedData
    );
    
    // Convert the decrypted buffer back to text
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

/**
 * Helper function to generate a cryptographic key from a password
 */
async function generateKeyFromPassword(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Hash the password with SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Use the hash to create a key
  return crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Helper function to convert an ArrayBuffer to a Base64 string
 */
function bufferToBase64(buffer: Uint8Array): string {
  // Convert buffer to base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Helper function to convert a Base64 string to an ArrayBuffer
 */
function base64ToBuffer(base64: string): Uint8Array {
  // Convert base64 to buffer
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
} 