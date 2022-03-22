# Metadata 표준

Metadata의 standard, 즉 표준은 다음과 같습니다.

> {\
> “name”:”NFT의 이름",\
> “symbol”:”NFT의 토큰심볼”,\
> “description”:”NFT의 설명, 그러니까 한줄짜리 홍보용 문구”,\
> “image”:”[https://ipfs.io/ipfs/](https://ipfs.io/ipfs/QmZuEuUq74rF5AdQK5g2PbjbvYyidxn2BGpV9KxRYjSnph){해시값} 이미지의 주소",\
> “attributes”:\[{“trait\_type”:”속성명 ex)hair color”,”value”:”속성값 ex) red”}]\
> }

&#x20;가장 필수적인 것들만 적어놓았습니다. 이 외에도 Json 데이터가 허용하는 값이면 뭐든지 가능합니다.

&#x20;각 이름은 “NFT이름 #001”처럼 번호를 매기는 것이 일반적이고, 심볼은 넣지 않아도 되지만 구분을 위해 넣는 것이 좋습니다. 속성값(attribute) 또한 넣지 않아도 무방하지만, 제너러티브 NFT를 만드는 이유는 판매하는 것이며, 상품의 특성이 없는 한 구매까지 이어지지도 않으니 보통은 attribute를 넣습니다. 속성값은 몇개를 넣어도 상관은 없지만, 보통 3\~6개정도 넣습니다.. 속성값 자체에 Rarity를 common, rare, unique와 같은 방식으로 넣기도 합니다.
