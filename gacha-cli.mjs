import { program } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import Caver from "caver-js";
import pinFileToIPFS from './ipfsUpload.mjs';
import awsUpload from './awsUpload.mjs';
const CACHE_PATH = './.cache/info.json';
const CONFIG_PATH = './config.json';
const CONTRACT_PATH = './Contract.json';
const WHITELIST_PATH = './whiteList.json';
const TRANSFER_PATH = './transferList.json';
const WL_CACHE = './src/Constant/whiteList.json';

const contractBuffer = fs.readFileSync(CONTRACT_PATH);
const contractJson = contractBuffer.toString();
const contractData = JSON.parse(contractJson);

let gachaAddress = contractData.gachaAddress;
let gachaABI = contractData.gachaABI;


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
  }else{
    throw new Error(
      'The Network name is wrong. 네트워크명은 baobab이나 mainnet으로 입력 바랍니다.',
    );
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
  let tempArr = new Array();
  let uriCnt = 0;
  for(var i = 0;i<cacheData.items.length;i++){
    tempArr.push(cacheData.items[i].link);
    uriCnt++;
    if((uriCnt)%100 == 0 || i == (cacheData.items.length-1)){
      ret = await contract.methods.getUploaded(minterAddress,(i+1-uriCnt),uriCnt, tempArr).call();
      for(var j = 0;j<uriCnt;j++){
        if(ret[j].toString() == "true"){
            console.log("Uploaded number " + j + ": on chain");
            cacheData.items[j].onChain = "true";
        }else{
            console.log("Uploaded number " + j + ": it's NOT on chain");
            cacheData.items[j].onChain = "false";
            flag = false;
        }
      }
      uriCnt = 0;
      tempArr = [];
    }

    // ret = await wait(1500);
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
.option(
  '-a, --aws',
  'Upload image files and json files to aws s3',
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
    let nftContract;
    
    if(options.network == 'baobab'){
        rpcURL = contractData.baobabRPCURL;
        caver = await new Caver(rpcURL);
        gachaAddress = contractData.gachaAddressBaobab;
        contract = await caver.contract.create(gachaABI, gachaAddress);
    }else if(options.network == 'mainnet'){
        rpcURL = contractData.mainnetRPCURL;
        caver = await new Caver(rpcURL);
        gachaAddress = contractData.gachaAddress;
        contract = await caver.contract.create(gachaABI, gachaAddress);
    }else{
      throw new Error(
        'The Network name is wrong. 네트워크명은 baobab이나 mainnet으로 입력 바랍니다.',
      );
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
      
      if(options.ipfs || options.aws){
        if (imageFileCount !== jsonFileCount) {
          throw new Error(
            `number of image files (${imageFileCount}) is different than the number of json files (${jsonFileCount}). 이미지 파일과 json 파일의 숫자가 다릅니다.`,
          );
        }
      }
    const totalCnt = configData.NumberOfNFT;
    console.log("total", totalCnt);
    let cacheData = '';    
    let cacheCnt = 0;
    var uriCnt = 0;
    let uriMetaForUpload = new Array();
    var items = new Array();
    let uploadedCnt = 0;
    let uploadedCntFlag = 0;
    
    if(!fs.existsSync('./.cache')){
      fs.mkdirSync('./.cache');
      ret = await caver.klay.sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: minterAddress,
        to: gachaAddress,
        data: contract.methods.mintNewToken(tokenName, tokenSymbol,totalCnt).encodeABI(),
        gas: '5000000'
      }).then(console.log("New collection is successfully made."));
      nftContract = ret.logs[0].address;
      console.log("NFT contract address is ", ret.logs[0].address);
    }else if(fs.existsSync('./.cache/info.json')){      
      const cacheBuffer = fs.readFileSync(CACHE_PATH);
      const cacheJson = cacheBuffer.toString();
      const dataCache = JSON.parse(cacheJson);
      nftContract = dataCache.NFTContract;
      if(dataCache.gachaMachineId != minterAddress || configData.TokenName != dataCache.tokenName){
        throw new Error(
          'The ./cache/info.json file is not match with minter address. ./cache/info.json 파일을 확인하시고, 필요하지 않다면 해당 파일을 삭제해주세요.',
        );
      }
      for(let j = 0;j<dataCache.items.length;j++){
        if(dataCache.items[j].onChain == "false"){   
          uploadedCnt = j;
          uploadedCntFlag = 1;
          break;
        }else{
          items.push(dataCache.items[j]); 
        }
      }
      if(uploadedCntFlag == 1){
        for(let j = uploadedCnt;j<dataCache.items.length;j++){
          const metadata = dirName + '/' + j + '.json';        
          const dataBuffer = fs.readFileSync(metadata);
          const dataJson = dataBuffer.toString();
          const metadataJson = JSON.parse(dataJson);
          console.log("Number : " + j + " upload again...");
                
          let cidMeta; 
          let uriMeta;          
          let uriLength;
          if(options.aws){            
            cidMeta = await awsUpload(metadata, "json"); 
            uriMeta = cidMeta;          
          }else if(options.ipfs){            
            cidMeta = await pinFileToIPFS(metadata); 
            uriMeta = "ipfs://" + cidMeta;      
          }else{
            if(configData.pinataApiKey.length > 0){         
              cidMeta = await pinFileToIPFS(metadata); 
              uriMeta = "ipfs://" + cidMeta;       
            }else if(configData.awsAccessKey.length > 0){
              cidMeta = await awsUpload(metadata, "json"); 
              uriMeta = cidMeta;         
            }
          }   
          uriMetaForUpload.push(uriMeta);
        }
        
        ret = await caver.klay.sendTransaction({
          type: 'SMART_CONTRACT_EXECUTION',
          from: minterAddress,
          to: gachaAddress,
          data: contract.methods.uploadBulk(totalCnt, j, uriMetaForUpload,(dataCache.items.length-uploadedCnt)).encodeABI(),
          gas: '1000000'
        });
        
        ret = await contract.methods.getUploaded(minterAddress,uploadedCnt,(dataCache.items.length-uploadedCnt), uriMetaForUpload).call();
        for(let j = 0;j<(dataCache.items.length-uploadedCnt);j++){
          if(ret[j].toString() == "true"){
            console.log("Uploaded number " + (j + uploadedCnt) + ": on chain");          
            items.push({
              "id" : j + uploadedCnt,
              "link" : uriMeta,
              "name" : metadataJson.name,
              "onChain" : "true"
            });   
          }else{      
            console.log("Uploaded number " + j + ": is still not on chain");   
            items.push({
              "id" : j + uploadedCnt,
              "link" : uriMeta,
              "name" : metadataJson.name,
              "onChain" : "false"
            });   
          }
        }
      }
      
      cacheData = {
        "tokenName" : configData.TokenName,
        "gachaMachineId" : minterAddress,
        "items" : items,
        "NFTContract" : nftContract
        }    
      fs.writeFileSync(CACHE_PATH, JSON.stringify(cacheData));

      console.log("Start to upload from " + dataCache.items.length + "...");
      uriCnt = 0;
      cacheCnt = dataCache.items.length;  
      uriMetaForUpload = [];
    }else{    
      ret = await caver.klay.sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: minterAddress,
        to: gachaAddress,
        data: contract.methods.mintNewToken(tokenName, tokenSymbol,totalCnt).encodeABI(),
        gas: '5000000'
      }).then(console.log("New collection is successfully made."));
      nftContract = ret.logs[0].address;
      console.log("NFT contract address is ", ret.logs[0].address);
    }
    for(let i = cacheCnt;i<totalCnt;i++){   
      const metadata = dirName + '/' + i + '.json';        
      const dataBuffer = fs.readFileSync(metadata);
      const dataJson = dataBuffer.toString();
      const metadataJson = JSON.parse(dataJson);
      console.log("Number : ", i);
      uriCnt++;
      
      if(options.ipfs){
        const image = dirName + '/' + i + '.' + imageExtension;
        const cidImage = await pinFileToIPFS(image);
        // Add a file to IPFS with file path
        const uriImage = "https://ipfs.io/ipfs/" + cidImage;        
        metadataJson.image = uriImage;
        fs.writeFileSync(metadata.toString(), JSON.stringify(metadataJson));  
      }else if(options.aws){
        const image = dirName + '/' + i + '.' + imageExtension;
        const cidImage = await awsUpload(image, imageExtension);
        // Add a file to AWSS3 with file path
        const uriImage = cidImage;        
        metadataJson.image = uriImage;
        fs.writeFileSync(metadata.toString(), JSON.stringify(metadataJson));  
      }
            
      let cidMeta; 
      let uriMeta;          
      let uriLength;
      if(options.aws){            
        cidMeta = await awsUpload(metadata, "json"); 
        uriMeta = cidMeta;         
        uriMetaForUpload.push(uriMeta);  
      }else if(options.ipfs){            
        cidMeta = await pinFileToIPFS(metadata); 
        uriMeta = "ipfs://" + cidMeta;      
        uriMetaForUpload.push(uriMeta);  
      }else{
        if(configData.pinataApiKey.length > 0){         
          cidMeta = await pinFileToIPFS(metadata); 
          uriMeta = "ipfs://" + cidMeta;      
          uriMetaForUpload.push(uriMeta);  
        }else if(configData.awsAccessKey.length > 0){
          cidMeta = await awsUpload(metadata, "json"); 
          uriMeta = cidMeta;         
          uriMetaForUpload.push(uriMeta);  
        }
      }


        items.push({
          "id" : i,
          "link" : uriMeta,
          "name" : metadataJson.name,
          "onChain" : "false"
        });   
          
        if(((i+1)%10) == 0 || i == (totalCnt-1)){
            if(uriCnt == 10){
                console.log("Upload " + (i-9) + "-" + (i));
            }else{
                console.log("Upload ~ " + (i));
            }
          cacheData = {
            "tokenName" : configData.TokenName,
            "gachaMachineId" : minterAddress,
            "items" : items,
            "NFTContract" : nftContract
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
          uriMetaForUpload = [];
        }
    }
});

program
.command('applyWhiteList')
.action(async () => {  
  let ret;
  let rpcURL = contractData.baobabRPCURL;
  let caver = await new Caver(rpcURL);
  const configBuffer = fs.readFileSync('./config.json');
  const configJson = configBuffer.toString();
  const configData = JSON.parse(configJson);
  caver.ipfs.setIPFSNode('ipfs.infura.io', 5001, true);
  
  const WLHash = await caver.ipfs.add(WHITELIST_PATH);
  console.log(WLHash);
  const WL_json = JSON.parse('{"whiteList" : "https://ipfs.io/ipfs/' + WLHash + '"}');
    
  fs.writeFileSync(WL_CACHE, JSON.stringify(WL_json));      
});

program
.command('mintToken')
.argument(
  '<number>',
  'Number of NFTs you want to mint',
)
.requiredOption(
  '-n, --network <string>',
  'JSON file with gacha machine settings',
)
.action(async (files, options, cmd) => {    
    const mintNum = cmd.args[0];
    console.log(options);
    let rpcURL;
    let ret;
    let contract;
    const configBuffer = fs.readFileSync('./config.json');
    const configJson = configBuffer.toString();
    const configData = JSON.parse(configJson);
    const imageExtension = configData.imageExtension;
    let caver;
    let gaslimit = mintNum * 850000;
    
    if(options.network == 'baobab'){
        rpcURL = contractData.baobabRPCURL;
        caver = await new Caver(rpcURL);
        gachaAddress = contractData.gachaAddressBaobab;
        contract = await caver.contract.create(gachaABI, gachaAddress);
    }else if(options.network == 'mainnet'){
        rpcURL = contractData.mainnetRPCURL;
        caver = await new Caver(rpcURL);
        contract = await caver.contract.create(gachaABI, gachaAddress);
    }else{
      throw new Error(
        'The Network name is wrong. 네트워크명은 baobab이나 mainnet으로 입력 바랍니다.',
      );
    }
    

    const minterAddress = configData.TreasuryAccount;
    const minterPrivateKey = configData.PrivateKey;
    const tokenName = configData.TokenName;
    const tokenSymbol = configData.TokenSymbol;
    ret = caver.klay.accounts.createWithAccountKey(minterAddress, minterPrivateKey);
    ret = caver.klay.accounts.wallet.add(ret);
    ret = caver.klay.accounts.wallet.getAccount(0);
    
    let mintCount = await contract.methods.getMintedCount(minterAddress).call();

    ret = await caver.klay.sendTransaction({
      type: 'SMART_CONTRACT_EXECUTION',
      from: minterAddress,
      to: gachaAddress,
      value: caver.utils.toPeb((0.11 * mintNum).toString(), 'KLAY'),
      data: contract.methods.mint(minterAddress,mintNum, minterAddress).encodeABI(),
      gas: gaslimit
    }).then(async (res)=>{
      console.log("Mint has succeded");
      mintCount = await contract.methods.getMintedCount(minterAddress).call();
      console.log("You've minted " + mintCount + " of NFTs");
    })
    .catch((err) => {
      console.log(err);
      console.log("Mint has failed.");});

});


program
.command('multiTransfer')
.requiredOption(
  '-n, --network <string>',
  'JSON file with gacha machine settings',
)
.action(async (options, cmd) => {    
    console.log(options);
    let rpcURL;
    let ret;
    let contract;
    const configBuffer = fs.readFileSync('./config.json');
    const configJson = configBuffer.toString();
    const configData = JSON.parse(configJson);
    let caver;
    const cacheBuffer = fs.readFileSync(CACHE_PATH);
    const cacheJSON = cacheBuffer.toString();
    const cacheData = JSON.parse(cacheJSON);
    
    if(options.network == 'baobab'){
        rpcURL = contractData.baobabRPCURL;
        caver = await new Caver(rpcURL);
    }else if(options.network == 'mainnet'){
        rpcURL = contractData.mainnetRPCURL;
        caver = await new Caver(rpcURL);
    }else{
      throw new Error(
        'The Network name is wrong. 네트워크명은 baobab이나 mainnet으로 입력 바랍니다.',
      );
    }

    const minterAddress = configData.TreasuryAccount;
    const minterPrivateKey = configData.PrivateKey;
    ret = caver.klay.accounts.createWithAccountKey(minterAddress, minterPrivateKey);
    ret = caver.klay.accounts.wallet.add(ret);
    ret = caver.klay.accounts.wallet.getAccount(0);

    
    const trListBuffer = fs.readFileSync(TRANSFER_PATH);
    const trListJson = trListBuffer.toString();
    const trListData = JSON.parse(trListJson);
    const kip17Instance = await new caver.klay.KIP17(cacheData.NFTContract);
    let startTokenId = trListData.startTokenId;
    for(let i = 0; i<trListData.items.length;i++){
      console.log("address : ", trListData.items[i].address);
      for(let j = 0;j<trListData.items[i].tokenNum;j++){ 
        ret = await kip17Instance.safeTransferFrom(minterAddress, trListData.items[i].address.toString(), startTokenId, {
          from : minterAddress,
          gas: '1000000'
        }).then((res) => {
          console.log("Number " + startTokenId + " has sent.");
          startTokenId++;        
        })
        .catch((err) => {
          console.log(err);
          console.log("Transfer has failed.");
          console.log("가스비가 모자라거나, 소유하지 않은 NFT일 수 있습니다. 이외에 Transfer가 끊긴 경우, 현재까지 진행된 Transfer 리스트를 transferList.json에서 삭제하시고 재실행해보시길 바랍니다.");
        });
      }     
    }      
});


program
.command('getMintCnt')
.requiredOption(
  '-n, --network <string>',
  'JSON file with gacha machine settings',
)
.action(async (options) => {  
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
    }else{
      throw new Error(
        'The Network name is wrong. 네트워크명은 baobab이나 mainnet으로 입력 바랍니다.',
      );
    }
    

    const minterAddress = configData.TreasuryAccount;
    const minterPrivateKey = configData.PrivateKey;
    const tokenName = configData.TokenName;
    const tokenSymbol = configData.TokenSymbol;
    ret = caver.klay.accounts.createWithAccountKey(minterAddress, minterPrivateKey);
    ret = caver.klay.accounts.wallet.add(ret);
    ret = caver.klay.accounts.wallet.getAccount(0);
    
    let mintCount = await contract.methods.getMintedCount(minterAddress).call();
    console.log(mintCount);

});

program
.command('nftBurn')
.argument(
  '<number>',
  'Number of NFTs you want to burn',
)
.requiredOption(
  '-n, --network <string>',
  'JSON file with gacha machine settings',
)
.action(async (files,options, cmd) => {  
  const tokenId = parseInt(cmd.args[0]);
    console.log(options);
    let rpcURL;
    let ret;
    let contract;
    const configBuffer = fs.readFileSync('./config.json');
    const configJson = configBuffer.toString();
    const configData = JSON.parse(configJson);
    const cacheBuffer = fs.readFileSync(CACHE_PATH);
    const cacheJson = cacheBuffer.toString();
    const dataCache = JSON.parse(cacheJson);
    const imageExtension = configData.imageExtension;
    let caver;
    
    if(options.network == 'baobab'){
        rpcURL = contractData.baobabRPCURL;
        caver = await new Caver(rpcURL);
        gachaAddress = dataCache.NFTContract;
        gachaABI = contractData.NFTABI;
        contract = await caver.contract.create(gachaABI, gachaAddress);
    }else if(options.network == 'mainnet'){
        rpcURL = contractData.mainnetRPCURL;
        caver = await new Caver(rpcURL);
        gachaAddress = dataCache.NFTContract;
        gachaABI = contractData.NFTABI;
        contract = await caver.contract.create(gachaABI, gachaAddress);
    }else{
      throw new Error(
        'The Network name is wrong. 네트워크명은 baobab이나 mainnet으로 입력 바랍니다.',
      );
    }
    
    const minterAddress = configData.TreasuryAccount;
    const minterPrivateKey = configData.PrivateKey;
    ret = caver.klay.accounts.createWithAccountKey(minterAddress, minterPrivateKey);
    ret = caver.klay.accounts.wallet.add(ret);
    ret = caver.klay.accounts.wallet.getAccount(0);

    
    ret = await caver.klay.sendTransaction({
      type: 'SMART_CONTRACT_EXECUTION',
      from: minterAddress,
      to: gachaAddress,
      data: contract.methods.burnSingle(tokenId).encodeABI(),
      gas: "1000000"
    }).then(async (res)=>{
      console.log("Burn has succeded");
    })
    .catch((err) => {
      console.log(err);
      console.log("Burn has failed.");
      console.log("소각할 가스비가 모자라거나, 소각할 NFT의 소유자가 아닐 수 있습니다.");
    });
    
    
});


program
.command('setPurchaseLimit')
.argument(
  '<number>',
  'Number of NFTs you want to set the purchase limit',
)
.requiredOption(
  '-n, --network <string>',
  'JSON file with gacha machine settings',
)
.action(async (files,options, cmd) => {  
  const purchaseLimit = parseInt(cmd.args[0]);
    console.log(options);
    let rpcURL;
    let ret;
    let contract;
    const configBuffer = fs.readFileSync('./config.json');
    const configJson = configBuffer.toString();
    const configData = JSON.parse(configJson);
    const cacheBuffer = fs.readFileSync(CACHE_PATH);
    const cacheJson = cacheBuffer.toString();
    const dataCache = JSON.parse(cacheJson);
    const imageExtension = configData.imageExtension;
    let caver;
    
    if(options.network == 'baobab'){
        rpcURL = contractData.baobabRPCURL;
        caver = await new Caver(rpcURL);
        gachaAddress = dataCache.NFTContract;
        gachaABI = contractData.NFTABI;
        contract = await caver.contract.create(gachaABI, gachaAddress);
    }else if(options.network == 'mainnet'){
        rpcURL = contractData.mainnetRPCURL;
        caver = await new Caver(rpcURL);
        gachaAddress = dataCache.NFTContract;
        gachaABI = contractData.NFTABI;
        contract = await caver.contract.create(gachaABI, gachaAddress);
    }else{
      throw new Error(
        'The Network name is wrong. 네트워크명은 baobab이나 mainnet으로 입력 바랍니다.',
      );
    }
    
    const minterAddress = configData.TreasuryAccount;
    const minterPrivateKey = configData.PrivateKey;
    ret = caver.klay.accounts.createWithAccountKey(minterAddress, minterPrivateKey);
    ret = caver.klay.accounts.wallet.add(ret);
    ret = caver.klay.accounts.wallet.getAccount(0);

    
    ret = await caver.klay.sendTransaction({
      type: 'SMART_CONTRACT_EXECUTION',
      from: minterAddress,
      to: gachaAddress,
      data: contract.methods.updatePurchaseLimit(purchaseLimit).encodeABI(),
      gas: "1000000"
    }).then(async (res)=>{
      console.log("Purchase limit set has been done");
    })
    .catch((err) => {
      console.log(err);
      console.log("Purchase limit set has failed");
      console.log("가스비를 체크해주시기 바랍니다.");
    });
    
    
});

async function wait(ms){
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

program.parse();