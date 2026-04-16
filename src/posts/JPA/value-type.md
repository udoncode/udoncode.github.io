---
slug: value-type
title: 값 타입 매핑하기
category: JPA
date: 2026-04-16
summary: 값 타입의 다양한 매핑 설정과 매핑 방법
---

ORM(Object-Relational Mapping)은 <b>자바 객체(클래스)</b>와 **관계형 데이터베이스의 테이블**을 연결해주는 기술입니다. 이 때 매핑은 객체의 <b>속성(property)</b>과 테이블의 <b>컬럼(column)</b>을 1:1로 연결하는 작업을 말합니다.

JPA에서 값 타입(value type)은 엔티티와는 달리 고유한 식별자(ID)가 없고, 다른 엔티티에 의존하는 타입입니다.
타입은 종류가 크게 2가지입니다.

- **기본 타입** : JDK가 제공하는 기본 값 타입 (String, Date, int, long, boolean …)
- **컴포넌트 타입(임베디드 타입)** : 개발자가 정의한 복합 값 타입 (Address, Item, Category …)



# 1. 기본 속성 매핑하기

JPA에서 기본 타입은 자동으로 영속됩니다.

| 타입 범주 | 포함된 타입 |
| --- | --- |
| **기본형 & 래퍼 클래스** | `int`, `Integer`, `long`, `Long`, 등 |
| **문자열** | `String` |
| **숫자 클래스** | `BigInteger`, `BigDecimal` |
| **날짜/시간** | `java.time.LocalDateTime`, `LocalDate`, `java.util.Date`, `Calendar`, `java.sql.Date`, `Time`, `Timestamp` |
| **배열** | `byte[]`, `Byte[]`, `char[]`, `Character[]` |

예를 들어, 아래의 필드는 DB에서 VARCHAR 타입의 name 컬럼과 매핑됩니다.

```java
private String name;
```


## 예외에 의한 구성
매핑에서 중요한 JPA의 설계 철학 중 하나는 **예외에 의한 구성**입니다. 이는 기본값을 잘 정해놓고, 특별한 경우에만 설정을 하는 방식을 말합니다. 대부분의 속성은 애너테이션 없이 자동으로 매핑되므로, 필요한 경우에만 아래 애너테이션을 명시적으로 사용합니다.


### 1. @Transient

엔티티 클래스의 모든 속성이 영속될 필요는 없습니다. 그럴 경우에는 `@Transient`를 제외할 필드 위에 사용합니다.

```java
@Transient
private BigDecimal priceWithTax;
```

이 어노테이션을 사용한 필드는 JPA가 영속 대상에서 제외합니다.
그렇다면 어떤 속성을 저장해야 할까요?
이를 판단하고자 몇 가지 질문을 던져볼 수 있습니다.
- 해당 속성이 객체를 구성하는 핵심 속성인가?
- 처음부터 필요한 값인가, 다른 속성으로부터 계산할 수 있는 값인가?
- 민감한 정보인가?

이와 같은 질문에 따라 필요한 정보만 DB에 저장하도록 설계하는 것이 좋습니다.


### 2. @Basic

매핑을 명시적으로 사용하고 싶다면, `@Basic`을 사용합니다.

```java
@Basic(optional = false)
private BigDecimal price;
```

- `optional = false`
    - DB에 NOT NULL 제약 생성
    - 저장 전에 NULL 체크 → INSERT/UPDATE 시 값 없으면 예외 발생


### 3. @Column

`@Basic` 이외에도 `@Column`을 사용할 수도 있습니다.

```java
@Column(name = "PriceWithoutTax", nullable = false)
private BigDecimal price;
```

- `name = "PriceWithoutTax"`
  필드명과 다른 컬럼명을 따로 지정할 수 있습니다.

- `nullable = false`
    - DB에 NOT NULL 제약 생성
    - 저장 전에 NULL 체크 → INSERT/UPDATE 시 값 없으면 예외 발생


### 4. @NotNull

NULL을 막고 싶다면, UI 레벨에서 검증하는 것이 깔끔합니다. 이 때 사용하는 옵션이 `@NotNull`입니다. 해당 설정을 통해 입력 폼에서 값이 비어 있다면 저장 전에 경고 메시지를 띄울 수 있습니다.  주의할 점은 런타임 유효성 검사에만 사용되므로, DDL 생성 시 NOT NULL 제약을 만들고 싶다면 반드시 `@Column(nullable = false)`를 함께 사용해야 합니다.


### 5. @Access

JPA는 @Id의 위치에 따라 기본 접근 전략을 결정합니다.

1. **필드 접근 전략**
필드 자체에 직접 접근하는 방식입니다.

```java
@Id
private Long id;
```

2. **속성 접근 전략**
getter/setter를 통해 접근하는 방식입니다.

```java
@Id
public Long getId() { ... }
```

주의할 점은 `@Id`가 **필드에 선언**되었으면, **모든 매핑 애너테이션도 필드에 붙어야 하고,** `@Id`가 **getter에 선언**되었으면, **매핑 애너테이션들도 getter에 붙여야 합니다.** 또한, setter에는 애너테이션을 붙일 수 없습니다.

그런데 `@Access`을 이용하면 특정 필드의 기본 전략을 바꿀 수 있습니다. 클래스에 붙이면 해당 클래스의 모든 속성에 적용되며, 개별 속성에 붙이면 해당 속성만 접근 방식을 변경합니다.

```java
@Id
@GeneratedValue(strategy = "GenerationType.SEQUENCE")
private Long id;

@Access(AccessType.PROPERTY)
private String name;
```

- `@Id`
  필드 위에 붙어 있으므로 기본 전략은 필드 접근입니다.

- `@Access(AccessType.PROPERTY)`
  필드 위에 사용하면 해당 필드는 `AccessType.PROPERTY`을 따릅니다.


### 6. @Temporal

Java 8 이전 타입을 사용할 때는 반드시 `@Temporal`을 지정해야 합니다. 자바에서는 아래와 같은 단일 클래스이지만, DB에서는 날짜(`DATE`), 시간(`TIME`), 날짜+시간(`TIMESTAMP`)이 각각 다른 타입으로 존재하기 때문입니다. 현재는 대부분 Java 8 LocalDate 계열을 사용하므로, 사용할 일이 잘 없습니다.

- java.util.Date
- java.util.Calendar
- java.sql.Date
- java.sql.Time
- java.sql.Timestamp

```java
@CreationTimestamp
@Temporal(TemporalType.DATE)
private Date createdOn;

@UpdateTimestamp
@Temporal(TemporalType.TIMESTAMP)
private Date lastModified;
```

- `@CreationTimestamp`
  엔티티 INSERT 직전에 현재 날짜로 설정

- `@UpdateTimestamp`
  UPDATE 시 자동으로 현재 시간 설정


### 7. @Enumerated
@Enumerated는 열거형 타입에 사용합니다. 기본값은 `ORDINAL`이므로, enum의 순서가 변경될 가능성을 고려하여 아래와 같이 문자열 방식을 명시하는 것을 권장합니다.

```java
@Enumerated(EnumType.STRING)
```




# 2. 임베디드 컴포넌트 매핑하기

임베디드 컴포넌트는 사용자가 직접 정의한 복합값 타입 객체로, 엔티티에 완전히 종속됩니다.
컴포넌트 타입은 다음과 같은 특징이 있습니다.

- 별도의 테이블이 없다.
- 식별자를 가지지 않는다.
- 모든 데이터가 하나의 행(row)에 들어간다.

또한, 컴포넌트 타입 사용 시에는 다음과 같은 주의사항이 있습니다.

- **불변 객체**
  값 타입은 특정 엔티티에서 단독으로 사용하므로, Setter를 만들지 않는 것이 안전합니다.
- **생성자**
  JPA 구현체에 따라 기본 생성자가 반드시 필요하므로 `protected`로 선언해 주는 것이 관례입니다.
- **비교**
  값 타입은 `==` 비교가 아닌 `equals()`를 재정의해서 모든 필드를 비교(동등성 비교)해야 합니다.


## 1. @Embeddable
직원과 근무 기간의 관계에서 Period를 Employee 엔티티에 종속되도록 만들 수 있습니다. Period는 Employee의 구성 요소로 따로 테이블을 만들 필요가 없기 때문입니다.

#### Period 클래스 (컴포넌트)

```java
@Embeddable
public class Period {
		@Column(nullable = false)
    private LocalDateTime startDate;
    
    @Column(nullable = false)
    private LocalDateTime endDate;

    protected Period() {}

    public boolean isWork(LocalDateTime now) {
        return now.isAfter(startDate) && now.isBefore(endDate);
    }
}
```

- `@Embeddable`
  다른 엔티티의 구성 요소로 포함될 값 타입임을 표시합니다.

- `@Column(nullable = false)`
  임베디드 컴포넌트는 가능하면 NOT NULL 제약을 주는 것이 좋습니다. 객체가 NULL이면, 값이 NULL인 것인지 비어 있는 것인지 의미적으로 모호하기 때문입니다.


#### Employee 클래스 (엔티티)

```java
@Entity
public class Employee {
    @Id
    @GeneratedValue
    private Long id;
    private String name;

    @Embedded
    private Period workPeriod;
}
```

- `@Embedded`
  엔티티가 해당 값 타입 컴포넌트를 사용함을 표시합니다. (선택 사항으로, 붙이지 않아도 동작합니다.)

- `@Id`
  임베디드 컴포넌트의 접근 전략은 소유 엔티티의 접근 전략을 따라갑니다. 컴포넌트의 접근 방식만 변경하고 싶다면, `@Access` 사용합니다.


임베디드 컴포넌트는 다음과 같이 속성들이 하나의 테이블에 펼쳐집니다.

```java
CREATE TABLE Employee (
    id BIGINT NOT NULL,
    name VARCHAR(255),
    startDate DATETIME,  -- Period 객체의 필드
    endDate DATETIME,    -- Period 객체의 필드
    PRIMARY KEY (id)
);
```


## 2. @AttributeOverride

컴포넌트 타입을 여러 개 사용하고 싶은 경우도 있습니다. 컬럼명의 충돌을 막기 위해 `@AttributeOverride`로 이름을 재정의할 수 있습니다. 예를 들어, 직원의 수습 기간과 계약 기간 정보를 필요로 할 수 있습니다.

```java
@Entity
public class Employee {
    @Id
    @GeneratedValue
    private Long id;
    private String name;

    @Embedded
    @AttributeOverride(name = "startDate", column = @Column(name = "probation_start")),
    @AttributeOverride(name = "endDate", column = @Column(name = "probation_end"))
    private Period probationPeriod;

    @Embedded
    @AttributeOverride(name = "startDate", column = @Column(name = "contract_start")),
    @AttributeOverride(name = "endDate", column = @Column(name = "contract_end"))
    private Period contractPeriod;
}
```

- `@AttributeOverride`의 `name` 속성
  `@Embeddable` 클래스(여기서는 `Period`) 안에 정의된 **자바 필드 이름**입니다.

- `@AttributeOverride`의 `column` 속성
  데이터베이스 테이블에 저장될 **실제 컬럼명**을 지정합니다.


## 3. 중첩 임베디드 타입

중첩 구조는 값 타입이 또 다른 값 타입을 포함하는 구조입니다. 예를 들어, 직원의 전체 계약 정보 내에 계약 기간을 포함하는 형태입니다.

#### 임베디드 타입 중첩 구조
```java
Employee
 ├─ ContractInfo
	  ├─ Period
```

#### Employee 엔티티
```java
@Entity
public class Employee {
    @Id
    @GeneratedValue
    private Long id;
    private String name;

    @Embedded
    private ContractInfo contractInfo;
}
```

#### ContractInfo > Period 타입
```java
@Embeddable
public class Period {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    protected Period() {}
}

@Embeddable
public class ContractInfo {
    private String contractType;
    private Long salary;

    @Embedded
    private Period contractPeriod;

    protected ContractInfo() {}
}
```


중첩이 아무리 길어져도 하나의 테이블에 속성들이 모두 들어갑니다.

#### EMPLOYEE 테이블

```sql
| ID | NAME | CONTRACT_TYPE | SALARY | START_DATE | END_DATE |
```