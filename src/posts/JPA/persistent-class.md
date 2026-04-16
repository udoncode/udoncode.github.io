---
slug: persistent-class
title: 영속 클래스 매핑하기
category: JPA
date: 2026-04-16
summary: 엔티티와 값 타입을 구분하고, 올바른 영속 클래스 작성하기
---

애플리케이션을 만들 때 해결해야 하는 현실 세계의 문제를 **애플리케이션 도메인**이라고 부릅니다.
이 애플리케이션 도메인에서 사용되는 현실 세계의 개념을 **도메인 모델**이라고 하며,
도메인 모델은 소프트웨어 상에서 **객체**로 구현해야 합니다.
개발자의 역할은 현실 세계의 개념을 소프트웨어 세계의 객체로 연결하는 것입니다.



# 1. 엔티티 vs 값 타입
모든 도메인 모델이 같은 수준의 중요도를 가지진 않습니다.
모델링의 방향성에 따라 이 클래스 간 중요도는 얼마든지 바뀔 수 있습니다.
예를 들어 아래와 같이 3가지 클래스가 있다고 가정해봅시다.

- User
- Item
- Address

3가지가 모두 비즈니스적으로 독립된 개체일 수도 있는 반면,
주소(Address) 개체가 독립적이지 않고, 사용자(User)에게 종속될 수도 있습니다.
따라서 현실 세계의 개념을 소프트웨어의 객체로 변환하려면,
도메인 모델을 주요 클래스와 보조 클래스로 잘 구분하는 것이 중요합니다.
다시 말해, 엔티티와 값 타입에 대한 이해가 필요합니다.


엔티티는 고유한 식별자를 가지며 시간이 지나 속성이 변한다고 하더라도 같은 정체성을 유지합니다.
반면, 값 타입은 고유한 식별자 없이 값 그 자체를 의미로 가집니다.
값이 같다면 동일한 것으로 보는 것입니다.


엔티티와 값 타입의 가장 큰 차이는 바로 **독립성**입니다.
엔티티는 고유 식별자를 통해 DB로부터 조회를 할 수 있고, 독립적인 생명주기를 가집니다.

값 타입은 그와는 반대로 식별자가 없고, 특정 엔티티에 **종속**됩니다.
그래서 여러 엔티티에서 하나의 값 타입 인스턴스를 공유하면,
한 곳의 수정이 의도치 않게 다른 곳에 영향을 주는 부작용이 발생할 수 있습니다.

따라서 값 타입은 생성자로만 값을 설정하고
Setter를 만들지 않는 **‘불변 객체’**로 설계하는 것이 안전합니다.


| 구분 | 엔티티 (Entity) | 값 타입 (Value Type) |
| --- | --- | --- |
| 식별자 | 있음 | 없음 |
| 생명주기 | 독립적 | 소유자에 종속 |
| 공유(참조) 가능 | 가능 | 불가능 |
| DB 표현 | PK | 소유 엔티티에 포함 |
| 예 | User | Address |

가끔 이 둘을 구분하는 것이 애매한 상황들이 충분히 발생할 수 있습니다.
그러한 상황에서는 항상 우선 **값 타입**으로 설계합니다.
그러다가 나중에 여러 엔티티에서 해당 값 타입을 필요로 하는 **공유 참조** 상황이 벌어질 때
값 타입을 엔티티로 승격합니다.




# 2. 엔티티의 식별자

## 1. 동일성(identity) vs 동등성(equality)
동일성과 동등성을 구분하는 것은 매우 중요합니다.
자바의 객체는 DB의 행(row)으로 표현되기 때문입니다.
DB에서는 테이블의 PK를 기준으로 행들을 구분합니다.
자바에서는 메모리 주소나 상태를 기준으로 객체를 구분합니다.

객체 동일성은 **두 참조가 같은 메모리 주소를 가리키는가**를 말합니다.
객체 동등성은 **같은 상태(State)인가**를 말합니다. 즉, 내용이 같은지를 따집니다.

단순하게 말하자면,
동일성은 `==`로 비교하는 것이고,
동등성은 `equals()`로 비교하는 것을 말합니다.

| 구분 | 기준 | 검사 방법 |
| --- | --- | --- |
| Object identity | 메모리 주소 | == |
| Object equality | 상태 | equals() |
| Database identity | 테이블 + PK | PK 값 |


이처럼 비교 방식의 차이로 인하여
JPA에서는 equals/hashCode 메서드를 재정의하는 것이 매우 중요합니다.
단, 엔티티에서 `equals()`를 구현할 때는 모든 필드를 비교하기보다
<strong>비즈니스 키(unique한 속성)</strong>나 <strong>식별자(@Id)</strong>를 기반으로 구현해야 합니다.
특히 JPA 프록시 객체와의 비교를 위해 `instanceof`를 사용하고,
필드에 직접 접근하기보다 **getter를 호출**하여 비교하는 것이
JPA의 지연 로딩 환경에서 안전합니다.

```java
@Entity
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String itemCode; // 비즈니스 키 (상품 관리 번호)

    private String name;

    protected Item() {} // JPA를 위한 기본 생성자

    @Override
    public boolean equals(Object o) {
        // 1. 동일성 비교 (참조 주소가 같으면 동일 객체)
        if (this == o) return true;

        // 2. 프록시 객체 대응 (instanceof 사용)
        // Hibernate가 생성한 프록시 객체와 원본 객체를 올바르게 비교하기 위함입니다.
        if (!(o instanceof Item)) return false;

        Item item = (Item) o;

        // 3. 비즈니스 키 비교 (Getter 호출 필수)
        // 필드 직접 접근(this.itemCode)은 프록시 객체의 경우 null일 수 있으므로
        // 반드시 getItemCode()를 통해 지연 로딩된 값을 가져와야 합니다.
        return getItemCode() != null && getItemCode().equals(item.getItemCode());
    }

    @Override
    public int hashCode() {
        // 4. 해시코드 구현
        return Objects.hash(getItemCode());
    }

    // Getter & Setter...
    public Long getId() { return id; }
    public String getItemCode() { return itemCode; }
}
```


## 2. 엔티티 클래스 매핑

엔티티에서 가장 중요한 것은 식별자입니다.

```java
@Entity
class Item {

    @Id
    @GeneratedValue(generator = "ID_GENERATOR")
    private Long id;

    public Long getId() {
        return id;
    }
}
```

- `@Entity`
  해당 클래스가 영속 객체이면서 JPA가 관리하는 엔티티임을 표시합니다.
- `@Id`
  해당 필드가 DB의 PK가 됩니다. 모든 엔티티는 반드시 이 `@Id`가 필요합니다.
- `@GeneratedValue`
  대체키 생성 전략을 설정합니다.


### 1. Access Type

`@Id`는 접근 방식이 두 가지가 있습니다.
필드 위에 붙이면 필드 접근이 되고, getter 위에 붙이면 프로퍼티 접근이 됩니다.
필드 접근 방식이 getter를 거치지 않고 직접 읽고 쓸 수 있다는 이점 때문에
주로 필드 접근 방식을 선호합니다.
단, Id 필드는 setter 생성을 절대 권하지 않습니다.
PK는 변경되어서는 안되는 필드이며,
변경 시 캐싱과 더티 체크 동작에 문제가 발생하기 때문입니다.


### 2. PK 선택 기준

PK의 조건으로는 보통 3가지입니다.

1. **NOT NULL** - null이면 안 된다.
2. **UNIQUE** - 유일해야 한다.
3. **IMMUTABLE** - 변경되면 안된다.

이 조건을 만족하는 키에는 자연키, 복합키, 대체키가 존재합니다.
그렇지만, **대체키**를 사용하는 것이 가장 좋습니다.

그 이유는 다음과 같습니다.
자연키는 변경 가능성이 존재합니다.
복합키는 쿼리가 복잡해지고, 스키마 변경이 어렵습니다.
반면 대체키는 PK의 조건을 만족시키는 것과 더불어 관리에도 용이합니다.


### 3. @GeneratedValue

JPA가 지원하는 대체키 생성 전략에는 4가지가 있습니다.
1. **GenerationType.AUTO**
   Hibernate가 DB 방언(dialect)을 보고 적절한 전략을 선택
2. **GenerationType.SEQUENCE**
   INSERT 전에 sequence를 호출하여 연속된 숫자 생성
3. **GenerationType.IDENTITY**
   DB가 auto-increment 컬럼을 가지며, INSERT 후 생성된 ID를 가져옴
4. **GenerationType.TABLE**
   별도의 테이블을 만들어 SEQUENCE_NAME, NEXT_VALUE 컬럼 생성
   INSERT 전에 이 테이블을 업데이트


#### 식별자 생성 시점

대체키 생성 전략에 따라 식별자 생성 가능 시점이 DB 접근의 전과 후로 나뉘게 됩니다.

- **INSERT 전 (PRE-INSERT)**
  DB에 INSERT 하기 전에 미리 ID를 생성하여 코드 상에서 즉시 `getId()`가 가능합니다.
- **INSERT 후 (POST-INSERT)**
  DB가 INSERT할 때 자동으로 ID를 생성하고 그 후에 `getId()`를 통해 조회할 수 있습니다.

| 구분 | Post-insert (IDENTITY) | Pre-insert (SEQUENCE) |
| --- | --- | --- |
| ID 생성 시점 | ID는 INSERT 후 생성 | ID는 INSERT 전에 생성 |
| 쓰기 지연 | INSERT 즉시 실행 필요 | SQL 실행 지연 가능 |
| Batch 최적화 | batch 최적화 불가 | batch 최적화 가능 |


가능하면 AUTO는 사용하지 말고 명시적으로 전략을 지정할 것을 권합니다.
또한, 성능 상 INSERT 전에 ID를 생성할 수 있는 시퀀스 전략이 좋습니다.

PRE-INSERT와 POST-INSERT 중 PRE-INSERT가 좋은 이유는
POST는 ID 획득을 하려면 INSERT를 미리 실행해야 하기 때문에
트랜잭션 커밋 시점에 한 번에 INSERT하는 BATCH INSERT가 거의 불가능하기 때문입니다.


#### Named Generator

MYSQL과 같이 시퀀스 전략을 사용하지 않는 DB의 경우
식별자 생성기를 직접 만들 수 있는 하이버네이트의 `@GenericGenerator`를 쓸 수 있습니다.
여러가지 전략 중 enhanced-sequence 전략을 사용하면, 시퀀스를 지원하지 않는 DB도
테이블을 이용하며 최적화된 시퀀스 전략을 사용할 수 있습니다.

```java
@org.hibernate.annotations.GenericGenerator(
  name = "ID_GENERATOR",
  strategy = "enhanced-sequence",
  parameters = {
     @org.hibernate.annotations.Parameter(
        name = "sequence_name",
        value = "MY_SEQUENCE"
     ),
     @org.hibernate.annotations.Parameter(
        name = "initial_value",
        value = "1000"
     )
})

@GeneratedValue(generator = "ID_GENERATOR")
private Long id;
```

- `generator = "ID_GENERATOR"`
  생성기의 이름을 지정
- `strategy = "enhanced-sequence"`
  하이버네이트의 고급 시퀀스 전략
- `name = "sequence_name"`
  사용할 DB 시퀀스 이름 지정 (`value = "MY_SEQUENCE"`)
- `name = "initial_value"`
  처음 생성될 ID (`value = "1000"`)