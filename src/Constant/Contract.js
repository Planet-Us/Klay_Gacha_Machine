export default {
    
    "gachaAddressBaobab" : "0x62Cc6ba7fC76b124B42687703d682EC120bc1F1d",
    "gachaAddress" : "0x40466BB10bb95d984E55554b6EDd05CA73187f29",
    "gachaABI" : [
		{
			"constant": true,
			"inputs": [],
			"name": "getBalance",
			"outputs": [
				{
					"name": "",
					"type": "uint256"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [
				{
					"name": "_maxCnt",
					"type": "uint256"
				},
				{
					"name": "cnt",
					"type": "uint256"
				},
				{
					"name": "_tokenURI",
					"type": "string"
				}
			],
			"name": "upload",
			"outputs": [
				{
					"name": "",
					"type": "bool"
				}
			],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"constant": true,
			"inputs": [
				{
					"name": "cnt",
					"type": "uint256"
				}
			],
			"name": "getTokenURI",
			"outputs": [
				{
					"name": "",
					"type": "string"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		},
		{
			"constant": true,
			"inputs": [
				{
					"name": "minterAddress",
					"type": "address"
				},
				{
					"name": "cnt",
					"type": "uint256"
				},
				{
					"name": "_tokenURI",
					"type": "string"
				}
			],
			"name": "getUploaded",
			"outputs": [
				{
					"name": "",
					"type": "bool"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		},
		{
			"constant": true,
			"inputs": [],
			"name": "isMintExist",
			"outputs": [
				{
					"name": "",
					"type": "address"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		},
		{
			"constant": true,
			"inputs": [
				{
					"name": "_count",
					"type": "uint256"
				}
			],
			"name": "getUserToken",
			"outputs": [
				{
					"name": "",
					"type": "string"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		},
		{
			"constant": true,
			"inputs": [
				{
					"name": "minterAddress",
					"type": "address"
				}
			],
			"name": "getMintedCount",
			"outputs": [
				{
					"name": "",
					"type": "uint256"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		},
		{
			"constant": true,
			"inputs": [
				{
					"name": "",
					"type": "address"
				}
			],
			"name": "nftManager",
			"outputs": [
				{
					"name": "",
					"type": "address"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [
				{
					"name": "_name",
					"type": "string"
				},
				{
					"name": "_symbol",
					"type": "string"
				}
			],
			"name": "mintNewToken",
			"outputs": [
				{
					"name": "",
					"type": "address"
				}
			],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [
				{
					"name": "_maxCnt",
					"type": "uint256"
				},
				{
					"name": "cnt",
					"type": "uint256"
				},
				{
					"name": "_tokenURI",
					"type": "string"
				},
				{
					"name": "uploadCnt",
					"type": "uint256"
				}
			],
			"name": "uploadBulk",
			"outputs": [
				{
					"name": "",
					"type": "bool"
				}
			],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [
				{
					"name": "_tokenNum",
					"type": "uint256"
				},
				{
					"name": "minterAddress",
					"type": "address"
				},
				{
					"name": "mintNum",
					"type": "uint256"
				},
				{
					"name": "mintee",
					"type": "address"
				}
			],
			"name": "mint",
			"outputs": [],
			"payable": true,
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"inputs": [],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "constructor"
		}
	],
    "baobabRPCURL" : "https://api.baobab.klaytn.net:8651/",
    "mainnetRPCURL" : "https://public-node-api.klaytnapi.com/v1/cypress"

}