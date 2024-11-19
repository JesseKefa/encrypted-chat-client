const lib = require('./lib'); // Importing cryptographic utilities from lib.js

class Messenger {
    constructor(govPublicKey, trustedPartyPublicKey) {
        this.govPublicKey = govPublicKey; // Public key for government surveillance
        this.trustedPartyPublicKey = trustedPartyPublicKey; // Trusted central party public key
        this.certificateStore = {}; // Store for certificates of other clients
        this.sessionState = {}; // Store session state (root key, chain keys, etc.)
    }

    // Generate and sign a certificate for the user
    async generateCertificate(username) {
        const elGamalKeys = await lib.generateEG();
        const certificate = {
            username: username,
            publicKey: elGamalKeys.publicKey,
        };
        this.privateKey = elGamalKeys.privateKey;

        // Sign the certificate
        const signature = await lib.signCertificate(this.privateKey, certificate);
        this.ownCertificate = { certificate, signature };
        return { certificate, signature };
    }

    // Receive and verify a certificate from a trusted party
    async receiveCertificate(certificate, signature) {
        const isVerified = await lib.verifySignature(
            this.trustedPartyPublicKey,
            certificate,
            signature
        );
        if (!isVerified) {
            throw new Error('Certificate verification failed! Possible tampering detected.');
        }
        this.certificateStore[certificate.username] = certificate.publicKey;
    }

    // Send a message to a valid receiver
    async sendMessage(receiverName, message) {
        const receiverPublicKey = this.certificateStore[receiverName];
        if (!receiverPublicKey) {
            throw new Error('Receiver public key not found. Ensure you have their certificate.');
        }

        if (!this.sessionState[receiverName]) {
            await this.initializeSession(receiverName, receiverPublicKey);
        }

        const { ciphertext, header } = await this.ratchetEncrypt(receiverName, message);

        return { header, ciphertext };
    }

    // Receive and decrypt a message
    async receiveMessage(senderName, { header, ciphertext }) {
        const senderPublicKey = this.certificateStore[senderName];
        if (!senderPublicKey) {
            throw new Error('Sender public key not found. Ensure you have received their certificate.');
        }

        if (!this.sessionState[senderName]) {
            await this.initializeSession(senderName, senderPublicKey);
        }

        const message = await this.ratchetDecrypt(senderName, header, ciphertext);
        return message;
    }

    // Initialize a session for key exchange
    async initializeSession(peerName, peerPublicKey) {
        const dhOutput = await lib.computeDH(this.privateKey, peerPublicKey);
        const rootKey = await lib.HMACtoHMACKey(dhOutput);
        this.sessionState[peerName] = {
            rootKey: rootKey,
            sendingChainKey: null,
            receivingChainKey: null,
        };
    }

    // Encrypt a message using the Double Ratchet algorithm
    async ratchetEncrypt(peerName, message) {
        const session = this.sessionState[peerName];

        // Ratchet step: Update root key and derive new sending chain key
        const newRootKey = await lib.HKDF(session.rootKey);
        const newChainKey = await lib.HKDF(newRootKey);
        session.rootKey = newRootKey;
        session.sendingChainKey = newChainKey;

        // Generate encryption key and IV
        const encryptionKey = await lib.HMACtoAESKey(newChainKey);
        const iv = await lib.genRandomSalt();
        const { ciphertext, authTag } = await lib.encryptAESGCM(message, encryptionKey, iv);

        // Encrypt session key for the government
        const govEncryptedKey = await lib.encryptAESGCM(newChainKey, this.govPublicKey, iv);

        const header = {
            iv,
            authTag,
            govEncryptedKey,
        };

        return { ciphertext, header };
    }

    // Decrypt a message using the Double Ratchet algorithm
    async ratchetDecrypt(peerName, header, ciphertext) {
        const session = this.sessionState[peerName];

        // Ratchet step: Update root key and derive new receiving chain key
        const newRootKey = await lib.HKDF(session.rootKey);
        const newChainKey = await lib.HKDF(newRootKey);
        session.rootKey = newRootKey;
        session.receivingChainKey = newChainKey;

        // Decrypt the message
        const decryptionKey = await lib.HMACtoAESKey(newChainKey);
        const message = await lib.decryptAESGCM(ciphertext, decryptionKey, header.iv, header.authTag);

        return message;
    }
}

module.exports = Messenger;
