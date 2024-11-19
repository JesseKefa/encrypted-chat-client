# Encrypted Chat Client

## Overview
This project implements an end-to-end encrypted chat system using the **Double Ratchet Algorithm**, designed to meet additional requirements for government surveillance. It offers essential features such as certificate generation, secure key exchange, and encrypted messaging, ensuring **Forward Secrecy** and **Break-in Recovery**.

## Features
- **End-to-End Encryption** using the Double Ratchet Algorithm.
- **ElGamal Key Pairs** for secure initial key exchange.
- **AES-GCM** for symmetric encryption of messages.
- **Forward Secrecy** to safeguard past communications even if current keys are compromised.
- **Government Key Encryption** for encrypting session keys with government-issued public keys.
- **Certificate-based Identity Verification** for enhanced security and trust.

## Prerequisites
- **Node.js** (version 18 or above)
- **NPM** (Node Package Manager)

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd encrypted-chat-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run tests to verify functionality:
   ```bash
   npm test
   ```

## How to Use

### CLI Mode

Interact with the Messenger system via the command-line interface (CLI).

1. Start the CLI:
   ```bash
   node cli.js
   ```

2. Available commands:

   - **Generate a certificate for the user:**
     ```bash
     generate <username>
     ```

   - **Receive and verify a certificate:**
     ```bash
     receive <name> <key> <sig>
     ```

   - **Send an encrypted message:**
     ```bash
     send <name> <message>
     ```

   - **Receive and decrypt a message:**
     ```bash
     receive-message <name>
     ```

   - **Exit the CLI:**
     ```bash
     exit
     ```

### Example Usage:

```
> generate alice
Generated Certificate: { username: 'alice', publicKey: '...' }

> send bob "Hello, Bob!"
Encrypted Message Sent: { header: { iv: '...', authTag: '...' }, ciphertext: '...' }

> receive-message alice
Decrypted Message: Hello, Bob!
```

## Running Tests
To ensure proper functionality, run the following command:

```bash
npm test
```

This executes the test cases in `test-messenger.js` to verify all features are working correctly.

## Project Structure
- **messenger.js**: Core implementation of the Messenger class.
- **lib.js**: Cryptographic utilities (e.g., key generation, encryption, HKDF).
- **test-messenger.js**: Unit tests to verify Messenger functionality.
- **cli.js**: Command-line interface for interacting with the Messenger system.

## Technology Stack
- **Node.js**: Server-side JavaScript runtime.
- **Crypto**: Native Node.js cryptographic library for encryption and key management.
- **Chai**: Assertion library for unit testing.

## Security Features
1. **Double Ratchet Algorithm**: Securely updates encryption keys with each message, ensuring forward secrecy.
2. **Government Surveillance**: Encrypts session keys using a government-issued public key for compliance.
3. **Certificate Verification**: Ensures authenticity of communication via trusted certificate authority.
4. **AES-GCM Encryption**: Provides confidentiality and ensures message integrity with built-in authentication.

## Future Enhancements
- Add support for handling out-of-order messages.
- Develop a web-based user interface for easier interaction.
- Extend functionality to simulate multiple clients for testing.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

