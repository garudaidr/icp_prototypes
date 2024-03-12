import ic from "ic0";
import { Principal } from "@dfinity/principal";
import { IDL } from "@dfinity/candid";
import { HttpAgent } from "@dfinity/agent";

// Utility functions for encoding and decoding data will go here

// Retrieve ledger ID
export async function getLedgerId(agent: HttpAgent, canisterId: string) {
  return await agent.query(canisterId, {
    methodName: "ledger_id",
    arg: IDL.encode([], []),
  });
}

// Retrieve ledger status
export async function getStatus(agent: HttpAgent, canisterId: string) {
  return await agent.query(canisterId, {
    methodName: "status",
    arg: IDL.encode([], []),
  });
}

// Queries a range of blocks from the ledger
export async function getBlocks(
  agent: HttpAgent,
  canisterId: string,
  start: bigint,
  length: bigint,
) {
  const argTypes = IDL.Record({
    start: IDL.Nat64,
    length: IDL.Nat64,
  });

  const encodedArgs = IDL.encode([argTypes], [{ start, length }]);

  // Use the `get_blocks` method to retrieve the blocks
  return await agent.query(canisterId, {
    methodName: "get_blocks",
    arg: encodedArgs,
  });
}

/**
 * Fetches the initial transaction id from the canister.
 * @param {string} [principalString] - The principal string of the account. Replace with actual ICP wallet principal and add to .env.
 * @param {string} [canisterId] - The ID of the canister to query.
 * @returns {Promise<any>} - The initial set of transactions fetched from the canister.
 */
export async function getAccountTransactions(
  index_canister_id: string,
  { owner, subaccount = [] }: { owner: Principal; subaccount: any[] },
  max_results: number = 100,
  start: bigint[] = [],
) {
  try {
    const agent_canister = ic(index_canister_id!);
    const account_transactions = await agent_canister.call(
      "get_account_transactions",
      {
        account: { owner, subaccount },
        max_results,
        start,
      },
    );

    return account_transactions.Ok.transactions;
  } catch (error) {
    throw error;
  }
}
