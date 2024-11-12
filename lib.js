const crypto = require('crypto');

// Function to sign a certificate (use RSA, ECDSA, or any signature algorithm you prefer)
async function signCertificate(privateKey, certificate) {
    const certString = JSON.stringify(certificate);  // Convert the certificate to a string (JSON format)
    const signer = crypto.createSign('SHA256');
    signer.update(certString);
    signer.end();
    const signature = signer.sign(privateKey, 'base64');
    return signature;
}

// Function to generate ElGamal keys for Diffie-Hellman key exchange
async function generateEG() {
    // ElGamal requires a large prime number, base, and private/public key generation
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256k1', // Elliptic curve used for ElGamal-like Diffie-Hellman
    });

    return { privateKey, publicKey };
}

// Function to compute Diffie-Hellman shared secret
async function computeDH(privateKey, publicKey) {
    const sharedSecret = crypto.diffieHellman({
        privateKey: privateKey,
        publicKey: publicKey,
    });

    return sharedSecret;
}

// Function to derive a HMAC key (used to derive a root key from DH output)
async function HMACtoHMACKey(sharedSecret) {
    const hmac = crypto.createHmac('sha256', sharedSecret);
    return hmac.digest();
}

// Key Derivation Function (HKDF) to derive new keys from the root key
async function HKDF(rootKey) {
    const salt = Buffer.from('salt');  // This should be a random salt in real applications
    const info = Buffer.from('info');  // Optional application-specific information
    
    // Perform HKDF using SHA256
    const hkdf = crypto.createHmac('sha256', salt);
    hkdf.update(rootKey);
    hkdf.update(info);
    const derivedKey = hkdf.digest();
    
    return derivedKey;
}

// Derive an AES key from an HMAC (this is for encryption/decryption)
async function HMACtoAESKey(chainKey) {
    const hmac = crypto.createHmac('sha256', chainKey);
    const aesKey = hmac.digest().slice(0, 32);  // AES-256 requires 32-byte key
    return aesKey;
}

// Generate a random initialization vector (IV) for AES GCM
async function genRandomSalt() {
    return crypto.randomBytes(16);  // 16-byte IV for AES GCM
}

// Encrypt data using AES GCM mode
async function encryptAESGCM(data, key, iv) {
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();
    return { ciphertext: encrypted, authTag: authTag.toString('base64') };
}

// Decrypt data using AES GCM mode
async function decryptAESGCM(ciphertext, key, iv, authTag) {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = {
    signCertificate,
    generateEG,
    computeDH,
    HMACtoHMACKey,
    HKDF,
    HMACtoAESKey,
    genRandomSalt,
    encryptAESGCM,
    decryptAESGCM,
};
