---
slug: fetch-plan-strategy
title: 조회 계획과 전략
category: JPA
date: 2026-04-19
summary: 데이터 조회 방식과 그에 따른 SQL 쿼리 생성 결과
---
자바 코드에서 연관된 특정 객체에 도달하려면, 점을 찍으며 객체가 가지는 필드로 타고 들어갑니다. 하지만, 관계형 DB에서는 이러한 객체 접근 방식이 불가능하기 때문에 연관된 데이터를 가져오려면 조인이나 추가 SELECT가 필요합니다. 따라서 자바 접근 방식이 실제 SQL 쿼리는 어떤 식으로 작성이 되는지 이해해야 합니다.




# 1. 조회 계획 (fetch plan)

조회 계획은 기본적으로 도메인 모델을 매핑할 때, 사용되는 설정 값입니다.

- `FetchType.LAZY`
- `FetchType.EAGER`


이 기본 설정은 다음과 같은 상황에서 항상 적용됩니다.

- 식별자로 엔티티를 로딩할 때 (`find()`)
- 이미 로딩된 엔티티에서 연관을 탐색할 때
- 영속 컬렉션을 iterate할 때


기본 전략은 가능한 모든 엔티티와 컬렉션을 `LAZY`로 매핑하는 것이 좋습니다.
그 이유는 다음과 같습니다.

- 접근한 데이터만 로딩
- 객체 그래프를 탐색하면서 필요한 만큼만 로딩

지연 로딩 전략은 엔티티 프록시를 통해 구현됩니다.


## 1. 엔티티 프록시

엔티티 프록시 객체를 얻으려면, `EntityManager#getReference()`를 사용합니다. 해당 메서드의 가장 중요한 점은 **SQL을 실행하지 않는다**는 점입니다. 프록시 객체는 해당 엔티티의 ID 값만 가지고 있는 빈 객체입니다.

엔티티가 기본 생성자가 필요하고 final 사용을 금지하는 이유가 바로 프록시 생성을 위해서입니다. 프록시는 ID 필드 이외의 다른 필드 getter를 호출하면 SELECT가 실행됩니다. 또한, 영속성 컨텍스트가 닫힌 상태에서 LAZY 접근하면 `LazyInitializationException`이 발생합니다.


## 2. 컬렉션의 지연 로딩

컬렉션은 기본값이 LAZY이므로, 굳이 `fetch = FetchType.LAZY`를 안 써도 됩니다.

그렇다면 컬렉션은 언제 로딩될까요? find()를 통해 특정 엔티티를 초기화하고, 해당 엔티티에 컬렉션 필드를 getter로 가져온다고 가정해봅시다.

getter를 호출한다고 해서 컬렉션이 로딩되지 않습니다. 이 컬렉션은 지연 로딩과 더티 체크를 위해 내부적으로 Persistent라는 래퍼(wrapper) 구현체로 교체합니다. 따라서 Hibernate가 컬렉션을 올바르게 감싸기 위해서는 도메인 모델에서 반드시 인터페이스(Set, List, Map)을 사용해야 합니다.

컬렉션은 접근 순간에 로딩됩니다. 즉, 컬렉션을 iterate하면, DB에 접근하게 됩니다. 이 때 부분 단위로는 불가능하며 전부 다 로딩하게 됩니다.


#### 엔티티 모델 구성

Hibernate가 컬렉션을 추적할 수 있도록 반드시 인터페이스(`List`)를 사용해야 합니다.

```java
@Entity
public class Student {
    @Id
    @GeneratedValue
    private Long id;

    private String name;

    // 기본값이 LAZY이므로 생략 가능
    @OneToMany(mappedBy = "student")
    private List<Subject> subjects = new ArrayList<>(); 

    // Getter, Setter...
}
```


#### 지연 로딩 동작 시점

컬렉션 내부 데이터에 접근하는 순간 쿼리가 나갑니다.

```java
// 1. 엔티티 조회 (Student 쿼리만 발생)
Student student = em.find(Student.class, 1L);

// 2. Getter 호출 (로딩되지 않음!)
// 이때 subjects는 Hibernate가 만든 'PersistentBag'이라는 래퍼 객체 상태입니다.
List<Subject> subjects = student.getSubjects();

System.out.println("아직 쿼리가 나가지 않았습니다.");

// 3. 실제 데이터 접근 (이때 Select 쿼리 발생)
// subjects.get(0), subjects.size(), 혹은 반복문 실행 시
for (Subject subject : subjects) {
    System.out.println(subject.getName());
}
```


## 3. 연관/컬렉션의 즉시 로딩

지연 로딩이 컬렉션의 기본 설정이지만, 경우에 따라 항상 로딩하고 싶은 경우가 있을 수 있습니다. LAZY 프록시 상태에서는 영속성 컨텍스트가 닫히면 getter 호출이 불가능합니다. LazyInitializationException이 발생하기 때문입니다.

이를 해결하려면, 두 가지 선택지가 있습니다.

- 영속성 컨텍스트가 열려 있을 때 수동 초기화
- `FetchType.EAGER`로 매핑 변경

하지만, 즉시 로딩을 사용하게 되면 예외를 막을 수는 있으나 그리 좋은 전략은 아닙니다. 단순히 몇몇의 특정 필드만 조회하려고 해도 EAGER 방식이 적용된 연관관계 엔티티들을 모두 JOIN한 SELECT가 사용되기 때문입니다.




# 2. 조회 전략 (fetch strategy)

엔티티 하나를 로딩하더라도 SQL의 SELECT문은 하나일 수도 있고, 여러 개일 수도 있습니다. 이는 몇 개의 테이블이 연관되어 있고 어떤 FETCH 전략을 사용하느냐에 달려 있습니다. 우리의 목적은 **SQL문의 개수는 최소화하고 SQL은 단순화하는 것**입니다. 네트워크 비용과 DB 부하를 줄일 수 있기 때문입니다.


## 1. N+1 SELECT 문제

엔티티 간 연관관계는 모두 LAZY로 설정한 상태에서 다(Many) 관계의 엔티티가 일(One) 관계의 엔티티 컬렉션을 조회하면 SQL 흐름은 다음과 같습니다.

- 다(Many) 엔티티의 목록을 로딩합니다.
- 다(Many) 엔티티 각각의 일(One)을 로딩합니다.

따라서 목록 조회 1번 + 목록 각각의 행마다 조회 N번으로 SELECT가 N+1번 발생하게 됩니다. 그 반대로 일(One) 관계의 엔티티에서 다(Many) 관계의 엔티티를 조회하는 경우도 마찬가지의 현상이 발생합니다.


### 문제 상황

학생 목록을 먼저 조회한 뒤, 각 학생이 수강 중인 **과목(Subject) 목록**을 출력하려는 상황입니다.

```java
@Entity
public class Student {
    @Id
    @GeneratedValue
    private Long id;
    private String name;

    // 일대다 관계, 기본값인 LAZY 적용
    @OneToMany(mappedBy = "student")
    private List<Subject> subjects = new ArrayList<>();
}

@Entity
public class Subject {
    @Id
    @GeneratedValue
    private Long id;
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;
}
```

```java
// 1. 모든 학생 조회 (쿼리 1번 발생)
// SELECT * FROM Student;
List<Student> students = em.createQuery("select s from Student s", Student.class)
                           .getResultList();

// 2. 각 학생의 수강 과목 목록을 조회 (학생 수 N만큼 추가 쿼리 발생)
for (Student student : students) {
    // student.getSubjects()는 프록시 래퍼를 반환하지만,
    // .size()나 반복문으로 내부 데이터에 접근하는 순간 SELECT 쿼리가 실행됩니다.
    System.out.println("학생: " + student.getName() + ", 과목 수: " + student.getSubjects().size());
}
```

학생이 10명(N=10)이라면, 데이터베이스에는 다음과 같이 총 **11번**의 요청이 가게 됩니다.

- `SELECT * FROM Student;`
- `SELECT * FROM Subject WHERE student_id = 1;` ~ `SELECT * FROM Subject WHERE student_id = 10;`


## 2. 카테시안 곱 문제

LAZY로 설정하면 연관관계 로딩 시 N+1 SELECT 문제가 발생했습니다. 이 문제를 해결하고자 EAGER를 적용하면 또 다른 문제가 발생합니다. 엔티티 간의 연관관계가 깊지 않다면, (=연관된 컬렉션이 하나라면) 크게 문제가 되지는 않습니다.

그러나 여러 개(2개 이상)의 컬렉션을 EAGER로 JOIN하게 되면 카테시안 곱(곱집합) 문제가 발생합니다.

카테시안 곱이란, **엔티티 간의 모든 조합이 출력되는 것**을 말합니다. 여기서 모든 조합은 곱으로 계산됩니다. A 컬렉션이 20개, B 컬렉션이 5개라면 총 100개의 행이 출력됩니다. 이와 같은 거대한 결과셋은 DB 서버에 부담을 주고 네트워크 비용도 증가합니다.


### 문제 상황

**학생**(Student)이 여러 개의 **수강 과목**(Subject)을 가지고 있고, 동시에 여러 개의 **자격증**(Certificate)을 가지고 있다고 가정해 봅시다.

```java
@Entity
public class Student {
    @Id
    @GeneratedValue
    private Long id;

    @OneToMany(fetch = FetchType.EAGER) // 위험: 즉시 로딩
    private List<Subject> subjects = new ArrayList<>();

    @OneToMany(fetch = FetchType.EAGER) // 위험: 즉시 로딩
    private List<Certificate> certificates = new ArrayList<>();
}
```


#### 데이터 예시

- **학생 A**: 수강 과목 3개 (`Java`, `DB`, `OS`)
- **학생 A**: 자격증 2개 (`정보처리기사`, `SQLD`)

이때 JPA가 이 학생을 한 번에 조회하기 위해 모든 관계를 `JOIN`하면 SQL 결과는 다음과 같이 나옵니다.

| Student | Subject (A) | Certificate (B) |
| --- | --- | --- |
| 학생 A | Java | 정보처리기사 |
| 학생 A | Java | SQLD |
| 학생 A | DB | 정보처리기사 |
| 학생 A | DB | SQLD |
| 학생 A | OS | 정보처리기사 |
| 학생 A | OS | SQLD |

실제 필요한 데이터는 과목 3개, 자격증 2개뿐인데, 중복된 학생 A의 데이터가 **과목(3) * 자격증(2) = 총 6개**의 행이 출력됩니다.


## 3. 배치 조회(batch fetching)

배치의 아이디어는 단순합니다. 하나의 프록시를 초기화할 바에는 같은 타입의 프록시 여러 개를 한 번에 로딩하는 전략입니다. 하나를 초기화할 때 여러 개를 IN 절로 묶어서 로딩하는 방법입니다.


### @BatchSize(size = ?)

만약 엔티티 위에 `@org.hibernate.annotations.BatchSize(size = 10)`와 같이 설정한다면, 목록 조회를 한 번 한 이후에는 해당 엔티티 첫 접근 시 최대 10개의 프록시를 로딩하게 됩니다. 그리고 그 다음 루프에서 10개를 조회하고 이 과정을 반복하게 됩니다.

이 방식은 DB 왕복을 줄일 수는 있지만, 추측을 기반으로 하기 때문에 정확히 몇 개의 프록시가 남아 있는지 모르고, 배치 개수를 몇 개로 지정하는 게 최적인지도 알기 어렵습니다.


### 사용 예시

엔티티의 컬렉션 필드 위에 `@BatchSize`를 적용합니다. `size`는 한 번에 `IN` 절에 넣을 부모 엔티티의 ID 개수를 의미합니다.

```java
@Entity
public class Student {
    @Id
    @GeneratedValue
    private Long id;
    private String name;

    @BatchSize(size = 10) // 10개씩 묶어서 로딩
    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
    private List<Subject> subjects = new ArrayList<>();
}
```


#### SQL 실행 흐름

학생 20명을 조회한 뒤, 각각의 수강 과목을 출력하는 상황을 가정해 보겠습니다.

**BatchSize 미적용 시**
- **1번**: 모든 학생 조회 (`SELECT * FROM student`)
- **20번**: 각 학생마다 수강 과목 조회 (`SELECT * FROM subject WHERE student_id = ?`)
- **총 21번의 쿼리 발생 (N+1)**

**BatchSize(size = 10) 적용 시**
1. **쿼리 1**: 전체 학생 20명 조회
2. **쿼리 2**: 첫 번째 학생의 `subjects`에 접근하는 순간, **학생 10명분**의 데이터를 한꺼번에 조회합니다.

    ```sql
    SELECT * FROM subject 
    WHERE student_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10); -- IN 절 사용
    ```

3. **쿼리 3**: 11번째 학생의 `subjects`에 접근할 때, 나머지 **학생 10명분**을 조회합니다.

    ```sql
    SELECT * FROM subject 
    WHERE student_id IN (11, 12, 13, 14, 15, 16, 17, 18, 19, 20);
    ```
   
- **총 3번의 쿼리로 종료 (1 + 2)**



## 4. 서브셀렉트(SUBSELECT)로 컬렉션 미리 로딩

배치 조회 방식은 추측 기반이므로 몇 개의 프록시가 있는지 정확히 모르는 상황에서 사용하기 어렵다는 단점이 있습니다. 이와 같은 경우에는 SUBSELECT가 더 나은 전략이 될 수 있습니다. SUBSELECT는 실제 로딩된 전체 집합을 기준으로 컬렉션을 로딩합니다.


### @Fetch(FetchMode.SUBSELECT)

컬렉션 매핑에 Hibernate 전용 어노테이션인 `FetchMode.SUBSELECT`를 사용하면, 일(One) 엔티티에서 다(Many) 엔티티 조회 시 다음과 같이 동작합니다.

1. 일(One) 엔티티 목록 조회
2. 컬렉션 접근 시 1의 조회 쿼리를 서브 쿼리로 감싸서 조회


### 사용 예시

```java
@Entity
public class Student {
    @Id
    @GeneratedValue
    private Long id;
    private String name;

    @Fetch(FetchMode.SUBSELECT)
    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
    private List<Subject> subjects = new ArrayList<>();
}
```


#### SQL 실행 흐름

학생 100명을 조회한 뒤, 그중 일부나 전체의 수강 과목을 출력하는 상황을 가정해 보겠습니다.

**1단계: 부모 엔티티 조회**
먼저 학생 목록을 가져옵니다. 이때의 `WHERE` 조건이나 상태를 하이버네이트가 기억합니다.

```sql
-- 쿼리 1: 학생 전체 조회
SELECT * FROM student WHERE id > 0;
```

**2단계: 컬렉션 접근 시 (SUBSELECT 작동)**
학생 중 단 한 명의 `subjects`에만 접근해도, **1단계에서 사용한 쿼리 자체를 서브쿼리로 삽입**하여 한 번에 긁어옵니다.

```sql
-- 쿼리 2: 서브쿼리를 이용한 과목 조회
SELECT * FROM subject WHERE student_id IN (SELECT id FROM student WHERE id > 0);
```

배치와는 달리 미리 로딩된 부모 전체 집합을 기준으로 컬렉션을 조회하여 추측 기반이 아닌 정확한 조회가 가능합니다. 쿼리 횟수는 항상 2번(부모 1번 + 자식 1번)입니다.


## 5. 여러 번의 SELECT로 즉시 조회

여러 컬렉션을 EAGER 설정으로 조회하면 카테시안 곱이 발생합니다. 이를 방지하려면 JOIN을 쓰지 말고 여러 SELECT로 나누어서 EAGER를 구현하는 것입니다.


### @Fetch(FetchMode.SELECT)

해당 어노테이션은 EAGER이지만 JOIN하지 말고 별도의 SELECT로 로딩하라는 의미입니다. SELECT 수가 증가하지만, 카테시안 곱이 발생하지 않으며 `LazyInitializationException`로부터도 안전합니다.


### 사용 예시

```java
@Entity
public class Student {
    @Id
    @GeneratedValue
    private Long id;

    @Fetch(FetchMode.SELECT)
    @OneToMany(mappedBy = "student", fetch = FetchType.EAGER) // 즉시 로딩
    private List<Subject> subjects = new ArrayList<>();

    @Fetch(FetchMode.SELECT)
    @OneToMany(mappedBy = "student", fetch = FetchType.EAGER) // 즉시 로딩
    private List<Certificate> certificates = new ArrayList<>();
}
```


#### SQL 실행 흐름

학생 1명을 조회할 때, 내부적으로 다음과 같이 동작합니다.

1. **쿼리 1**: 학생 조회 (`SELECT * FROM student WHERE id = 1`)
2. **쿼리 2**: 과목 조회 (`SELECT * FROM subject WHERE student_id = 1`)
3. **쿼리 3**: 자격증 조회 (`SELECT * FROM certificate WHERE student_id = 1`)

그러나 만약 학생 **목록**을 조회한다면, 각 학생마다 추가 쿼리가 실행되어 N+1 문제가 발생합니다.

**카테시안 곱과의 차이점**

- **JOIN 사용 시**: 1번의 쿼리로 해결하지만, 결과 행(Row)이 `과목 수 × 자격증 수`만큼 불어나 데이터 중복이 심해집니다.
- **FetchMode.SELECT 사용 시**: 쿼리는 3번 나가지만, 각각의 결과는 딱 필요한 데이터만 가져오므로 네트워크 전송량과 메모리 효율이 좋습니다.



## 6. 동적 즉시 조회

동적 즉시 조회는 조회 계획을 기본적으로 LAZY로 두고, 특정 쿼리에서만 EAGER를 적용하는 것입니다.


### join fetch

핵심 키워드는 SELECT문에 `join fetch`를 사용하는 것입니다. 이 키워드는 조인만 하는 것이 아니라 조인한 연관을 즉시 로딩하라는 의미입니다. 따라서 프록시가 아닌 완전히 초기화된 상태로 반환합니다.


### 사용 예시

```java
// 1. 일반 조인: Student만 조회하고 Subject는 프록시로 남음
String sql1 = "select s from Student s join s.subjects";

// 2. 페치 조인: Student와 Subject를 한 번의 쿼리로 즉시 로딩
String sql2 = "select s from Student s join fetch s.subjects";

List<Student> students = em.createQuery(sql2, Student.class).getResultList();
```


#### SQL 실행 및 데이터 로딩 과정

페치 조인을 사용하면 JPA는 우리가 엔티티에 설정한 `LAZY` 설정을 무시하고, SQL 레벨에서 `INNER JOIN`을 실행하여 모든 필드를 조회합니다.

```sql
SELECT s.*, sub.*
FROM student s
INNER JOIN subject sub ON s.id = sub.student_id;
```

- **조회 시점**: 단 한 번의 SELECT 쿼리만 발생합니다.
- **반환 객체**: `students.get(0).getSubjects()`를 호출해도 추가 쿼리가 나가지 않습니다. 이미 SQL 조회 시점에 진짜 데이터가 채워진 **초기화된 상태**로 반환되었기 때문입니다.