const {BabyJubPoint, G, Fr} = require("./BabyJubPoint");
const crypto = require("crypto");
const utils = require("ffjavascript").utils;
const keccak256  = require("keccak256");
const assert = require('assert');
const { bufToBigint, bigintToBuf } = require("bigint-conversion");

function gen_sig (message, secKey) {
    if (!(typeof message == "bigInt")){
        message = BigInt(message);
    }
    if (!(typeof secKey == "bigInt")){
       let  _secKey = BigInt(secKey.toString());
        assert(secKey == _secKey, "secret key differs when converting to bigint");
    }
    let pubKeyPoint = G.mul(secKey);
    const rand = BigInt(utils.leBuff2int(crypto.randomBytes(32)));
    let R = G.mul(rand);
    console.log("the random point is", R.x, R.y);
    let Int = bufToBigint(keccak256("0x"+R.x.toString(16).padStart(64, "0") +pubKeyPoint.x.toString(16).padStart(64, "0")  +message.toString(16).padStart(64, "0")), 16); 
    console.log("the signature keccak hash", bufToBigint(keccak256("0x"+R.x.toString(16).padStart(64, "0") +pubKeyPoint.x.toString(16).padStart(64, "0")  +message.toString(16).padStart(64, "0")), 16));
    let hash = new Fr(Int).mul(secKey);
    let s =  hash.add(rand);

    let R_compressed = bufToBigint(R.compress());
    return {
        "sig": String(s.n).split("n")[0],
        "rand": String(R_compressed).split("n")[0]
    }
}
function verify (s, r, m, pubKey){
    if (typeof r != "bigInt"){
        r = bigintToBuf(BigInt(r));
     }
    if (typeof pubKey != "bigInt"){
        pubKey = bigintToBuf(BigInt(pubKey));
     }
    let point = new BabyJubPoint();

    let R = new BabyJubPoint(point.decompress(r)[0], point.decompress(r)[1]);
    console.log("the random point is", R.x, R.y);
    let pubKeyPoint = new BabyJubPoint(point.decompress(pubKey)[0], point.decompress(pubKey)[1]);
    let hash = new Fr(bufToBigint(keccak256("0x"+R.x.toString(16).padStart(64, "0") + pubKeyPoint.x.toString(16).padStart(64, "0")  + m.toString(16).padStart(64 , "0"))));
    console.log("The verifier keccak hash is", bufToBigint(keccak256("0x"+R.x.toString(16).padStart(64, "0") +pubKeyPoint.x.toString(16).padStart(64, "0")  +m.toString(16).padStart(64, "0")), 16));
    try {
        assert(G.mul(s).equal(R.add(pubKeyPoint.mul(hash.n))));
        return true;
    }catch(err){
        console.log("The signature is invalid");
        return false;
    }
}

exports.verify_Schnorr = verify; 
exports.gen_Schnorr_sig = gen_sig; 