---
description: Pinata IPFS
---

# 이미지가 이미 업로드된 경우

이미지가 이미 저장소에 업로드 되어있는 경우(Pinata ipfs)

Pinata IPFS에 이미 이미지를 업로드하고, 이미지의 URI를 이미 Metadata(json파일)에 삽입해놓은 경우엔, 다음과 같은 명령어를 통해 Metadata를 Pinata IPFS에 업로드하고 tokenURI를 스마트컨트랙트에 업로드하는 작업을 진행합니다.

```
node gacha-cli.mjs upload <폴더명> -n <네트워크명>

ex) node gacha-cli.mjs upload images -n baobab
ex2) node gacha-cli.mjs upload images -n mainnet
```

나머지 작업은 방법 1과 동일합니다.
