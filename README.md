# Introduction
Klay-Gacha-Machine이란? 
Klay-Gacha-Machine은 클레이튼 환경에서 NFT를 발행하기 위한 에코시스템을 지향하며, 클레이튼 기반의 NFT 발행을 원하시는 개발자와 발행인들을 위해 많은 개발도구들을 지원해 개발적 요소를 최소화하는 것을 목표로 합니다.

# Official Menual
곧 깃북 업데이트와 함께 추가기능 매뉴얼이 제공될 예정입니다.
## Medium
https://medium.com/@eklee808/%EA%B0%9C%EB%B0%9C%EC%97%86%EC%9D%B4-%ED%81%B4%EB%A0%88%EC%9D%B4-%EC%A0%9C%EB%84%88%EB%9F%AC%ED%8B%B0%EB%B8%8C-nft-%EB%B0%9C%ED%96%89%ED%95%98%EA%B8%B0-1-klay-gacha-machine-eb17496e8b22


# Product
## Gacha-Machine-CLI 
NFT 발행을 위한 이미지 파일의 IPFS, AWS S3 업로드 및 메타데이터 URL 삽입 기능, 그리고 메타데이터의 URL의 IPFS, AWS S3 업로드 및 스마트 컨트랙트 업로드 기능을 제공하여 몇번의 명령어 입력으로 NFT 발행을 위한 모든 준비를 한번에 끝낼 수 있는 기능을 제공합니다.

## Mint UI 
Gacha-Machine-CLI를 이용해 업로드가 끝난 NFT를 발행하기 위한 Mint UI를 제공합니다. 사용자는 Mint UI를 NFT를 발행/판매할 웹사이트에 올려 NFT 발행/판매를 쉽게 실시할 수 있습니다.

# Klay-Gacha-Machine 설치하기​
git clone을 이용한 설치​명령 프롬프트를 켜고 다음 명령어를 입력합니다.

` git clone https://github.com/Planet-Us/Klay_Gacha_Machine.git`

`cd Klay_Gacha-Machine`

`npm install`

# Gacha-CLI Config 설정
프로젝트 내 config.json 파일을 열면 다음과 같은 파일 내용이 나옵니다.
```
{ "NumberOfNFT" : 100, //총 발행갯수  

"TokenName" : "myNFT", //NFT의 대표 이름

"TokenSymbol" : "MNT", //NFT의 토큰심볼  

"TreasuryAccount": "", //NFT의 발행주소

"PrivateKey": "", //NFT 발행주소의 프라이빗  

"pinataApiKey":"", //Pinata의 api key 

"pinataSecretApiKey": "", //Pinata의 secret key 

"imageExtension" : "jpeg", //이미지 파일의 확장자 

"awsRegion" : "ap-northeast-2", //aws s3의 리전이름 

"awsBucketName": "", //aws s3의 버킷이름 예) "gacha-machine"

"awsAccessKey" : "", //aws의 액세스키  

"awsSecretKey" : "" //aws의secret key }
```

위 내용 중, pinata를 사용하실 분들은 pinataApiKey와 pinataSecretApiKey를 채워야 하고, AWS S3를 사용하실 분들은 awsRegion, awsBucketName, awsAccessKey, awsSecretKey를 채워주시면 됩니다. 그 외의 항목들은 모두 채워주셔야 합니다.

# 화이트리스트 적용
프로젝트 폴더 내 whiteList.json 파일에 화이트리스트 대상 주소를 입력합니다.
화이트리스트는 json 형식으로 다음과 같이 작성해주셔야 합니다.
```
{
    "items" : [
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"},
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"},
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"},
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"},
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"},
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"},
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"},
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"},
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"},
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"},
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"},
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"},
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"},
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"},
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"},
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"},
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"},
        {"address":"0xFCcB6d83D02d55aaaaaaaaaaaaaaaaaaaaaaa"}
    ]
}
```
화이트리스트 명단이 작성되면, 다음의 명령어를 통해 화이트리스트를 업데이트합니다.
`node gacha-cli.mjs applyWhiteList`
화이트리스트 업로드가 완료되면, Mint UI에서의 화이트리스트 적용을 위해 .env파일의 화이트리스트 항목을 "true"로 바꿔줍니다.

# Mint UI 환경파일 설정
프로젝트 내 .env파일을 열면 다음과 같은 내용이 나옵니다. (.env파일이 없는 경우, 파일 이름을 '.env'로 새로 만들어주세요)
```
REACT_APP_NFT_PRICE=0.2 //민팅 가격(0.1Klay 이상으로 설정하셔야 합니다)
REACT_APP_NUMBER_OF_NFT=12 //총 발행량 or 회당 발행량(화이트리스트의 경우)
REACT_APP_TREASURY_ACCOUNT= //NFT 발행 주소
REACT_APP_PRIVATE_KEY= //NFT 발행 주소의 프라이빗 키
REACT_APP_LIVE_DATE="25 Feb 2022 10:00:00 GMT" // NFT 발행을 시작할 날짜
REACT_APP_NFT_FILENAME_EXTENSION=jpeg //NFT 이미지의 형식
REACT_APP_NETWORK=baobab //네트워크명 baobab or mainnet
REACT_APP_WHITELIST=false //화이트리스트 사용 여부
```

# Mint UI 테스트
.env파일의 설정이 끝나면, 다음과 같은 명령어를 통해 Mint UI를 로컬 환경에서 테스트해볼 수 있습니다.

`npm start`
