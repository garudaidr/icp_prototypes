import { Principal } from "@dfinity/principal";
import { IDL } from "@dfinity/candid";
import { HttpAgent } from "@dfinity/agent";

// Utility to encode a transfer request for ICRC-1 tokens
function _encodeTransferRequest(request: {
  to: {
    owner: Principal;
    subaccount?: Uint8Array;
  };
  amount: number;
  from_subaccount?: Uint8Array;
  fee?: number;
  memo?: Uint8Array;
  created_at_time?: bigint;
}) {
  const argTypes = IDL.Record({
    from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    to: IDL.Record({
      owner: IDL.Principal,
      subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    }),
    amount: IDL.Nat,
    fee: IDL.Opt(IDL.Nat),
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(IDL.Nat64),
  });

  return IDL.encode([argTypes], [request]);
}

// Perform a transfer of ICRC-1 tokens
export async function transferIcrc1Tokens(
  agent: HttpAgent,
  canisterId: string,
  transferArgs: {
    to: {
      owner: Principal;
      subaccount?: Uint8Array;
    };
    amount: number;
    from_subaccount?: Uint8Array;
    fee?: number;
    memo?: Uint8Array;
    created_at_time?: bigint;
  },
) {
  const encodedTransferRequest = _encodeTransferRequest(transferArgs);

  return await agent.call(canisterId, {
    methodName: "icrc1_transfer",
    arg: encodedTransferRequest,
  });
}
