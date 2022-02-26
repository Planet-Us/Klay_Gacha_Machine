import fs from "fs";
import pinataSDK from "@pinata/sdk";

const CONFIG_PATH = './config.json';
const configBuffer = fs.readFileSync(CONFIG_PATH);
const configJson = configBuffer.toString();
const configData = JSON.parse(configJson);
const pinataApiKey = configData.pinataApiKey;
const pinataSecretApiKey = configData.pinataSecretApiKey;


const pinata = pinataSDK(pinataApiKey, pinataSecretApiKey);

export default async function pinFileToIPFS(image) {
    console.log("Path is", image);
    let hashValue;
    const options = {};
    const ret = await pinata.pinFileToIPFS(fs.createReadStream(image), options)
    .then(function (result) {
      hashValue = result["IpfsHash"];
    })
    .catch((err) => {
        console.log(err);
    });
    return hashValue;
};