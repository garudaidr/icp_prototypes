# User Cash Management System on ICP

This documentation outlines a comprehensive guide and detailed code explanation for a User Cash Management System created for the Internet Computer (ICP) platform. Utilizing Rust for the backend canister functionality and HTML/JavaScript for the frontend, this system demonstrates the management of user balances in a decentralized environment.

## Overview

The User Cash Management System showcases the capabilities of the Internet Computer in managing user balances through canisters. It comprises two principal components:

- **Backend Canister**: Implements logic for operations such as adding users, updating their balances, and searching within a decentralized database, all coded in Rust.
- **Frontend Canister**: Offers a web interface for user interactions, enabling functionalities like user balance addition, viewing, and searching, designed with HTML and JavaScript.

## Prerequisites

Required installations include:

- Node.js (refer to `package.json` for version compatibility)
- DFINITY Foundation's SDK, `dfx`, for deployment on the Internet Computer
- Rust and Cargo to compile Rust code

## Setup

To initialize the system, follow these instructions:

1. **Clone the Repository**: Begin by cloning the repository to your local machine.
2. **Install Dependencies**: In the project directory, run `npm install` to install the necessary dependencies.
3. **Start the Local Replica**: Execute `dfx start --clean --host 127.0.0.1:8000` to start a local development environment.
4. **Deploy Canisters**: Deploy the canisters to your local replica using `npm run deploy:local`.

## Features

- **Add Users**: Supports adding users via the web interface, with an initial balance that can be incremented.
- **Get Users**: Enables viewing a list of users and their current balances.
- **Search Users**: Allows for searching users by username, highlighting dynamic query functionality.

## Development Commands

- `npm run build`: Compiles the frontend resources.
- `npm run deploy:local`: Deploys canisters to the local development network.
- `npm run deploy:ic`: Deploys canisters to the Internet Computer mainnet, activating the application.
- `npm run generate`: Generates `.did` interface files for canister interaction, aiding frontend-backend communication.

## Backend Canister

The backend canister, crafted in Rust, employs the Candid interface definition language, the IC CDK (Canister Development Kit) macros, and Serde for serialization. It introduces a user store implemented as a binary tree map (`BTreeMap`) for effective user balance management.

### Key Components

- **User Store**: A `BTreeMap<usize, User>` mapping user IDs to user records, facilitating efficient balance management.
- **User Structure**: Defines user data with fields for `principal` and `balance`.
- **Error Handling**: Implements a structure for encapsulating error messages.
- **Periodic Task**: A periodic task increments user balances at specified intervals, demonstrating asynchronous operations and interaction with external canisters.

### Functions

- **init**: Initializes the canister, setting up a periodic task to update user balances.
- **add_user**: Adds a user with a given principal. Principals are associated with an initial balance.
- **get_users**: Retrieves a list of all users along with their balances.
- **search_users**: Filters users by matching part of their principal against a search query.

## Frontend Canister

The frontend, built with simple HTML and JavaScript, facilitates interaction with the backend canister, providing an intuitive UI for adding, viewing, and searching for users based on balance and principal.

### HTML Structure

- A display area for showing user information.
- Buttons for retrieving all users and adding new ones.
- An input field for entering a new user's principal.
- A search interface for users by principal.

### JavaScript Logic

- **getUserBtn**: Fetches and displays all users with their balances.
- **addUserBtn**: Adds a new user with the specified principal.
- **searchUserBtn**: Searches for users by principals matching the search query.
- **updateDbDisplay**: Refreshes the UI with the latest information on users and their balances.

### Interaction Flow

Upon initialization, the JavaScript script fetches and displays existing users and their balances. It responds to user actions like adding new users or searching through the existing ones, updating the UI accordingly.

## Contributing

Contributions are encouraged and appreciated! Feel free to report issues or submit pull requests for fixes or enhancements. Your involvement helps improve the project for everyone.

## License

This project is shared under the MIT License. Refer to the LICENSE file in the repository for the full license text.
