---
slug: transaction-concurrency
title: 트랜잭션과 동시성
category: JPA
date: 2026-04-19
summary: 트랜잭션의 개념과 동시성 문제에 대한 해결 방안
---
데이터베이스는 혼자 사용하는 것이 아닙니다. 여러 사용자가 동시에 데이터를 읽고 수정합니다. 그렇다면 여러 사용자가 동시에 같은 데이터를 건드릴 때 어떻게 안전하게 처리할까요?



# 1. 트랜잭션

작업 단위는 원자적인 작업 묶음을 말합니다. 하나의 기능을 이루는 작업 단위 내에서는 작업이 하나라도 실패하면 전부 취소되어야 합니다. 트랜잭션은 이 작업의 경계를 정하고 다른 작업과 격리해줍니다.

## ACID

ACID는 트랜잭션이 반드시 지켜야 할 4가지 속성입니다. 트랜잭션이 제대로 동작했다고 말하려면 이 네 가지 조건을 만족해야 합니다.

- #### 원자성(Atomicity)
모든 작업은 하나의 덩어리처럼 실행됩니다. 전부 성공하거나 전부 실패해야 합니다.

- #### 일관성(Consistency)
여러 사용자가 동시에 작업해도 데이터 무결성은 깨지면 안됩니다. 외래키 무결성, NOT NULL, UNIQUE와 같은 DB 제약 조건은 반드시 지켜져야 합니다.

- #### 격리성(Isolation)
한 트랜잭션의 작업은 다른 트랜잭션에 보이면 안 됩니다. 커밋되지 않은 내용이나 중간 계산 상태는 다른 트랜잭션에 영향을 미칠 수 없습니다.

- #### 지속성(Durability)
커밋이 완료되면 시스템이 죽어도 데이터는 남아야 합니다.

정리하자면, 트랜잭션은 하나의 작업처럼 실행되고(A), 데이터는 항상 정상 상태를 유지하며(C\), 다른 트랜잭션에 영향을 주지 않고(I), 결과는 영구히 보존되어야 합니다(D).





# 2. 동시 접근 제어

사용자가 여러 명이면 트랜잭션도 여러 개가 동시에 일어납니다. **각 트랜잭션은 다른 트랜잭션이 없는 것처럼 보여야 합니다.** 즉, 트랜잭션끼리 서로 간섭하지 않도록 노력해야 합니다. 이것이 트랜잭션 격리 개념입니다.

## 1. 트랜잭션 격리

A 트랜잭션이 실행될 때 B 트랜잭션이 존재하지 않는 것처럼 동작해야 합니다. 격리를 구현하는 전통적인 방식은 <b>락(Locking)</b>입니다. 트랜잭션이 데이터를 읽거나 수정할 때 해당 데이터에 락을 걸어서 그동안 다른 트랜잭션이 건드릴 수 없게 막는 방식입니다.

현대적인 방식은 MVCC(Multi-Version Concurrency Control)가 있습니다. 이름처럼 데이터를 덮어쓰는 대신에 여러 버전을 유지하는 방식입니다.


### 1. 트랜잭션 격리 문제 4가지

트랜잭션 격리 문제로는 4가지가 있습니다. 동시성 문제라고도 말합니다.

- **갱신 손실 (Lost Update)**
- **더티 리드 (Dirty Read)**
- **반복 불가능 읽기 (Unrepeatable Read)**
- **팬텀 리드 (Phantom Read)**


#### 갱신 손실 (Lost Update)

두 트랜잭션이 동시에 같은 데이터를 수정하는 경우 다음과 같이 먼저 수정한 트랜잭션의 데이터가 사라지는 현상을 말합니다.

**상황**
1. 각 트랜잭션(T1, T2)이 데이터를 읽습니다.
   T1: 읽음 → 100
   T2: 읽음 → 100

2. 각 트랜잭션(T1, T2)이 데이터를 수정합니다. T2가 T1보다 늦게 수정합니다.
   T1: 100 → 120 저장
   T2: 100 → 150 저장

3. 결과는 150으로 반영됩니다.

**결과** : T1의 120은 사라졌습니다.



#### 더티 리드 (Dirty Read)

커밋되지 않은 데이터를 읽는 것을 말합니다.

**상황**
1. 트랜잭션 T1이 데이터를 200으로 수정합니다. 아직 커밋은 하지 않았습니다.
   T1: 값 100 → 200 (아직 commit 안 함)

2. 트랜잭션 T2가 커밋되지 않은 그 값(200)을 읽습니다.
   T2: 200 읽음

**결과** : T2는 존재하지 않는 값을 읽었습니다.



#### 반복 불가능 읽기 (Unrepeatable Read)

같은 데이터를 두 번 읽었는데 값이 달라지는 것을 말합니다.

**상황**
1. 트랜잭션 T1이 값을 읽습니다.
   T1: 값 100 읽음

2. 트랜잭션 T2이 해당 값을 변경합니다.
   T2: 값 200으로 변경

3. 트랜잭션 T1이 해당 값을 다시 읽습니다.
   T1: 값 200 읽음

**결과** : 같은 T1 트랜잭션에서 같은 행을 두 번 읽었는데 값이 달라졌습니다.



#### 팬텀 리드 (Phantom Read)

같은 쿼리를 두 번 실행했는데 결과 집합이 달라지는 경우를 말합니다.

**상황**
1. SELECT COUNT(*) 쿼리를 조회합니다.
   T1: 값이 100 이상인 행 조회 → 10개

2. T2가 데이터를 추가 후 커밋합니다.
   T2: 값 150 INSERT

3. T1이 같은 쿼리로 조회합니다.
   T1: 값이 100 이상인 행 다시 조회 → 11개

**결과** : 이처럼 행의 개수가 바뀌는 현상을 유령(pahntom)이라고 부릅니다.



### 2. ANSI 격리 수준 4단계

현실적으로 트랜잭션 간 완전한 격리는 비용이 엄청 크게 발생합니다. 시스템을 멈추면서까지 모든 사용자를 기다리게 하거나 성능을 떨어뜨릴 수 없기 때문입니다. 그래서 나온 개념이 격리 수준입니다. 완벽한 격리를 조금 포기하고 대신 성능을 취하는 방식입니다.

ANSI 격리 수준은 위와 같은 4가지 트랜잭션 격리 문제를 얼마나 허용하느냐에 따라 나눈 수준(Level)을 말합니다.

- **READ_UNCOMMITTED**
- **READ_COMMITTED**
- **REPEATABLE_READ**
- **SERIALIZABLE**

| 격리 수준 | 팬텀 리드 | 반복 불가능 읽기 | 더티 리드 | 갱신 손실 |
| --- | --- | --- | --- | --- |
| **READ_UNCOMMITTED** | 발생 가능 | 발생 가능 | 발생 가능 | 방지 |
| **READ_COMMITTED** | 발생 가능 | 발생 가능 | 방지 | 방지 |
| **REPEATABLE_READ** | 발생 가능 | 방지 | 방지 | 방지 |
| **SERIALIZABLE** | 방지 | 방지 | 방지 | 방지 |

JPA에서는 기본적으로 READ_COMMITTED 수준입니다. 대부분의 애플리케이션에서 이 수준이면 충분합니다.


## 2. 낙관적 동시성 제어

낙관적(optimistic) 방식은 같은 데이터를 동시에 수정하는 일이 드물 경우에 적합합니다. **미리 잠그지 말고 작업 끝(flush/commit)에 충돌을 감지하는 방식**입니다. 락으로 미리 막는 것이 아닌 버전 비교로 잡아내게 됩니다. 버전은 **먼저 커밋한 사람이 이기는 규칙**으로 뒤늦게 커밋한 사람에게 예외로 알려주기 위해 사용합니다.


### @Version

버전 활성화를 위해서는 엔티티에 버전 필드를 추가 후 해당 필드에 이 어노테이션을 사용합니다. 해당 필드는 Hibernate가 자동 관리하는 것으로 **setter를 만들어선 안됩니다**. 버전은 엔티티가 변경이 감지되면(더티 체킹) flush 시점에 1 증가합니다.

A 트랜잭션과 B 트랜잭션이 동시에 값을 읽은 후 A 트랜잭션이 먼저 커밋을 하고 나면, 버전은 1이 증가한 상태입니다. 이 때 B 트랜잭션이 커밋을 시도하면, `OptimisticLockException` 이 발생합니다. B의 트랜잭션 버전과 A의 트랜잭션의 버전이 일치하지 않기 때문입니다.


### 시나리오

- **Student(id=1, version=1)** 데이터가 DB에 저장되어 있음.
- **트랜잭션 A**와 **트랜잭션 B**가 거의 동시에 이 데이터를 조회함.


#### 엔티티 설정

가장 먼저 엔티티에 `@Version` 필드를 추가합니다. 이 필드가 바로 '버전 비교'의 핵심 역할을 합니다.

```java
@Entity
public class Student {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    private int score;

    @Version // 낙관적 락을 위한 버전 관리 필드
    private Long version; 

    // Getter는 제공하되, Setter는 만들지 않는 것이 권장됩니다.
    public Long getVersion() {
        return version;
    }
    
    // 점수 수정
    public void updateScore(int score) {
        this.score = score;
    }
}
```


#### 충돌 흐름

```java
// --- 트랜잭션 A 시작 ---
Student studentA = repository.findById(1L); // version: 1 로드

// --- 트랜잭션 B 시작 (거의 동시에 발생) ---
Student studentB = repository.findById(1L); // version: 1 로드

// 1. 트랜잭션 A가 먼저 점수를 수정하고 커밋
studentA.updateScore(100);
// [Flush 시점] DB의 version은 2가 됨 (성공)

// 2. 트랜잭션 B가 뒤늦게 점수를 수정하고 커밋 시도
studentB.updateScore(90); 
// [Flush 시점] B가 처음 읽었던 version은 1인데, 현재 DB의 version은 2임!
// -> 버전 불일치 발생!
```



## 3. 비관적 동시성 제어

비관적 방식은 데이터가 충돌날 일이 잦을 것이라고 가정하는 경우에 적합합니다. **처음부터 DB로부터 특정 행에 대한 접근 권한을 요청하여 다른 트랜잭션의 충돌 가능 작업을 제한합니다.** 미리 잠금을 확보하여 안전하게 작업을 진행하는 방식입니다.


### PESSIMISTIC_READ / PESSIMISTIC_WRITE

`setLockMode` 락 모드에는 2가지가 있습니다.

- `PESSIMISTIC_READ` : 반복 가능한 읽기(repeatable read)를 보장합니다.
- `PESSIMISTIC_WRITE` : 팬텀 리드까지 막으려 하지만, DBMS에 따라 다릅니다.

Hibernate는 락 모드에 맞춰 SQL에 잠금 구문을 덧붙여서 DB 레벨 락을 겁니다. 문법은 DB마다 다르므로 dialect에 따라 결정됩니다. 또한, 락은 DB 트랜잭션 동안만 유지됩니다. 트랜잭션이 길어질수록 성능과 확장성 면에서 좋지 않습니다.

락을 얻지 못하면 즉시 예외가 발생합니다.

- `LockTimeoutException` : 락을 얻지 못한 경우에 발생합니다.
- `PessimisticLockException` : 치명적인 에러로 롤백이 필요한 경우입니다.

락의 잠금 단위는 기본적으로 테이블의 행 단위입니다. 정확하게는 엔티티가 매핑된 테이블의 해당 행을 잠급니다. 조인된 가상 테이블 전체가 아닌 결과로 반환된 실제 물리적 행을 말합니다.


### 시나리오

- **Student(id=1)** 데이터가 DB에 있음.
- **트랜잭션 A**가 먼저 데이터를 조회하며 락을 획득함.
- **트랜잭션 B**가 뒤이어 같은 데이터를 조회하려 함.


#### 1. 리포지토리 설정

JPA에서는 `@Lock` 어노테이션을 사용하여 아주 간단하게 비관적 락을 적용할 수 있습니다.

```java
public interface StudentRepository extends JpaRepository<Student, Long> {

    // 데이터를 조회할 때부터 즉시 DB에 락을 겁니다.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Student s where s.id = :id")
    Optional<Student> findByIdWithPessimisticLock(Long id);
}
```


#### 2. 충돌 흐름

```java
// --- 트랜잭션 A 시작 ---
// SELECT ... FOR UPDATE 구문이 실행되며 DB 해당 행에 락을 겁니다.
Student studentA = repository.findByIdWithPessimisticLock(1L); 

// --- 트랜잭션 B 시작 (거의 동시에 발생) ---
// 트랜잭션 A가 락을 쥐고 있으므로, B는 여기서 대기하거나 예외가 발생합니다.
Student studentB = repository.findByIdWithPessimisticLock(1L); 
// -> A가 커밋될 때까지 여기서 멈춰 서서 기다리게 됩니다.

// 1. 트랜잭션 A가 점수를 수정하고 커밋
studentA.updateScore(100);
// [Commit 시점] DB에 값이 반영되고, 걸려있던 락이 풀립니다.

// 2. 트랜잭션 B가 드디어 데이터를 읽어옴 (A가 수정한 이후의 데이터)
// 이제 락을 획득하고 로직을 수행합니다.
studentB.updateScore(90);
// [Commit 시점] 성공
```

Hibernate는 데이터베이스 종류(Dialect)에 맞춰 SQL 끝에 잠금 구문을 추가합니다.
- **MySQL/PostgreSQL:** `SELECT ... FOR UPDATE`
- **Oracle:** `SELECT ... FOR UPDATE`


#### 예외 발생 상황
락을 얻기 위해 무한정 기다릴 수 없으므로 **타임아웃**을 설정할 수 있습니다. 설정한 시간 내에 락을 얻지 못하면 예외가 발생합니다.

```java
// 락 획득 대기 시간을 3초로 제한 (Query Hint 사용)
@Lock(LockModeType.PESSIMISTIC_WRITE)
@QueryHints({@QueryHint(name = "javax.persistence.lock.timeout", value = "3000")})
Optional<Student> findByIdWithTimeout(Long id);
```

`LockTimeoutException`: 설정한 시간 동안 락을 기다렸지만 얻지 못한 경우 발생합니다.



## 4. 데드락
데드락은 서로가 서로를 기다리다가 아무도 못 움직이는 상태를 말합니다. 이 현상은 비관적 락에서 발생합니다.


### 발생 과정

**트랜잭션 1**

```sql
UPDATE ITEM ... WHERE ID = 1;
UPDATE ITEM ... WHERE ID = 2;
```

**트랜잭션 2**

```sql
UPDATE ITEM ... WHERE ID = 2;
UPDATE ITEM ... WHERE ID = 1;
```

이렇게 되면, 다음과 같은 상황이 발생합니다.

**트랜잭션 1**
1. ID = 1 락 획득 (잠금)
2. ID = 2 기다림

**트랜잭션 2**
1. ID = 2 락 획득 (잠금)
2. ID = 1 기다림

이렇게 서로가 무한 대기 상태에 머무르게 되면, DB는 둘 중 하나를 강제로 죽여서 예외를 발생시킵니다.


### 해결 방안

이와 같은 현상을 막기 위해서는 2가지 방안이 있습니다.

**1. 항상 같은 순서로 잠그는 것이 좋습니다.**
ID=1 → ID=2 순으로 업데이트를 한다면 서로 반대로 잠그는 일이 없습니다. ID의 순서를 정하여 UPDATE합니다.

**2. 처음부터 미리 강하게 잠급니다.**
`PESSIMISTIC_WRITE`으로 먼저 락을 걸어두면 다른 트랜잭션이 기다려야 합니다. 다만, 성능 부담이 클 수 있습니다.