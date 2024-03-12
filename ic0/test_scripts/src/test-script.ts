import { config } from "dotenv";
import { createHostAgentAndIdentityFromSeed, getIdentityFromSeed } from "./icp";
import { callIcrc2Approval, callIcrc2TransferFrom } from "./icp/update";
import { Principal } from "@dfinity/principal";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

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

async function main() {
  const seedPhrase = argv.s;

  const ledgerCanisterId = "ryjl3-tyaaa-aaaaa-aaaba-cai";

  // Initialize the agent with the identity
  const agent = createHostAgentAndIdentityFromSeed(seedPhrase);
  const senderIdentity = getIdentityFromSeed(seedPhrase);
  console.log("Principal: ", senderIdentity.getPrincipal().toString());

  try {
    // Call the icrc2_approve function
    const response = await callIcrc2Approval(ledgerCanisterId, agent, {
      amount: 100_000,
      spender: {
        owner: Principal.fromText(
          "rs5mh-o6yer-kpzmc-vgwfe-7ye7l-5olpo-gj7ud-xxwmm-cnoa2-v6dyr-aae",
        ),
      },
    });
    console.log("Response Approval:", response);
  } catch (error) {
    console.error("Error Approval:", error);
  }

  try {
    // Call the icrc2_transfer_from function
    const response = await callIcrc2TransferFrom(ledgerCanisterId, agent, {
      from_principal: Principal.fromText(
        "rs5mh-o6yer-kpzmc-vgwfe-7ye7l-5olpo-gj7ud-xxwmm-cnoa2-v6dyr-aae",
      ),
      to_principal: Principal.fromText(
        "rg2ah-xl6x4-z6svw-bdxfv-klmal-cwfel-cfgzg-eoi6q-nszv5-7z5hg-sqe",
      ),
      amount: 100_000,
    });
    console.log("Response Transfer:", response.response.headers);
  } catch (error) {
    console.error("Error Approval:", error);
  }
}

main();
