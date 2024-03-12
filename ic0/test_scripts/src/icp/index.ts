import fetch from "cross-fetch";
import { HttpAgent } from "@dfinity/agent";
import * as bip39 from "bip39";
import HDKey from "hdkey";
import Secp256k1 from "secp256k1";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";

/**
 * Converts an ICP timestamp (in nanoseconds) to a JavaScript Date object.
 * @param {string} icp_timestamp_string - The ICP timestamp as a string.
 * @returns {Date} - The corresponding JavaScript Date object.
 */
export function convertIcpTimestamp(icp_timestamp_string: string) {
  const timestamp_in_nanoseconds = BigInt(icp_timestamp_string);
  const timestamp_in_milliseconds = Number(
    timestamp_in_nanoseconds / BigInt(1000000),
  );

  // Convert the timestamp from nanoseconds to milliseconds and create a Date object.
  const date = new Date(timestamp_in_milliseconds);

  return date;
}

// Define the BIP44 derivation path for ICP.
const DERIVATION_PATH = "m/44'/223'/0'/0";

/**
 * Generates a Secp256k1KeyIdentity from a seed phrase and an optional index.
 * @param {string} mnemonic - The mnemonic seed phrase.
 * @param {number} [index=0] - The index to use in the derivation path (default is 0).
 * @returns {Secp256k1KeyIdentity} - The generated Secp256k1KeyIdentity.
 */
export const getIdentityFromSeed = (mnemonic: string, index = 0) => {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const masterKey = HDKey.fromMasterSeed(seed);

  // Derive the private and public keys using the BIP44 derivation path.
  const { privateKey } = masterKey.derive(`${DERIVATION_PATH}/${index}`);
  const publicKey = Secp256k1.publicKeyCreate(privateKey, false);

  return Secp256k1KeyIdentity.fromKeyPair(publicKey, privateKey);
};

/**
 * Creates an HttpAgent and a Secp256k1KeyIdentity from a given seed phrase.
 * @param {string} seedPhrase - The seed phrase to generate the identity.
 * @param {string} [host="https://ic0.app"] - The host URL for the HttpAgent (default is the IC mainnet URL).
 * @returns {HttpAgent} - The initialized HttpAgent with the generated identity.
 */
export function createHostAgentAndIdentityFromSeed(
  seedPhrase: string,
  host: string = "https://ic0.app",
) {
  const identity = getIdentityFromSeed(seedPhrase);

  // Initialize and return the HttpAgent with the generated identity.
  return new HttpAgent({
    host,
    identity,
    fetch,
  });
}
