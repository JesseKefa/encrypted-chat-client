const readline = require('readline');
const Messenger = require('./messenger.js');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
});

const govPublicKey = 'govPublicKey'; // Replace with a valid government public key
const trustedPartyPublicKey = 'trustedPartyPublicKey'; // Replace with a valid trusted party public key

const user = new Messenger(govPublicKey, trustedPartyPublicKey);

const commands = `
Available commands:
1. generate <username>        - Generate a certificate for the user.
2. receive <name> <key> <sig> - Receive and store a certificate.
3. send <name> <message>      - Send an encrypted message.
4. receive-message <name>     - Receive and decrypt a message.
5. exit                       - Exit the application.
`;

console.log('Welcome to Messenger CLI');
console.log(commands);
rl.prompt();

rl.on('line', async (line) => {
    const args = line.trim().split(' ');
    const command = args[0];

    try {
        switch (command) {
            case 'generate':
                if (args.length !== 2) {
                    console.log('Usage: generate <username>');
                    break;
                }
                const cert = await user.generateCertificate(args[1]);
                console.log('Generated Certificate:', cert);
                break;

            case 'receive':
                if (args.length !== 4) {
                    console.log('Usage: receive <name> <key> <sig>');
                    break;
                }
                const certObj = { username: args[1], publicKey: args[2] };
                await user.receiveCertificate(certObj, args[3]);
                console.log(`Certificate from ${args[1]} received successfully.`);
                break;

            case 'send':
                if (args.length < 3) {
                    console.log('Usage: send <name> <message>');
                    break;
                }
                const receiverName = args[1];
                const message = args.slice(2).join(' ');
                const { header, ciphertext } = await user.sendMessage(receiverName, message);
                console.log('Encrypted Message Sent:', { header, ciphertext });
                break;

            case 'receive-message':
                if (args.length !== 2) {
                    console.log('Usage: receive-message <name>');
                    break;
                }
                const senderName = args[1];
                const decryptedMessage = await user.receiveMessage(senderName);
                console.log('Decrypted Message:', decryptedMessage);
                break;

            case 'exit':
                console.log('Exiting Messenger CLI. Goodbye!');
                process.exit(0);

            default:
                console.log(`Unknown command: ${command}`);
                console.log(commands);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }

    rl.prompt();
}).on('close', () => {
    console.log('Goodbye!');
    process.exit(0);
});
