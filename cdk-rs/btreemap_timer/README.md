# User Cash Management System on ICP

This documentation combines a detailed code explanation and setup guide for a User Management System designed for the Internet Computer (ICP) platform. The system utilizes Rust for the backend canister and HTML/JavaScript for the frontend, showcasing the management of users in a decentralized database.

## Overview

The User Management System is designed to demonstrate the capabilities of the Internet Computer in handling user data through canisters. It is divided into two main components:

- **Backend Canister**: Implements logic for user operations such as adding, retrieving, and searching users within a decentralized database, written in Rust.
- **Frontend Canister**: Provides a simple web interface for user interaction, allowing for operations like user addition, viewing, and searching, developed with HTML and JavaScript.

## Prerequisites

To work with this system, the following installations are necessary:

- Node.js (check `package.json` for version compatibility)
- DFINITY Foundation's SDK, `dfx`, for building and deploying on the Internet Computer
- Rust and Cargo for compiling Rust code

## Setup

Follow these steps to get the system up and running:

1. **Clone the Repository**: Start by cloning this repository to your local environment.
2. **Install Dependencies**: Navigate to the project directory and execute `npm install` to install necessary dependencies.
3. **Start the Local Replica**: Utilize `dfx start --clean --host 127.0.0.1:8000` to initiate a local development environment.
4. **Deploy Canisters**: Use `npm run deploy:local` to deploy the canisters onto your local replica.

## Features

- **Add Users**: Facilitates adding users through the web interface, with an auto-incremented cash value for each user.
- **Get Users**: Allows viewing a list of users added to the system.
- **Search Users**: Enables searching for users by username, showcasing dynamic user query functionality.

## Development Commands

- `npm run build`: Compiles the frontend resources.
- `npm run deploy:local`: Deploys canisters to the local development network.
- `npm run deploy:ic`: Deploys canisters to the Internet Computer mainnet, making the application live.
- `npm run generate`: Generates `.did` interface files necessary for interacting with canisters, facilitating frontend-backend communication.

## Backend Canister

The backend canister, written in Rust, employs the Candid interface definition language, the IC CDK (Canister Development Kit) macros, and Serde for serialization. It features a user store implemented as a binary tree map (`BTreeMap`) for efficient user management.

### Key Components

- **User Store**: A `BTreeMap<usize, User>` mapping user IDs to user records.
- **User Structure**: Represents user data, including `username` and `cash`.
- **Error Handling**: A simple structure to encapsulate error messages.
- **Periodic Task**: Upon initialization, a periodic task is set to increment each user's cash by 1 unit every second.

### Functions

- **init**: Initializes the canister and starts a periodic task.
- **add_user**: Adds a new user with a specified username. Usernames are stored along with an initial cash value of 0.
- **get_users**: Retrieves a list of all users.
- **search_users**: Filters users based on a search query matching part of their username.

## Frontend Canister

The frontend is designed with basic HTML and JavaScript to interact with the backend canister. It provides a simple UI for adding, viewing, and searching for users.

### HTML Structure

- A display area to show user information.
- Buttons for retrieving all users and adding new users.
- An input field for adding a new user's username.
- An input field and a button for searching users by username.

### JavaScript Logic

- **getUserBtn**: Fetches and displays all users.
- **addUserBtn**: Adds a new user with the specified username.
- **searchUserBtn**: Searches for users with usernames that include the search query.
- **updateDbDisplay**: Updates the UI with the latest users' information.

### Interaction Flow

The JavaScript script initializes by immediately fetching and displaying existing users. It listens for button clicks to add new users or search through existing ones, updating the UI in response to these actions.

## Contributing

We welcome contributions! Feel free to open an issue or submit a pull request with any fixes or enhancements. Your input helps make this project better for everyone.

## License

This project is open-sourced under the MIT License. See the LICENSE file in the repository for full license text.
