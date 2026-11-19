---
title: "[SQL 튜닝] 02. SQL 튜닝 기본"
subtitle: 올바른 WHERE절 작성법
date: 2026-11-19
category: 개발
sub: 데이터베이스
tags: [DB, SQL, TUNING]
---

## 1. **SARGable**

**SARGable**은 **S**earch **ARG**ument + **able**, 즉 "검색 조건으로 쓸 수 있는"이라는 뜻이다.

**데이터베이스가 인덱스를 이용해서 검색할 수 있도록 WHERE 조건을 작성하는 방법**이다.

예를 들어 아래와 같은 `orders` 테이블이 있고, `ordered_at`에 인덱스가 있다고 가정하자.

인덱스는 날짜순으로 정렬되어 있다.

| id | ordered_at |
| --- | --- |
| 1 | 2025-01-01 10:00 |
| 2 | 2025-01-02 15:00 |
| 3 | 2025-01-03 09:00 |
| 4 | 2025-01-04 12:00 |
| 5 | 2025-01-05 18:00 |

인덱스를 사용하는 검색 조건과 그렇지 않은 검색 조건의 SQL은 다음과 같다.

**인덱스를 사용하는 SQL문**

```sql
SELECT *
FROM orders
WHERE ordered_at = '2025-01-03';
```

DB는 인덱스를 이용해서 해당 날짜가 있는 위치를 찾아갈 수 있다.

이를 **SARGable한 조건**이라고 한다.

**인덱스를 사용하지 않는 SQL문**

```sql
SELECT *
FROM orders
WHERE DATE(ordered_at) = '2025-01-03';
```

여기서는 `DATE()`라는 함수가 등장한다.

DB 입장에서는 아래와 같이 판단한다.

1. 인덱스는 `2025-01-03 09:00`처럼 원래 날짜와 시간이 정렬되어 있다.
2. 그런데 SQL은 `DATE(ordered_at)`의 결과를 비교하라고 한다.
3. DB는 각 값에 DATE()를 적용해야 비교할 수 있다.
4. 원래 인덱스의 정렬 순서를 그대로 활용하기 어렵다.

따라서 **인덱스에 저장된 원래 값을 기준으로 검색 범위를 좁히기 어려워진 것**이다.

이를 **Non-SARGable한 조건**이라고 한다.

**해결책**

검색 시 인덱스를 제대로 타고 싶다면 **컬럼을 가공하지 말고, 비교할 값을 가공하면 된다.**

잘못된 방식

```sql
WHERE DATE(ordered_at) = '2025-01-03'
```

올바른 방식

```sql
WHERE ordered_at >= '2025-01-03'
  AND ordered_at <  '2025-01-04'
```

두 조건은 같은 날짜의 데이터를 조회한다는 점에서 목적이 같다.

그러나 두 번째 방법은 원래 컬럼을 가공하지 않는다.

이처럼 시작점을 포함하고 끝점을 제외하는 방식을 **반열린 구간**이라고 한다.

만약 단순히 `BETWEEN`으로 하루의 마지막 시간을 `23:59:59`로 지정하면 소수점 이하 초가 있는 데이터가 누락될 수 있다.

**조건 비교**

| Non-SARGable | SARGable |
| --- | --- |
| `WHERE DATE(ordered_at) = '2026-03-01'` | `WHERE ordered_at >= '2026-03-01' AND ordered_at < '2026-03-02'` |
| `WHERE YEAR(ordered_at) = 2025` | `WHERE ordered_at >= '2025-01-01' AND ordered_at < '2026-01-01'` |
| `WHERE ordered_at + INTERVAL 30 DAY >= NOW()` | `WHERE ordered_at >= NOW() - INTERVAL 30 DAY` |
| `WHERE total_price * 1.1 > 55000` | `WHERE total_price > 50000` |
| `WHERE SUBSTRING(name, 1, 3) = '사용자'` | `WHERE name LIKE '사용자%'` |
| `WHERE IFNULL(city, '미입력') = '미입력'` | `WHERE city IS NULL` |
| `WHERE email = 0` (문자 컬럼에 숫자) | `WHERE email = '0'` (타입 맞추기) |

여기서 눈 여겨 볼 점은 다음과 같다.

- `LIKE '사용자%'`는 앞부분이 고정된 검색이라 인덱스를 활용할 수 있다.
- `LIKE '%사용자'`처럼 앞에 와일드카드가 있으면 일반적인 B+Tree 인덱스로 범위를 좁히기 어렵다.
- `email = 0`처럼 컬럼과 다른 자료형을 비교하면 MySQL의 암묵적 형 변환 때문에 인덱스 활용이 어렵다.

## 2. `WHERE` 조건의 최적화 기본 원칙

### ① 인덱스 컬럼은 가공하지 않는다

```sql
-- 나쁜 예
WHERE YEAR(created_at) = 2025

-- 좋은 예
WHERE created_at >= '2025-01-01'
  AND created_at < '2026-01-01'
```

### **② 검색 범위를 좁힌다**

```sql
-- 특정 상태가 아닌 모든 주문
WHERE status <> 'CANCELLED'

-- 특정 상태의 주문
WHERE status = 'COMPLETED'
```

`=`나 `IN`, 범위 비교(`<`, `<=`)는 인덱스에서 검색할 범위를 정하기 좋다.

반면 부정 조건 `<>`, `NOT IN`, `NOT LIKE`는 제외할 값 외에 많은 데이터를 읽어야 할 수 있다.

다만 부정 조건이라고 해서 반드시 인덱스를 사용하지 못하는 것은 아니고 데이터 분포에 따라 다르다.

### **③ 날짜 검색은 반열린 구간을 사용한다** (`>= 시작 AND < 끝`)

```sql
-- 버그 위험: '2026-03-01 23:59:59.500' 같은 소수점 초가 빠짐
WHERE ordered_at BETWEEN '2026-03-01 00:00:00' AND '2026-03-01 23:59:59'

-- 안전하고 인덱스도 잘 탐
WHERE ordered_at >= '2026-03-01' AND ordered_at < '2026-03-02'
```

### **④ WHERE 조건의 작성 순서는 성능에 영향을 주지 않는다**

```sql
-- A
WHERE status = 'COMPLETED'
  AND user_id = 10

-- B
WHERE user_id = 10
  AND status = 'COMPLETED'
```

일반적으로 두 쿼리는 옵티마이저가 동일하게 최적화할 수 있다.

중요한 것은 **WHERE에 적힌 순서가 아니라 어떤 인덱스가 존재하고, 그 인덱스의 컬럼 순서가 어떻게 구성되어 있는가**이다.

## 3. 함수와 형변환

### 컬럼에 함수 씌우기

```sql
-- 함수 사용
SELECT *
FROM orders
WHERE DATE(ordered_at) = '2026-03-01';

-- 범위 검색
SELECT *
FROM orders
WHERE ordered_at >= '2026-03-01'
  AND ordered_at < '2026-03-02';
```

두 SQL은 모두 2026년 3월 1일에 주문한 데이터를 찾으려는 목적이다.

그런데 DB 입장에서는 완전히 다른 검색이다.

**DATE() 함수 사용**

인덱스가 가지는 데이터는 `ordered_at`이라서 DB는 원래 인덱스에 저장된 값에서 `DATE()`를 적용한 뒤 비교해야 한다.

따라서 일반적인 인덱스 검색 방식으로 범위를 좁히기 어렵다.

**범위 검색**

범위 검색의 경우 DB가 원래 인덱스에서 다음 범위를 찾으면 된다.

- 3월 1일 00:00:00 이상
- 3월 2일 00:00:00 미만

인덱스가 날짜순으로 정렬되어 있으므로 해당 구간만 읽으면 된다.

이는 산술 연산도 마찬가지 원리이다.

```sql
-- 컬럼을 계산 (bad!)
WHERE ordered_at + INTERVAL 7 DAY >= '2026-11-12'

-- 비교할 값을 계산 (good!)
WHERE ordered_at >= '2026-11-12' - INTERVAL 7 DAY
```

### 함수 기반 인덱스

경우에 따라서 어떤 서비스는 날짜만 추출해서 검색하는 기능을 자주 사용할 수 있다.

```sql
WHERE DATE(ordered_at) = '2026-03-01'
```

이와 같은 상황에서는 매번 쿼리를 범위 조건으로 바꾸기 번거로울 수 있다.

이처럼 **함수 결과 자체를 검색 기준으로** 삼고 싶을 때 사용하는 것이 **함수 기반 인덱스(Functional Index)**이다.

```sql
CREATE INDEX idx_orders_order_date ON orders ((DATE(ordered_at)));
```

다음은 DATE()를 적용한 결과를 기준으로 인덱스를 만든다.

| **일반 인덱스 (ordered_at)** | **함수 기반 인덱스 (DATE(ordered_at))** |
| --- | --- |
| 03-01 08:30 | 03-01 |
| 03-01 12:00 | 03-01 |
| 03-02 09:00 | 03-02 |

단, 함수 기반 인덱스는 인덱스 공간을 추가로 사용하고 INSERT, UPDATE, DELETE 때 인덱스도 관리해야 한다.

따라서 다음과 같은 우선순위를 세운다.

1. 쿼리를 수정해서 기존 인덱스를 활용한다.
2. 쿼리를 수정하기 어렵고 해당 검색이 중요하다면 함수 기반 인덱스를 고려한다.

### 형변환

자료형이 다른 데이터를 비교하면 DB가 알아서 자료형을 바꾸기도 한다.

이것을 **암묵적 형변환(Implicit Type Conversion)**이라고 한다.

MySQL은 문자열을 숫자로 변환해서 비교한다.

```sql
-- 숫자 컬럼에 문자 값: 괜찮음 (값만 변환)
EXPLAIN SELECT * FROM orders WHERE user_id = '777';   -- type: ref

-- 문자 컬럼에 숫자 값: Full Scan
EXPLAIN SELECT * FROM users WHERE email = 0;          -- type: ALL
```

따라서 변환되는 대상이 컬럼이라면, 심각한 문제가 발생할 수 있다.

`email`은 문자 컬럼인데 숫자 `0`과 비교하므로, 거의 모든 사용자의 `email`을 숫자로 변환하고자 시도한다.

또한, 숫자로 변환할 수 없는 문자열은 `0`으로 취급하므로 숫자로 변환할 수 없는 이메일까지 조회된다.

## 4. LIKE 검색

SQL의 `LIKE`는 문자열이 특정 패턴과 일치하는지 검사하는 연산자이다.

`%`는 **문자가 0개 이상 존재한다**는 의미이다.

LIKE는 **와일드카드 `%`가 어디에 있느냐**가 어디에 있느냐가 가장 중요하다.

| 패턴 | 의미 | 인덱스 | 이유 |
| --- | --- | --- | --- |
| `LIKE '사용자777%'` | ~로 시작 | range | 사전에서 '사용자777'로 시작하는 구간을 찾을 수 있음 |
| `LIKE '%777'` | ~로 끝남 | ALL | 시작 글자를 모르면 어디를 펼칠지 모름 |
| `LIKE '%777%'` | ~를 포함 | ALL | 시작 글자를 모르면 어디를 펼칠지 모름 |

B+Tree 인덱스는 문자열을 정렬해서 보관하므로, 시작 부분이 정해진 문자열은 구간을 찾을 수 있다.

반면 단순히 특정 문자열이 포함되어 있거나 끝이 정해진 문자열은 시작 문자를 알 수 없으므로 정할 수 없다.

## 5. OR / AND 조건

### **AND: 조건을 하나씩 좁혀 간다**

다음과 같은 상황을 가정한다.

- 전체 주문: 1,000,000건
- `user_id = 777`에 해당하는 주문: 10건
- 그중 `total_price > 50000`인 주문: 3건

```sql
SELECT *
FROM orders
WHERE user_id = 777 AND total_price > 50000;
```

`user_id` 인덱스를 사용하면 100만 건을 전부 확인할 필요 없이 해당 사용자의 주문 10건을 찾을 수 있다.

그다음 10건에 대해서 가격 조건을 검사한다.

이처럼 **AND는 인덱스가 있는 조건 하나만으로도 검색 범위를 줄일 수 있다.**

### **OR: 두 조건의 결과를 모두 찾아야 한다**

```sql
SELECT *
FROM orders
WHERE user_id = 777 OR total_price = 45000;
```

이번에는 AND와는 달리 두 조건 중 하나라도 빠뜨리면 결과가 틀린다.

`user_id = 777`인 주문을 찾아야 하고, `total_price = 45000`인 주문도 찾아야 한다.

**`user_id`에만 인덱스가 있는 경우**

`user_id` 인덱스로 찾은 주문 외에 가격이 45000원인 주문도 전부 확인해야 한다.

따라서 전체 테이블 스캔이 더 유리할 수도 있다.

**`user_id`와 `total_price` 양쪽 모두 인덱스가 있는 경우**

`user_id` 인덱스로 사용자 `777`을 검색하고, `total_price`로 가격 `45000`을 검색해서 두 결과를 병합한다.

병합한 결과에서 중복된 행을 제거하고 최종 결과를 반환한다.

이와 같은 방식을 `Index Merge`라고 부른다.

유사한 방식으로는 `UNION`으로 쿼리를 분리하는 방법도 있다.

```sql
SELECT *
FROM orders
WHERE user_id = 777

UNION

SELECT *
FROM orders
WHERE total_price = 45000;
```

이처럼 **OR는 테이블 크기와 데이터 분포에 따라 실행 계획이 달라진다.**

참고로 **같은 컬럼의 OR**는 `IN`으로 표현할 수 있다.

가독성이 좋고 인덱스 활용도 가능하다.

```sql
-- 같은 컬럼의 OR
WHERE user_id = 1 OR user_id = 2 OR user_id = 3

-- IN으로 표현
WHERE user_id IN (1, 2, 3)
```

**정리**

| 조건 | 인덱스 활용 관점 |
| --- | --- |
| `A AND B` | 한쪽 인덱스만 있어도 검색 범위를 줄일 수 있음 |
| `A OR B` | 양쪽 조건의 결과를 모두 찾아야 함 |
| `A OR B`, 양쪽 인덱스 있음 | Index Merge 가능 |
| 같은 컬럼의 OR | `IN`으로 표현 가능 |

## 6. NULL 조건

NULL은 0도 아니고 빈 문자열도 아니다.

값이 없거나 알 수 없는 상태를 나타낸다.

따라서 다음과 같은 조건을 조심해야 한다.

### **NULL을 비교하면 UNKNOWN이 나온다**

```sql
NULL = NULL  -- UNKNOWN
NULL = 10    -- UNKNOWN
NULL <> 10   -- UNKNOWN
```

값을 알 수 없는 NULL은 값 비교 자체가 성립이 안된다.

UNKNOWN 행은 결과에서 제외된다.

NULL 검사에는 일반 비교 연산자가 아니라 `IS NULL`을 사용한다.

```sql
-- 잘못된 방법
WHERE city = NULL

-- 올바른 방법
WHERE city IS NULL
```

### `<>`는 NULL을 포함하지 않는다

NULL은 값을 알 수 없으므로, 같지 않은지도(`<>`) 알 수 없다.

```sql
SELECT *
FROM users
WHERE city <> '서울';
```

따라서 다음과 같이 판단한다.

| city | `city <> '서울'` | 결과 |
| --- | --- | --- |
| 서울 | FALSE | 제외 |
| 부산 | TRUE | 포함 |
| 대전 | TRUE | 포함 |
| NULL | UNKNOWN | 제외 |

### `NOT IN`에 NULL이 섞이면 결과가 0건이다

```sql
SELECT COUNT(*) 
FROM users 
WHERE city NOT IN ('서울', NULL);
```

위 조건의 의미는 다음과 같다.

```sql
SELECT COUNT(*) 
FROM users 
city <> '서울' AND city <> NULL;
```

`AND`는 양쪽 모두 `TRUE`가 되어야 하고, `city <> NULL`은 행을 제외하므로 결과는 0건이다.

### NULL 처리 함수로 컬럼 감싸기

```sql
-- 컬럼에 함수 → Non-SARGable
WHERE IFNULL(city, '미입력') = '미입력'

-- OK!
WHERE city IS NULL
```

검색할 때마다 `IFNULL()`을 `city` 컬럼에 적용하지 않도록 NULL 여부를 직접 검사한다.

## 7. SELECT 컬럼 최소화

`SELECT *`는 지양하고 가능하면 필요한 컬럼만 가져오는 것이 좋다.

DB가 디스크에서 데이터를 읽는 과정 자체가 달라질 수 있기 때문이다.

InnoDB는 기본키를 기준으로 데이터를 저장하는 **클러스터형 인덱스**이다.

클러스터형 인덱스의 특징은 **보조 인덱스에 인덱스 컬럼과 기본키를 함께 저장**한다.

### 커버링 인덱스

커버링 인덱스는 인덱스만으로 쿼리를 해결할 수 있는 경우를 말한다.

```sql
SELECT id, ordered_at
FROM orders
WHERE ordered_at >= '2026-11-01'
  AND ordered_at < '2026-11-08';
```

`ordered_at`을 인덱스 컬럼으로 삼으면 보조 인덱스에는 기본키도 함께 저장된다.

따라서 보조 인덱스에서 기본키 인덱스로 굳이 이동할 필요가 없어진다.

결국 `SELECT *`는 커버링 인덱스를 사용할 기회를 놓칠 수 있게 만든다.

## 8. 불필요한 중복 조회

다음은 같은 데이터를 여러 번 읽거나, 필요 이상으로 많이 읽는 패턴이다.

**패턴 1. 존재 확인에 `COUNT(*)`**

```sql
-- 777번 사용자의 주문을 전부 세고 나서 0보다 큰지 확인
SELECT COUNT(*) FROM orders WHERE user_id = 777;

-- 하나만 찾으면 즉시 멈춤
SELECT EXISTS (SELECT 1 FROM orders WHERE user_id = 777);
-- 또는
SELECT 1 FROM orders WHERE user_id = 777 LIMIT 1;
```

**패턴 2. 같은 테이블을 조건만 바꿔 여러 번 읽기**

```sql
-- 테이블을 세 번 스캔
SELECT COUNT(*) FROM orders WHERE status = 'PAID';
SELECT COUNT(*) FROM orders WHERE status = 'SHIPPED';
SELECT COUNT(*) FROM orders WHERE status = 'CANCELLED';

-- 한 번 스캔으로 전부 (세로로)
SELECT status, COUNT(*) FROM orders GROUP BY status;

-- 한 번 스캔으로 전부 (가로로: 조건부 집계)
SELECT SUM(CASE WHEN status = 'PAID'      THEN 1 ELSE 0 END) AS paid,
       SUM(CASE WHEN status = 'SHIPPED'   THEN 1 ELSE 0 END) AS shipped,
       SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled
FROM orders;
```

**패턴 3: SELECT 절에 같은 대상을 보는 스칼라 서브쿼리 여러 개**

```sql
-- 사용자마다 orders를 두 번씩 조회
SELECT u.name,
       (SELECT COUNT(*)         FROM orders o WHERE o.user_id = u.id) AS cnt,
       (SELECT SUM(total_price) FROM orders o WHERE o.user_id = u.id) AS total
FROM users u
WHERE u.id BETWEEN 1 AND 100;

-- 한 번의 JOIN + GROUP BY
SELECT u.name, COUNT(o.id) AS cnt, SUM(o.total_price) AS total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.id BETWEEN 1 AND 100
GROUP BY u.id, u.name;
```

**패턴 4: JOIN으로 생긴 중복을 `DISTINCT`로 덮기**

```sql
-- 주문이 많은 사용자일수록 행이 불어났다가, DISTINCT로 다시 정렬·제거
SELECT DISTINCT u.id, u.name
FROM users u JOIN orders o ON o.user_id = u.id
WHERE o.ordered_at >= '2026-11-10';

-- "주문이 있는 사용자"라는 의도 그대로 표현
SELECT u.id, u.name
FROM users u
WHERE EXISTS (SELECT 1 FROM orders o
              WHERE o.user_id = u.id AND o.ordered_at >= '2026-11-10');
```

**패턴 5: 애플리케이션 반복문 안의 쿼리**

```java
for (Long userId : userIds) {                  // 100번 반복
    orderRepository.countByUserId(userId);     // 쿼리 100번
}
```

## 9. LIMIT과 페이징

LIMIT은 가져올 개수를 제한한다.

```sql
SELECT *
FROM orders
ORDER BY ordered_at DESC
LIMIT 20;
```

`ordered_at`에 인덱스가 있다면, DB는 인덱스에서 최신 주문부터 읽다가 20개를 찾으면 멈추면 된다.

따라서 LIMIT은 속도가 빠르다.

OFFSET은 앞에서 건너뛸 개수를 지정한다.

```sql
SELECT *
FROM orders
ORDER BY ordered_at DESC
LIMIT 20 OFFSET 500000;
```

해당 SQL문의 의미는 다음과 같다.

- `OFFSET 500000`: 앞에서 50만 개를 건너뛰어라.
- `LIMIT 20`: 그다음 20개를 가져와라.

DB 입장에서는 50만 번째 위치로 한 번에 점프할 수 없다.

앞의 50만 개를 읽으며 버린 후에 그다음 20개를 읽을 수 있기 때문에 페이지가 뒤로 갈수록 느리다.

이에 대한 해결책은 다음과 같다.

### ① Keyset 페이징

건너뛸 개수를 지정하지 말고, 마지막으로 읽은 데이터의 위치를 기억하면 된다.

마지막 주문 정보가 다음과 같다고 가정하자.

```sql
ordered_at = 2026-11-11 20:13:05
id         = 734561
```

그러면 다음 페이지는 ‘마지막으로 읽었던 주문보다 오래된 주문 20개를 가져오라.’라고 작성하면 된다.

```sql
SELECT id, user_id, total_price, ordered_at
FROM orders
WHERE ordered_at < '2026-11-11 20:13:05'
ORDER BY ordered_at DESC, id DESC
LIMIT 20;
```

이렇게 하면 DB가 마지막으로 읽은 위치를 기준으로 다음 데이터를 찾을 수 있다.

여기서 `id`까지 정렬하는 이유는 유일한 값(PK)을 마지막 정렬 기준으로 붙여야 중복이 발생하지 않기 때문이다.

두 정렬 기준을 모두 고려해서 마지막으로 본 행 다음부터 가져오는 방법은 다음과 같다.

```sql
SELECT id, user_id, total_price, ordered_at
FROM orders
WHERE ordered_at < '2026-11-11 20:13:05'
   OR (
       ordered_at = '2026-11-11 20:13:05'
       AND id < 734561
   )
ORDER BY ordered_at DESC, id DESC
LIMIT 20;
```

이 쿼리는 다음 두 조건 중 하나를 만족하는 데이터이다.

1. 마지막 주문보다 시간이 더 오래된 주문
2. 시간이 같다면 ID가 더 작은 주문

### ② 지연 조인 (Deferred Join)

페이지 번호를 사용해서 원하는 페이지로 바로 이동해야 하는 경우도 있다.

Keyset 페이징은 이전 페이지의 마지막 위치를 알아야 하기 때문에 500페이지로 바로 이동하기 어렵다.

```sql
SELECT *
FROM orders
ORDER BY ordered_at DESC
LIMIT 20 OFFSET 500000;
```

기존 쿼리의 문제점은 50만 개를 건너뛰는 과정에서 실제 테이블 데이터까지 읽을 수 있다는 것이다.

지연 조인을 사용한면 이 작업을 두 단계로 나눈다.

1. 가벼운 인덱스에서 50만 개 건너뛰기: `SELECT id FROM orders ...`
2. 실제 테이블에서 20개만 조회: `JOIN orders ON id`

```sql
SELECT o.*
FROM orders o
JOIN (
    SELECT id
    FROM orders
    ORDER BY ordered_at DESC, id DESC
    LIMIT 20 OFFSET 500000
) t ON t.id = o.id
ORDER BY o.ordered_at DESC, o.id DESC;
```

건너뛰는 작업을 상대적으로 가벼운 인덱스에서 수행하여 실제 행을 읽는 비용을 줄인다.