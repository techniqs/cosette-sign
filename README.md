# cosette-sign

Typescript implementation of [COSE](https://tools.ietf.org/html/rfc8152) signing, [RFC8152](https://tools.ietf.org/html/rfc8152)

This is a fork of [cosette](https://github.com/lovasoa/cosette) that strips everything but signing.
The reason for that is that we needed only the signing part, but the rest has dependencies to NodeJS.

It depends on isomorphic-webcrypto, so on the browser, it uses the fast and secure WebCrypto cryptographic API.

## Current state

Working with isomorphic-webcrypto:

- Create and verify ECDSA signatures
- Create and verify MAC and AES-CCM signatures

## Sign

```js
const cose = require('cosette-sign');
const crypto = rquire("isomorphic-webcrypto");

async function sign() {
  const plaintext = 'Important message!';
  const headers = {
    'p': {'alg': 'ES256'},
    'u': {'kid': '11'}
  };
  const signer = {
    // See https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
    'key': await crypto.subtle.importKey("jwk", {
                  "kty":"EC",
                  "crv":"P-256",
                  "x":"usWxHK2PmfnHKwXPS54m0kTcGJ90UiglWiGahtagnv8",
                  "y":"IBOL-C3BttVivg-lSreASjpkttcsz-1rb7btKLv8EX4",
                  "d":"V8kgd2ZBRuh2dgyVINBUqpPDr7BOMGcF22CQMIUHtNM"
               }, { name: "ECDSA", namedCurve: "P-256" }, true, [usage]);
  };

  const buf = await cose.sign.create(headers, plaintext, signer);
  console.log('Signed message: ' + buf.toString('hex'));
}

sign()
```

## Verify Signature

```js
const cose = require('cosette-sign');

const verifier = {
  'key': {
    'x': Buffer.from('143329cce7868e416927599cf65a34f3ce2ffda55a7eca69ed8919a394d42f0f', 'hex'),
    'y': Buffer.from('60f7f1a780d8a783bfb7a2dd6b2796e8128dbbcef9d3d168db9529971a36e7b9', 'hex')
  }
};
const COSEMessage = Buffer.from('d28443a10126a10442313172496d706f7274616e74206d6573736167652158404c2b6b66dfedc4cfef0f221cf7ac7f95087a4c4245fef0063a0fd4014b670f642d31e26d38345bb4efcdc7ded3083ab4fe71b62a23f766d83785f044b20534f9', 'hex');

cose.sign.verify(
  COSEMessage,
  verifier)
.then((buf) => {
  console.log('Verified message: ' + buf.toString('utf8'));
}).catch((error) => {
  console.log(error);
});
```

## Install

```bash
npm install cosette-sign --save
```

## Test

```bash
npm test
```
