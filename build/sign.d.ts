/// <reference types="node" />
import * as common from './common';
export declare const SignTag = 98;
export declare const Sign1Tag = 18;
export interface CreateOptions {
    encodep?: string;
    excludetag?: boolean;
}
export interface Signer {
    externalAAD?: Buffer | ArrayBuffer;
    key: CryptoKey;
    u?: {
        kid: number | string;
    };
    p?: {
        alg: string;
    };
}
export declare type Signers = Signer | Signer[];
export declare function create(headers: common.HeaderPU, payload: Uint8Array, signers: Signers, options?: CreateOptions): Promise<Buffer>;
interface Verifier {
    externalAAD?: ArrayBuffer | Buffer;
    key: CryptoKey;
    kid?: string;
}
interface VerifyOptions {
    defaultType?: number;
}
/**
 * Error thrown where a message signature could not be verified.
 * This may mean that the message was forged.
 *
 * @member plaintext The decoded message, for which the signature is incorrect.
 */
export declare class SignatureMismatchError extends Error {
    /** The decoded CBOR message with an invalid signature.  */
    plaintext: any;
    constructor(plaintext: any);
}
/**
 * Verify the COSE signature of a CBOR message.
 *
 * @throws {SignatureMismatchError} Will throw an exception if the signature is invalid.
 * @param payload A CBOR-encoded signed message
 * @param verifier The key used to check the signature
 * @returns The decoded message, if the signature was correct.
 */
export declare function verify(payload: Uint8Array, verifier: Verifier, options?: VerifyOptions): Promise<any>;
export {};
