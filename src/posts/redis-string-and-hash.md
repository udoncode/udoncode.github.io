---
title: "[레디스] 02. String과 Hash"
subtitle: 레디스 자료구조 String, Hash
date: 2026-11-17
category: 개발
sub: 데이터베이스
tags: [DB, NOSQL, REDIS]
---

## 1. String

String은 Redis의 가장 기본 자료구조이다.

문자열, 숫자, JSON, 이미지 바이트까지 담을 수 있다. (최대 512MB)

**기본 명령어**

```bash
SET greeting "hello"          → OK
GET greeting                  → "hello"
APPEND greeting " redis"      → (integer) 11   ← 뒤에 이어 붙이고 길이 반환
GET greeting                  → "hello redis"
STRLEN greeting               → (integer) 11
```

**여러 개 한 번에: `MSET` / `MGET`**

```bash
MSET user:1:name udon user:2:name ramen
MGET user:1:name user:2:name user:3:name
1) "udon"
2) "ramen"
3) (nil)       ← 없는 키는 nil
```

`GET`을 3번 하면 네트워크 왕복이 3번이지만, `MGET`은 1번이다.

**조회하면서 처리: `GETDEL` / `SET ... GET`**

```bash
SET temp:code 1234
GETDEL temp:code        → "1234"   ← 꺼내면서 삭제 (인증번호 1회용 처리에 딱!)
GET temp:code           → (nil)

SET config:mode A
SET config:mode B GET   → "A"      ← 새 값을 넣으면서 이전 값을 돌려줌
```

### 원자적 카운터

**숫자 증감 명령어**

```bash
SET post:52:views 0
INCR post:52:views          → (integer) 1
INCR post:52:views          → (integer) 2
INCRBY post:52:views 10     → (integer) 12
DECR post:52:views          → (integer) 11
DECRBY post:52:views 5      → (integer) 6
INCRBYFLOAT score:1 1.5     → "1.5"
```

**두 가지 성질**

```bash
INCR new:counter            → (integer) 1   ← 키가 없으면 0으로 보고 1 증가
SET name udon
INCR name                   → (error) ERR value is not an integer or out of range
```

여기서 가장 중요한 개념은 ‘원자적’이다.

둘 이상의 사용자가 동시에 들어오면 다음과 같은 **경쟁 상태**에 빠진다.

```bash
현재 값: 100

A: GET → 100 읽음
B: GET → 100 읽음        ← A가 저장하기 전에 읽어 버림!
A: 100+1 → SET 101
B: 100+1 → SET 101       ← B도 101을 저장

결과: 2명이 봤는데 101 (1회 증발)
```

반면, Redis는 명령어를 하나씩 순서대로 실행한다.

```bash
A: INCR → 101
B: INCR → 102   ← OK!
```

`INCR`은 "읽기 + 더하기 + 저장"을 **Redis 안에서 명령어 하나로** 처리하니까 중간에 아무도 끼어들 수 없다.

따라서 숫자를 올리거나 내릴 때는 **GET → 계산 → SET 하지 말고 무조건 INCR/DECR 계열**을 사용한다.

### TTL 설정 (만료 시간)

TTL(Time To Live)은 ”이 키는 N초 뒤에 자동으로 사라진다."라는 설정이다.

**기본 명령어**

```bash
SET session:abc "user1001"
EXPIRE session:abc 60      → (integer) 1    ← 60초 뒤 삭제 예약
TTL session:abc            → (integer) 57   ← 남은 시간(초)
PTTL session:abc           → (integer) 56812 ← 남은 시간(밀리초)
PERSIST session:abc        → (integer) 1    ← 만료 취소, 영구 키로
TTL session:abc            → (integer) -1
```

**TTL 반환값 읽는 법**

| 반환값 | 의미 |
| --- | --- |
| 양수 | 남은 초 |
| `-1` | 키는 있는데 **만료 시간이 없음** (영구) |
| `-2` | **키 자체가 없음** (이미 만료됐거나 처음부터 없음) |

`SET`은 기존 TTL을 지우는 반면, `INCR`, `APPEND`, `HSET`처럼 **값을 수정하는 명령은 TTL을 유지한다.**

덮어쓰기와 수정의 차이이다.

```bash
SET code 1234 EX 60
SET code 5678              ← 그냥 SET
TTL code                   → -1 TTL 사라짐

SET code 1234 EX 60
SET code 5678 KEEPTTL      ← 값만 바꾸고 TTL은 유지
TTL code                   → 55
```

### NX / EX 옵션

`SET`에는 강력한 옵션이 많다.

```bash
SET key value [NX | XX] [EX 초 | PX 밀리초 | KEEPTTL] [GET]
```

| 옵션 | 뜻 |
| --- | --- |
| `EX 60` | 60초 뒤 만료 |
| `PX 500` | 500밀리초 뒤 만료 |
| `NX` | **키가 없을 때만** 저장 (Not eXists) |
| `XX` | **키가 있을 때만** 저장 (eXists) |
| `KEEPTTL` | 기존 TTL 유지 |

**NX: 먼저 온 사람만 성공**

```bash
SET seat:A1 user:1001 NX     → OK      ← 첫 번째 사람: 성공
SET seat:A1 user:2002 NX     → (nil)   ← 두 번째 사람: 실패 (이미 있음)
GET seat:A1                  → "user:1001"
```

**NX + EX 조합**

```bash
SET lock:order:777 server-A NX EX 10
```

키가 없을 때만 만들고, 10초 뒤 자동 삭제

| 용도 | 예시 | 왜 EX가 필요할까? |
| --- | --- | --- |
| **중복 요청 방지** | 결제 버튼 연타 시 첫 요청만 처리 | 처리 후 일정 시간 뒤 다시 허용 |
| **간단한 락** | 같은 주문을 동시에 처리 못 하게 | 서버가 죽어도 락이 영원히 안 남게 |
| **인증번호** | `SET auth:010-1234 482910 NX EX 180` | 3분 뒤 자동 만료 |

## 2. Hash 명령어

**Hash의 필요성**

사용자 정보를 String으로 저장하는 방법은 두 가지가 있다.

그러나 이 두 방법 모두 사용하기에 불편한 점이 있다.

```bash
방법 ① 필드마다 키를 따로
SET user:1001:name udon
SET user:1001:email udon@ex.com
SET user:1001:age 28
→ 키가 너무 많아지고, 한 사용자를 통째로 지우기 불편함

방법 ② JSON 문자열로
SET user:1001 '{"name":"udon","email":"udon@ex.com","age":28}'
→ age 하나 바꾸려 해도 전체를 읽고, 파싱하고, 다시 저장해야 함
```

Hash는 이 둘의 장점만을 합친 방식이다.

키 하나에 묶어 두면서 필드 하나만 읽고 쓸 수 있다.

**기본 명령어**

```bash
HSET user:1001 name udon email udon@ex.com age 28
→ (integer) 3                 ← "새로 추가된" 필드 개수

HGET user:1001 name           → "udon"
HMGET user:1001 name age      → 1) "udon" 2) "28"
HGETALL user:1001
1) "name"
2) "udon"
3) "email"
4) "udon@ex.com"
5) "age"
6) "28"                       ← 필드, 값, 필드, 값... 순서로 나옴
```

**수정 / 삭제 / 확인**

```bash
HSET user:1001 age 29         → (integer) 0   ← 기존 필드 수정이라 "추가"는 0개
HDEL user:1001 email          → (integer) 1
HEXISTS user:1001 email       → (integer) 0
HLEN user:1001                → (integer) 2   ← 필드 개수
HKEYS user:1001               → 1) "name" 2) "age"
HVALS user:1001               → 1) "udon" 2) "29"
```

**Hash 안에서 원자적 카운터**

```bash
HINCRBY user:1001 point 100   → (integer) 100
HINCRBY user:1001 point -30   → (integer) 70
HSETNX user:1001 name ramen   → (integer) 0   ← 필드가 이미 있으면 무시 (Hash판 NX)
```

**Hash의 TTL 주의점**

```bash
EXPIRE user:1001 3600         ← Hash "전체"에 TTL
```

기본적으로 **TTL은 키 단위라서** 필드 하나만 만료시킬 수는 없다.

## 3. String vs Hash

| 상황 | 추천 | 이유 |
| --- | --- | --- |
| 값 하나 (토큰, 인증번호, 플래그) | String | 단순함 |
| 카운터 하나 (조회수) | String + INCR | 단순함 |
| 락, 중복 방지 | String + NX EX | `SET` 옵션을 쓸 수 있음 |
| 객체 (사용자, 상품) + **필드 일부만 자주 수정** | Hash | 부분 수정 가능 |
| 객체를 **항상 통째로** 읽고 씀 (캐시) | String(JSON) | 직렬화 한 번이면 끝 |
| 객체 안에 카운터 (포인트, 좋아요 수) | Hash + HINCRBY | 객체와 함께 관리 |