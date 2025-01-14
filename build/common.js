"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uint8ArrayEquals = exports.runningInNode = exports.xor = exports.TranslateKey = exports.TranslateHeaders = exports.EMPTY_BUFFER = exports.HeaderParameters = exports.AlgFromTags = void 0;
const ALGO_TAGS = [
    ["RS512", -259],
    ["RS384", -258],
    ["RS256", -257],
    ["ES512", -36],
    ["PS256", -37],
    ["PS384", -38],
    ["PS512", -39],
    ["ECDH-SS", -27],
    ["ECDH-ES-512", -26],
    ["ECDH-ES", -25],
    ["ES256", -7],
    ["direct", -6],
    ["A128GCM", 1],
    ["A192GCM", 2],
    ["A256GCM", 3],
    ["SHA-256_64", 4],
    ["SHA-256-64", 4],
    ["HS256/64", 4],
    ["SHA-256", 5],
    ["HS256", 5],
    ["SHA-384", 6],
    ["HS384", 6],
    ["SHA-512", 7],
    ["HS512", 7],
    ["AES-CCM-16-64-128", 10],
    ["AES-CCM-16-128/64", 10],
    ["AES-CCM-16-64-256", 11],
    ["AES-CCM-16-256/64", 11],
    ["AES-CCM-64-64-128", 12],
    ["AES-CCM-64-128/64", 12],
    ["AES-CCM-64-64-256", 13],
    ["AES-CCM-64-256/64", 13],
    ["AES-MAC-128/64", 14],
    ["AES-MAC-256/64", 15],
    ["AES-MAC-128/128", 25],
    ["AES-MAC-256/128", 26],
    ["AES-CCM-16-128-128", 30],
    ["AES-CCM-16-128/128", 30],
    ["AES-CCM-16-128-256", 31],
    ["AES-CCM-16-256/128", 31],
    ["AES-CCM-64-128-128", 32],
    ["AES-CCM-64-128/128", 32],
    ["AES-CCM-64-128-256", 33],
    ["AES-CCM-64-256/128", 33],
];
const AlgToTags = new Map(ALGO_TAGS);
const AlgFromTagsMap = new Map(ALGO_TAGS.map(([alg, tag]) => [tag, alg]));
function AlgFromTags(tag) {
    const cose_name = AlgFromTagsMap.get(tag);
    if (!cose_name)
        throw new Error('Unknown algorithm, ' + tag);
    return cose_name;
}
exports.AlgFromTags = AlgFromTags;
const Translators = {
    kid: (value) => new TextEncoder().encode(value).buffer,
    alg: (value) => {
        if (!AlgToTags.has(value))
            throw new Error('Unknown \'alg\' parameter, ' + value);
        return AlgToTags.get(value);
    }
};
exports.HeaderParameters = {
    partyUNonce: -22,
    static_key_id: -3,
    static_key: -2,
    ephemeral_key: -1,
    alg: 1,
    crit: 2,
    content_type: 3,
    ctyp: 3,
    kid: 4,
    IV: 5,
    Partial_IV: 6,
    counter_signature: 7
};
;
exports.EMPTY_BUFFER = new ArrayBuffer(0);
function TranslateHeaders(header) {
    const result = new Map();
    for (const param in header) {
        if (!exports.HeaderParameters[param]) {
            throw new Error('Unknown parameter, \'' + param + '\'');
        }
        let value = header[param];
        let trans = Translators[param];
        if (trans) {
            value = trans(header[param]);
        }
        if (value !== undefined && value !== null) {
            result.set(exports.HeaderParameters[param], value);
        }
    }
    return result;
}
exports.TranslateHeaders = TranslateHeaders;
;
const KeyParameters = {
    crv: -1,
    k: -1,
    x: -2,
    y: -3,
    d: -4,
    kty: 1
};
const KeyTypes = {
    OKP: 1,
    EC2: 2,
    RSA: 3,
    Symmetric: 4
};
const KeyCrv = {
    'P-256': 1,
    'P-384': 2,
    'P-521': 3,
    X25519: 4,
    X448: 5,
    Ed25519: 6,
    Ed448: 7
};
const KeyTranslators = {
    kty: (value) => {
        if (!(KeyTypes[value])) {
            throw new Error('Unknown \'kty\' parameter, ' + value);
        }
        return KeyTypes[value];
    },
    crv: (value) => {
        if (!(KeyCrv[value])) {
            throw new Error('Unknown \'crv\' parameter, ' + value);
        }
        return KeyCrv[value];
    }
};
function TranslateKey(key) {
    const result = new Map();
    for (const param in key) {
        if (!KeyParameters[param]) {
            throw new Error('Unknown parameter, \'' + param + '\'');
        }
        let value = key[param];
        let trans = KeyTranslators[param];
        if (trans) {
            value = trans(value);
        }
        result.set(KeyParameters[param], value);
    }
    return result;
}
exports.TranslateKey = TranslateKey;
;
function xor(a, b) {
    const buffer = new Uint8Array(Math.max(a.length, b.length));
    for (let i = 1; i <= buffer.length; ++i) {
        const av = (a.length - i) < 0 ? 0 : a[a.length - i];
        const bv = (b.length - i) < 0 ? 0 : b[b.length - i];
        buffer[buffer.length - i] = av ^ bv;
    }
    return buffer;
}
exports.xor = xor;
;
function runningInNode() {
    return Object.prototype.toString.call(global.process) === '[object process]';
}
exports.runningInNode = runningInNode;
;
function uint8ArrayEquals(a, b) {
    return a.length === b.length && a.every((v, i) => b[i] === v);
}
exports.uint8ArrayEquals = uint8ArrayEquals;
//# sourceMappingURL=common.js.map