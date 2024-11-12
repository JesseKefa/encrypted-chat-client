const assert = require('chai').assert;
const Messenger = require('../messenger.js');
const lib = require('../lib'); // Ensure this is importing correctly

describe('Messenger functionality', function () {

  it('should create a Messenger instance', function () {
    const messenger = new Messenger('govPublicKey', 'trustedPartyPublicKey');
    assert.instanceOf(messenger, Messenger, 'The instance is of type Messenger');
  });

  it('should generate a certificate for a user', async function () {
    const messenger = new Messenger('govPublicKey', 'trustedPartyPublicKey');
    const certificate = await messenger.generateCertificate('alice');
    assert.property(certificate, 'username', 'Certificate should have username');
    assert.property(certificate, 'publicKey', 'Certificate should have publicKey');
  });

  it('should receive and verify a certificate', async function () {
    const messenger = new Messenger('govPublicKey', 'trustedPartyPublicKey');
    const certificate = await messenger.generateCertificate('alice');
    
    // Replace this with a valid private key (PEM format)
    const privateKey = 'your_private_key'; // Use a valid private key for signing
    const signature = await lib.signCertificate(privateKey, certificate);
    
    await messenger.receiveCertificate(certificate, signature);
    assert.property(messenger.certificateStore, 'alice', 'The certificate store should contain alice\'s public key');
  });

  it('should send a message to a valid receiver', async function () {
    const aliceMessenger = new Messenger('govPublicKey', 'trustedPartyPublicKey');
    const bobMessenger = new Messenger('govPublicKey', 'trustedPartyPublicKey');
    
    const aliceCertificate = await aliceMessenger.generateCertificate('alice');
    const bobCertificate = await bobMessenger.generateCertificate('bob');
    
    // Simulate certificate exchange
    await aliceMessenger.receiveCertificate(bobCertificate, await lib.signCertificate('trustedPartyPrivateKey', bobCertificate));
    await bobMessenger.receiveCertificate(aliceCertificate, await lib.signCertificate('trustedPartyPrivateKey', aliceCertificate));

    const message = 'Hello, Bob!';
    const { header, ciphertext } = await aliceMessenger.sendMessage('bob', message);
    assert.isObject(header, 'Message should include header');
    assert.isString(ciphertext, 'Message should be encrypted');
  });

  it('should receive a message correctly', async function () {
    const aliceMessenger = new Messenger('govPublicKey', 'trustedPartyPublicKey');
    const bobMessenger = new Messenger('govPublicKey', 'trustedPartyPublicKey');
    
    const aliceCertificate = await aliceMessenger.generateCertificate('alice');
    const bobCertificate = await bobMessenger.generateCertificate('bob');
    
    await aliceMessenger.receiveCertificate(bobCertificate, await lib.signCertificate('trustedPartyPrivateKey', bobCertificate));
    await bobMessenger.receiveCertificate(aliceCertificate, await lib.signCertificate('trustedPartyPrivateKey', aliceCertificate));

    const message = 'Hello, Bob!';
    const { header, ciphertext } = await aliceMessenger.sendMessage('bob', message);
    const receivedMessage = await bobMessenger.receiveMessage('alice', { header, ciphertext });
    
    assert.equal(receivedMessage, message, 'The received message should match the sent message');
  });
});
