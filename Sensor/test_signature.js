const utils = require("ffjavascript").utils;
const crypto = require("crypto");
const { bufToBigint, hexToBigint, bufToHex } = require("bigint-conversion");
const web3 = require("web3-utils"); 
const fs = require("fs");


///// Format of the hash in the scheme: 
///// H_i = Hash ( r || H_(i-1) || d_i)
// One thing that I think may be a problem here is that the hash is more than 16 digits so when slicing it, it could be a problem but IDK


/// To do: 
    // 1- change the global parameters 
    // 2- create functions for codes that yet don't have it 
    // 3- get the inputs from text or by an input 



const rand = bufToHex(crypto.randomBytes(32));
const initial_rand = bufToHex(crypto.randomBytes(32));

console.log("the random value is:", rand.toString());
console.log("the initial random value is", initial_rand);
let initial_hash = '0x' + initial_rand;
const batch_size = 100;
const number_of_features = 5;
// const size_of_flattened_format = ((batch_size * number_of_features )/ number_of_hashes) ; 
const size_of_flattened_format = 65; 
const grouping_param = size_of_flattened_format/number_of_features; 
let data_points = [];
let features = [];
const file_address = "Outputs/zokrates_input";
let random_size = rand.length;
let zok_rand_input = ''; 
let zok_hash_input = '';



////////// Creating the data points 
for (let i=0; i< batch_size; i++ ){
    for (let j=0; j<number_of_features; j++)
        features.push(bufToBigint(crypto.randomBytes(4)).toString().split("n")[0]);
    data_points.push(features);
    features =[];
}


/////// Grouping the data to lessen the number of hash computations
function data_grouping(data, grouping_param) {
    let grouped  = [];
    let data_handling ; 
    for (let index = 0; index<batch_size; index+=grouping_param){
        data_handling = data.slice(index, index+grouping_param); 
        grouped.push(data_handling.flat());
    }
    // if (((batch_size * number_of_features) % size_of_flattened_format )!= 0) {
    //     data_handling = data.slice(batch_size - (batch_size % grouping_param) , batch_size); 
    //     grouped.push(data_handling.flat());
    //     console.log("Left out data is ", data_handling);
    // }
    return {
        "grouped_data": grouped, 
    }
}

let grouped_data = data_grouping(data_points, grouping_param ).grouped_data;
console.log("rumber of rounds", grouped_data.length);
console.log(grouped_data);

////////////////////////////The tested output piece of code
///// This seems to be the correct way of passing the input since it's padded and the 0x from the hex is subtracted from the output 
// This line seperates the first 16 integers of the encodepacked of the input 5 
// console.log(web3.encodePacked(5).slice(50,66));
// We should put int the 16 least significant digits of the input + 0x to the hash function 
// hash_output = web3.sha3("0x" + web3.encodePacked(5453454).slice(50,66) + web3.encodePacked(3453453).slice(50,66));
// hash_output = hash_output.split('x')[1];
// let first_chunk = hash_output.slice(0,16);
// console.log(hexToBigint(first_chunk));





function hashing_without_grouping(data_points, rand, prev_hash){
    let data_concat = '';
    let data_hash;

    for (let index=0; index<batch_size; index++){
        for (let j=0; j<number_of_features; j++)
            data_concat = data_concat + web3.encodePacked(data_points[index][j]).slice(50, 66);
        data_hash = web3.sha3("0x" + data_concat);
        data_concat = '';
        prev_hash = web3.sha3("0x" + rand + prev_hash.split('x')[1] + data_hash.split('x')[1]);
        console.log(prev_hash);
    }
    return {
        "hash": prev_hash
    }
}
function hashing_with_grouping(grouped, rand, initial_hash, grouping_param){
    let prev_hash = initial_hash;
    let number_of_groups = batch_size/grouping_param;
    let group_size = grouped[0].length;
    let data_concat = '';
    let data_hash ;
    console.log(" the group size is", group_size, " number of groups are", number_of_groups);
    for (let index=0; index< grouped.length; index++){
        for (let j=0; j<grouped[index].length; j++)
            data_concat = data_concat + web3.encodePacked(grouped[index][j]).slice(50, 66);
        data_hash = web3.sha3("0x" + data_concat);
        data_concat = '';
        prev_hash = web3.sha3("0x" + rand + prev_hash.split('x')[1] + data_hash.split('x')[1]);
    }
    return {
        "hash": prev_hash
    }
}

function create_flattened_format(flattened_size) {
    let flattened_format = Array(flattened_size).fill(0);
    return{
        "flattened": flattened_format
    }
}



let hash_result = hashing_with_grouping(grouped_data, rand, initial_hash, grouping_param).hash;



///////////  preparing zokrates random and hash input 
for (let i=0; i<random_size; i+=16){
    zok_rand_input = zok_rand_input + " " + hexToBigint(rand.slice(i, i+16).toString().split("n")[0]);
    zok_hash_input = zok_hash_input + " " + hexToBigint(initial_hash.split("x")[1].slice(i, i+16)).toString().split('n')[0];
}

////////// Writing the results into a file for zokrates input
fs.writeFileSync("./" + file_address, (zok_rand_input + " " + zok_hash_input ));

hash_result = hash_result.split('x')[1];




fs.appendFileSync("./" + file_address, " "  + grouped_data.flat().join(" ") ); 
console.log("Grouped data is", grouped_data); 



for ( let i= 0; i<64;  i+=16) {
    let hash_int_value = hash_result.slice(i,i +16);
    fs.appendFileSync("./" + file_address, " "  + (hexToBigint(hash_int_value)).toString().split("n")[0]);
    
    console.log(hexToBigint(hash_int_value).toString().split("n")[0]);
}

fs.appendFileSync("./" + file_address,  " " + create_flattened_format(size_of_flattened_format).flattened.join(" "));


// console.log(create_flattened_format(size_of_flattened_format).flattened.join(" "));
{
// for (i = 0; i<4; i++){
//     dummy = hexToBigint(buffer.slice(i*16, (i+1)*16)); 
//     console.log(dummy);
//     dummy = dummy.toString().split('n')[0];
//     hash = hash + " " + dummy;
// }
// console.log(hash);
// console.log(bufToBigint(hash));
// const secret = new Fr(BigInt(utils.leBuff2int(crypto.randomBytes(32))));
// let pub_key_point = G.mul(secret.n);

// let signature = gen_Schnorr_sig(BigInt("10"), secret.n, pub_key_point);
// console.log(signature); 

// console.log(verify_Schnorr(signature.sig, signature.rand, BigInt("12"), pub_key_point.compress()));
}