# ICP Ledger and Indexer Local Setup

## Overview
When working in a local development environment, i.e., with a local replica instead of the public Internet Computer, you cannot access the ICP ledger. To test applications that integrate with the ICP ledger locally, it's necessary to deploy a local ledger canister. However, this local ledger canister won't have the history and balances of the live ICP ledger.

There are two methods for deploying an ICP ledger locally:

1. **Use dfx-nns to deploy the entire NNS locally.** Since the ICP ledger is part of the NNS, this command will also install an ICP ledger with canister ID `ryjl3-tyaaa-aaaaa-aaaba-cai`. This solution is fast, straightforward, but more heavyweight.
2. **Deploy the ICP ledger wasm locally.** This method, discussed in this guide, offers more control over the deployment and is lightweight.

Deploying an ICP ledger locally provides advantages over the default ledger from `dfx` that is installed with `dfx nns install`, such as defining the minting account, control over the initialization arguments, and which wasm version of the ICP ledger to interact with.

The ICP ledger only exists on the mainnet, and the wasm running there is not intended for other token deployments. It's meant to be backward compatible, thus contains legacy code not recommended for new ledger deployments.

For deploying your own token or building an ICRC-1 ledger, refer to the guide on setting up an ICRC-1 ledger.

## Steps to Deploy Your Copy of the Ledger Canister to a Local Replica

### Step 1: Install the IC SDK
Ensure you are using a recent version of the IC SDK. If not installed, follow the instructions in the installing the IC SDK section.

### Step 2: Create a New dfx Project
```bash
dfx new icp_ledger_canister
cd icp_ledger_canister
```

### Step 3: Delete all the files and folders except dfx.json
Delete all the files and folders generated except the `dfx.json` file in your project's main directory.

### Step 4: Configure the dfx.json File
Open the `dfx.json` file in your project's directory and replace its content with the provided JSON configuration. 

```json
{
  "canisters": {
    "icp_ledger_canister": {
      "type": "custom",
      "candid": "https://raw.githubusercontent.com/dfinity/ic/d87954601e4b22972899e9957e800406a0a6b929/rs/rosetta-api/icp_ledger/ledger.did",
      "wasm": "https://download.dfinity.systems/ic/d87954601e4b22972899e9957e800406a0a6b929/canisters/ledger-canister.wasm.gz",
      "remote": {
        "id": {
          "ic": "ryjl3-tyaaa-aaaaa-aaaba-cai"
        }
      }
    }
  },
  "defaults": {
    "build": {
      "args": "",
      "packtool": ""
    }
  },
  "output_env_file": ".env",
  "version": 1
}
```

### Step 5: Start a Local Replica
```bash
dfx start --background --clean
```

### Step 6: Create a New Identity for the Minting Account
```bash
dfx identity new minter
dfx identity use minter
export MINTER_ACCOUNT_ID=$(dfx ledger account-id)
```

Transfers from the minting account create Mint transactions, and to the minting account create Burn transactions.

### Step 7: Switch Back to Your Default Identity
```bash
dfx identity use default
export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id)
```

### Step 8: Deploy the Ledger Canister with Archiving Options
Use `dfx deploy` with the specified arguments to deploy the ledger canister, setting up initial values, the minting account, and other options.

```bash
dfx deploy --specified-id ryjl3-tyaaa-aaaaa-aaaba-cai icp_ledger_canister --argument "
  (variant {
    Init = record {
      minting_account = \"$MINTER_ACCOUNT_ID\";
      initial_values = vec {
        record {
          \"$DEFAULT_ACCOUNT_ID\";
          record {
            e8s = 10_000_000_000 : nat64;
          };
        };
      };
      send_whitelist = vec {};
      transfer_fee = opt record {
        e8s = 10_000 : nat64;
      };
      token_symbol = opt \"LICP\";
      token_name = opt \"Local ICP\";
    }
  })
"
```

### Step 9: Interact with the Canister
Interact with the canister using CLI commands or the Candid UI, as demonstrated, to work with your local ICP ledger canister.

```
http://127.0.0.1:4943/?canisterId=bnz7o-iuaaa-aaaaa-qaaaa-cai&id=ryjl3-tyaaa-aaaaa-aaaba-cai
```

Your local ICP ledger canister is now up and running, ready for other canisters to communicate with it.

### Step 10: Deploy the Index Canister
Use `dfx deploy` with the specified arguments to deploy the index canister, setting up initial values, the minting account, and other options.

```bash
dfx deploy icp_index_canister --specified-id qhbym-qaaaa-aaaaa-aaafq-cai --argument '(record {ledger_id = principal "ryjl3-tyaaa-aaaaa-aaaba-cai"})'
```

# Appendix
Extra explanations on commands used during development and deployment activities.
## Detailed Command Explanation
This document explains each command from a sequence of operations typically performed during development and deployment activities on the Internet Computer using the DFINITY SDK (`dfx`), Rust, and cargo tools.
### Commands Breakdown
#### Exploring and Setting Up the Environment
1. `ls`
   Lists the contents of the current directory. This command is often used to view the projects and files in the working directory.
2. `cd icp_index_canister/`
   Changes the current directory to `icp_index_canister`, which is presumably a project or canister directory.
3. `rustrover .`
   This appears to be a custom or context-specific command, possibly a typo or a script. Typically, Rust-related commands start with `cargo`. It might be intended for operations like linting, building, or analyzing Rust code.
4. `cd ..`
   Returns to the parent directory of the current location, stepping out of `icp_index_canister`.
5. `cd icp_index_canister/`
   Re-enters the `icp_index_canister` directory, indicating perhaps a reconsideration or a step in a repetitive process.
6. `rustrover .`
   Repeats the operation, likely for code verification or another specific purpose within the `icp_index_canister` project.
#### Managing Rust Dependencies
7. `cd src/rust_profile_backend/`
   Navigates into the `src/rust_profile_backend` directory, which suggests a Rust project structure with a backend component.
8. `cargo update`
   Updates the Rust project's dependencies to their latest versions according to the `Cargo.toml` file. This ensures the project uses the most recent libraries and frameworks.
9. `cd ../..`
   Moves back two directory levels, likely returning to the root of the project or a specific starting point.
#### Clearing the Screen and Deploying Canisters
10. `clear`
    Clears the terminal screen for better visibility of subsequent commands.
11. `dfx deploy`
    Deploys all canisters specified in the project's `dfx.json` configuration file to the local Internet Computer network. This command compiles the canisters and prepares them for interaction.
#### Project and Canister Management
12. `cd src/rust_profile_backend/`
    Re-enters the `src/rust_profile_backend` directory for further operations on the Rust backend.
13. `cargo update`
    Again, updates the Rust project's dependencies.
14. `dfx start --clean --background`
    Starts the local replica of the Internet Computer network, removing the state from any previous runs (`--clean`) and running in the background (`--background`).
15. `dfx stop`
    Stops the running local Internet Computer network replica.
#### Creating and Configuring New Projects
16. `cd vault/`
    Moves into the `vault` directory, possibly another project or component within the workspace.
17. `rustrover .`
    Executes the `rustrover` command again within the new context, for reasons similar to previous invocations.
18. `dfx new --type=rust rust_profile`
    Creates a new project named `rust_profile` with Rust as the specified type. This initializes a project structure suited for Rust development on the Internet Computer.
19. `rm -vrf rust_profile`
    Removes the `rust_profile` directory and all of its contents. The `-v` flag provides verbose output, and `-rf` forces recursive deletion without prompts.
20. `dfx new rust_profile --type=rust --no-frontend`
    Creates a new Rust project named `rust_profile` without a frontend component. This focuses the project on backend or canister logic.
#### Advanced Deployment and Configuration
21. `sudo su`
    Switches to the root user. This command is generally used for operations requiring administrative privileges.
22. `df -h`
    Displays disk space usage in human-readable format. It is useful for checking available storage before proceeding with deployments or installations.
23. `dfx deploy icp_index_canister --specified-id qhbym-qaaaa-aaaaa-aaafq-cai --argument '(record {ledger_id = principal "ryjl3-tyaaa-aaaaa-aaaba-cai"})'`
    Deploys the `icp_index_canister` with a specified canister ID and initialization arguments. This allows for precise control over canister deployment and configuration.
#### Interacting with Canisters and Managing Identities
24. `dfx canister call qhbym-qaaaa-aaaaa-aaafq-cai ledger_id '()'`
    Invokes a method (`ledger_id`) on the specified canister (`qhbym-qaaaa-aaaaa-aaafq-cai`), passing no arguments to the method. This call is likely
 to retrieve or interact with the ledger ID within the canister.
25. `dfx identity new adam`
    Creates a new identity named `adam`. Identities are used to manage different profiles or personas when interacting with the Internet Computer.
26. `dfx identity use adam`
    Switches the current working identity to `adam`, affecting subsequent commands that rely on the identity context.
27. `dfx ledger account-id`
    Retrieves the account ID associated with the current identity, useful for transactions and ledger interactions.
#### Ledger and Transaction Operations
28. `dfx ledger get-principal`
    Fetches the principal ID associated with the current ledger account. Principals are unique identifiers for users and canisters on the Internet Computer.
29. `dfx canister call ryjl3-tyaaa-aaaaa-aaaba-cai icrc1_transfer '(record { to = record { owner = principal "faaxs-bnxon-kqibg-iysrk-4vcrb-tedik-5eqlw-uvrzo-apf56-5ctmn-yae";};  amount = 1000000000:nat;})'`
    Executes a token transfer (`icrc1_transfer`) from the `ryjl3-tyaaa-aaaaa-aaaba-cai` canister, specifying the recipient and amount. This command demonstrates how to perform financial transactions on the Internet Computer.
30. `dfx canister call qhbym-qaaaa-aaaaa-aaafq-cai get_account_transactions '(record{account=record {owner = principal "qc3dy-uhurk-5656j-j7m2w-ceieg-rfr26-qvbv4-kmjv7-oxxar-w4wmn-tqe"}; max_results=100:nat})'`
    Requests a list of account transactions for a specified account, limiting the response to a maximum number of results. This is useful for auditing and tracking financial activities.
#### Final Operations and Cleanup
31. `dfx canister call ryjl3-tyaaa-aaaaa-aaaba-cai icrc1_transfer '(record { to = record { owner = principal "qc3dy-uhurk-5656j-j7m2w-ceieg-rfr26-qvbv4-kmjv7-oxxar-w4wmn-tqe"; subaccount = blob "37, 65, 61, 65, 61, 35, 37, 32, 39, 36, 34, 33, 39, 36, 37, 38, 32, 64, 31, 34, 63, 38, 30, 62, 63, 62, 39, 35, 31, 34, 66, 65, 32, 63, 33, 32, 61, 62, 36, 33, 64, 33, 65, 35, 33, 66, 61, 30, 30, 34, 36, 30, 63, 31, 37, 64, 38, 65, 66, 64, 38, 32, 37, 38"; };  amount = 120000000:nat;})'`
    Initiates another token transfer with a specified amount and detailed recipient information, including a subaccount represented as a blob. This command indicates the use of subaccounts for transaction differentiation or management.
32. `dfx identity use adam`
    Switches back to the `adam` identity, likely for further operations or cleanup under this identity.
33. `dfx ledger --network local balance 7eaea572964396782d14c80bcb9514fe2c32ab63d3e53fa00460c17d8efd8278`
    Checks the balance of a specific account or subaccount on the local network. This is part of managing finances and understanding the state of accounts within the development environment.
### Conclusion
This detailed breakdown covers a variety of commands used for development, deployment, and management of projects on the Internet Computer. From basic directory navigation to complex ledger transactions, these commands represent a comprehensive workflow for developers working within the DFINITY ecosystem.