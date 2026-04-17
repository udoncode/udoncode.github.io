---
slug: inheritance-mapping
title: 상속 매핑하기
category: JPA
date: 2026-04-17
summary: RDB와 객체 지향의 구조적 불일치와 상속 매핑 전략의 이해
---
객체 지향 세계와 관계형 DB 세계의 구조적 차이 중 하나는 상속 유무입니다. 객체 지향은 is-a 관계(상속)와 has-a 관계(연관 관계)를 모두 지원하지만, 관계형 DB에서는 오로지 has-a 관계만 존재합니다. 이처럼 구조적 불일치를 해결하고자 상속 구조를 테이블로 옮기기 위한 전략이 4가지가 있습니다.



# 1. 구체 클래스마다 테이블 생성하기 (다형성 X)

구체 클래스는 추상 클래스와 반대되는 개념으로, 인스턴스가 생성되는 클래스를 말합니다. 이 전략은 구체 클래스마다 각각 하나의 테이블을 생성하고, 그 테이블에 추상 클래스로부터 상속받은 속성까지 포함합니다. 다시 말해, 추상 클래스는 상위 클래스가 되며, 테이블을 생성하지 않고 속성만 하위 클래스에게 물려주게 됩니다.

> - 상속 구조의 각 구체 클래스마다 독립적인 테이블을 만듭니다.
> - 상위 클래스는 `MappedSuperclass`로 처리하여 테이블을 생성하지 않고, 속성만 하위 클래스가 물려받도록 만듭니다.


#### @MappedSuperclass
`@MappedSuperclass`는 두 가지 의미를 가지는 어노테이션입니다.

- 이 클래스는 테이블을 만들지 않는다.
- 자식 테이블에 자신의 필드를 포함시킨다.

| 어노테이션 | 테이블 생성 | 상속 필드 포함 |
| --- | --- | --- |
| @Entity | O | O |
| @MappedSuperclass | X | O |

```java
@MappedSuperclass
public abstract class Product {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private int price;
}

@Entity
@AttributeOverride(
	name = "name",
	column = "@Column(name = "TITLE", nullable = false)
)
public class Book extends Product {
    private String author;
}

@Entity
public class Laptop extends Product {
    private String cpu;
}
```

- `@MappedSuperclass` : 테이블은 만들지 않고, 속성만 하위 클래스에 상속됩니다. (`id`, `name`, `price`)
- `@Entity` : 이 클래스는 테이블로 매핑됩니다.
- `@AttributeOverride` : 상속된 `name` 컬럼을 `TITLE`로 이름을 변경합니다.
- ID의 경우, 부모에 두고 자식에게 공유할 수도 있고, 각 자식마다 반복 선언할 수도 있습니다.


#### @NoRepositoryBean

Spring Data는 기본적으로 Repository 인터페이스마다 구현체를 만듭니다. 그런데 이 전략은 추상 클래스의 테이블이 생성되지 않습니다. 따라서 `@NoRepositoryBean`를 사용하여 해당 인터페이스는 직접 인스턴스를 생성하지 말라고 선언해야 합니다. 또한, 구체 클래스에서 재사용을 위하여 제네릭을 사용합니다.

```java
@NoRepositoryBean
public interface ProductRepository<T extends Product> extends JpaRepository<T, Long> { }
```

- `@NoRepositoryBean`: 직접 인스턴스를 만들 수 없게 합니다.
- 제네릭으로 `T`를 받아서 하위 리포지토리가 재사용할 수 있도록 설계합니다.

```java
public interface BookRepository extends ProductRepository<Book, Long> {}

public interface LaptopRepository extends ProductRepository<Laptop, Long> {}
```


#### 문제점

이 전략은 부모 테이블이 생성되지 않는다는 점에서 여러가지 문제가 발생합니다.

1. **다형적 연관관계 불가**
   DB에서 연관관계를 FK로 표현하지만, 테이블이 없으므로 부모의 ID 참조가 불가능합니다.

2. **다형적 쿼리 성능 문제**
   구체 클래스 조회는 단일 테이블로 이루어져 빠릅니다. 그러나 부모 클래스를 조회하면 구체 클래스의 개수만큼 SELECT를 실행합니다. 예를 들어, 구체 클래스가 5개면 SELECT가 5번 실행됩니다.

결론적으로 다른 엔티티가 해당 추상 클래스를 참조하는 상황이나 다형적 조회가 많은 상황에서는 이 전략은 부적합합니다.





# 2. 구체 클래스마다 테이블 생성하기 (다형성 O)

이 전략은 앞에서 소개했던 구체 클래스마다 테이블 생성하기의 문제점이었던 다형성의 어려움을 UNION 기반으로 해결합니다. 그 외의 기본적인 구조와 개념은 동일합니다.

> - 상속 구조의 하위 클래스마다 별도 테이블을 생성합니다.
> - 상위 클래스는 추상 클래스(혹은 인터페이스)로 정의하며, `@Entity`와 함께 TABLE_PER_CLASS 전략을 사용합니다.
> - 다형성 쿼리를 위해 SQL의 UNION 연산자를 사용하여 각 테이블을 하나로 합친 것처럼 조회합니다.


#### @Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)

이 전략은 `@Entity`와 함께 `@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)`를 사용하여 부모 클래스도 엔티티로 만들어 **부모로부터 조회하는 것을 가능하게 만듭니다.** 따라서 ID 또한 부모 클래스에 반드시 있어야 합니다. 중요한 점은 엔티티로 선언을 했으나 여전히 **부모 테이블은 존재하지 않으며** 각각 구체 클래스의 테이블은 DB 입장에서 서로 독립적입니다.

```java
@Entity
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public abstract class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.TABLE)
    private Long id;
    private String name;
    private int price;
}

@Entity
public class Book extends Product {
    private String author;
}

@Entity
public class Laptop extends Product {
    private String cpu;
}
```


Repository에서도 부모 클래스가 `@Entity`가 되었으므로, `@NoRepositoryBean`이 필요 없이 부모 타입의 Repository를 만들 수 있습니다.

```java
public interface ProductRepository<T extends Product, ID> extends JpaRepository<T, ID> {}
```


#### UNION ALL (다형성 조회)
해당 전략에서 부모 클래스를 조회하면, 각각의 구체 클래스의 테이블을 UNION을 사용하여 하나의 테이블로 조회합니다. 구체 클래스마다 SELECT를 사용하던 이전 전략과 달리 UNION 한 번으로 조회가 가능합니다. 즉, 부모 테이블이 존재하지는 않지만 UNION을 통해 마치 가상 테이블이 존재하는 것처럼 처리합니다.

그러나 여전히 테이블의 구조는 정규화되지 않은 중복된 컬럼들이 존재합니다.





# 3. 클래스 계층 전체를 하나의 테이블로 생성하기

이 전략은 계층 내 모든 클래스의 모든 속성을 하나의 테이블의 컬럼으로 포함합니다. 따라서 계층 내 각각의 클래스를 구분하기 위한 특별한 컬럼이 필요합니다.

> - 상속 계층 전체를 하나의 테이블로 매핑합니다.
> - 모든 클래스의 속성을 하나의 테이블에 통합하고, 어떤 클래스의 인스턴스인지 구별하기 위해 식별자 컬럼을 사용합니다.
> - 조인이나 UNION 없이 다형성 쿼리를 한 번에 처리할 수 있어 성능이 뛰어납니다.


#### @Inheritance(strategy = InheritanceType.SINGLE_TABLE)
계층 전체를 하나의 테이블로 생성하기 위해 필요한 어노테이션입니다.

#### @DiscriminatorColumn(name = “")
부모 클래스에 각 행의 타입을 저장하기 위한 컬럼을 생성합니다. 모든 클래스가 하나의 테이블로 합쳐지기 때문에 이들을 구분하기 위한 컬럼입니다.

#### @DiscriminatorValue("")
자식 클래스에 타입 컬럼의 값을 명시합니다.

```java
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dtype")
public abstract class Product {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private int price;
}

@Entity
@DiscriminatorValue("B")
public class Book extends Product {
    private String author; // Laptop 저장 시 이 컬럼은 NULL 허용 필요
}

@Entity
@DiscriminatorValue("L")
public class Laptop extends Product {
    private String cpu; // Book 저장 시 이 컬럼은 NULL 허용 필요
}
```

- `@Inheritance(SINGLE_TABLE)`: 단일 테이블 전략을 사용합니다.
- `@DiscriminatorColumn(name = "dtype")`: 클래스 구분을 위한 식별 컬럼을 추가합니다.
- 모든 하위 클래스 컬럼은 NULL을 허용해야 합니다.

싱글 테이블 전략은 하나의 테이블로 이루어져 있으므로 조회 부분에서 최상의 성능을 자랑합니다. 그러나 단점 또한 여기서 파생됩니다. 자식 컬럼은 NULL을 허용해야 하므로 데이터 무결성 문제가 발생하고 정규화를 위반해야 합니다.




# 4. 클래스마다 테이블 생성하여 조인하기

이 전략은 객체의 is-a 관계를 DB의 has-a 관계로 바꿔 표현하는 전략으로 가장 졍규화된 형태의 방법입니다. 상속 관계를 SQL의 외래키(FK) 관계로 표현합니다.

>- 상속 구조의 모든 클래스에 대해 각자 테이블을 만듭니다.
>- 하위 클래스 테이블은 부모 테이블의 기본키를 외래키로 참조합니다.
>- 조인을 통해 전체 엔티티 정보를 재구성합니다.


#### @Inheritance(strategy = InheritanceType.JOINED)
추상 클래스를 포함하여 모든 클래스는 각각 자신의 테이블을 가집니다. 부모 클래스와 자식 클래스는 JOIN을 위해 같은 PK 값을 공유합니다. 따라서 부모 클래스에만 ID를 선언하고, 자식 클래스는 상속 받습니다.

#### @PrimaryKeyJoinColumn(name = “”)
부모 PK 이름과 다른 자식 PK 이름을 사용하고 싶다면, 해당 어노테이션을 사용합니다.

```java
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Product {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private int price;
}

@Entity
@PrimaryKeyJoinColumn(name = "book_id")
public class Book extends Product {
    private String author;
}

@Entity
public class Laptop extends Product {
    private String cpu;
}
```

- `@Inheritance(strategy = InheritanceType.JOINED)`: 상위 클래스이자 테이블로 매핑됩니다.
- `@PrimaryKeyJoinColumn`: 조인 키를 명시적으로 지정합니다. 생략하면 기본은 부모의 `id`가 됩니다.
- `id`는 상위 클래스에서 상속되므로 따로 선언할 필요가 없습니다.
- 하위 클래스의 `id`는 `Product.id`를 참조하는 외래키이자 기본키입니다.

이 전략의 핵심은 자식 클래스의 ID가 PK이자 부모 클래스를 참조하는 FK가 된다는 것입니다. 그에 따라 정규화도 가능하고, 무결성 제약(NOT NULL)도 용이합니다. 그러나 계층이 깊어질수록 JOIN 수가 증가하고 쿼리 복잡성이 증가하게 됩니다.





# 5. 전략 선택 가이드

#### 1. `TABLE_PER_CLASS` (UNION 기반)

다형성 쿼리나 연관관계가 거의 없는 경우에 사용합니다. 상위 클래스를 직접 조회하거나 참조하지 않을 때 유용합니다.
- **장점** : 각 클래스가 독립 테이블로 구조가 명확하고 단순합니다.
- **단점** : 다형성 쿼리 시 `UNION`이 필요하므로, 성능 이슈가 발생할 수 있습니다.

#### 2. `SINGLE_TABLE`

다형성 쿼리나 연관관계가 필요하고, 하위 클래스의 속성이 적고 대부분 optional한 경우에 사용합니다.
- **장점** : 쿼리가 단순하며 성능이 가장 뛰어납니다.
- **단점** : 모든 하위 클래스 속성을 하나의 테이블에 들어가므로, 대부분 NULL을 허용해야 합니다.

#### 3. `JOINED`

다형성 쿼리나 연관관계가 필요하고, 하위 클래스의 속성이 많으며 대부분 필수(NOT NULL)인 경우에 사용합니다.
- **장점** : 정규화가 가능하며 무결성 제약 설정이 쉽습니다.
- **단점** : 조인으로 인한 성능 저하 가능성과 쿼리 작성이 복잡합니다.