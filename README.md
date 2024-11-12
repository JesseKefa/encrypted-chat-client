# Encrypted Chat Client using Double Ratchet Algorithm

This project is an end-to-end encrypted chat client implementation using the Double Ratchet Algorithm, as used by Signal and WhatsApp.

## Features
- Secure Diffie-Hellman key exchange using ElGamal.
- End-to-end encryption using AES-GCM.
- Forward Secrecy and Break-in Recovery as per Signal’s specification.
- Government public key encryption for message headers.

## Setup Instructions
1. Clone this repository:
git clone https://github.com/<username>/encrypted-chat-client.git

csharp
Copy code

2. Navigate into the project directory:
cd encrypted-chat-client

markdown
Copy code

3. Install dependencies:
npm install

bash
Copy code

4. Run the test suite:
npm test

markdown
Copy code

## Running the Application
- The code can be run using Node.js to simulate encrypted messaging between clients.
- The core cryptographic operations are handled by the `lib.js` library.
