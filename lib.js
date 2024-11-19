const crypto = require('crypto');

// Function to sign a certificate
function signCertificate(privateKey, certificate) {
    const certString = JSON.stringify(certificate); // Convert certificate to JSON string
    const signer = crypto.createSign('SHA256');
    signer.update(certString);
    signer.end();

    // Ensure the private key is used correctly
    const signature = signer.sign(privateKey, 'base64');
    return signature;
}

// Function to generate ElGamal-like keys using elliptic curves
function generateEG() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256k1', // Curve used for Diffie-Hellman
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return { privateKey, publicKey };
}

// Function to compute Diffie-Hellman shared secret
function computeDH(privateKey, publicKey) {
    const privateKeyObj = crypto.createPrivateKey(privateKey);
    const publicKeyObj = crypto.createPublicKey(publicKey);

    const sharedSecret = crypto.diffieHellman({
        privateKey: privateKeyObj,
        publicKey: publicKeyObj,
    });

    return sharedSecret;
}

// Key Derivation Function (HKDF) for secure key derivation
function HKDF(inputKeyMaterial, salt = crypto.randomBytes(32), info = '') {
    // Step 1: Extract
    const prk = crypto.createHmac('sha256', salt).update(inputKeyMaterial).digest();

    // Step 2: Expand
    const hkdf = crypto.createHmac('sha256', prk).update(info).digest();
    return hkdf.slice(0, 32); // Return a 32-byte key for AES-256
}

// Derive an AES key from HMAC chain key
function HMACtoAESKey(chainKey) {
    const hmac = crypto.createHmac('sha256', chainKey);
    return hmac.digest().slice(0, 32); // AES-256 requires a 32-byte key
}

// Generate a random initialization vector (IV) for AES-GCM
function genRandomSalt() {
    return crypto.randomBytes(16); // 16-byte IV for AES-GCM
}

// Encrypt data using AES-GCM
function encryptAESGCM(data, key, iv) {
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();
    return { ciphertext: encrypted, authTag: authTag.toString('base64') };
}

// Decrypt data using AES-GCM
function decryptAESGCM(ciphertext, key, iv, authTag) {
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
    HKDF,
    HMACtoAESKey,
    genRandomSalt,
    encryptAESGCM,
    decryptAESGCM,
};
