---
title: "[레디스] 01. Redis 개념과 환경 구축"
subtitle: 레디스란 무엇인가
date: 2026-11-13
category: 개발
sub: 데이터베이스
tags: [DB, NOSQL, REDIS]
---

## 1. 레디스(Redis)란

> **Redis** = **Re**mote **Di**ctionary **S**erver
> 

레디스는 위 이름과 같이 네트워크 너머에 있는 거대한 딕셔너리(`Map`)이다.

`Map` 자료구조와 같이 Key-Value로 값을 저장 및 접근한다.

다만 차이는 `Map`이 애플리케이션 밖에 별도로 존재하는 서버로 여러 서버가 함께 접속 해서 쓸 수 있다는 점이다.

```java
Map<String, Object> redis = new HashMap<>();
redis.put("user:1:name", "kim");
redis.get("user:1:name"); // "kim"
```

### RDBMS와 비교

| 구분 | RDBMS | Redis |
| --- | --- | --- |
| 데이터 저장 위치 | 디스크 중심 | **메모리(RAM)** 중심 |
| 데이터 모델 | 테이블, 행, 열, 관계(JOIN) | **Key-Value** (값은 다양한 자료구조) |
| 조회 방식 | SQL (복잡한 조건 검색 가능) | **Key로 바로 접근** (복잡한 검색은 약함) |
| 속도 | ms 단위 | 보통 **μs~1ms 미만** |
| 주 용도 | 원본 데이터(Source of Truth) | 캐시, 세션, 토큰, 랭킹, 카운터, 락 |
| 스키마 | 있음 (CREATE TABLE) | 없음 (그냥 넣으면 됨) |

Redis는 RDB를 대체하는 게 아니라 보완한다.

데이터 원본은 RDB로 디스크에 안전하게 보관하고, 자주 사용하는 데이터만 Redis로 메모리에 복사해서 빠르게 꺼내는 것이 핵심이다.

### 레디스의 구조

레디스는 **인메모리(In-memory)** 구조를 가져서 읽기 속도가 빠르다.

일반적인 컴퓨터 저장장치의 속도 차이를 비교해보면 한 눈에 알 수 있다.

- RAM \< SSD \< HDD

하지만 메모리의 특징에 따른 대가도 있다.

- **메모리는 비싸고 작아서** 모든 데이터를 다 넣을 수 없다.
- **메모리는 휘발성이라서** 서버가 꺼지면 데이터가 날아간다.

### 레디스의 아키텍처

레디스의 가장 중요한 특징은 명령어를 한 번에 하나씩 실행한다는 점이다.

레디스는 기본적으로 명령어를 **싱글 스레드**로 처리한다.

각 명령어는 원자적(atomic)이라서 중간에 다른 명령이 끼어들 수 없다.

여러 서버(클라이언트)가 동시에 요청을 보내면 다음과 같이 처리한다.

```
Client A ── GET user:1 ──┐
Client B ── SET user:2 ──┤
Client C ── INCR counter ┤
Client D ── GET user:3 ──┘
                         │
                         ▼
                  Event Loop
                         │
                  명령어 순차 처리
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           GET A       SET B      INCR C
              │          │          │
              ▼          ▼          ▼
           Memory      Memory     Memory
              │          │          │
              ▼          ▼          ▼
           Response   Response   Response
```

1. 여러 클라이언트의 요청을 동시에 받는다.
2. 이벤트 루프가 처리할 요청을 관리한다.
3. 메인 스레드에서 명령어를 순차적으로 처리한다.
4. 실행 결과를 클라이언트에 반환한다.

싱글 스레드 구조의 장점은 다음과 같다.

- 작업이 전부 메모리 연산이므로 명령어 하나가 아주 짧게 끝낸다.
- 스레드가 하나이므로 동시성 제어의 문제가 없다.

그러나 만일 느린 명령어가 중간에 끼어 있다면, 이로 인해 전체가 대기해야 하는 경우가 발생할 수 있다.

## 2. 레디스의 기본 명령어

### 도커로 레디스 접속하기

1. Redis 컨테이너 실행

```docker
docker run -d --name my-redis -p 6379:6379 redis:8
```

1. redis-cli로 접속

```docker
docker exec -it my-redis redis-cli --raw
```

### 연결 확인

```
127.0.0.1:6379> PING
PONG
```

`PONG`이 돌아오면 Redis가 살아 있다는 의미이다.

#### C — Create (저장)

```
127.0.0.1:6379> SET user:1:name kim
OK
127.0.0.1:6379> SET user:1:email kim@example.com
OK
```

#### R — Read (조회)

```
127.0.0.1:6379> GET user:1:name
"kim"
127.0.0.1:6379> GET user:999:name
(nil)                      ← 없는 키는 nil (자바의 null)
127.0.0.1:6379> EXISTS user:1:name
(integer) 1                ← 있으면 1, 없으면 0
```

#### U — Update (수정)

레디스에는 `UPDATE`가 따로 없다. **같은 키에 다시 `SET`하면 덮어쓴다.**

```
127.0.0.1:6379> SET user:1:name hong
OK
127.0.0.1:6379> GET user:1:name
"hong"
```

#### D — Delete (삭제)

```
127.0.0.1:6379> DEL user:1:email
(integer) 1                ← 삭제된 키 개수
127.0.0.1:6379> GET user:1:email
(nil)
```

### 이외 기본 명령어

| 명령어 | 하는 일 | 예시 |
| --- | --- | --- |
| `TYPE key` | 값의 자료구조 확인 | `TYPE user:1:name` → `string` |
| `DBSIZE` | 전체 키 개수 | `(integer) 1` |
| `FLUSHALL` | **모든 데이터 삭제** | 사용 주의! |
| `QUIT` | cli 종료 |  |

### Key 설계 규칙

레디스는 테이블이 없어서 **Key 이름이 곧 구조가 된다**. 

이름을 대충 지으면 나중에 찾지도, 지우지도, 관리하지도 못한다.

**규칙 ① 콜론(`:`)으로 계층을 나눈다**

```
[대상]:[ID]:[속성]
user:1001:profile
post:52:views
product:300:detail
```

SQL로 치면 `테이블:PK:컬럼` 느낌과 유사하다. 콜론 구분은 Redis 커뮤니티의 사실상 표준이고, GUI 도구들도 이걸 폴더처럼 묶어서 보여준다.

**규칙 ② 앞에서부터 큰 범위 → 작은 범위**

```
(good) shop:user:1001:cart
(bad) cart:1001:user:shop   (뭐가 뭔지 알기 어려움)
```

여러 서비스가 레디스 하나를 같이 쓴다면 앞에 서비스 이름 prefix를 붙인다.

**규칙 ③ 읽기 쉬우면서 너무 길지 않게**

```
(bad) u:1:p                                    ← 너무 짧아서 의미를 모름
(bad) application_user_information_profile_1001 ← 너무 길어서 메모리 낭비
(good) user:1001:profile                         ← 적당함
```

키도 메모리를 차지한다. 키가 수백만 개면 키 길이도 무시할 수 없다.

**규칙 ④ 팀 안에서 일관성 유지**

```
(bad) user:1:name / users-2-name / USER_3_NAME  ← 섞여 있으면 지옥
(good) 하나의 규칙을 정하고 모두 따르기 (소문자 + 콜론 + 하이픈 정도)
```

**규칙 ⑤ 용도를 이름에 드러내기**

```
cache:product:300        ← 캐시라서 지워져도 괜찮다는 걸 알 수 있음
session:abc123           ← 세션
refresh-token:user:1001  ← 토큰
lock:order:777           ← 락
```