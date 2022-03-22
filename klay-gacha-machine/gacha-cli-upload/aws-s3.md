# AWS S3를 사용한 방법

AWS S3를 사용하고자 한다면 다음 명령어를 통해 이미지와 메타데이터를 AWS S3에 업로드하고, tokenURI를 스마트컨트랙트에 업로드합니다.

```
node gacha-cli.mjs upload <폴더명> -n <네트워크명> -a

ex) node gacha-cli.mjs upload images -n baobab -a
ex2) node gacha-cli.mjs upload images -n mainnet -a
```

나머지 작업은 방법 1과 동일합니다.
