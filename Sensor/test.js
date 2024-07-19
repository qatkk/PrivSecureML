const utils = require("ffjavascript").utils;
const crypto = require("crypto");
const sizeof = require("object-sizeof");
const BabyJubPoint = require("./BabyJubPoint");
const { bufToBigint, hexToBigint, bigintToHex, bufToHex } = require("bigint-conversion");
const {verify_Schnorr, gen_Schnorr_sig} = require("./signature_gen");

let rand = bufToBigint(crypto.randomBytes(32));
let message = bufToBigint(crypto.randomBytes(32));

let secret_key = bufToBigint(crypto.randomBytes(32));
let pubKey = BabyJubPoint.G.mul(secret_key); 

let signature = gen_Schnorr_sig(message, secret_key, pubKey); 
console.log("the signature is ", signature.sig, signature.rand);
console.log("the type of sig is ", typeof signature.sig);
console.log(verify_Schnorr(signature.sig, signature.rand, message, bufToBigint(pubKey.compress())));