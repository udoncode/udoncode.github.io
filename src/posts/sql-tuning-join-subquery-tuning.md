---
title: "[SQL 튜닝] 03. JOIN과 서브쿼리 튜닝"
subtitle: JOIN의 원리와 활용
date: 2026-11-20
category: 개발
sub: 데이터베이스
tags: [DB, SQL, TUNING]
---

## 1. JOIN의 종류

| 종류 | 결과 | 비고 |
| --- | --- | --- |
| `INNER JOIN` | 양쪽에 짝이 있는 행만 | 가장 흔함 |
| `LEFT [OUTER] JOIN` | 왼쪽 전부 + 오른쪽은 짝이 없으면 NULL |  |
| `RIGHT [OUTER] JOIN` | LEFT의 반대 | 테이블 순서를 바꿔 LEFT로 쓰는 게 관례 |
| `FULL OUTER JOIN` | 양쪽 전부 | **MySQL은 미지원** (PostgreSQL은 지원) |
| `CROSS JOIN` | 모든 조합 (카테시안 곱) | 의도한 게 아니면 사고 |
| `SELF JOIN` | 같은 테이블끼리 | 별칭으로 구분 |

#### 주의! LEFT JOIN에서 오른쪽 조건을 WHERE에 쓰면 INNER JOIN이 된다

```sql
-- 의도: 모든 사용자 + 그 사람의 '취소 아닌' 주문 수 (주문 없으면 0)

-- WHERE에 오른쪽 조건
SELECT u.id, COUNT(o.id)
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.status <> 'CANCELLED'        -- 주문 없는 사용자는 o.status가 NULL → 탈락!
GROUP BY u.id;

-- ON에 오른쪽 조건
SELECT u.id, COUNT(o.id)
FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.status <> 'CANCELLED'
GROUP BY u.id;
```

**이유는 다음과 같다.**

1. `JOIN` 단계에서 LEFT JOIN으로 짝이 없는 사용자는 NULL 행으로 살린다.
2. `WHERE`에서 `NULL <> 'CANCELLED'`처럼 NULL을 비교 연산자를 사용하면 `UNKNOWN`이 되어 다시 버린다.

결과적으로 INNER JOIN과 같아진다.

따라서 의도에 맞는 쿼리를 작성하려면 다음과 같은 규칙을 따른다.

> LEFT JOIN에서 **오른쪽 테이블을 거르는 조건은 ON에**, **최종 결과를 거르는 조건은 WHERE에 쓴다.**
> 

## 2. JOIN 알고리즘

SQL에서 `JOIN` 문법은 **무엇을 짝지을지만** 작성한다.

그러면 옵티마이저는 **어떻게 짝지을지를** 정한다.

대표적인 방법은 세 가지가 있다.

### Nested Loop Join (중첩 루프 조인)

한 행씩 가져온 다음 맞는 짝을 찾는 방법이다.

여기서 바깥 테이블과 안쪽 테이블은 다음과 같이 부른다.

- Driving 테이블: 먼저 행을 가져오는 테이블
- Driven 테이블: Driving 테이블의 각 행에 맞는 데이터를 찾는 테이블

```sql
for (바깥 테이블의 행 r1)              ← Driving 테이블
    for (안쪽 테이블에서 r1과 짝인 행 r2)  ← Driven 테이블 (인덱스로 찾음)
        결과에 (r1, r2) 추가
```

이 SQL은 11월 11일 이후의 주문을 가져와서, 각 주문을 한 사용자의 이름과 연결한다.

```sql
-- 날짜로 고른 주문마다 users PK로 사용자 1명씩 찾기
SELECT u.name, o.total_price
FROM orders o JOIN users u ON u.id = o.user_id
WHERE o.ordered_at >= '2026-11-11';
```

실제 작업 과정은 다음과 같다.

1. orders 101번 조회
    
    `user_id = 1` → users에서 1 검색
    
2. orders 102번 조회
    
    `user_id = 2` → users에서 2 검색
    
3. orders 103번 조회
    
    `user_id = 1` → users에서 1 검색
    
4. (계속)

따라서 비용은 다음과 같다.

**비용 = 바깥 행 수 × 안쪽 한 번 찾는 비용**

안쪽 테이블(`users`)의 JOIN 컬럼에 **인덱스가 있으면** 한 번 찾는 비용이 아주 낮다.

기본키에는 B+Tree 인덱스가 있기 때문에 안쪽 테이블 전체를 뒤질 필요 없이 기본키로 빠르게 찾을 수 있다.

| 상황 | 검색 방식 |
| --- | --- |
| 안쪽 테이블에 인덱스 있음 | 인덱스로 필요한 행 찾기 |
| 안쪽 테이블에 인덱스 없음 | 안쪽 테이블을 매번 훑기 |

**핵심은 바깥 테이블의 행마다 안쪽 테이블에서 짝을 찾는다는 것이다.**

### Hash Join (해시 조인)

검색용 사전(해시 테이블)을 미리 만들어 두는 방식이다.

따라서 두 단계로 나눈다.

| 단계 | 하는 일 |
| --- | --- |
| Build | 한쪽 테이블(작은 쪽)을 읽어 해시 테이블 생성 |
| Probe | 다른 쪽 테이블(큰 쪽)을 읽으며 해시 테이블에서 짝 찾기 |
1. Build 단계: `users`로 해시 테이블 생성
2. Probe 단계: `orders` 테이블을 읽으며 사전에서 검색

| users.id | users.name |
| --- | --- |
| 1 | 철수 |
| 2 | 영희 |
| 3 | 민수 |
| … | … |

기본적으로 Hash Join은 대량 데이터에서 Nested Loop보다 빠르다.

사용자 테이블을 한 번 읽어서 검색용 사전을 만들고, 주문 100만 건을 읽으며 사전에서 찾기 때문이다.

그러나 해시 테이블을 만들려면 메모리가 필요하다.

데이터가 너무 크다면 메모리에 들어가지 못하므로 디스크를 사용하게 된다.

디스크를 사용하면 결과적으로 더 느려질 수 있다.

Hash Join의 특성상 다음과 같이 등호 JOIN에 적합하다.

```sql
ON users.id = orders.user_id
```

반면 범위 JOIN에는 일반적인 Hash Join을 사용할 수 없다.

```sql
ON a.price > b.price
```

### **Sort Merge Join (정렬 병합 조인)**

양쪽을 정렬하고 동시에 비교하는 방식이다.

과정은 다음과 같다.

1. 양쪽을 JOIN 컬럼 기준으로 정렬 (이미 인덱스로 정렬돼 있으면 생략)
2. 두 포인터를 앞으로 옮기며 같은 값끼리 짝짓기

예를 들어 ID순으로 미리 정렬을 해두면, 작은 ID부터 차례대로 비교하며 짝을 짓는다.

범위 조건을 JOIN에도 사용할 수 있다.

그러나 MySQL은 지원하지 않는다.

**비교**

| 구분 | Nested Loop | Hash | Sort Merge |
| --- | --- | --- | --- |
| 핵심 | 하나씩 검색 | 사전 생성 | 정렬 후 비교 |
| 인덱스 | 있으면 유리 | 불필요 | 있으면 정렬 생략 가능 |
| 메모리 | 적음 | 상대적으로 많음 | 정렬에 사용 |
| 첫 결과 | 빠를 수 있음 | Build 후 | 정렬 후 |
| MySQL 8 | O | O | X |

## 3. Join Order

Nested Loop의 비용은 **바깥 행 수 × 안쪽 탐색 비용**이다.

**바깥 테이블의 행이 적으면 안쪽 테이블을 탐색하는 횟수가 줄어든다.**

다음은 ‘**서울** 사용자의 **2026-11-11 이후** 주문’이다.

```sql
SELECT u.name, o.id, o.total_price
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.city = '서울'
  AND o.ordered_at >= '2026-11-11';
```

순서는 두 가지가 가능하다.

**순서 A: users → orders**

`users`가 바깥 테이블이고 `orders`가 안쪽 테이블이라고 가정한다.

1. 바깥 테이블인 `users`부터 읽는다.
2. 안쪽 테이블인 `orders`에서 주문을 찾는다.
3. 마지막으로 주문 날짜를 확인하여 조건을 만족하는 주문만 남긴다.

서울 사용자 한 명이 평균 10건의 주문을 했다고 가정하면 총 2만 명 × 평균 10건 = 약 20만 건의 주문을 찾게 된다.

**순서 B: orders → users**

1. 바깥 테이블인 orders부터 읽는다.
2. 안쪽 테이블인 users에서 사용자를 찾는다.
3. 마지막으로 서울 사용자인지 확인한다.

전체 주문이 100만 건인데 해당 날짜 이후 주문이 2천 건이라면 2천 번의 사용자 검색이 발생한다.

| 구분 | 순서 A | 순서 B |
| --- | --- | --- |
| 바깥 테이블 | users | orders |
| 바깥 테이블 통과 행 | 20,000명 | 2,000건 |
| 안쪽 테이블 | orders | users |
| 안쪽 탐색 횟수 | 약 20,000회 | 약 2,000회 |
| 안쪽에서 찾는 주문 | 약 200,000건 | 사용자 2,000번 검색 |

옵티마이저는 통계를 보고 **결과가 적게 남는 조건(선택도가 좋은 조건)이 붙은 테이블을 먼저 읽는다.**

또한, **Nested Loop에서는 안쪽 테이블의 JOIN 컬럼에 인덱스가 있는 것이 유리하다.**

`users.id`는 PK이므로 인덱스가 있어서 주문 하나를 가져올 때마다 사용자를 빠르게 찾을 수 있다.

그런데 안쪽 테이블에 인덱스가 없다면 사용자 테이블 전체를 매번 검색해야 한다.

## 4. Join Cardinality

### 관계의 카디널리티

카디널리티는 두 테이블의 데이터가 서로 몇 개씩 연결되는가를 뜻한다.

- 1:1 → 한 행이 최대 한 행과 연결
- 1:N → 한 행이 여러 행과 연결
- N:M → 양쪽 모두 여러 행과 연결

**users**

| id | name |
| --- | --- |
| 1 | 철수 |
| 2 | 영희 |

**orders**

| id | user_id | total_price |
| --- | --- | --- |
| 101 | 1 | 45,000 |
| 102 | 1 | 36,000 |
| 103 | 1 | 21,000 |
| 104 | 2 | 50,000 |

`users.id`와 `orders.user_id`를 JOIN하면 다음과 같다.

```sql
SELECT u.name, o.id, o.total_price
FROM users u
JOIN orders o ON o.user_id = u.id;
```

해당 JOIN은 사용자 한 명에게 주문이 여러 개 연결되므로 1:N 관계이다.

| name | order_id | total_price |
| --- | --- | --- |
| 철수 | 101 | 45,000 |
| 철수 | 102 | 36,000 |
| 철수 | 103 | 21,000 |
| 영희 | 104 | 50,000 |

**이처럼 JOIN 결과 행 수가 반드시 원래 테이블 행 수와 같지는 않다.**

### 팬 아웃(Fan-out)

다음과 같이 쿠폰 테이블도 있다고 가정해보자.

**orders**

| id | user_id | total_price |
| --- | --- | --- |
| 101 | 1 | 45,000 |
| 102 | 1 | 36,000 |
| 103 | 1 | 21,000 |

**coupons**

| id | user_id | coupon_name |
| --- | --- | --- |
| 201 | 1 | 쿠폰A |
| 202 | 1 | 쿠폰B |

이 상태에서 두 테이블을 모두 JOIN하면 다음과 같다.

```sql
SELECT *
FROM users u
JOIN orders o ON o.user_id = u.id
JOIN coupons c ON c.user_id = u.id
WHERE u.id = 1;
```

각 주문은 쿠폰 2장과 연결되고, 각 쿠폰은 주문 3건과 연결된다.

**JOIN 결과: 3 × 2 = 6행**

| 주문 | 쿠폰 |
| --- | --- |
| 주문 101 | 쿠폰A |
| 주문 101 | 쿠폰B |
| 주문 102 | 쿠폰A |
| 주문 102 | 쿠폰B |
| 주문 103 | 쿠폰A |
| 주문 103 | 쿠폰B |

이렇게 **행이 예상보다 늘어나는 현상을 팬아웃**이라고 한다.

이처럼 중복된 데이터가 늘어나면, 집계 결과도 제대로 출력되지 않는다.

```sql
SELECT
    u.id,
    SUM(o.total_price),
    COUNT(c.id)
FROM users u
JOIN orders o ON o.user_id = u.id
JOIN coupons c ON c.user_id = u.id
GROUP BY u.id;
```

기존의 주문 금액 합계가 조인을 거쳐 쿠폰 수만큼 복제되어 의도한 결과보다 훨씬 커진다.

즉, **JOIN 자체는 정상적으로 동작했지만 집계할 데이터가 중복된 것이다.**

이를 해결하려면, **자식 테이블을 먼저 집계한다.**

```sql
SELECT
    u.id,
    o.total,
    c.cnt
FROM users u
LEFT JOIN (
    SELECT
        user_id,
        SUM(total_price) AS total
    FROM orders
    GROUP BY user_id
) o ON o.user_id = u.id
LEFT JOIN (
    SELECT
        user_id,
        COUNT(*) AS cnt
    FROM coupons
    GROUP BY user_id
) c ON c.user_id = u.id;
```

주문 집계와 쿠폰 집계를 먼저 진행하여 사용자당 한 행으로 만드는 기법이다.

`LEFT JOIN`을 사용했기 때문에 주문이나 쿠폰이 없는 사용자도 결과에 남아도 집계 결과가 없으면 해당 컬럼은 `NULL`이다.

### **옵티마이저의 카디널리티 추정**

옵티마이저는 JOIN을 실행하기 전에 다음과 같은 판단을 한다.

- 이 테이블을 먼저 읽으면 몇 행이 남는가?
- 다음 테이블과 JOIN하면 몇 행이 만들어지는가?

이때 예상하는 결과 행 수가 **카디널리티 추정**이다.

옵티마이저가 실제보다 훨씬 적은 행이 만들어질 거라고 생각하면, 잘못된 JOIN 알고리즘이나 순서를 선택할 수 있다.

```sql
EXPLAIN ANALYZE
SELECT ...
```

이 명령으로 실행 계획을 확인할 수 있다.

여기서 다음 두 가지를 비교하면 된다.

- `rows`: 옵티마이저가 예상한 행 수
- `actual rows`: 실제 실행 결과 행 수

예상은 100행인데 실제로 10만 행이라면 추정이 크게 빗나간 것이다.

## 5. Semi Join / Anti Join

일반 JOIN은 상대방의 데이터를 가져오는 것이다.

반면, Semi Join과 Anti Join은 상대방의 데이터가 존재하는지만 확인하는 것을 말한다.

|  | 의미 | SQL 표현 |
| --- | --- | --- |
| **Semi Join** | 짝이 **하나라도 있는** 바깥 행을 **한 번씩만** 반환 | `EXISTS`, `IN` |
| **Anti Join** | 짝이 **하나도 없는** 바깥 행을 반환 | `NOT EXISTS`, `NOT IN`, `LEFT JOIN ... IS NULL` |

### Semi Join: 짝이 있는지만 확인하기

다음 SQL은 주문한 적이 있는 사용자를 한 번만 출력한다.

```sql
SELECT *
FROM users u
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
);
```

`EXISTS`는 말 그대로 존재하는지를 확인하기 한다.

최초 일치한 주문을 발견하면 더 이상 해당 사용자 주문은 살펴볼 필요가 없다는 것이 장점이다.

### Anti Join: 짝이 없는지만 확인하기

반대로 다음 SQL은 주문한 적이 없는 사용자를 한 번만 출력한다.

```sql
SELECT *
FROM users u
WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
);
```

`NOT EXISTS`는 일치하는 데이터가 존재하지 않는 경우만 반환한다.

### JOIN + DISTINCT와 EXISTS의 차이

두 SQL은 결과적으로 같은 결과를 만들 수 있다.

**방법 A: JOIN + DISTINCT**

```sql
SELECT DISTINCT u.*
FROM users u
JOIN orders o ON u.id = o.user_id;
```

**방법 B: EXISTS**

```sql
SELECT *
FROM users u
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
);
```

그러나 과정에서 차이를 보인다.

**방법 A: JOIN + DISTINCT**

1. 철수와 주문 3건을 모두 연결
2. 철수가 3번 등장
3. 중복을 제거해서 철수 1명만 남김

**방법 B: EXISTS**

1. 철수의 주문을 확인
2. 첫 번째 주문 발견
3. 더 확인하지 않고 철수 1명 반환

### `NOT IN` vs `NOT EXISTS`

`NOT IN`과 `NOT EXISTS`는 `NULL` 때문에 결과가 달라진다.

다음 테이블에서 주문하지 않는 사용자를 찾아보자.

**users**

| id | name |
| --- | --- |
| 1 | 철수 |
| 2 | 영희 |
| 3 | 민수 |

**orders**

| id | user_id |
| --- | --- |
| 101 | 1 |
| 102 | 2 |
| 103 | NULL |

**방법 A: NOT IN**

```sql
SELECT *
FROM users
WHERE id NOT IN (
    SELECT user_id FROM orders
);
```

해당 SQL문의 출력 결과는 UNKNOWN으로 만족하는 행이 없다.

이유는 다음과 같다.

`3 NOT IN (1, 2, NULL)`은 내부적으로 아래와 같은 비교를 한다.

```sql
3 <> 1
AND 3 <> 2
AND 3 <> NULL
```

그런데 NULL을 `<>`로 비교를 하지 못하니 UNKNOWN이 나오므로 값이 나오지 않는다.

따라서 `NOT IN`에 NULL이 포함되면 행을 아무것도 반환하지 않는다.

**방법 B: NOT EXISTS**

```sql
SELECT *
FROM users u
WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
);
```

해당 SQL문의 출력 결과는 민수를 반환한다.

민수의 id인 3과 일치하는 주문이 있는지만 확인하기 때문이다.

**따라서 없는 데이터를 찾을 때는 `NOT EXISTS`를 기본으로 사용한다.**

## 6. Correlated Subquery (상관 서브쿼리)

상관 서브쿼리는 바깥 쿼리에서 현재 처리 중인 행의 값을 가져와서 서브쿼리를 실행하는 방식이다.

다음 SQL은 각 사용자의 가장 최근 주문을 찾는다.

```sql
SELECT o.*
FROM orders o
WHERE o.ordered_at = (
    SELECT MAX(o2.ordered_at)
    FROM orders o2
    WHERE o2.user_id = o.user_id
);
```

- `o2.user_id`: 서브쿼리 내부의 주문 사용자 ID
- `o.user_id`: 바깥 쿼리의 주문 사용자 ID

서브쿼리가 바깥 쿼리의 `o.user_id`를 참조하고 있는 상관 서브쿼리이다.

중요한 건 **상관 서브쿼리는 반복할 때마다 발생하는 비용이 크면 문제가 된다.**

따라서 반복 작업의 부담을 줄이려면 다른 방법 2가지가 있다.

**방법 A. 먼저 집계하고 JOIN하기**

```sql
SELECT o.*
FROM orders o
JOIN (
    SELECT user_id, MAX(ordered_at) AS last_at
    FROM orders
    WHERE user_id BETWEEN 1 AND 1000
    GROUP BY user_id
) t
    ON o.user_id = t.user_id
   AND o.ordered_at = t.last_at;
```

순서는 다음과 같다.

1. 사용자별 최신 주문 시간을 먼저 구한다.
2. 원래 orders 테이블과 JOIN하여 사용자 ID와 주문 시간이 모두 일치하는 행을 찾는다.
3. 최신 주문을 반환한다.

사용자별 최신 주문 시간을 한 번에 집계한 뒤 JOIN하여 반복 검색을 줄인다.

**방법 B. 윈도우 함수 사용하기**

```sql
WITH ranked AS (
    SELECT o.*,
           ROW_NUMBER() OVER (
               PARTITION BY user_id
               ORDER BY ordered_at DESC, id DESC
           ) AS rn
    FROM orders o
    WHERE user_id BETWEEN 1 AND 1000
)
SELECT *
FROM ranked
WHERE rn = 1;
```

이번에는 `ROW_NUMBER()`가 사용자별로 주문에 순위를 매긴다.

각 사용자별로 최신 주문에 1등을 부여하고, 마지막에 `rn = 1`인 행만 가져오는 방식이다.

여기서 `id DESC`는 주문 시간이 같은 경우에도 하나를 선택하기 위한 추가 정렬 조건이다.

## 7. CTE / Derived Table

CTE와 Derived Table은 복잡한 SQL을 작은 단계로 나눠서 작성하는 방법이다.

예를 들어 아래와 같은 문제를 해결해보자.

> 사용자별 총 주문 금액을 구하고, 주문 금액이 높은 사용자 TOP 10을 조회하라.
> 

우선 사용자별 주문 금액을 합친다.

```sql
SELECT user_id, SUM(total_price) AS total
FROM orders
GROUP BY user_id;
```

그런 다음 이 결과를 가지고 users 테이블과 JOIN하면 된다.

그런데 여기서 조회한 결과는 실제 테이블이 아니다.

이 결과를 마치 테이블처럼 사용하려면 Derived Table과 CTE를 사용하면 된다.

### Derived Table (파생 테이블)

**`FROM` 안에 결과를 직접 작성**

```sql
SELECT *
FROM (
    SELECT user_id, SUM(total_price) AS total
    FROM orders
    GROUP BY user_id
) AS t;
```

안쪽 쿼리가 만든 결과를 `t`라는 이름으로 부른다.

순서는 다음과 같다.

1. 안쪽 쿼리로 사용자별 주문 금액을 조회한다.
2. 그 결과를 `t`라는 이름으로 사용한다.
3. 바깥쪽 쿼리에서 `t`를 일반 테이블처럼 조회한다.

즉, **FROM 안에 임시 결과를 만드는 방식이다.**

### CTE (공통 테이블 표현식)

**`WITH`에서 결과를 먼저 정의하고 사용**

```sql
WITH user_totals AS (
    SELECT user_id, SUM(total_price) AS total
    FROM orders
    GROUP BY user_id
)
SELECT *
FROM user_totals;
```

`WITH` 절을 사용해서 `user_totals`라는 이름으로 임시 결과를 먼저 정의하고, 아래 쿼리에서 사용한다.

순서는 다음과 같다.

1. WITH로 사용자별 주문 금액을 조회한다.
2. 그 결과에 `user_totals`라는 이름을 붙인다.
3. 아래 쿼리에서 `user_totals`를 테이블처럼 사용한다.

옵티마이저는 내부적으로 이 임시 결과를 두 가지 방법으로 처리한다.

**Merge (병합)**

중간 결과를 따로 만들지 않고, 원래 쿼리에 합쳐서 실행하는 방식이다.

예를 들어 다음과 같은 쿼리는 굳이 두 단계로 실행할 필요가 없다.

```sql
SELECT *
FROM (
    SELECT *
    FROM users
) AS t
WHERE t.id = 10;
```

그래서 다음처럼 내부적으로 합쳐서 실행한다.

```sql
SELECT *
FROM users
WHERE id = 10;
```

병합되면 바깥 쿼리 조건도 원래 테이블에서 사용하므로 **인덱스도 활용할 수 있다.**

**Materialize (구체화)**

중간 결과를 실제 임시 테이블로 만들어 놓는 방식이다.

```sql
SELECT user_id, SUM(total_price) AS total
FROM orders
GROUP BY user_id;
```

이 쿼리는 GROUP BY로 집계해야 한다.

MySQL은 이 결과를 먼저 계산해서 임시 테이블에 저장한 다음 바깥쪽 쿼리에서 사용할 수 있다.

구체화되면 임시 테이블에는 인덱스가 그대로 따라오지 않는다.

MySQL은 필요 시에 임시 테이블에 자동으로 인덱스를 만들어 JOIN에 활용한다.

임시 테이블은 메모리에 담기지 못하면 디스크를 사용하기 때문에 성능이 저하될 수 있다.

**CTE와 Derived Table 중 무엇을 사용해야 할까?**

성능보다는 코드의 가독성과 재사용성을 기준으로 선택한다.

| 구분 | Derived Table | CTE |
| --- | --- | --- |
| 작성 위치 | FROM 안 | WITH 위쪽 |
| 가독성 | 중첩되면 복잡해짐 | 상대적으로 읽기 쉬움 |
| 재사용 | 같은 서브쿼리를 반복 작성 | 이름을 여러 번 참조 가능 |
| 재귀 쿼리 | 불가능 | 가능 |
| 성능 | 대체로 유사 | 대체로 유사 |

## 8. 불필요한 JOIN 제거

### **패턴 1: 이미 가지고 있는 값을 얻으려고 JOIN**

```sql
SELECT o.id, u.id AS user_id, o.total_price
FROM orders o
JOIN users u ON u.id = o.user_id
WHERE o.ordered_at >= '2026-11-11';
```

주문 정보를 조회하면서 사용자 ID도 가져오고 있다.

그런데 `orders` 테이블에도 이미 `user_id`가 존재하므로 다음과 같이 바꾼다.

```sql
SELECT o.id, o.user_id, o.total_price
FROM orders o
WHERE o.ordered_at >= '2026-11-11';
```

### **패턴 2: 컬럼을 하나도 사용하지 않는 LEFT JOIN**

```sql
SELECT o.id, o.total_price
FROM orders o
LEFT JOIN products p ON p.id = o.product_id;
```

이 쿼리는 products의 컬럼을 하나도 사용하지 않고 products를 JOIN하고 있다.

따라서 다음과 같이 제거한다.

```sql
SELECT o.id, o.total_price
FROM orders o;
```

### **패턴 3: 존재 확인용 JOIN + DISTINCT**

이번에는 상품을 하나라도 주문한 사용자 목록을 조회하고자 한다.

```sql
SELECT DISTINCT u.id, u.name
FROM users u
JOIN orders o ON o.user_id = u.id;
```

여기서 문제는 굳이 주문 내역을 알 필요가 없다는 것이다.

주문한 적이 있는 사용자의 존재 여부만 알면 되므로 `EXISTS`를 사용한다.

```sql
SELECT u.id, u.name
FROM users u
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.user_id = u.id
);
```

### **패턴 4: 혹시 몰라서 붙인 JOIN**

다음은 공통 주문 조회 쿼리이다.

```sql
SELECT o.*, u.name, p.name AS product_name
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN products p ON p.id = o.product_id;
```

이 쿼리를 여러 화면에서 공통으로 사용한다.

- 주문 목록 화면: 주문 ID, 금액만 필요
- 사용자 주문 화면: 사용자 이름 필요
- 상품 주문 화면: 상품 이름 필요

그런데 주문 ID와 금액만 필요한 화면에서도 users와 products를 모두 JOIN하고 있다.

따라서 화면이나 기능에 필요한 데이터만 조회하도록 변경한다.