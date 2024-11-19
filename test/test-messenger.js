const assert = require('chai').assert;
const Messenger = require('../messenger.js');
const lib = require('../lib'); // Ensure this is importing correctly

describe('Messenger functionality', function () {
    let trustedPartyKeys, govKeys;

    before(async function () {
        // Generate trusted party and government key pairs for tests
        trustedPartyKeys = await lib.generateEG();
        govKeys = await lib.generateEG();
    });

    it('should create a Messenger instance', function () {
        const messenger = new Messenger(govKeys.publicKey, trustedPartyKeys.publicKey);
        assert.instanceOf(messenger, Messenger, 'The instance is of type Messenger');
    });

    it('should generate a certificate for a user', async function () {
        const messenger = new Messenger(govKeys.publicKey, trustedPartyKeys.publicKey);
        const { certificate } = await messenger.generateCertificate('alice');
        assert.property(certificate, 'username', 'Certificate should have a username property');
        assert.property(certificate, 'publicKey', 'Certificate should have a publicKey property');
    });

    it('should receive and verify a certificate', async function () {
        const messenger = new Messenger(govKeys.publicKey, trustedPartyKeys.publicKey);
        const { certificate, signature } = await messenger.generateCertificate('alice');

        // Simulate signing by the trusted central party
        const trustedSignature = await lib.signCertificate(trustedPartyKeys.privateKey, certificate);

        await messenger.receiveCertificate(certificate, trustedSignature);
        assert.property(
            messenger.certificateStore,
            'alice',
            'The certificate store should contain Alice\'s public key'
        );
        assert.strictEqual(
            messenger.certificateStore['alice'],
            certificate.publicKey,
            'The stored public key should match Alice\'s public key'
        );
    });

    it('should send a message to a valid receiver', async function () {
        const aliceMessenger = new Messenger(govKeys.publicKey, trustedPartyKeys.publicKey);
        const bobMessenger = new Messenger(govKeys.publicKey, trustedPartyKeys.publicKey);

        const { certificate: aliceCertificate } = await aliceMessenger.generateCertificate('alice');
        const { certificate: bobCertificate } = await bobMessenger.generateCertificate('bob');

        // Simulate certificate exchange and verification
        const aliceTrustedSignature = await lib.signCertificate(trustedPartyKeys.privateKey, aliceCertificate);
        const bobTrustedSignature = await lib.signCertificate(trustedPartyKeys.privateKey, bobCertificate);

        await aliceMessenger.receiveCertificate(bobCertificate, bobTrustedSignature);
        await bobMessenger.receiveCertificate(aliceCertificate, aliceTrustedSignature);

        // Send message from Alice to Bob
        const message = 'Hello, Bob!';
        const { header, ciphertext } = await aliceMessenger.sendMessage('bob', message);

        assert.isObject(header, 'The message should include a header object');
        assert.property(header, 'iv', 'The header should include the initialization vector (IV)');
        assert.isString(ciphertext, 'The ciphertext should be a string');
    });

    it('should receive a message correctly', async function () {
        const aliceMessenger = new Messenger(govKeys.publicKey, trustedPartyKeys.publicKey);
        const bobMessenger = new Messenger(govKeys.publicKey, trustedPartyKeys.publicKey);

        const { certificate: aliceCertificate } = await aliceMessenger.generateCertificate('alice');
        const { certificate: bobCertificate } = await bobMessenger.generateCertificate('bob');

        // Simulate certificate exchange and verification
        const aliceTrustedSignature = await lib.signCertificate(trustedPartyKeys.privateKey, aliceCertificate);
        const bobTrustedSignature = await lib.signCertificate(trustedPartyKeys.privateKey, bobCertificate);

        await aliceMessenger.receiveCertificate(bobCertificate, bobTrustedSignature);
        await bobMessenger.receiveCertificate(aliceCertificate, aliceTrustedSignature);

        // Send and receive message
        const message = 'Hello, Bob!';
        const { header, ciphertext } = await aliceMessenger.sendMessage('bob', message);
        const receivedMessage = await bobMessenger.receiveMessage('alice', { header, ciphertext });

        assert.strictEqual(receivedMessage, message, 'The received message should match the sent message');
    });
});
