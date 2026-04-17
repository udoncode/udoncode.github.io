---
slug: collection-mapping
title: 컬렉션 매핑하기
category: JPA
date: 2016-04-17
summary: 컬렉션의 종류에 따른 매핑 방식과 연관관계 매핑
---
컬렉션 매핑은 필수 사항이 아닙니다. 따라서 엔티티 내에서 컬렉션 필드를 사용하는 경우에는 그 목적이 분명해야 합니다. 
컬렉션 매핑을 통해 얻는 이점은 다음과 같습니다.


#### 컬렉션 매핑의 장점

1. **자동 조회(지연 로딩 / 즉시 로딩)**
직접 쿼리를 작성하지 않아도, 컬렉션을 탐색할 수 있습니다.

```java
user.getPosts(); // SELECT * FROM POST WHERE USER_ID = ?
```

2. **자동 저장(Cascade)**
`POST` 객체를 별도로 `PERSIST()`하지 않아도 `.add()`하는 것만으로도 `USER`와 함께 저장됩니다.

```java
user.getPosts().add(new Post("Post 3"));
userRepository.save(user);
```

3. **자동 삭제 (orphanRemoval / Cascade)**
`User`가 삭제되면 관련 모든 `Post`도 자동으로 삭제됩니다.


#### 컬렉션의 종류

엔티티 내부의 컬렉션 필드는 DB에 어떤 식으로 저장할 수 있는지 알아봅시다.

컬렉션에 담을 타입에는 크게 두 가지 종류가 있습니다.
- 값 타입 (기본 타입)
- 컴포넌트 타입 (값 타입의 집합)

지원하는 컬렉션의 종류에는 6가지가 있습니다.

| **컬렉션 타입** | **중복 허용** | **순서 유지** | **정렬 방식** | **특징 및 비고** |
| --- | --- | --- | --- | --- |
| **Set** | X | X | 정렬 없음 | 중복을 허용하지 않는 기본 집합 |
| **SortedSet** | X | O | **메모리** | Hibernate 전용. `Comparator`를 사용하여 JVM 내 정렬 |
| **List** | O | O | **DB 인덱스** | `@OrderColumn` 사용 시 DB에 별도 인덱스 컬럼 생성 |
| **Collection (Bag)** | O | X | 정렬 없음 | 중복은 허용하나 순서는 무시. `ArrayList`로 구현 |
| **Map** | Key 기준 X | X | 정렬 없음 | Key-Value 쌍으로 저장. Key는 중복 불가 |
| **SortedMap** | Key 기준 X | O | **메모리** | Hibernate 전용. Key를 기준으로 메모리 내 정렬 |


#### 핵심 원칙

- 항상 인터페이스로 속성 타입을 선언하고, 구현체로 초기화해야 합니다.
- 초기화는 필드에서 바로 하는 것이 좋습니다.
   (생성자나 setter로 나중에 초기화 시 `NullPointerException`이 발생할 수 있습니다.)
- 제네릭을 반드시 사용해야 합니다.




# 1. 값 타입 컬렉션

## 주요 어노테이션

#### @ElementCollection
값 타입 컬렉션이라는 의미입니다. 값 타입 컬렉션은 단순 값들의 집합입니다. 따라서 다음과 같은 특징을 가집니다.
- 엔티티 컬렉션이 아니다.
- 식별자가 없다.
- 독립적인 생명주기가 없다.


#### @CollectionTable
컬렉션은 반드시 별도의 테이블에 저장됩니다. 파라미터로는 `name`, `joinColumns`가 있습니다.
- `name` : 테이블 이름
- `joinColumns = @JoinColumn(name = “”)` : 외래키 컬럼 이름


#### @Column(name = “”)
컬렉션의 값을 저장할 컬럼 이름을 지정합니다.


## 1. Set
Set은 컬렉션 중 매핑 형태가 가장 단순합니다. 중복을 방지하고자 **복합 기본키**(외래키 + 값 컬럼)를 가집니다.

```java
@Entity
public class Member {
    @Id
    @GeneratedValue
    @Column(name = "MEMBER_ID")
    private Long id;

    // Set: 좋아하는 음식 (중복 불가)
    @ElementCollection
    @CollectionTable(
        name = "FAVORITE_FOODS", 
        joinColumns = @JoinColumn(name = "MEMBER_ID")
    )
    @Column(name = "FOOD_NAME") // 값 컬럼명
    private Set<String> favoriteFoods = new HashSet<>();
}
```
- `MEMBER_ID`와 `FOOD_NAME`을 복합 기본키로 가집니다.



## 2. Bag

Bag은 순서가 없고, **중복을 허용**하는 컬렉션입니다. 이 컬렉션은 자바 컬렉션 프레임워크에는 존재하지 않기 때문에 `Collection` 인터페이스와 `ArrayList` 구현체를 사용합니다. 하이버네이트는 이를 내부적으로 Bag으로 처리합니다.


#### @GenericGenerator
대리키를 생성하기 위한 전략을 지정합니다.

- `name` : ID 생성기 이름
- `strategy` : ID 생성 전략

#### @org.hibernate.annotations.CollectionId
컬렉션 테이블에 인공 식별자 컬럼(대리키)을 추가합니다. Bag은 중복을 허용하기 때문에 복합키가 더 이상 유니크하지 않습니다. 따라서 하이버네이트 전용 기능인 `@CollectionId`를 사용해 새로운 대리키(인공 식별자) 컬럼을 만들어야 합니다.

```java
@Entity
public class Member {
    @Id
    @GeneratedValue
    @Column(name = "MEMBER_ID")
    private Long id;
    
    private String name;

    // Bag: 생일 목록 (순서 없음, 중복 허용 가능성이 있어 대리키 생성)
    @ElementCollection
    @CollectionTable(
        name = "MEMBER_BIRTHDAYS", 
        joinColumns = @JoinColumn(name = "MEMBER_ID")
    )
    @GenericGenerator(name = "sequence_gen", strategy = "sequence")
    @org.hibernate.annotations.CollectionId(
        columns = @Column(name = "BIRTHDAY_ID"), // 추가할 식별자 컬럼
        type = @org.hibernate.annotations.Type(type = "long"), 
        generator = "sequence_gen"
    )
    @Column(name = "BIRTHDAY")
    private Collection<String> nicknames = new ArrayList<>();
}
```

별도의 `MEMBERS_BIRTHDAYS`를 만들지 않아도 되므로, `MEMBER`에 종속된 구조로 간단하게 관리가 됩니다.


## 3. List

List는 순서를 반드시 보존할 필요가 있는 경우에만 제한적으로 사용합니다. 저장 순서를 DB에 굳이 저장하기 보다는 쿼리 시 정렬하는 게 더 나을 수도 있기 때문입니다.

#### @OrderColumn

DB에 순서를 저장하는 인덱스 컬럼을 추가합니다. 순서가 있는 List 컬렉션의 특성상 필요한 컬럼이며, **기본키는 이 순서 컬럼과 외래키를 합친 복합키**가 됩니다. 

인덱스는 반드시 연속된 숫자여야 합니다. 따라서 컬렉션의 특정 요소를 삭제하면, 인덱스를 한 칸씩 앞당기고자 그 뒤의 요소들이 모두 UPDATE가 발생합니다. 이처럼 List는 수정 비용이 크기 때문에 가능하면 사용을 자제합니다.

```java
@Entity
public class Member {
    @Id
    @GeneratedValue
    @Column(name = "MEMBER_ID")
    private Long id;

    // List: 방문한 도시 목록 (방문 순서가 중요함)
    @ElementCollection
    @CollectionTable(
        name = "VISITED_CITIES", 
        joinColumns = @JoinColumn(name = "MEMBER_ID")
    )
    @OrderColumn(name = "CITY_ORDER") // 순서를 저장할 인덱스 컬럼
    @Column(name = "CITY_NAME")
    private List<String> visitedCities = new ArrayList<>();
}
```

- `MEMBER_ID`와 `CITY_ORDER`을 복합 기본키로 가집니다.


## 정리

| 타입 | 중복 | 순서 | PK 구조 |
| --- | --- | --- | --- |
| Set | 불가 | 없음 | FK + VALUE |
| Bag | 가능 | 없음 | 대리키 |
| List | 가능 | 있음 | FK + INDEX |



## 4. Map
Map은 Key와 Value의 구조를 가지기 때문에 각각을 저장할 별도의 컬럼이 필요합니다. 또한, Map은 Key 중복을 허용하지 않기 때문에 **Key 컬럼 + FK**의 복합키를 기본키로 가집니다.

#### @MapKeyColumn(name = "")
key 저장용 컬럼입니다.

#### @Column(name = "")
value 저장 컬럼입니다.

```java
@Entity
public class Member {
    @Id
    @GeneratedValue
    @Column(name = "MEMBER_ID")
    private Long id;

    // Map: 연락처 정보 (Key: 연락처 타입, Value: 전화번호)
    @ElementCollection
    @CollectionTable(
        name = "CONTACT_INFO", 
        joinColumns = @JoinColumn(name = "MEMBER_ID")
    )
    @MapKeyColumn(name = "CONTACT_TYPE") // Map의 Key 컬럼 (예: "HOME", "WORK")
    @Column(name = "PHONE_NUMBER")       // Map의 Value 컬럼
    private Map<String, String> contactInfo = new HashMap<>();
}
```

- `MEMBER_ID`와 `CONTACT_TYPE`이 복합 기본키가 됩니다.


## 5. Sorted vs Ordered
정렬에는 정렬이 발생하는 위치(DB vs 애플리케이션 메모리)에 따라 두 가지 종류가 있습니다.

| 구분 | 의미 |
| --- | --- |
| Sorted | 자바 메모리에서 Comparator로 정렬합니다. |
| Ordered | DB에서 ORDER BY로 정렬합니다. |


#### SortedSet / SortedMap

Hibernate에서 `@SortNatural`이나 `@SortComparator`를 사용하는 `SortedSet` 계열은 **DB에서 데이터를 일단 다 가져온 뒤, 자바 메모리 내에서 정렬**합니다.

데이터를 불러올 때 `TreeSet`이나 `TreeMap` 인스턴스를 생성하며, 자바의 `Comparator`를 이용해 정렬된 상태를 유지합니다. DB 부하를 줄일 수 있지만, 데이터 양이 많으면 자바 메모리와 CPU를 사용하게 됩니다.


#### LinkedHashSet / LinkedHashMap

`Linked` 계열 컬렉션은 데이터가 삽입된 순서를 기억합니다. `@OrderBy` 어노테이션을 통해 SQL의 `ORDER BY` 구문을 사용한 결과가 해당 컬렉션에 저장됩니다.





# 2. 컴포넌트 타입 컬렉션

사실 값 타입만으로는 데이터를 온전히 관리하기가 힘듭니다. 현실적으로는 이보다 더 많은 데이터를 필요로 하기 때문입니다. 그래서 컴포넌트 타입을 고려하게 됩니다. 값 타입의 집합인 컴포넌트 타입(혹은 임베디드 타입)은 엔티티가 아니므로 다음과 같은 특징을 가집니다.

- 식별자가 없습니다.
- 다른 엔티티에 포함됩니다.

컴포넌트 타입의 중요한 점은 반드시 **모든 필드가 NOT NULL**이어야 한다는 점입니다. 그 이유는 **동일성(Identity) vs 동등성(equality) 개념**과 관련이 있습니다. 기본적으로 사용자 정의 객체는 값 비교가 아닌 **동일성 비교**(**참조 비교**)를 수행합니다.

따라서 **동등성 비교**(**값 비교**)를 수행할 수 있도록 `equals() / hashCode()`를 재정의하는 것이 바람직합니다. DB의 행과 연결지어 보았을 때 객체의 주소가 아닌 내용을 기준으로 중복이 판단되어야 하기 때문입니다. 마찬가지로, NULL을 비교한다는 것은 논리적으로 어색하기 때문에 NOT NULL이 되어야 합니다.

컴포넌트 타입의 컬렉션 테이블을 생성할 때 기본키는 NULL이 아닌 모든 컬럼을 조합하여 생성합니다. 컴포넌트는 엔티티와는 달리 따로 식별자가 존재하지 않기 때문에 **모든 값이 합쳐져야 유일하기** 때문입니다.

정리하자면 다음과 같습니다.

- 컴포넌트는 값 타입입니다.
- 값 타입은 **값**으로 비교해야지, **참조**로 비교하면 안됩니다.
- 올바른 비교를 위해서는 필드가 NULL을 허용해서는 안됩니다.

→ `equals() / hashCode()` 를 알맞게 재정의해야 합니다.

```java
@Embeddable
public class Address {

    private String city;
    private String street;
    private String zipcode;

    protected Address() {} // JPA용 기본 생성자

    public Address(String city, String street, String zipcode) {
        this.city = city;
        this.street = street;
        this.zipcode = zipcode;
    }

    // Equals & HashCode: 모든 필드를 비교
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Address address = (Address) o;
        return Objects.equals(city, address.city) && 
               Objects.equals(street, address.street) && 
               Objects.equals(zipcode, address.zipcode);
    }

    @Override
    public int hashCode() {
        return Objects.hash(city, street, zipcode);
    }
}
```

보통 직접 타이핑하기보다 **Lombok**의 `@EqualsAndHashCode`를 쓰거나, IDE(IntelliJ 등)의 Generate 기능을 통해 자동으로 만드는 방식을 주로 사용합니다.



## 1. Set
Set은 중복을 허용하지 않습니다. 게다가 컴포넌트도 값 타입이므로 식별자가 없습니다. 따라서 **모든 NOT NULL 컬럼 조합이 PK**가 됩니다.

자바가 값을 비교하는 방식과 DB가 PK로 값을 구분하는 방식은 다릅니다. Set의 복합 기본키에는 부모의 기본키도 당연히 포함되기 때문에 `equals()` / `hashCode()`에 부모를 반드시 포함해야 안전한 비교가 가능합니다.

```java
@Entity
public class Member {
    @Id
    @GeneratedValue
    @Column(name = "MEMBER_ID")
    private Long id;

    // Set: 주소 목록 (중복 불가, 모든 필드 + FK가 복합 PK가 됨)
    @ElementCollection
    @CollectionTable(
        name = "MEMBER_ADDRESS_SET", 
        joinColumns = @JoinColumn(name = "MEMBER_ID")
    )
    private Set<Address> addressSet = new HashSet<>();
}
```


#### @org.hibernate.annotations.Parent

컬렉션 로딩 시 부모 객체를 자동으로 주입합니다.


#### 문제 상황

값 자체가 같더라도, 부모가 다르면 다른 것으로 취급해야 하는 경우가 있습니다. 예를 들어, `MEMBER`와 `ADDRESS` 관계에서 “주소가 같으면 같은 사람인가?”라는 질문을 던질 수 있습니다. `Address` 클래스에 `city`, `street`만 넣고 `equals()`를 만들었다고 가정합니다.

두 명의 멤버가 똑같은 주소에 살고 있는 상황입니다.

```java
Address samePlace = new Address("서울시", "강남구");

memberA.getAddresses().add(samePlace); 
memberB.getAddresses().add(samePlace); // (A와 B는 다른 사람이지만 주소값은 같음)
```

이때, 주소 객체들이 어느 멤버에게 속해 있는지 모른 채로 주소만 떼어내고 비교하면 자바의 `Set` 컬렉션에서는 주소가 같은 데이터이므로 하나로 합치게 됩니다.


#### 해결 방법 (@Parent)

이를 해결하려면, `@Parent`로 주소 객체가 누구의 주소인지(부모)를 명시해줍니다.

```java
@Embeddable
public class Address {
    
    @Parent
    private Member member; // 이 주소를 소유한 Member를 참조 (부모 연결)

    private String city;
    private String street;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Address address = (Address) o;
        
        // 주소 값(city, street)뿐만 아니라 '누구의 주소(member)'인지도 비교!
        return Objects.equals(city, address.city) && 
               Objects.equals(street, address.street) &&
               Objects.equals(member, address.member); 
    }

    @Override
    public int hashCode() {
        return Objects.hash(city, street, member);
    }
}
```


## 2. Bag

중복을 허용하고 NULL 필드도 허용하고 싶다면 Bag을 고려해볼 수 있습니다. Bag은 복합 기본키 대신 **대체키**(`@CollectionId`)를 사용합니다. 값 타입이므로 여전히 equals/hashCode는 **값 기준** 비교입니다. nullable 필드도 포함해서 비교해야 합니다. 이때, `Objects.equals()`로 비교해야 `NullPointerException`을 방지할 수 있습니다.

```java
@Entity
public class Member {
    @Id
    @GeneratedValue
    @Column(name = "MEMBER_ID")
    private Long id;

    // Bag: 주소 목록 (중복 허용, 대리키 사용)
    @ElementCollection
    @CollectionTable(
        name = "MEMBER_ADDRESS_BAG", 
        joinColumns = @JoinColumn(name = "MEMBER_ID")
    )
    @GenericGenerator(name = "address_seq", strategy = "sequence")
    @CollectionId(
        columns = @Column(name = "ADDRESS_ID"), // 대체키 추가
        type = @org.hibernate.annotations.Type(type = "long"), 
        generator = "address_seq"
    )
    private Collection<Address> addressBag = new ArrayList<>();
}
```

- `ADDRESS_ID`가 각 행의 고유 ID(PK) 역할을 수행합니다.


## 3. Map<Primitive, Embeddable>

Map의 key는 DB에서 별도 컬럼으로 저장됩니다. value는 객체 내부의 각각의 필드가 컬럼으로 저장됩니다.또한, key 컬럼은 중복을 허용하지 않기 때문에 **key 컬럼 + FK 복합키**가 기본키가 됩니다.

```java
@Entity
public class Member {
    @Id
    @GeneratedValue
    @Column(name = "MEMBER_ID")
    private Long id;

    // Map: 주소 타입(String)을 Key로, 주소 객체(Address)를 Value로 가짐
    @ElementCollection
    @CollectionTable(
        name = "MEMBER_ADDRESS_MAP", 
        joinColumns = @JoinColumn(name = "MEMBER_ID")
    )
    @MapKeyColumn(name = "ADDRESS_TYPE") // Key 컬럼명
    private Map<String, Address> addressMap = new HashMap<>();
}
```

## 정리

| Set | Bag | Map |
| --- | --- | --- |
| 값 전체가 식별자 | 대리키 사용 | key가 식별자 |
| 모든 필드가 PK | 값은 PK가 아님 | value는 단순 값 |



## 4. Map<Embeddable, Embeddable>

Key가 객체(Embeddable)일 경우, 단일 컬럼을 지정하는 `@MapKeyColumn`은 무시됩니다. 대신 객체 내부의 개별 필드명을 바꾸려면 `@MapKeyAttributeOverride`를 사용해야 합니다. 별도 설정이 없다면 **Key 객체의 NOT NULL인 모든 필드 + 부모 FK**가 결합하여 DB의 복합 기본키(PK)가 됩니다.

```java
// Key: 국가 정보
@Embeddable
public class Country {
    private String isoCode; // 예: "KR", "US"
    private String countryName;

    protected Country() {}
    public Country(String isoCode, String countryName) {
        this.isoCode = isoCode;
        this.countryName = countryName;
    }

    // equals/hashCode ...
}

// Value: 여권 상세 정보
@Embeddable
public class PassportInfo {
    private String passportNumber;
    private LocalDate expiryDate;

    protected PassportInfo() {}
    public PassportInfo(String passportNumber, LocalDate expiryDate) {
        this.passportNumber = passportNumber;
        this.expiryDate = expiryDate;
    }
    
    // equals/hashCode ...
}
```

```java
@Entity
public class Member {
    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @ElementCollection
    @CollectionTable(
        name = "MEMBER_PASSPORTS",
        joinColumns = @JoinColumn(name = "MEMBER_ID")
    )
    // Map의 Key(Country) 설정: 객체의 필드를 컬럼으로 매핑
    // 별도 설정이 없으면 Country의 필드명이 그대로 컬럼명이 됩니다.
    private Map<Country, PassportInfo> passports = new HashMap<>();

    public void addPassport(Country country, PassportInfo info) {
        this.passports.put(country, info);
    }
}
```





# 3. 엔티티 연관관계 매핑

값 타입은 엔티티에 완전히 종속적인 관계를 가졌습니다. 식별자도 없으며 독립적인 생명주기도 가지지 못하였습니다. 이와는 반대되는 개념이 엔티티입니다. 엔티티는 고유한 식별자(PK)가 있고, 독립적으로 저장, 삭제, 조회가 가능합니다.

엔티티 연관관계에서는 **FK를 항상 many**에 두는 편이 자연스럽습니다. DB 관점에서 many의 테이블이 one의 테이블의 FK를 가지기 때문입니다. 다음은 ORM에서 가장 중요한 원칙입니다.

> FK를 가진 쪽이 연관관계의 주인입니다.


## 단방향 연관관계

가장 이상적이고 단순한 엔티티 연관관계는 FK를 소유한 주인 쪽에 ManyToOne을 지정하는 것입니다.

#### @ManyToOne
여러 `Member`(Many)편 객체가 하나의 `Team`(One)편 객체를 참조한다는 의미의 어노테이션입니다.

#### @fetch = FetchType.LAZY
`Member`(Many)편 객체를 조회할 때 `Team`(One)편 객체를 즉시 로딩하지 않고, 호출 시점이 되어서야 조회한다.

#### @JoinColumn
- `name = "...”`

  FK 컬럼 이름을 지정합니다.

- `nullable = false`

  Many편 객체는 반드시 One편 객체를 참조해야 합니다. 이 설정을 빠트리면 Many편 객체가 연관관계가 없는 고아 데이터가 생길 수 있으므로 주의해야 합니다.

```java
// 일(One) 편: 단방향 매핑에서는 대상 엔티티에 아무런 추가 코드가 필요 없습니다.
@Entity
public class Team {
    @Id
    @GeneratedValue
    @Column(name = "TEAM_ID")
    private Long id;
    
    private String name;
}

// 다(Many) 편: 외래키를 가지는 연관관계의 주인
@Entity
public class Member {
    @Id
    @GeneratedValue
    @Column(name = "MEMBER_ID")
    private Long id;
    
    private String username;

    // 단방향 연관관계 매핑
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TEAM_ID", nullable = false) 
    private Team team;
}
```


## 양방향 연관관계
One에서도 Many를 조회하고 싶다면, 양방향 연관관계를 만들어야 합니다.

#### @OneToMany
- `mappedBy`
  이 컬렉션은 Many(`Member`)의 엔티티가 관리하는 외래키 필드(`team`)에 의해 매핑되었음을 선언합니다. 다시 말해, 다음과 같은 의미를 지닙니다.

    - 외래키(FK)는 다(Many) 쪽 테이블에 존재한다.
    - 다(Many) 쪽의 `@ManyToOne`에서 이미 외래키 관리가 이루어진다.
    - 일(One) 쪽의 `@OneToMany`는 읽기 전용(조회용)이며, 외래키를 생성하거나 관리하지 않는다.
- `fetch = FetchType.LAZY`
  컬렉션 기본값은 LAZY입니다. One을 조회할 때마다 모든 Many를 조회하는 것은 성능 문제가 발생합니다.

```java
@Entity
public class Team {
    @Id
    @GeneratedValue
    @Column(name = "TEAM_ID")
    private Long id;
    
    private String name;

    // 양방향 매핑: Member 엔티티의 'team' 필드에 의해 매핑됨을 명시 (읽기 전용)
    @OneToMany(mappedBy = "team")
    private List<Member> members = new ArrayList<>();
}
```

- `mappedBy`는 반드시 주인의 속성 이름 `team`과 정확히 일치해야 합니다.

양방향의 이점은 **객체 그래프의 탐색과 영속성 전이(Cascade)를 사용할 수 있다**는 점입니다. 그러나 그만큼 양방향 매핑은 복잡성이 증가하고 성능 문제가 발생할 수 있으므로 항상 신중하게 결정해야 합니다.


## 상태 전이(Cascade)
상태 전이는 엔티티를 저장, 삭제와 같이 상태가 변화할 때, 그 작업을 연관된 엔티티에도 함께 적용(호출)해주는 기능입니다. 이 기능을 사용하지 않으면 연관된 엔티티들을 각각 별도로 관리해야 합니다.

단, 상태 전이가 된다고 해서 객체 간의 참조가 자동으로 연결되는 것은 아니므로, DB에 외래 키(FK)가 정상적으로 저장되려면 **연관관계 편의 메서드**를 통해 주인 엔티티에 부모 객체를 꼭 할당해줘야 합니다.


#### 상태 전이 유형

| CascadeType | 설명 |
| --- | --- |
| `PERSIST` | 저장할 때 연관 객체도 함께 저장 |
| `MERGE` | 병합할 때 연관 객체도 함께 병합 |
| `REMOVE` | 삭제할 때 연관 객체도 함께 삭제 |
| `REFRESH` | 새로 고침할 때 연관 객체도 함께 새로 고침 |
| `DETACH` | 영속성 컨텍스트에서 분리할 때 같이 분리 |
| `ALL` | 위의 모든 cascade 동작 포함 |


```java
@Entity
public class Team {
    @Id
    @GeneratedValue
    @Column(name = "TEAM_ID")
    private Long id;
    
    private String name;

    @OneToMany(mappedBy = "team", cascade = CascadeType.PERSIST)
    private List<Member> members = new ArrayList<>();
}
```

이렇게 하면, `Team`을 저장할 때, 컬렉션에 있는 `Member`가 자동으로 같이 저장됩니다.

cascade 설정은 남용하면 의도치 않게 데이터가 저장되거나 삭제될 수 있으므로, 종속 관계를 잘 따져서 적용해야 합니다.


## 고아 객체 삭제(Orphan Removal)

**Orphan Removal**은 부모 엔티티의 컬렉션에서 자식 엔티티가 제거되었을 때, JPA가 그 자식을 자동으로 데이터베이스에서도 삭제해주는 기능입니다. 즉, 부모 엔티티와의 연결이 끊어진 자식 엔티티를 고아라고 부릅니다.

#### orphanRemoval = true
```java
@Entity
public class Team {
    @Id
    @GeneratedValue
    @Column(name = "TEAM_ID")
    private Long id;

    @OneToMany(mappedBy = "team", 
               cascade = CascadeType.ALL,
               orphanRemoval = true) // 고아 객체 설정 활성화
    private List<Member> members = new ArrayList<>();

    // ... 연관관계 편의 메서드 (addMember 등)
}
```

이제 리스트에서 멤버를 제외하면(`team.getMembers().remove(member)`), 트랜잭션 커밋 시 해당 `member`가 삭제됩니다.

이 옵션은 **자식 엔티티가 여러 부모에 의해 공유될 때** 특히 주의해야 합니다. 부모 한 곳에서 참조를 끊어 자식이 삭제되면, 그 자식을 참조하던 다른 엔티티에서 데이터가 사라져 런타임 에러(예외)가 발생할 수 있기 때문입니다. 따라서 고아 객체 제거는 자식 엔티티가 **단 하나의 부모에게만 완전히 종속**될 때만 사용해야 합니다.