# Gacha-CLI Config 설정

vscode를 이용해 프로젝트를 열면, 다음과 같이 프로젝트의 파일들이 좌측에 나열됩니다.

![](../.gitbook/assets/vs1.JPG)

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
