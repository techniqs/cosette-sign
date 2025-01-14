/// <reference types="node" />
export declare function AlgFromTags(tag: number): string;
export declare const HeaderParameters: {
    [key: string]: number;
};
export declare type HeaderValue = string | Buffer | number;
export declare type HeaderType = {
    [T in keyof typeof HeaderParameters]?: HeaderValue;
};
export interface HeaderPU {
    p: HeaderType;
    u: HeaderType;
}
export declare const EMPTY_BUFFER: ArrayBuffer;
export declare function TranslateHeaders(header: HeaderType): Map<number, HeaderValue>;
export declare function TranslateKey(key: CryptoKey): Map<any, any>;
export declare function xor(a: Uint8Array, b: Uint8Array): Uint8Array;
export declare function runningInNode(): boolean;
export declare function uint8ArrayEquals(a: Uint8Array, b: Uint8Array): boolean;
