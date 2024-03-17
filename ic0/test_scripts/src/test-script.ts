import { config } from "dotenv";
import { createHostAgentAndIdentityFromSeed, getIdentityFromSeed } from "./icp";
import { transferIcrc1Tokens } from "./icp/update";
import { Principal } from "@dfinity/principal";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { getAccountIdentifier, getIcrc1Balance } from "./icp/query/icrc1";
import { getAccountTransactions } from "./icp/query/indexer";
import { local } from "ic0";

config(); // Initialize dotenv

let argv: any;
argv = yargs(hideBin(process.argv))
  .option("seed_phrase", {
    alias: "s",
    description: "seed phrase",
    type: "string",
    requiresArg: true,
  })
  .help()
  .alias("help", "h").argv;

const fromHexString = (hexString) =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

async function main() {
  const seedPhrase = argv.s;

  const ledgerCanisterId = "ryjl3-tyaaa-aaaaa-aaaba-cai";

  // Initialize the agent with the identity
  const agent = createHostAgentAndIdentityFromSeed(seedPhrase, "http://localhost:8000");
  const senderIdentity = getIdentityFromSeed(seedPhrase);
  console.log("Principal: ", senderIdentity.getPrincipal().toString());

  try {
    // dfx ledger account-id --of-principal rs5mh-o6yer-kpzmc-vgwfe-7ye7l-5olpo-gj7ud-xxwmm-cnoa2-v6dyr-aae --subaccount 0000000000000000000000000000000000000000000000000000000000000001 (edited) 
    // Call the account_identifier function
    const response = await getAccountIdentifier(
      agent,
      ledgerCanisterId,
      Principal.fromText(
        "rs5mh-o6yer-kpzmc-vgwfe-7ye7l-5olpo-gj7ud-xxwmm-cnoa2-v6dyr-aae",
      ),
      fromHexString(
        "0000000000000000000000000000000000000000000000000000000000000001",
      ),
    );
    console.log("Response Subaccount Account Identifier:", response);
  } catch (error) {
    console.error("Error:", error);
  }

  try {
    // Call the icrc1_balance_of function
    const response = await getIcrc1Balance(agent, ledgerCanisterId, {
      owner: Principal.fromText(
        "rs5mh-o6yer-kpzmc-vgwfe-7ye7l-5olpo-gj7ud-xxwmm-cnoa2-v6dyr-aae",
      ),
    });
    console.log("Response Balance Of:", response);
  } catch (error) {
    console.error("Error Balance Of:", error);
  }

  try {
    // Call the icrc1_transfer function
    const response = await transferIcrc1Tokens(agent, ledgerCanisterId, {
      to: {
        owner: Principal.fromText(
          "rs5mh-o6yer-kpzmc-vgwfe-7ye7l-5olpo-gj7ud-xxwmm-cnoa2-v6dyr-aae",
        ),
      },
      amount: 100_000_000,
    });
    console.log("Response Transfer:", response.response);
  } catch (error) {
    console.error("Error Approval:", error);
  }

  const indexerCanisterId = "ryjl3-tyaaa-aaaaa-aaaba-cai";

  try {
    // Call the icrc1_balance_of function
    const agentCanister = local(indexerCanisterId);
    const response = await getAccountTransactions(agentCanister, {
      owner: Principal.fromText(
        "rs5mh-o6yer-kpzmc-vgwfe-7ye7l-5olpo-gj7ud-xxwmm-cnoa2-v6dyr-aae",
      ),
    });
    console.log("Response Balance Of:", response);
  } catch (error) {
    console.error("Error Balance Of:", error);
  }
}

main();
