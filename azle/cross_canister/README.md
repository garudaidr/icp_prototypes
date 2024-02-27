# Azle Cross Canister Calls with SQLite

This project demonstrates how to perform cross-canister calls using Azle, focusing on the interaction between a backend service and a database canister. Here, the database canister manages user data with SQLite, showcasing a novel approach to decentralized database management on the Internet Computer Protocol (ICP).

- [Installation](#installation)
- [Deployment](#deployment)
- [Understanding the Code](#understanding-the-code)
- [Examples](#examples)

Azle helps you build secure, decentralized servers in TypeScript or JavaScript on ICP. For more documentation, see [The Azle Book](https://demergent-labs.github.io/azle/).

## Installation

> Windows is only supported through a Linux virtual environment, such as [WSL](https://learn.microsoft.com/en-us/windows/wsl/install)

**On Ubuntu/WSL:**

```bash
sudo apt-get install podman
```

**On Mac:**

```bash
brew install podman
```

**Node.js Setup:**

It's recommended to use nvm and Node.js 20:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
node --version
```

**ICP Tools:**

Install the `dfx` command line tools for managing ICP applications:

```bash
DFX_VERSION=0.16.1 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
dfx --version
```

If you encounter a `command not found` error for `dfx`, add `$HOME/bin` to your path:

```bash
echo 'export PATH="$PATH:$HOME/bin"' >> "$HOME/.bashrc"
```

## Deployment

```bash
npx azle new cross_canister
cd cross_canister

npm install

dfx start --clean --host 127.0.0.1:8000
```

**Deploy Your Canisters:**

In a new terminal within the `cross_canister` directory:

```bash
dfx deploy
```

Enable auto-reload for HTTP-based canisters during development (not for production):

```bash
AZLE_AUTORELOAD=true dfx deploy
```

**Viewing the Frontend:**

Access your frontend via `http://[canisterId].localhost:8000`.

To find your `[canisterId]`:

```bash
dfx canister id backend
```

Use `curl` or any HTTP client to interact with your canister:

```bash
curl http://[canisterId].localhost:8000/users
curl -X POST -H "Content-Type: application/json" -d "{\"username\": \"newuser\"}" http://[canisterId].localhost:8000/users/add
```

## Understanding the Code

The project consists of two main components:

1. **Database Canister:** Manages a SQLite database to store user data. It exposes functions to add users and retrieve user lists.

2. **Backend Canister:** Serves as the interface for external HTTP requests, forwarding them to the database canister and returning the responses.

This setup demonstrates how to structure and deploy a project with cross-canister calls, enabling a separation of concerns between data management and request handling.

## Examples

Explore more Azle examples in the [examples directory](https://github.com/demergent-labs/azle/tree/main/examples), including:

- [apollo_server](https://github.com/demergent-labs/azle/tree/main/examples/apollo_server)
- [ethers](https://github.com/demergent-labs/azle/tree/main/examples/ethers)
- [express](https://github.com/demergent-labs/azle/tree/main/examples/express)
- [fs](https://github.com/demergent-labs/azle/tree/main/examples/fs)
- [cross_canister_calls](https://github.com/demergent-labs/azle/tree/main/examples/cross_canister_calls)
- [ic_evm_rpc](https://github.com/demergent-labs/azle/tree/main/examples/ic_evm_rpc)
- [sqlite](https://github.com/demergent-labs/azle/tree/main/examples/sqlite)
- [web_assembly](https://github.com/demergent-labs/azle/tree/main/examples/web_assembly)
