# End-to-End Encrypted Messenger

## Overview
This project implements an end-to-end encrypted chat system using the **Double Ratchet Algorithm**, with additional requirements for government surveillance. The system provides features like certificate generation, secure key exchange, and encrypted messaging, ensuring **Forward Secrecy** and **Break-in Recovery**.

## Features
- End-to-end encryption using the Double Ratchet Algorithm.

- ElGamal key pairs for initial key exchange.

- AES-GCM for symmetric encryption of messages.

- Forward Secrecy to protect past messages if current keys are compromised.

- Government key encryption for session keys.

- Certificate-based identity verification.

## Prerequisites
**Node.js** (version 18 or above)
**NPM** (Node Package Manager)

## Installation
1. Clone the repository:
   ```
    git clone <repository-url>
    cd encrypted-chat-client
    ```

2. Install dependencies:
    ``` 
    npm install
    ```

3. Run tests to verify functionality:
    ``` 
    npm test
    ```

## How to Use
#  CLI Mode

- You can interact with the Messenger system using the CLI tool.

1. Start the CLI:
```
node cli.js
```

2. Available commands:
Generate a certificate for the user.
```
generate <username> 
``` 

Receive and verify a certificate.
```
receive <name> <key> <sig>
```

Send an encrypted message
```
send <name> <message>: 
```

Receive and decrypt a message.
```
receive-message <name>
```

Exit the CLI.
```
exit
```


Example:

```
> generate alice
Generated Certificate: { username: 'alice', publicKey: '...' }

> send bob "Hello, Bob!"
Encrypted Message Sent: { header: { iv: '...', authTag: '...' }, ciphertext: '...' }

> receive-message alice
Decrypted Message: Hello, Bob!
```

## Running Tests
To validate the implementation, run:

```
npm test
```

This runs the test cases provided in test-messenger.js to ensure all functionalities work correctly.

## Project Structure
- messenger.js: Core implementation of the Messenger class.
- lib.js: Cryptographic utilities (e.g., key generation, encryption, HKDF).
- test-messenger.js: Unit tests for verifying Messenger functionality.
- cli.js: Command-line interface for interacting with the Messenger system.
Technology Stack
- Node.js: Server-side JavaScript runtime.
Crypto: Native Node.js cryptographic library for encryption and key management.
- Chai: Assertion library for unit testing.


## Security Features
1. Double Ratchet Algorithm: Securely updates encryption keys after every message.

2. Government Surveillance: Session keys are encrypted with a government-issued public key.

3. Certificate Verification: Trusted central authority verifies the authenticity of certificates.

4. AES-GCM Encryption: Provides confidentiality and message integrity.


## Future Enhancements
- Add support for handling out-of-order messages.
- Create a web-based UI for easier interaction.
- Extend functionality to simulate multiple clients in parallel.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.