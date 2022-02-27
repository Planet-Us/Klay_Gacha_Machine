import { program } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import Caver from "caver-js";
import pinFileToIPFS from './ipfsUpload.mjs';
const CACHE_PATH = './.cache/info.json';
const CONFIG_PATH = './config.json';
const CONTRACT_PATH = './Contract.json';

const contractBuffer = fs.readFileSync(CONTRACT_PATH);
const contractJson = contractBuffer.toString();
const contractData = JSON.parse(contractJson);

let gachaAddress = contractData.gachaAddress;
const gachaABI = contractData.gachaABI;


program.version('0.0.2');

program.command('verify')
.requiredOption(
  '-n, --network <string>',
  'JSON file with gacha machine settings',
)
.action(async (options) => {
  let ret;
  let rpcURL;
  const configBuffer = fs.readFileSync(CONFIG_PATH);
  const configJson = configBuffer.toString();
  const configData = JSON.parse(configJson);
  let caver;
  let contract;
  if(options.network == 'baobab'){
    rpcURL = contractData.baobabRPCURL;
    caver = new Caver(rpcURL);
    gachaAddress = contractData.gachaAddressBaobab;
    contract = await caver.contract.create(gachaABI, gachaAddress);
  }else if(options.network == 'mainnet'){
    rpcURL = contractData.mainnetRPCURL;
    caver = new Caver(rpcURL);
    contract = await caver.contract.create(gachaABI, gachaAddress);
  }

  const minterAddress = configData.TreasuryAccount;
  const minterPrivateKey = configData.PrivateKey;
  const mintNum = configData.NumberOfNFT;
  ret = await caver.klay.accounts.createWithAccountKey(minterAddress, minterPrivateKey);
  ret = caver.klay.accounts.wallet.add(ret);
  ret = caver.klay.accounts.wallet.getAccount(0);
  const cacheBuffer = fs.readFileSync(CACHE_PATH);
  const cacheJSON = cacheBuffer.toString();
  const cacheData = JSON.parse(cacheJSON);
  let flag = true;
  for(var i = 0;i<cacheData.items.length;i++){
    ret = await contract.methods.getUploaded(minterAddress,i, cacheData.items[i].link).call();
    if(ret.toString() == "true"){
        console.log("Uploaded number " + i + ": on chain");
        cacheData.items[i].onChain = "true";
    }else{
        console.log("Uploaded number " + i + ": it's NOT on chain");
        cacheData.items[i].onChain = "false";
        flag = false;
    }
  }  
  if(!flag){
      console.log("Some of uploaded are NOT on chain. Please upload again.");
  }else{
      console.log("All uploaded are successfully on chain.");
  }
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cacheData));  

});
program
.command('upload')
.argument(
  '<directory>',
  'Directory containing images named from 0-n',
  val => {
    return fs.readdirSync(`${val}`).map(file => path.join(val, file));
  },
)
.requiredOption(
  '-n, --network <string>',
  'JSON file with gacha machine settings',
)
.option(
  '-i, --ipfs',
  'Upload image files to pinata ipfs if you need',
)
.action(async (files, options, cmd) => {    
    const dirName = cmd.args[0];
    console.log(options);
    let rpcURL;
    let ret;
    let contract;
    const configBuffer = fs.readFileSync('./config.json');
    const configJson = configBuffer.toString();
    const configData = JSON.parse(configJson);
    const imageExtension = configData.imageExtension;
    let caver;
    
    if(options.network == 'baobab'){
        rpcURL = contractData.baobabRPCURL;
        caver = await new Caver(rpcURL);
        gachaAddress = contractData.gachaAddressBaobab;
        contract = await caver.contract.create(gachaABI, gachaAddress);
    }else if(options.network == 'mainnet'){
        rpcURL = contractData.mainnetRPCURL;
        caver = await new Caver(rpcURL);
        contract = await caver.contract.create(gachaABI, gachaAddress);
    }
    

    const minterAddress = configData.TreasuryAccount;
    const minterPrivateKey = configData.PrivateKey;
    const tokenName = configData.TokenName;
    const tokenSymbol = configData.TokenSymbol;
    ret = caver.klay.accounts.createWithAccountKey(minterAddress, minterPrivateKey);
    ret = caver.klay.accounts.wallet.add(ret);
    ret = caver.klay.accounts.wallet.getAccount(0);


    
    // Set connection with IPFS Node
    caver.ipfs.setIPFSNode('ipfs.infura.io', 5001, true);
    
    const imageFiles = files.filter(it => {
        return !it.endsWith('.json');
      });
      const imageFileCount = imageFiles.length;
  
      const jsonFileCount = files.filter(it => {
        return it.endsWith('.json');
      }).length;
  
      if (imageFileCount !== jsonFileCount) {
        throw new Error(
          `number of image files (${imageFileCount}) is different than the number of json files (${jsonFileCount})`,
        );
      }
    const totalCnt = imageFileCount;
    let cacheData = '';    
    
      ret = await caver.klay.sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: minterAddress,
        to: gachaAddress,
        data: contract.methods.mintNewToken(tokenName, tokenSymbol).encodeABI(),
        gas: '8000000'
      }).then(console.log("New collection is successfully made."));
    var uriCnt = 0;
    let uriMetaForUpload = "";
    var items = new Array();
    for(let i = 0;i<totalCnt;i++){     
      const metadata = dirName + '/' + i + '.json';        
      const dataBuffer = fs.readFileSync(metadata);
      const dataJson = dataBuffer.toString();
      const metadataJson = JSON.parse(dataJson);
      console.log("Number : ", i);
      
      if(options.ipfs){
        const image = dirName + '/' + i + '.' + imageExtension;
        uriCnt++;
        const cidImage = await pinFileToIPFS(image);
        // Add a file to IPFS with file path
        const uriImage = "https://ipfs.io/ipfs/" + cidImage;        
        metadataJson.image = uriImage;
        fs.writeFileSync(metadata.toString(), JSON.stringify(metadataJson));  
      }   
            
        const cidMeta = await pinFileToIPFS(metadata); 
        const uriMeta = "ipfs://" + cidMeta;         
        uriMetaForUpload = uriMetaForUpload + uriMeta;         

        if(!fs.existsSync('.cache')){
          fs.mkdirSync('.cache');
        }

        items.push({
          "id" : i,
          "link" : uriMeta,
          "name" : metadataJson.name,
          "onChain" : "false"
        });   
          
        if(uriCnt == 10 || i == (totalCnt-1)){
            if(uriCnt == 10){
                console.log("Upload " + (i-9) + "-" + (i));
            }else{
                console.log("Upload " + (i-totalCnt-1) + "-" + (i));
            }
          cacheData = {
            "gachaMachineId" : minterAddress,
            "items" : items
            }    
          ret = await caver.klay.sendTransaction({
            type: 'SMART_CONTRACT_EXECUTION',
            from: minterAddress,
            to: gachaAddress,
            data: contract.methods.uploadBulk(totalCnt, i, uriMetaForUpload, uriCnt).encodeABI(),
            gas: '1000000'
          })
          
          fs.writeFileSync(CACHE_PATH, JSON.stringify(cacheData));
          uriCnt = 0;
          uriMetaForUpload = '';
        }
    }
});

async function wait(ms){
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

program.parse();