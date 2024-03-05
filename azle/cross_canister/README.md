# Azle Cross Canister Calls with SQLite

This project demonstrates how to perform cross-canister calls using Azle, focusing on the interaction between a backend service and a database canister. Here, the database canister manages user data with SQLite, showcasing a novel approach to decentralized database management on the Internet Computer Protocol (ICP).

Azle helps you build secure, decentralized servers in TypeScript or JavaScript on ICP. For more documentation, see [The Azle Book](https://demergent-labs.github.io/azle/).

## Features

- **Database Canister (`database.ts`)**: Manages a SQLite database for storing user information. Provides functions to add new users and query existing users.
- **Backend (`backend.ts`)**: Serves as the middleware between the frontend and the database canister. Handles HTTP requests for adding and retrieving users, and serves static files.
- **Frontend (`index.html` and `index.ts`)**: Utilizes LitElement to create a web component for user interaction. Allows users to add new usernames to the database and displays the list of added usernames.

## Prerequisites

- Node.js (Recommended: use nvm to install Node.js 20)
- dfx command line tools for managing ICP applications
- Podman (Linux/WSL) or Docker (Mac)

## Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

## Deployment

Start your local ICP replica:

```bash
dfx start --clean --host 127.0.0.1:8000
```

Deploy your canisters:

```bash
dfx deploy
```

For auto-reload during development:

```bash
AZLE_AUTORELOAD=true dfx deploy
```

## Understanding the Code

The project consists of two main components:

1. **Database Canister**: Manages SQLite database for user data storage.
2. **Backend Canister**: Interfaces for external HTTP requests.

This setup demonstrates structuring and deploying projects with cross-canister calls for a clear separation of concerns between data management and request handling.

## Scripts

- `build`: Builds the frontend assets.
- `pretest`, `test`: Scripts for running tests.
- `format`: Formats the codebase using Prettier.

## Examples

Explore Azle examples, including:

- [apollo_server](https://github.com/demergent-labs/azle/tree/main/examples/apollo_server)
- [ethers](https://github.com/demergent-labs/azle/tree/main/examples/ethers)
- [express](https://github.com/demergent-labs/azle/tree/main/examples/express)
- And many more in the [examples directory](https://github.com/demergent-labs/azle/tree/main/examples).

## Contributing

We welcome contributions! Please feel free to submit pull requests or open issues to suggest improvements or add new features.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
