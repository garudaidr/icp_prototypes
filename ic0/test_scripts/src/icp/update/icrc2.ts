import { Principal } from "@dfinity/principal";
import { IDL } from "@dfinity/candid";
import { HttpAgent } from "@dfinity/agent";

/**
 * Encodes an approval request into the format expected by the canister using Candid IDL.
 * @param {object} request - The approval request to encode.
 * @returns {Uint8Array} - The encoded approval request.
 */
function _encodeApprovalRequest(request) {
  const argTypes = IDL.Record({
    spender: IDL.Record({
      owner: IDL.Principal,
      subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    }),
    amount: IDL.Nat,
    fee: IDL.Opt(IDL.Vec(IDL.Nat8)),
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(IDL.Nat64),
    expected_allowance: IDL.Opt(IDL.Nat),
    expires_at: IDL.Opt(IDL.Nat64),
  });

  return IDL.encode([argTypes], [request]);
}

/**
 * Calls the icrc2_approve function on a canister with a specific approval request.
 * @param {HttpAgent} agent - The HTTP agent used for the call.
 * @param {object} params - The parameters for the approval request.
 * @param {number} params.amount - The amount to be approved.
 * @param {object} [params.spender] - The spender's information.
 * @param {Principal} params.spender.owner - The Principal of the spender.
 * @param {any[]} [params.spender.subaccount] - The optional subaccount of the spender.
 * @param {any[]} [params.fee] - Optional fee information.
 * @param {any[]} [params.memo] - Optional memo for the transaction.
 * @param {any[]} [params.from_subaccount] - Optional subaccount information for the source.
 * @param {any[]} [params.created_at_time] - Optional creation time for the transaction.
 * @param {any[]} [params.expected_allowance] - Optional expected allowance.
 * @param {any[]} [params.expires_at] - Optional expiration time for the approval.
 * @param {string} canisterId - The ID of the canister to call.
 * @returns {Promise<any>} - The result of the canister call.
 */
export async function callIcrc2Approval(
  agent: HttpAgent,
  ledger_canister_id: string,
  {
    amount,
    spender,
    fee = [],
    memo = [],
    from_subaccount = [],
    created_at_time = [],
    expected_allowance = [],
    expires_at = [],
  }: {
    amount: number;
    spender: {
      owner: Principal;
      subaccount?: any[];
    };
    fee?: any[];
    memo?: any[];
    from_subaccount?: any[];
    created_at_time?: any[];
    expected_allowance?: any[];
    expires_at?: any[];
  },
) {
  const approvalRequest = {
    spender,
    amount,
    fee,
    memo,
    from_subaccount,
    created_at_time,
    expected_allowance,
    expires_at,
  };

  const encodedApprovalRequest = _encodeApprovalRequest(approvalRequest);

  return await agent.call(ledger_canister_id, {
    methodName: "icrc2_approve",
    arg: encodedApprovalRequest,
  });
}

/**
 * Encodes a transfer-from request into the format expected by the canister using Candid IDL.
 * @param {object} request - The transfer-from request to encode.
 * @returns {Uint8Array} - The encoded transfer-from request.
 */
function _encodeTransferFromRequest(request) {
  const argTypes = IDL.Record({
    from: IDL.Record({
      owner: IDL.Principal,
      subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    }),
    to: IDL.Record({
      owner: IDL.Principal,
      subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    }),
    amount: IDL.Nat,
    fee: IDL.Opt(IDL.Vec(IDL.Nat8)),
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(IDL.Nat64),
    expires_at: IDL.Opt(IDL.Nat64),
  });

  return IDL.encode([argTypes], [request]);
}

/**
 * Calls the icrc2_transfer_from function on a canister with a specific transfer request.
 * @param {HttpAgent} agent - The HTTP agent used for the call.
 * @param {object} params - The parameters for the transfer request.
 * @param {Principal} params.from_principal - The Principal of the sender's account.
 * @param {Principal} params.to_principal - The Principal of the receiver's account.
 * @param {number} params.amount - The amount of tokens to transfer.
 * @param {any[]} [params.fee] - Optional fee information for the transfer.
 * @param {any[]} [params.memo] - Optional memo for the transfer.
 * @param {any[]} [params.from_subaccount] - Optional subaccount information for the sender.
 * @param {any[]} [params.to_subaccount] - Optional subaccount information for the receiver.
 * @param {any[]} [params.created_at_time] - Optional creation time for the transfer.
 * @param {any[]} [params.expires_at] - Optional expiration time for the transfer.
 * @param {string} canisterId - The ID of the canister to call.
 * @returns {Promise<any>} - The result of the canister call.
 */
export async function callIcrc2TransferFrom(
  agent: HttpAgent,
  ledger_canister_id: string,
  {
    from_principal,
    to_principal,
    amount,
    fee = [],
    memo = [],
    from_subaccount = [],
    to_subaccount = [],
    created_at_time = [],
    expires_at = [],
  }: {
    from_principal: Principal;
    to_principal: Principal;
    amount: number;
    fee?: any[];
    memo?: any[];
    from_subaccount?: any[];
    to_subaccount?: any[];
    created_at_time?: any[];
    expires_at?: any[];
  },
) {
  const transferRequest = {
    from: { owner: from_principal, subaccount: from_subaccount },
    to: { owner: to_principal, subaccount: to_subaccount },
    amount,
    fee,
    memo,
    created_at_time,
    expires_at,
  };

  const encodedTransferRequest = _encodeTransferFromRequest(transferRequest);

  return await agent.call(ledger_canister_id!, {
    methodName: "icrc2_transfer_from",
    arg: encodedTransferRequest,
  });
}
