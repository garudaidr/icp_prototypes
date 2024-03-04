# User Management System

This repository contains the code for a basic User Management System designed for the Internet Computer platform. It showcases the use of canisters to manage users in a decentralized database, with a simple web interface for interaction.

## Overview

The system is split into two main components:

- **Backend Canister**: Written in Rust, this canister handles the logic for adding and retrieving users from a database.
- **Database Canister**: Also written in Rust, this canister acts as a simple database, storing user information.
- **Frontend**: A basic HTML/JavaScript frontend for interacting with the canisters.

## Prerequisites

Before you start, ensure you have the following installed:

- Node.js (Refer to `package.json` for compatible versions)
- dfx (The DFINITY Foundation's SDK for building on the Internet Computer)
- Rust and cargo for compiling the canisters

## Setup

1. **Clone the Repository**

   Begin by cloning this repository to your local machine.

2. **Install Dependencies**

   Navigate to the project directory and run:

   ```sh
   npm install
   ```

3. **Start the Local Replica**

   To develop and test locally, start the dfx local replica:

   ```sh
   dfx start --clean --host 127.0.0.1:8000
   ```

4. **Deploy Canisters**

   Deploy the canisters to your local replica:

   ```sh
   dfx deploy --network=local
   ```

## Features

- **Add Users**: Users can be added through the web interface.
- **Get Users**: View a list of added users.

## Development Commands

- `npm run build`: Builds the frontend.
- `npm run deploy:local`: Deploys canisters to the local network.
- `npm run deploy:ic`: Deploys canisters to the Internet Computer mainnet.
- `npm run generate`: Generates `.did` files for interacting with canisters.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with any improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
