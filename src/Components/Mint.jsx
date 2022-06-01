
import ContractData from '../Constant/Contract';
import WLData from '../Constant/whiteList';
import react, {Component, useEffect, useState} from 'react';
import Caver from 'caver-js';
import axios from 'axios';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

let gachaAddress = ContractData.gachaAddress;
if(process.env.REACT_APP_NETWORK == "baobab"){
  gachaAddress = ContractData.gachaAddressBaobab;
}else if(process.env.REACT_APP_NETWORK == "mainnet"){
  gachaAddress = ContractData.gachaAddress;
}
const gachaABI = ContractData.gachaABI;
const timeStmp = + new Date();
let WLFlag = 0;
let limit = new Array();


export default function Mint(props) {
    const [nftCount, setNftCount] = useState(0);
    const [account, setAccount] = useState("");
    const [minterAddress, setMinterAddress] = useState("");
    const [mintCnt, setMintCnt] = useState(0);
    const [mintLive, setMintLive] = useState(true);
    const [walletConnection, setWalletConnection] = useState(false);
    let caver = new Caver(window.klaytn);
    let contract = new caver.contract.create(gachaABI, gachaAddress);
    let NFTPrice = process.env.REACT_APP_NFT_PRICE.toString();
    let whiteList;
    
  const whiteListCheck = async (init) =>{
    if(process.env.REACT_APP_WHITELIST == "true"){
      let ret = await axios.get(WLData.whiteList)
      .then(async (Response) => {
        whiteList = Response.data.items;
        let flag = 0;
        for(let i = 0; i<whiteList.length;i++){
          if(account.toUpperCase() == whiteList[i].address.toUpperCase()){
            flag = 1;
            WLFlag = 1;
            console.log(whiteList[i].address.toUpperCase());
          }
        }
        if(flag == 0){
          WLFlag = 0;
        }
      })
    }
    let liveDate = new Date(process.env.REACT_APP_LIVE_DATE).getTime();          
    if(timeStmp > liveDate){
      setMintLive(false);
    }
  }
  const maxPurchaseCheck = async (cnt) =>{
    let limitFlag = 0;
    if(localStorage.getItem("limitPurchase")){
      limit = JSON.parse(localStorage.getItem("limitPurchase"));
    }
    console.log(limit);
    for(let i=0;i<limit.length;i++){
      if(limit[i].address.toUpperCase == account.toUpperCase){
        // console.log("lim Add : ", limit[i].address);
        // console.log("lim Num : ", limit[i].number);
        limitFlag = 1;
        if(limit[i].number + cnt >= process.env.REACT_APP_PURCHASE_LIMIT){
          alert("지갑당 구매한도를 넘었습니다.");
          return false;
        }else{
          return true;
        }
      }
    }
    if(limitFlag == 0){
      return true;
    }else{
      return false;
    }
  }
  const maxPurchaseCnt = async (cnt) =>{
    let limitFlag = 0;
    for(let i=0;i<limit.length;i++){
      if(limit[i].address == account){
        // console.log("lim Add : ", limit[i].address);
        // console.log("lim Num : ", limit[i].number);
        limitFlag = 1;
        limit[i].number = limit[i].number + cnt;
      }
    }
    if(limitFlag == 0){
      limit.push({
        "address" : account,
        "number" : cnt
      });
      console.log(limit);
    }
    localStorage.setItem("limitPurchase", JSON.stringify(limit));
  }
    
  useEffect(async () => {
    let ret;
    const addr = process.env.REACT_APP_TREASURY_ACCOUNT;
    
    if(window.klaytn){
      // console.log(window.klaytn);
      const [address] = await window.klaytn.enable();      
      setWalletConnection(true);
      setAccount(address);
      setMinterAddress(addr);
      whiteListCheck(0);  
      
      window.klaytn.on('accountsChanged', async (accounts) => {
        setAccount(window.klaytn.selectedAddress);
        whiteListCheck(1);
      })    
    }else{
      alert("현재 사용할 수 있는 클레이튼 지갑이 없습니다. 지갑을 설치하신 후 이용바랍니다.");
    }
  },[]); 
  
  useEffect(async () => {    
    if(account.length > 0){
      let mintCount = await contract.methods.getMintedCount(minterAddress).call();
      console.log(localStorage);
      whiteListCheck(0);
      setMintCnt(mintCount);
    }
  },[minterAddress]);
  useEffect(async () => {    
    if(account.length > 0 && minterAddress.length > 0){
      let mintCount = await contract.methods.getMintedCount(minterAddress).call();
      setMintCnt(mintCount);
    }
    let ret;
    whiteListCheck(1);
    let liveDate = new Date(process.env.REACT_APP_LIVE_DATE).getTime();
    if(timeStmp > liveDate){
      setMintLive(false);
    }else{      
      setMintLive(true);
    }
  },[walletConnection]);

  const wait = async (ms) => {
  return new Promise((resolve) => {
      setTimeout(() => {
          resolve();
      }, ms);
  });
  }
  const connectWallet = async () => {
    if(!window.klaytn._kaikas.isEnabled()){
      const [address] = await window.klaytn.enable();
      setAccount(address);
      setWalletConnection(true);
    }
  }

  const mintNFT = async (cnt) => {
    let ret;    
    whiteListCheck(1);
    let gaslimit = cnt * 850000;
    // console.log(mintCnt);
    if(process.env.REACT_APP_WHITELIST == "true" && WLFlag != 1){
      alert("해당 주소는 민팅 대상 화이트리스트에 포함되어있지 않습니다.");
    }else{
      if(process.env.REACT_APP_WHITELIST == "true" && parseInt(process.env.REACT_APP_PURCHASE_LIMIT) > 0){  
        let limitRet = await maxPurchaseCheck(cnt); 
        if(limitRet == true){
          ret = await caver.klay.sendTransaction({
              type: 'SMART_CONTRACT_EXECUTION',
              from: account,
              to: gachaAddress,
              value: caver.utils.toPeb((NFTPrice * cnt).toString(), 'KLAY'),
              data: contract.methods.mint(mintCnt, process.env.REACT_APP_TREASURY_ACCOUNT,cnt, account).encodeABI(),
              gas: gaslimit
            }).then(async (res)=>{
              console.log(res);
              let maxRet = await maxPurchaseCnt(cnt);
            })
            .catch((err) => {alert("Mint has failed.");});  
        }      
      }else if(process.env.REACT_APP_WHITELIST == "true" && parseInt(process.env.REACT_APP_PURCHASE_LIMIT) == 0){ 
        ret = await caver.klay.sendTransaction({
            type: 'SMART_CONTRACT_EXECUTION',
            from: account,
            to: gachaAddress,
            value: caver.utils.toPeb((NFTPrice * cnt).toString(), 'KLAY'),
            data: contract.methods.mint(mintCnt, process.env.REACT_APP_TREASURY_ACCOUNT,cnt, account).encodeABI(),
            gas: gaslimit
          }).then(async (res)=>{
            console.log(res);
          })
          .catch((err) => {alert("Mint has failed.");});
      }else if(process.env.REACT_APP_WHITELIST == "false"){
        ret = await caver.klay.sendTransaction({
            type: 'SMART_CONTRACT_EXECUTION',
            from: account,
            to: gachaAddress,
            value: caver.utils.toPeb((NFTPrice * cnt).toString(), 'KLAY'),
            data: contract.methods.mint(mintCnt, process.env.REACT_APP_TREASURY_ACCOUNT,cnt, account).encodeABI(),
            gas: gaslimit
          }).then((res)=>{console.log(res);})
          .catch((err) => {alert("Mint has failed.");});
      }
        let mintCount = await contract.methods.getMintedCount(minterAddress).call();
        setMintCnt(mintCount);
      
        await wait(3000);
    }
    
  }
  
const bull = (
  <Box
    component="div"
    sx={{ display: 'flex', mx: '2px', md: '10px', transform: 'scale(0.8)' , border: '2px', alignContent: 'center', padding: '10px'}}
  >
  </Box>
);
    
  return (
    <div style={{display: 'flex', marginTop: '10%',justifyContent: 'center'}}>
      <Box  sx={{ width: '20%', background: '#000010', color: '#FFFFFF', borderRadius:'8px', minWidth:'270px'}}>
      <Stack spacing={1}>
        <div>Remaining {mintCnt}/{process.env.REACT_APP_NUMBER_OF_NFT}</div>
        <div>Price : {process.env.REACT_APP_NFT_PRICE} Klay</div>
        <Button variant="contained" style={{margin:'5px', background: '#4f473e', color: 'white'}} disabled={walletConnection} onClick={connectWallet}>{walletConnection ? (account.toString().slice(0,7) + "...") : "Wallet Connect"}</Button>
        <Button variant="contained" style={{margin:'5px'}} disabled={mintLive} onClick={(cnt) => mintNFT(1)}>Mint 1 NFT</Button>
        <Button variant="contained" style={{margin:'5px'}} disabled={mintLive} onClick={(cnt) => mintNFT(3)}>Mint 3 NFT</Button>
        <Button variant="contained" style={{margin:'5px'}} disabled={mintLive} onClick={(cnt) => mintNFT(5)}>Mint 5 NFT</Button>
        <div style={{fontSize: '10px', margin: '5px'}}>Powered by Klay-Gacha-Machine</div>
      </Stack>
      </Box>
    </div>
  );
}

