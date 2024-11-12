// messenger.js

const lib = require('./lib'); // Importing cryptographic utilities from lib.js

class Messenger {
    constructor(govPublicKey, trustedPartyPublicKey) {
        this.govPublicKey = govPublicKey; // Public key for government surveillance
        this.trustedPartyPublicKey = trustedPartyPublicKey; // Trusted central party public key
        this.certificateStore = {}; // Store for certificates of other clients
        this.sessionState = {}; // Store session state (root key, chain keys, etc.)
    }

    async generateCertificate(username) {
        // Generate ElGamal key pair for Diffie-Hellman key exchange
        const elGamalKeys = await lib.generateEG();
        const certificate = {
            username: username,
            publicKey: elGamalKeys.publicKey,
        };
        // Store private key locally for future use
        this.privateKey = elGamalKeys.privateKey;
        return certificate;
    }

    async receiveCertificate(certificate, signature) {
        // Verify signature from trusted central party
        const isVerified = await lib.verifySignature(this.trustedPartyPublicKey, certificate, signature);
        if (!isVerified) {
            throw 'Certificate verification failed! Possible tampering detected.';
        }
        // Store the certificate for future communication
        this.certificateStore[certificate.username] = certificate.publicKey;
    }

    async sendMessage(receiverName, message) {
        const receiverPublicKey = this.certificateStore[receiverName];
        if (!receiverPublicKey) {
            throw 'Receiver public key not found. Ensure you have the certificate.';
        }

        // Setup Double Ratchet session if not already done
        if (!this.sessionState[receiverName]) {
            await this.initializeSession(receiverName, receiverPublicKey);
        }

        // Encrypt message using Double Ratchet algorithm (includes ratchet step)
        const { ciphertext, header } = await this.ratchetEncrypt(receiverName, message);

        // Return message with necessary headers (for the government and the receiver)
        return { header, ciphertext };
    }

    async receiveMessage(senderName, { header, ciphertext }) {
        const senderPublicKey = this.certificateStore[senderName];
        if (!senderPublicKey) {
            throw 'Sender public key not found. Ensure you have received their certificate.';
        }

        // If session doesn't exist, initialize it
        if (!this.sessionState[senderName]) {
            await this.initializeSession(senderName, senderPublicKey);
        }

        // Decrypt the message using Double Ratchet
        const message = await this.ratchetDecrypt(senderName, header, ciphertext);

        return message;
    }

    async initializeSession(peerName, peerPublicKey) {
        // Diffie-Hellman key exchange for initial root key
        const dhOutput = await lib.computeDH(this.privateKey, peerPublicKey);
        const rootKey = await lib.HMACtoHMACKey(dhOutput); // Use HMAC to derive the root key
        this.sessionState[peerName] = {
            rootKey: rootKey,
            sendingChainKey: null, // Will be derived from root key
            receivingChainKey: null,
        };
    }

    async ratchetEncrypt(peerName, message) {
        // Implement the ratchet step (derive new keys, encrypt message, update chain)
        // Use the root key to update the sending chain key
        const session = this.sessionState[peerName];
        const newChainKey = await lib.HKDF(session.rootKey); // Ratchet step
        session.sendingChainKey = newChainKey;

        // Encrypt the message using the derived key
        const iv = await lib.genRandomSalt(); // Generate a random IV
        const encryptionKey = await lib.HMACtoAESKey(newChainKey);
        const ciphertext = await lib.encryptAESGCM(message, encryptionKey, iv);

        const header = {
            iv, // Include IV in the header for the receiver
        };

        return { ciphertext, header };
    }

    async ratchetDecrypt(peerName, header, ciphertext) {
        // Use the root key to update the receiving chain key
        const session = this.sessionState[peerName];
        const newChainKey = await lib.HKDF(session.rootKey); // Ratchet step
        session.receivingChainKey = newChainKey;

        // Decrypt the message using the derived key
        const decryptionKey = await lib.HMACtoAESKey(newChainKey);
        const message = await lib.decryptAESGCM(ciphertext, decryptionKey, header.iv);

        return message;
    }
}

module.exports = Messenger;
