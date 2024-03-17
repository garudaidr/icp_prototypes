import { Principal } from "@dfinity/principal";
import { IDL } from "@dfinity/candid";
import { HttpAgent } from "@dfinity/agent";

// Utility to encode a transfer request for ICRC-1 tokens
function _encodeTransferIcrc1Request(request: {
  to: {
    owner: Principal;
    subaccount: any;
  };
  amount: number;
  from_subaccount: any;
  fee: any;
  memo: any;
  created_at_time: any;
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
  {
    to: {
      owner,
      subaccount,
    },
    amount,
    from_subaccount,
    fee,
    memo,
    created_at_time,
  }: {
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
  // Construct transferArgs, omitting undefined fields
  const transferArgs = {
    to: {
      owner,
      subaccount: subaccount ? [subaccount] : [], // Ensure subaccount is included, empty if not provided
    },
    amount,
    from_subaccount: from_subaccount ? [from_subaccount] : [],
    fee: fee ? [fee] : [],
    memo: memo ? [memo] : [],
    created_at_time: created_at_time ? [created_at_time] : [],
  };
  const encodedTransferRequest = _encodeTransferIcrc1Request(transferArgs);

  return await agent.call(canisterId, {
    methodName: "icrc1_transfer",
    arg: encodedTransferRequest,
  });
}
