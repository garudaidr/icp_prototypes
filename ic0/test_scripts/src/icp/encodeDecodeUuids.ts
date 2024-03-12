/**
 * This is for Jagad backend to decode the data (quote uuid and destination uuid) in the memo attached to the ICP transaction for ckBTC offramp.
 * Decodes a 32-byte array back into two separate UUID strings.
 * It splits the array back into two parts, decodes each part into a UUID string,
 * and returns these UUIDs in an array.
 *
 * @param {Uint8Array} byteArray32 - A 32-byte Uint8Array containing two concatenated UUIDs.
 * @returns {string[]} An array of two strings, where each string is one of the decoded UUIDs.
 */
export function decodeByteArray(byteArray32: Uint8Array): string[] {
  var byteArray1 = byteArray32.slice(0, 16);
  var byteArray2 = byteArray32.slice(16, 32);

  var quoteUuid = byteArrayToUuid(byteArray1);
  var destinationUuid = byteArrayToUuid(byteArray2);

  return [quoteUuid, destinationUuid];
}

// helper function to decodeByteArray
function byteArrayToUuid(byteArray: Uint8Array): string {
  var hexParts: string[] = [];

  for (var i = 0; i < byteArray.length; i++) {
    var hex = byteArray[i].toString(16).padStart(2, "0");
    hexParts.push(hex);
  }

  return hexParts
    .join("")
    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
}

// This will be for Lokamining team.
/**
 * Encodes and concatenates two UUID strings into a single byte array for the memo attached to the ICP transaction for ckBTC offramp.
 *
 * @param {string} quoteUuid - The first UUID to be encoded and concatenated.
 * @param {string} destinationUuid - The second UUID to be encoded and concatenated.
 * @returns {Uint8Array} A 32-byte Uint8Array containing the concatenated byte representations of the two UUIDs.
 */
export function encodeUuids(
  quoteUuid: string,
  destinationUuid: string,
): Uint8Array {
  var byteArray1 = uuidToByteArray(quoteUuid);
  var byteArray2 = uuidToByteArray(destinationUuid);
  var concatenatedArray = new Uint8Array(32);

  concatenatedArray.set(byteArray1);
  concatenatedArray.set(byteArray2, 16);

  return concatenatedArray;
}

// helper function to encodeUuids
function uuidToByteArray(uuid: string) {
  var noHyphensUuid = uuid.replace(/-/g, "");
  var buffer = new Uint8Array(16);
  for (var i = 0, j = 0; i < 32; i += 2, j++) {
    var byte = noHyphensUuid.substring(i, i + 2);
    buffer[j] = parseInt(byte, 16);
  }

  return buffer;
}
