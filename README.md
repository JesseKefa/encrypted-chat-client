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
- **Node.js** (version 18 or above)
- **NPM** (Node Package Manager)

## Installation
1. Clone the repository:
   ```
    git clone <repository-url>
    cd encrypted-chat-client
2. Install dependencies:
    ``` 
    npm install
3. Run tests to verify functionality:
    ``` 
    npm test


## How to Use
#  CLI Mode

- You can interact with the Messenger system using the CLI tool.

1. Start the CLI:
```
node cli.js


2. Available commands:
```
generate <username> : Generate a certificate for the user.

receive <name> <key> <sig>: Receive and verify a certificate.

send <name> <message>: Send an encrypted message.

receive-message <name>: Receive and decrypt a message.

exit: Exit the CLI.

Example:

bash
Copy code
> generate alice
Generated Certificate: { username: 'alice', publicKey: '...' }

> send bob "Hello, Bob!"
Encrypted Message Sent: { header: { iv: '...', authTag: '...' }, ciphertext: '...' }

> receive-message alice
Decrypted Message: Hello, Bob!
Running Tests
To validate the implementation, run:

bash
Copy code
npm test
This runs the test cases provided in test-messenger.js to ensure all functionalities work correctly.

Project Structure
messenger.js: Core implementation of the Messenger class.
lib.js: Cryptographic utilities (e.g., key generation, encryption, HKDF).
test-messenger.js: Unit tests for verifying Messenger functionality.
cli.js: Command-line interface for interacting with the Messenger system.
Technology Stack
Node.js: Server-side JavaScript runtime.
Crypto: Native Node.js cryptographic library for encryption and key management.
Chai: Assertion library for unit testing.
Security Features
Double Ratchet Algorithm:

Securely updates encryption keys after every message.
Ensures Forward Secrecy and Break-in Recovery.
Government Surveillance:

Session keys are encrypted with a government-issued public key.
Certificate Verification:

Trusted central authority verifies the authenticity of certificates.
AES-GCM Encryption:

Provides confidentiality and message integrity.
Limitations
Does not handle dropped or out-of-order messages (extra credit feature).
Assumes certificates are exchanged securely via a trusted party.
Future Enhancements
Add support for handling out-of-order messages.
Create a web-based UI for easier interaction.
Extend functionality to simulate multiple clients in parallel.
Author
Your Name
Contact: [your-email@example.com]
University/Organization: Your University Name
License
This project is licensed under the MIT License. See the LICENSE file for details.