---
title: "[레디스] 03. List와 Set"
subtitle: 레디스 자료구조 List, Set
date: 2026-11-19
category: 개발
sub: 데이터베이스
tags: [DB, NOSQL, REDIS]
---

## 1. List

### List 기본 명령어

**넣기: LPUSH / RPUSH**

```bash
RPUSH fruits apple          → (integer) 1   ← 넣은 뒤 전체 길이 반환
RPUSH fruits banana cherry  → (integer) 3
LPUSH fruits mango          → (integer) 4

현재 상태: [ mango, apple, banana, cherry ]
            ↑ LPUSH가 넣은 곳         ↑ RPUSH가 넣은 곳
```

**보기: LRANGE / LLEN / LINDEX**

```bash
LRANGE fruits 0 -1          ← 처음(0)부터 끝(-1)까지 전부
1) "mango"
2) "apple"
3) "banana"
4) "cherry"

LRANGE fruits 0 1           → mango, apple   (앞에서 2개)
LLEN fruits                 → (integer) 4
LINDEX fruits -1            → "cherry"       (-1은 맨 끝)
```

**빼기: LPOP / RPOP**

```bash
LPOP fruits                 → "mango"     ← 왼쪽에서 꺼내고 삭제
RPOP fruits                 → "cherry"    ← 오른쪽에서 꺼내고 삭제
LPOP fruits 2               → 1) "apple" 2) "banana"   ← 여러 개 한 번에
LLEN fruits                 → (integer) 0
EXISTS fruits               → (integer) 0  ← 비면 키 자체가 자동 삭제!
```

**기타 유용한 명령어**

```bash
RPUSH nums a b c a d
LREM nums 0 a               → (integer) 2   ← 값이 "a"인 요소 모두 삭제 (0 = 전부)
LTRIM nums 0 1              ← 0~1번만 남기고 나머지 잘라냄
LSET nums 0 z               ← 0번 요소를 z로 교체
```

### List의 Queue / Stack 구조

List는 **넣는 방향과 빼는 방향을 어떻게 조합하느냐**에 따라 완전히 다른 자료구조가 된다.

**Queue (큐): 먼저 들어온 게 먼저 나간다 (FIFO)**

```bash
RPUSH로 넣고 LPOP으로 뺀다 (방향이 반대)

RPUSH job:queue job1 job2 job3

  꺼내는 쪽 ◀── [ job1, job2, job3 ] ◀── 넣는 쪽
               LPOP                RPUSH

LPOP job:queue  → "job1"  먼저 넣은 게 먼저 나옴
```

**용도:** 작업 대기열(이메일 발송, 이미지 변환, 알림 전송)

**Stack (스택): 나중에 들어온 게 먼저 나간다 (LIFO)**

```bash
LPUSH로 넣고 LPOP으로 뺀다 (방향이 같음)

LPUSH history page1 page2 page3

  넣고 빼는 쪽 ◀▶ [ page3, page2, page1 ]

LPOP history    → "page3"  마지막에 넣은 게 먼저 나옴
```

**용도:** 뒤로 가기, 실행 취소(Undo), 최근 본 상품

**List의 단점**

**양 끝(LPUSH, RPOP 등)은 매우 빠르지만**, `LINDEX`나 `LRANGE`로 **중간 위치를 찾는 건 느리다.**

처음부터 하나씩 세어야 해서 O(N)이 된다.

양 끝에서 넣고 빼는 용도로 쓰고, 중간 접근이 잦다면 다른 자료구조를 고려한다.

### Blocking Pop

작업자가 Redis에 작업이 들어올 때까지 잠들어 있다가, 작업이 들어오면 즉시 꺼내서 처리하는 기능이다.

예를 들어, 다음과 같은 작업이 필요하다.

- 주문 완료 시 이메일 발송
- 배송 준비 알림 발송
- 포인트 적립

이와 같은 일은 주문을 처리하는 서버에 모두 맡기면 부담이 커진다.

따라서 일을 별도로 맡기는 구조를 취한다.

- Producer (생산자) : 해야 할 일을 만들어서 큐에 넣는 역할 (주문 서버)
- Queue (큐) : 해야 할 일을 임시로 보관하는 곳 (이메일 발송, 포인트 적립)
- Worker (작업자) : 큐에서 일을 꺼내 실제로 실행하는 역할 (이메일 발송 서버)

생산자와 작업자는 서로 다른 서버일 수도 있다.

생산자는 일을 맡기기만 하고, 작업자는 실제 일을 처리하기만 하기 때문이다.

**Worker: `job:queue`에 작업이 들어올 때까지 대기**

```bash
BLPOP job:queue 0
```

- `BLPOP`: 리스트의 왼쪽에서 데이터를 꺼낸다. (데이터를 꺼내는 순간 큐에서 삭제)
- `0`: 데이터가 들어올 때까지 무한정 기다린다.

**Producer: 작업을 `job:queue` 큐에 넣음**

```bash
RPUSH job:queue send-email:1001
```

**Worker: 결과**

```bash
1) "job:queue"
2) "send-email:1001"
```

그런데 다음과 같은 상황이 발생할 수 있다.

1. Redis 큐에 이메일 발송 작업이 들어옴.
2. Worker가 `BLPOP`으로 작업을 꺼냄.
3. Redis 큐에서 해당 작업이 삭제됨.
4. Worker가 이메일을 보내기 직전에 갑자기 종료됨.

결과적으로 큐에 있던 작업은 삭제되고, Worker는 이메일 발송 작업이 유실된다.

**해결책: `BLMOVE`**

```bash
BLMOVE job:queue job:processing LEFT RIGHT 0
```

이 명령은 다음 두 가지를 한 번에 수행한다.

1. `job:queue`에서 작업을 꺼냄.
2. 꺼낸 작업을 `job:processing`으로 옮김.

그러면 Worker가 죽더라도 작업이 `job:processing`에 남아 있다.

작업이 성공적으로 끝나면 `LREM`으로 삭제하면 된다.

## 2.Set

### Set 기본 명령어

**넣기 / 확인 / 빼기**

```bash
SADD tags:post:1 redis java spring    → (integer) 3
SADD tags:post:1 redis                → (integer) 0   ← 이미 있으면 무시!
SMEMBERS tags:post:1                  → 1) "java" 2) "redis" 3) "spring"
                                         (순서는 보장되지 않아요)
SISMEMBER tags:post:1 java            → (integer) 1   ← 있음
SISMEMBER tags:post:1 python          → (integer) 0   ← 없음
SMISMEMBER tags:post:1 java python    → 1) 1  2) 0    ← 여러 개 한 번에 확인
SCARD tags:post:1                     → (integer) 3   ← 개수 (Cardinality)
SREM tags:post:1 java                 → (integer) 1
```

**랜덤 뽑기**

```bash
SADD event:users u1 u2 u3 u4 u5
SRANDMEMBER event:users 2   → 2명 랜덤 조회 (삭제 안 함)
SPOP event:users            → 1명 랜덤으로 꺼내고 삭제 (경품 추첨!)
```

**Set의 중복 제거**

SADD의 반환값으로 처음인지 아닌지 판단할 수 있다.

```bash
SADD post:1:likes user:1001   → (integer) 1   ← 새로 추가됨 = "처음 누름"
SADD post:1:likes user:1001   → (integer) 0   ← 이미 있음 = "이미 누름"
```

### 집합 연산

```bash
SADD user:A:follows tom jerry spike
SADD user:B:follows jerry spike tyke
```

| 연산 | 명령어 | 결과 |
| --- | --- | --- |
| **교집합** (둘 다) | `SINTER user:A:follows user:B:follows` | jerry, spike |
| **합집합** (어느 쪽이든) | `SUNION user:A:follows user:B:follows` | tom, jerry, spike, tyke |
| **차집합** (A에만) | `SDIFF user:A:follows user:B:follows` | tom |

**결과를 저장하기: ~STORE**

```bash
SINTERSTORE mutual:A:B user:A:follows user:B:follows   → (integer) 2
SMEMBERS mutual:A:B                                     → jerry, spike
```

**개수만 필요하다면**

```bash
SINTERCARD 2 user:A:follows user:B:follows     → (integer) 2
```

- `SINTERCARD`: 교집합에 해당하는 원소의 개수만 반환
- 2는 교집합으로 비교할 Set의 개수이다.