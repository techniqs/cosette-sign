"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.SignatureMismatchError = exports.create = exports.Sign1Tag = exports.SignTag = void 0;
const cbor = __importStar(require("cbor-web"));
const isomorphic_webcrypto_1 = __importDefault(require("isomorphic-webcrypto"));
const common = __importStar(require("./common"));
const EMPTY_BUFFER = common.EMPTY_BUFFER;
const Tagged = cbor.Tagged;
exports.SignTag = 98;
exports.Sign1Tag = 18;
function doSign(SigStructure, signer, alg) {
    return __awaiter(this, void 0, void 0, function* () {
        let ToBeSigned = cbor.encode(SigStructure);
        return yield isomorphic_webcrypto_1.default.subtle.sign(getAlgorithmParams(alg), signer.key, ToBeSigned);
    });
}
function create(headers, payload, signers, options) {
    return __awaiter(this, void 0, void 0, function* () {
        options = options || {};
        const p = common.TranslateHeaders(headers.p || {});
        const u = common.TranslateHeaders(headers.u || {});
        const bodyP = (p.size === 0) ? EMPTY_BUFFER : cbor.encode(p);
        const p_buffer = (p.size === 0 && options.encodep === 'empty') ? EMPTY_BUFFER : cbor.encode(p);
        if (Array.isArray(signers)) {
            if (signers.length === 0) {
                throw new Error('There has to be at least one signer');
            }
            if (signers.length > 1) {
                throw new Error('Only one signer is supported');
            }
            // TODO handle multiple signers
            const signer = signers[0];
            const externalAAD = signer.externalAAD || EMPTY_BUFFER;
            const signerPMap = common.TranslateHeaders(signer.p || {});
            const signerU = common.TranslateHeaders(signer.u || {});
            const alg = signerPMap.get(common.HeaderParameters.alg) || signerU.get(common.HeaderParameters.alg);
            const signerP = (signerPMap.size === 0) ? EMPTY_BUFFER : cbor.encode(signerPMap);
            if (typeof alg !== 'number') {
                throw new Error('Failed to get algorithm');
            }
            const SigStructure = [
                'Signature',
                bodyP,
                signerP,
                externalAAD,
                payload
            ];
            const sig = yield doSign(SigStructure, signer, alg);
            const signed = [p_buffer, u, payload, [[signerP, signerU, sig]]];
            return cbor.encode(options.excludetag ? signed : new Tagged(exports.SignTag, signed));
        }
        else {
            const signer = signers;
            const externalAAD = signer.externalAAD || EMPTY_BUFFER;
            const alg = p.get(common.HeaderParameters.alg) || u.get(common.HeaderParameters.alg);
            const SigStructure = [
                'Signature1',
                bodyP,
                externalAAD,
                payload
            ];
            if (typeof alg !== 'number') {
                throw new Error('Failed to get algorithm');
            }
            const sig = yield doSign(SigStructure, signer, alg);
            const signed = [p_buffer, u, payload, sig];
            return cbor.encodeCanonical(options.excludetag ? signed : new Tagged(exports.Sign1Tag, signed));
        }
    });
}
exports.create = create;
;
function getAlgorithmParams(alg) {
    const cose_name = common.AlgFromTags(alg);
    if (cose_name.startsWith('ES'))
        return { 'name': 'ECDSA', 'hash': 'SHA-' + cose_name.slice(2) };
    else if (cose_name.startsWith('RS'))
        return { "name": "RSASSA-PKCS1-v1_5" };
    else if (cose_name.startsWith('PS'))
        return { name: "RSA-PSS", saltLength: +cose_name.slice(2) / 8 };
    else
        throw new Error('Unsupported algorithm, ' + cose_name);
}
function isSignatureCorrect(SigStructure, verifier, alg, sig) {
    return __awaiter(this, void 0, void 0, function* () {
        const ToBeSigned = cbor.encode(SigStructure);
        return isomorphic_webcrypto_1.default.subtle.verify(getAlgorithmParams(alg), verifier.key, sig, ToBeSigned);
    });
}
function getSigner(signers, verifier) {
    if (verifier.kid == null)
        throw new Error("Missing kid");
    const kid_buf = new TextEncoder().encode(verifier.kid);
    for (let i = 0; i < signers.length; i++) {
        const kid = signers[i][1].get(common.HeaderParameters.kid); // TODO create constant for header locations
        if (common.uint8ArrayEquals(kid_buf, kid)) {
            return signers[i];
        }
    }
}
function getCommonParameter(first, second, parameter) {
    let result;
    if ('get' in first) {
        result = first.get(parameter);
    }
    if (!result && ('get' in second)) {
        result = second.get(parameter);
    }
    return result;
}
/**
 * Error thrown where a message signature could not be verified.
 * This may mean that the message was forged.
 *
 * @member plaintext The decoded message, for which the signature is incorrect.
 */
class SignatureMismatchError extends Error {
    constructor(plaintext) {
        super(`Signature mismatch: The CBOR message ${JSON.stringify(plaintext)} has an invalid signature.`);
        this.name = "SignatureMismatchError";
        this.plaintext = plaintext;
    }
}
exports.SignatureMismatchError = SignatureMismatchError;
/**
 * Verify the COSE signature of a CBOR message.
 *
 * @throws {SignatureMismatchError} Will throw an exception if the signature is invalid.
 * @param payload A CBOR-encoded signed message
 * @param verifier The key used to check the signature
 * @returns The decoded message, if the signature was correct.
 */
function verify(payload, verifier, options) {
    return __awaiter(this, void 0, void 0, function* () {
        options = options || {};
        let obj = yield cbor.decodeFirst(payload);
        let type = options.defaultType ? options.defaultType : exports.SignTag;
        if (obj instanceof Tagged) {
            if (obj.tag !== exports.SignTag && obj.tag !== exports.Sign1Tag) {
                throw new Error('Unexpected cbor tag, \'' + obj.tag + '\'');
            }
            type = obj.tag;
            obj = obj.value;
        }
        if (!Array.isArray(obj)) {
            throw new Error('Expecting Array');
        }
        if (obj.length !== 4) {
            throw new Error('Expecting Array of lenght 4');
        }
        let [p, u, plaintext, signers] = obj;
        if (type === exports.SignTag && !Array.isArray(signers)) {
            throw new Error('Expecting signature Array');
        }
        p = (!p.length) ? EMPTY_BUFFER : cbor.decodeFirstSync(p);
        u = (!u.size) ? EMPTY_BUFFER : u;
        let signer = (type === exports.SignTag ? getSigner(signers, verifier) : signers);
        if (!signer) {
            throw new Error('Failed to find signer with kid' + verifier.kid);
        }
        let SigStructure;
        let alg;
        let sig;
        if (type === exports.SignTag) {
            const externalAAD = verifier.externalAAD || EMPTY_BUFFER;
            let signerP = signer[0];
            sig = signer[2];
            signerP = (!signerP.length) ? EMPTY_BUFFER : signerP;
            p = (!p.size) ? EMPTY_BUFFER : cbor.encode(p);
            const signerPMap = cbor.decode(signerP);
            alg = signerPMap.get(common.HeaderParameters.alg);
            SigStructure = [
                'Signature',
                p,
                signerP,
                externalAAD,
                plaintext
            ];
        }
        else {
            const externalAAD = verifier.externalAAD || EMPTY_BUFFER;
            alg = getCommonParameter(p, u, common.HeaderParameters.alg);
            p = (!p.size) ? EMPTY_BUFFER : cbor.encode(p);
            SigStructure = [
                'Signature1',
                p,
                externalAAD,
                plaintext
            ];
            sig = signer;
        }
        if (alg === undefined) {
            throw new Error('Failed to find algorithm of key ' + verifier.kid);
        }
        if (yield isSignatureCorrect(SigStructure, verifier, alg, sig)) {
            return plaintext;
        }
        else {
            throw new SignatureMismatchError(plaintext);
        }
    });
}
exports.verify = verify;
;
//# sourceMappingURL=sign.js.map