
import ContractData from '../Constant/Contract';
import react, {Component, useEffect, useState} from 'react';
import Caver from 'caver-js';
const CACHE_PATH = './.cache/info.json';

var ipfsClient = require('ipfs-http-client');
let gachaAddress = ContractData.gachaAddress;
if(process.env.REACT_APP_NETWORK == "baobab"){
  gachaAddress = ContractData.gachaAddressBaobab;
}else if(process.env.REACT_APP_NETWORK == "mainnet"){
  gachaAddress = ContractData.gachaAddress;
}
const gachaABI = ContractData.gachaABI;
const timeStmp = + new Date();


export default function Mint(props) {
    const [nftCount, setNftCount] = useState(0);
    const [account, setAccount] = useState("");
    const [minterAddress, setMinterAddress] = useState("");
    const [mintCnt, setMintCnt] = useState(0);
    const [mintLive, setMintLive] = useState(true);
    let caver = new Caver(window.klaytn);
    let contract = new caver.contract.create(gachaABI, gachaAddress);
    let NFTPrice = process.env.REACT_APP_NFT_PRICE.toString();

    
  useEffect(async () => {
    const addr = process.env.REACT_APP_TREASURY_ACCOUNT;
    
    if(window.klaytn){
      console.log(window.klaytn);
      const [address] = await window.klaytn.enable();
      let ret;
      setAccount(address);
      setMinterAddress(addr);
    }    
    let liveDate = new Date(process.env.REACT_APP_LIVE_DATE).getTime();
    if(timeStmp > liveDate){
      setMintLive(false);
    }
  },[]); 
  
  useEffect(async () => {    
    if(account.length > 0){
      let mintCount = await contract.methods.getMintedCount(minterAddress).call();
      setMintCnt(mintCount);
    }
  },[minterAddress]);

  const wait = async (ms) => {
  return new Promise((resolve) => {
      setTimeout(() => {
          resolve();
      }, ms);
  });
  }

  const mintNFT1 = async () => {
    let ret;
    
    ret = await caver.klay.sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: account,
        to: gachaAddress,
        value: caver.utils.toPeb((NFTPrice * 1).toString(), 'KLAY'),
        data: contract.methods.mint(mintCnt, process.env.REACT_APP_TREASURY_ACCOUNT,1, account).encodeABI(),
        gas: '2000000'
      });
      let mintCount = await contract.methods.getMintedCount(minterAddress).call();
      setMintCnt(mintCount);

    await wait(3000);
  }
  const mintNFT3 = async () => {
    setNftCount(3);
    let ret;
    
    ret = await caver.klay.sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: account,
        to: gachaAddress,
        value: caver.utils.toPeb((NFTPrice * 3).toString(), 'KLAY'),
        data: contract.methods.mint(mintCnt, process.env.REACT_APP_TREASURY_ACCOUNT,3, account).encodeABI(),
        gas: '2000000'
      });
      let mintCount = await contract.methods.getMintedCount(minterAddress).call();
      setMintCnt(mintCount);

    await wait(3000);
  }
  const mintNFT5 = async () => {
    setNftCount(5);
    let ret;
    
    ret = await caver.klay.sendTransaction({
        type: 'SMART_CONTRACT_EXECUTION',
        from: account,
        to: gachaAddress,
        value: caver.utils.toPeb((NFTPrice * 5).toString(), 'KLAY'),
        data: contract.methods.mint(mintCnt, process.env.REACT_APP_TREASURY_ACCOUNT,5, account).encodeABI(),
        gas: '2000000'
      });
      let mintCount = await contract.methods.getMintedCount(minterAddress).call();
      setMintCnt(mintCount);

    await wait(3000);
  }
    
  return (
    <div>
      <div>{mintCnt}/{process.env.REACT_APP_NUMBER_OF_NFT}</div>
      <div>Price : {process.env.REACT_APP_NFT_PRICE}</div>
      <button disabled={mintLive} onClick={mintNFT1}>Mint 1 NFT</button>
      <button disabled={mintLive} onClick={mintNFT3}>Mint 3 NFT</button>
      <button disabled={mintLive} onClick={mintNFT5}>Mint 5 NFT</button>
    </div>
  );
}

