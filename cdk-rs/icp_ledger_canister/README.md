# ICP Ledger Local Setup

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