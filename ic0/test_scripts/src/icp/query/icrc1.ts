import { Principal } from "@dfinity/principal";
import { IDL } from "@dfinity/candid";
import { HttpAgent } from "@dfinity/agent";

// Retrieve metadata for the ICRC-1 token
export async function getIcrc1Metadata(agent: HttpAgent, canisterId: string) {
  return await agent.query(canisterId, {
    methodName: "icrc1_metadata",
    arg: IDL.encode([], []),
  });
}

// Query the balance of an ICRC-1 token account
export async function getIcrc1Balance(
  agent: HttpAgent,
  canisterId: string,
  account: {
    owner: Principal;
    subaccount?: Uint8Array;
  },
) {
  const arg = IDL.encode(
    [
      IDL.Record({
        owner: IDL.Principal,
        subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
      }),
    ],
    [account],
  );

  return await agent.query(canisterId, {
    methodName: "icrc1_balance_of",
    arg,
  });
}
