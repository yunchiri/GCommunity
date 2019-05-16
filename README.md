# Pyron
Group Thread Base Chat style Community backend

structure

server -> thread -> message


### 기능
- Thread , id, name , type( base, vs ), info
- Realtime chat
- 정렬, 인기, | 시간
- 퍼오기 기능 업그레이드
- 댓글라시코 
- 모바일에 맞게 실시간성, 알람을 가장 신경씀

### DB tables

- thread (tid, tname, type, info)
- Board
- Comment
- User

누구나 스레드 추가할수 있도록 
아래는 봇으로 자동생성
- player
- match
- team
- etc

OAuth 2.0 gwt token
redis 

### 제약
모바일에서 thread는 < 100 개
관심 제외, 시간순으ㄹ 내부디비 삭제 

### Model
Board  crud
Comment crud
Gtag crud

### utils
Notification
Cache
Mqtt




