---
slug: entity-association-mapping
title: 엔티티 연관관계 매핑
category: JPA
date: 2026-04-18
summary: 엔티티 간 관계에 따른 다양한 전략을 알아봅니다.
---

엔티티 간 연관관계, 특히 컬렉션이 포함된 엔티티 간 연관관계는 그만큼 복잡도가 올라가기 때문에 정말 이것이 필요한지를 먼저 고민하는 것이 중요합니다. 컴포넌트 매핑과 `@ManyToOne` 매핑만으로도 웬만한 애플리케이션을 만드는 데 큰 무리가 없습니다. 따라서 정말 필요한 경우에만 선택적으로 사용하는 것이 좋습니다.



# 1. 일대일 연관관계
컴포넌트 값 타입과 비교해보았을 때, 엔티티 간 일대일 연관관계의 가장 큰 이점은 **공유 참조가 가능하다**는 점입니다. 독립적인 테이블을 가지게 되는 엔티티의 특성상 여러 엔티티에서 참조하기가 편리합니다.


## 1. 기본키 공유 전략
1:1 관계에서 두 테이블의 행이 같은 PK 값을 공유합니다. 다시 말해, 두 객체가 저장될 때 같은 PK를 가져야 합니다.


#### 대상 엔티티
먼저 ID를 생성할 주체인 상세 정보 엔티티입니다.
```java
@Entity
public class MemberDetail {
    @Id
    @GeneratedValue
    private Long id;

    private String address;
    private String phoneNumber;

    // 기본 생성자, Getter/Setter
}
```


#### 주 엔티티
상세 정보의 ID를 그대로 자신의 PK로 사용하는 엔티티입니다.
```java
@Entity
@Table(name = "MEMBERS")
public class Member {
    @Id
    private Long id; // @GeneratedValue가 없습니다!

    private String name;

    @OneToOne(optional = false, cascade = CascadeType.ALL)
    @PrimaryKeyJoinColumn
    private MemberDetail detail;

    public Member() {}

    public Member(Long id, String name) {
        this.id = id;
        this.name = name;
    }
}
```

- `@PrimaryKeyJoinColumn`: 자신(`Member`)의 PK를 상대방(`MemberDetail`)의 PK와 맞춥니다.
- `@OneToOne` : 일대일 매핑을 지정합니다.
    - `optional = false` : 반드시 상대 객체를 가져야 하므로, false로 지정합니다.
    - `casecade = CascadeType.ALL` : 상태 전이 속성을 전체로 지정합니다.


#### 저장하는 방법
기본 키 공유 전략은 ‘누가 ID를 만드는가’와 ‘그 값을 어떻게 복사해주는가’가 가장 중요합니다.

```java
@Transactional
public void saveMember() {
    // 1. 상세 정보 객체를 먼저 만듭니다.
    MemberDetail detail = new MemberDetail();
    detail.setAddress("서울시 강남구");
    detail.setPhoneNumber("010-1234-5678");

    // 2. 상세 정보를 먼저 DB에 저장하여 ID를 발급받습니다.
    detailRepository.save(detail);

    // 3. 발급받은 ID를 Member의 ID로 직접 넣어주며 생성합니다.
    Member member = new Member(detail.getId(), "홍길동");
    member.setDetail(detail);

    // 4. 이제 Member를 저장합니다. Member의 ID도 MemberDetail의 ID와 같습니다.
    memberRepository.save(member);
}
```


#### 문제점
기본 키 공유 전략은 기본적으로 다음과 같은 문제를 가집니다.

- **저장 순서가 정해져 있습니다**
  반드시 `MemberDetail`을 먼저 저장하고 그 ID를 가져와야 합니다.

- **지연 로딩의 제약이 생깁니다**
  `@OneToOne` 관계에서 지연 로딩 프록시는 **`optional = false`일 때만 제대로 작동**합니다. 만약 nullable 하다면, 하이버네이트는 값이 null인지 아닌지 확인하기 위해 테이블을 조회해야 하기 때문입니다. 이는 즉시 로딩의 동작과 다름이 없습니다.


#### 해결책(`@GenericGenerator(strategy = "foreign")`)
이와 같은 문제를 해결하려면, 하이버네이트에서 제공하는 `@GenericGenerator(strategy = "foreign")`를 사용할 수 있습니다. 연관관계의 주인 쪽에서 ID 필드에 설정하면, `mappedBy` 되어 있는 반대 쪽의 ID 필드 값을 가져와 그 값을 사용합니다.


#### 주인 엔티티: Member (ID를 먼저 생성하는 쪽)
`Member`는 평범한 엔티티처럼 자신의 ID를 스스로 생성합니다. 다만, 양방향 관계를 위해 상세 정보를 참조합니다.

```java
@Entity
@Table(name = "MEMBERS")
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToOne(
        mappedBy = "member", // MemberDetail의 'member' 필드가 주인임을 표시
        cascade = CascadeType.PERSIST // Member를 저장할 때 Detail도 함께 저장!
    )
    private MemberDetail detail;

    // 생성자, Getter/Setter
    public void setDetail(MemberDetail detail) {
        this.detail = detail;
        if (detail.getMember() != this) {
            detail.setMember(this); // 양방향 편의 메소드
        }
    }
}
```


#### 종속 엔티티: MemberDetail (ID를 빌려오는 쪽)
`@GenericGenerator`를 사용하여 자신의 ID를 직접 만들지 않고 **`member` 객체의 ID를 복사해 오도록** 설정합니다.

```java
@Entity
public class MemberDetail {
    @Id
    @GeneratedValue(generator = "detailKeyGenerator")
    @org.hibernate.annotations.GenericGenerator(
        name = "detailKeyGenerator",
        strategy = "foreign", // ID를 외부에서 가져옵니다.
        parameters = @org.hibernate.annotations.Parameter(
            name = "property", value = "member" // 그 외부 대상을 'member' 필드로 지정
        )
    )
    private Long id;

    private String address;

    @OneToOne(optional = false)
    @PrimaryKeyJoinColumn // PK를 공유하면서 조인하겠다는 선언
    private Member member;

    // 생성자에서 Member를 받으면 관계가 명확해집니다.
    public MemberDetail(Member member) {
        this.member = member;
    }
    
    // 기본 생성자, Getter/Setter
}
```


#### 실행 흐름
이제 ID로 인한 저장 순서를 지킬 필요가 없습니다. 하이버네이트가 알아서 처리합니다.

```java
@Transactional
public void saveMemberWithDetail() {
    // 1. 객체들 생성 (아직 ID들은 null 상태)
    Member member = new Member();
    member.setName("김철수");

    MemberDetail detail = new MemberDetail(member);
    detail.setAddress("부산광역시 해운대구");

    // 2. 관계 맺기
    member.setDetail(detail);

    // 3. Member만 저장! 
    // 이때 Hibernate는:
    //   A. Member를 먼저 INSERT 해서 ID를 얻어옵니다.
    //   B. Detail의 ID를 Member와 똑같은 ID로 자동으로 설정합니다.
    //   C. Detail을 INSERT 합니다.
    memberRepository.save(member);
}
```



## 2. 외래키 조인 전략
PK를 공유하는 전략과 달리 일반적인 외래키 컬럼을 사용합니다. 외래키 조인 컬럼은 반드시 UNIQUE 해야 합니다. 여러 엔티티가 참조하게 되면 일대다 관계가 되어버리기 때문입니다.

```java
@Entity
public class Member {
    @Id
    @GeneratedValue
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST, optional = false)
    @JoinColumn(name = "MEMBER_DETAIL_ID", unique = true) // FK 컬럼명 직접 지정
    private MemberDetail detail;
}

@Entity
public class MemberDetail {
    @Id
    @GeneratedValue
    private Long id; // 자신만의 독립적인 ID를 가짐
    private String address;
}
```

- `@JoinColumn(unique = true)` : 외래키 컬럼을 만들며, `unique = true` 설정으로 DB 수준에서 일대일 관계가 엄격히 관리됩니다.

외래키 조인 전략에서는 LAZY 옵션이 정상적으로 작동합니다. 앞서 공유키 전략의 경우 nullable 여부를 DB에서 확인해야 했지만, 외래키 전략의 경우 FK 값만으로 상대 측의 존재 여부를 판단할 수 있기 때문입니다.



## 3. 조인 테이블 전략
nullable 컬럼은 NULL 처리의 어려움과 unique 제약과의 충돌로 인해 문제가 발생할 수 있습니다. **optional한 관계**에서는 외래키 전략을 사용하기보다는 중간 테이블을 쓰는 것이 명확합니다. 중간 테이블의 행 유무로 관계가 있는지 없는지를 쉽게 판별할 수 있고, null 문제도 피할 수 있기 때문입니다.

**조인 테이블**을 사용하면,
- 연결된 데이터가 있을 때만 조인 테이블에 행(Row)을 추가합니다.
- 연결이 없으면 조인 테이블에 아무것도 적지 않습니다.


### 시나리오

`STUDENT`와 `LOCKER` 관계에서 학생은 사물함을 가질 수도 있고 아닐 수도 있습니다.
조인 테이블 전략을 쓰면, 학생 테이블에도, 사물함 테이블에도 서로를 가리키는 외래 키(FK)가 없습니다. 오직 중간에 있는 `STUDENT_LOCKER` 테이블이 누가 어떤 사물함을 쓰는지 관리합니다.


#### 주인 엔티티: 학생(Student)
```java
@Entity
public class Student {
    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinTable(
        name = "STUDENT_LOCKER", // 조인 테이블의 이름
        joinColumns = 
            @JoinColumn(name = "STUDENT_ID"), // 현재 엔티티(Student) 쪽 컬럼
        inverseJoinColumns = 
            @JoinColumn(
                name = "LOCKER_ID", 
                nullable = false, 
                unique = true // 1:1 관계를 보장
            )
    )
    private Locker locker;

    public Student() {}
    public Student(String name) { this.name = name; }
    
    // Getter, Setter...
}
```


#### 종속 엔티티: 사물함(Locker)
```java
@Entity
public class Locker {
    @Id
    @GeneratedValue
    private Long id;

    private String lockerNumber;

    // 양방향 관계가 필요하다면 추가 (선택 사항)
    @OneToOne(mappedBy = "locker")
    private Student student;

    public Locker() {}
    public Locker(String lockerNumber) {
        this.lockerNumber = lockerNumber;
    }

    // Getter, Setter...
}
```


#### 데이터베이스 테이블 구조
이 코드가 실행되면 DB에는 다음과 같은 구조가 만들어집니다.

- **STUDENTS**: `ID(PK)`, `NAME` (학생 정보만 깔끔하게 보관)
- **LOCKERS**: `ID(PK)`, `LOCATION` (사물함 정보만 깔끔하게 보관)
- **STUDENT_LOCKER (조인 테이블)**:
    - `STUDENT_ID (PK, FK)`: 특정 학생이 여기에 등록됩니다. PK이므로 한 학생은 명부에 두 번 적힐 수 없습니다.
    - `LOCKER_ID (Unique, FK)`: 특정 사물함이 여기에 등록됩니다. Unique 제약 조건 덕분에 이미 누군가 쓰고 있는 사물함은 다시 등록될 수 없습니다.

---


# 2. 일대다 연관관계

## 1. Bag의 장점

`Bag`은 **순서가 없고 중복을 허용하는 컬렉션**으로 성능이 가장 뛰어납니다. `List`처럼 인덱스를 관리할 필요도 없으며, `Set`처럼 중복 검사도 하지 않습니다. 이로 인해 컬렉션을 DB에서 로딩하지 않고도 새 요소를 추가할 수 있습니다.

따라서 일대다 연관관계에서는 연관 관계 주인의 반대 쪽(비주인)에 `Bag`을 고려해볼 수 있습니다. 중복을 허용한다고 해서 실제 DB에 같은 행이 여러 번 저장되지는 않습니다. DB의 업데이트 주체는 `@ManyToOne` 쪽이기 때문입니다.

SELECT로 컬렉션을 초기화하지 않고 INSERT가 가능하다는 것이 Bag의 최대 장점입니다.


### 시나리오
학생(`STUDENT`)은 과목별로 여러 성적(`GRADE`)을 가질 수 있습니다.


#### 학생(Student) 엔티티 매핑
`Collection` 인터페이스와 `ArrayList`를 사용해 Bag으로 선언합니다.

```java
@Entity
public class Student {
    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @OneToMany(mappedBy = "student")
    private Collection<Grade> grades = new ArrayList<>(); // Bag 컬렉션 생성

    public void addGrade(Grade grade) {
        this.grades.add(grade);
        grade.setStudent(this);
    }
    
    // Getter, Setter...
}
```


#### 성적(Grade) 엔티티 매핑

실제 DB에서 학생의 ID(`STUDENT_ID`)를 외래 키로 가지고 있는 쪽입니다.

```java
@Entity
public class Grade {
    @Id
    @GeneratedValue
    private Long id;

    private String subject;
    private int score;

    @ManyToOne
    @JoinColumn(name = "STUDENT_ID")
    private Student student;

    // 생성자, Getter, Setter...
}
```


#### 실행 흐름

자바 메모리 상에서는 중복 추가가 가능하지만, DB에서 다시 조회해보면, 중복 데이터는 무시되고 실제 저장된 데이터는 하나만 나타납니다.

```java
@Transactional
public void testBag() {
    Student student = new Student("김철수");
    studentRepository.save(student);

    Grade math = new Grade("수학", 95, student);
    
    // 1. 자바 메모리상에서는 중복 추가가 가능합니다.
    student.addGrade(math);
    student.addGrade(math); 
    
    // 메모리에서는 2개로 보입니다.
    System.out.println(student.getGrades().size()); // 결과: 2

    gradeRepository.save(math);
    
    // 2. 하지만 다시 DB에서 조회해 오면?
    // 실제 DB 연관관계의 주인은 Grade의 student 필드이므로, 
    // 중복된 데이터는 무시되고 실제 저장된 1개만 나타납니다.
    Student savedStudent = studentRepository.findById(student.getId()).get();
    System.out.println(savedStudent.getGrades().size()); // 결과: 1
}
```


## 2. List를 쓰지 않는 이유

`List`는 순서가 있기 때문에 index를 관리하는 컬럼이 필요합니다. index 컬럼은 0부터 시작하며 값이 항상 연속적입니다. 중간에 비어 있으면 안 된다는 의미입니다. 이러한 특성으로 인해 List 컬렉션에서 변동이 일어나면 기존 요소들의 index들을 모두 UPDATE해야 하는 상황이 발생합니다.

따라서 List 컬렉션은 되도록이면 사용을 하지 않는 것이 성능 상 유리하고, 사용한다면 List 컬렉션은 매핑하지 말고 @ManyToOne으로 단방향 매핑하여 필요할 경우에만 쿼리로 가져오는 것이 좋습니다.


### 시나리오

학생(`STUDENT`)이 시험을 치른 순으로 성적(`GRADE`)을 저장해야 합니다.


#### 주인 엔티티: 학생 (Student)

리스트 매핑에서는 특이하게도 **'일(1)'** 쪽인 `Student`가 리스트의 순서를 관리하는 주인이 됩니다.

```java
@Entity
public class Student {
    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @OneToMany
    @JoinColumn(
        name = "STUDENT_ID", // GRADE 테이블에 생성될 FK 컬럼
        nullable = false
    )
    @OrderColumn(
        name = "EXAM_ORDER", // 성적표의 순서(0, 1, 2...)를 저장할 컬럼
        nullable = false
    )
    private List<Grade> grades = new ArrayList<>();

    // 편의 메소드: 리스트에 추가하면 순서대로 저장됩니다.
    public void addGrade(Grade grade) {
        this.grades.add(grade);
    }
}
```

- `List<Grade>`: `Collection`이 아닌 `List`를 사용해야 순서 번호를 매길 수 있습니다.
- `@OrderColumn`: DB의 `GRADE` 테이블에 `EXAM_ORDER`라는 컬럼이 생기고, 리스트의 index(0, 1, 2...) 값이 저장됩니다.


#### 종속 엔티티: 성적표 (Grade)

양방향 관계를 만들고 싶다면, `Grade` 쪽에서도 `Student`를 참조하게 만듭니다. 하지만 리스트 순서 권한은 이미 학생에게 있으므로, 여기서는 **읽기 전용**으로 설정하는 것이 핵심입니다.

```java
@Entity
public class Grade {
    @Id
    @GeneratedValue
    private Long id;

    private String subject;
    private int score;

    @ManyToOne
    @JoinColumn(
        name = "STUDENT_ID",
        insertable = false, // 학생 쪽 @JoinColumn과 충돌하지 않도록 설정
        updatable = false   // 읽기 전용 참조
    )
    private Student student;

    // 생성자, Getter/Setter...
}
```


#### GRADE 테이블의 구조

| **ID** | **SUBJECT** | **SCORE** | **STUDENT_ID (FK)** | **EXAM_ORDER (Index)** |
| --- | --- | --- | --- | --- |
| 1 | 수학 | 90 | 500 (철수) | **0** |
| 2 | 영어 | 85 | 500 (철수) | **1** |
| 3 | 과학 | 95 | 500 (철수) | **2** |



## 3. 조인 테이블 전략

선택적(Optional) 연관 관계에서는 언제나 조인 테이블을 고려해보는 것이 좋습니다. 조인 테이블을 사용하지 않으면, NULL이 들어올 수 있기 때문에 데이터 품질을 떨어뜨릴 수 있기 때문입니다. 가능하면 외래키는 NULL로 두기보다 조인 테이블로 표현하여 관계를 명확히 하고 무결성을 강화하는 편이 좋습니다.


### 시나리오

- 하나의 동아리(`CLUB`)는 여러 학생(`STUDENT`)이 들어올 수 있습니다.
- 희망하는 학생(`STUDENT`)은 하나의 동아리(`CLUB`)에 선택적으로 가입할 수 있습니다.


#### 주인 엔티티: 학생 (Student)

데이터베이스 설계 관점에서 `NULL`을 피하기 위해, 학생 쪽에서 동아리와의 관계를 **조인 테이블**로 설정합니다. `@ManyToOne` 어노테이션과 `@JoinTable`을 함께 사용합니다.

```java
@Entity
public class Student {
    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinTable(
        name = "CLUB_MEMBERSHIP", // 연결 테이블(명부) 이름
        joinColumns = 
            @JoinColumn(name = "STUDENT_ID"), // 현재 엔티티(학생)를 가리키는 FK
        inverseJoinColumns = 
            @JoinColumn(
                name = "CLUB_ID", 
                nullable = false // 동아리 정보는 반드시 있어야 함
            )
    )
    private Club club;
    
    // 생성자, Getter, Setter...
}
```

- `@JoinTable`: 이 설정 덕분에 `STUDENTS` 테이블에는 `CLUB_ID` 컬럼이 생기지 않습니다. 대신 `CLUB_MEMBERSHIP`이라는 별도의 테이블이 생깁니다.
- **Optional의 처리**: 동아리에 가입하지 않은 학생은 `CLUB_MEMBERSHIP` 테이블에 아예 기록되지 않으므로 `NULL`이 발생하지 않습니다.


#### 종속 엔티티: 동아리 (Club)

동아리 쪽에서는 학생들을 컬렉션으로 참조합니다. 실제 매핑 설정은 학생 쪽에 있으므로 `mappedBy`를 사용합니다.

```java
@Entity
public class Club {
    @Id
    @GeneratedValue
    private Long id;

    private String clubName;

    @OneToMany(mappedBy = "club") // Student 엔티티의 'club' 필드에 의해 관리됨
    private Set<Student> members = new HashSet<>();

    // 생성자, Getter, Setter 생략
}
```


#### 데이터베이스 테이블 구조

이 코드가 실행되면 DB에는 다음과 같은 구조가 만들어집니다.

1. **STUDENTS**: `ID`, `NAME` (동아리 정보 없음!)
2. **CLUBS**: `ID`, `CLUB_NAME`
3. **CLUB_MEMBERSHIP (조인 테이블)**:
    - `STUDENT_ID (PK, FK)`: 학생 한 명은 이 명부에 딱 한 번만 올라올 수 있습니다. (1:N 보장)
    - `CLUB_ID (FK)`: 여러 학생이 같은 동아리 ID를 가질 수 있습니다.


---


# 3. 다대다 연관관계

## 1. JoinTable 생성

다대다 관계에서는 단방향이든 양방향이든 중간 테이블(Join Table)이 필요합니다. 연관 관계의 주인 쪽에 `@JoinTable`을 이용하여 중간 테이블을 생성합니다. 중간 테이블의 기본키는 연관관계를 형성하는 **각각의 엔티티의 PK를 합쳐 복합키**로 만들어 줍니다.

컬렉션은 Set이 가장 적합합니다. DB의 중간 테이블은 복합 기본키로 구성되며 중복 링크를 허용하지 않습니다. 그렇다면 자바 컬렉션도 중복을 허용하지 않는 구조가 가장 자연스럽습니다.

`CascadeType.REMOVE`는 사용하지 않는 편이 좋습니다. 다대다는 특정 엔티티가 하나에만 속한 것이 아니라 여러 곳에 속해 있을 수 있기 때문입니다. 따라서 `CascadeType.REMOVE`나 `orphanRemoval` 속성을 사용하는 것은 위험합니다.


### 시나리오

- 한 명의 학생(`STUDENT`)은 여러 수업(`COURSE`)을 수강 신청할 수 있습니다.
- 하나의 수업(`COURSE`)에는 여러 명의 학생(`STUDENT`)이 출석합니다.


#### 데이터베이스 구조

다대다 관계는 중간에 **수강신청 명부** 같은 테이블이 반드시 필요합니다.

- **STUDENTS**: `ID`, `NAME`
- **COURSES**: `ID`, `TITLE`
- **STUDENT_COURSE (조인 테이블)**:
    - `STUDENT_ID (FK)`: 학생을 가리킴
    - `COURSE_ID (FK)`: 수업을 가리킴
    - **PK**: `(STUDENT_ID, COURSE_ID)`의 조합 (한 학생이 같은 수업을 두 번 신청할 수 없음)


#### 학생(Student) 엔티티: 관계의 주인

연관 관계의 주인인 학생 엔티티에서 조인 테이블 설정을 해줍니다.

```java
@Entity
public class Student {
    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @ManyToMany(cascade = CascadeType.PERSIST)
    @JoinTable(
        name = "STUDENT_COURSE", // 조인 테이블 이름
        joinColumns = @JoinColumn(name = "STUDENT_ID"),      // 현재 엔티티(학생) FK
        inverseJoinColumns = @JoinColumn(name = "COURSE_ID") // 반대 엔티티(수업) FK
    )
    private Set<Course> courses = new HashSet<>();

    // 편의 메소드: 양방향 관계를 한 번에 맺어줍니다.
    public void addCourse(Course course) {
        this.courses.add(course);
        course.getStudents().add(this);
    }
}
```

- 다대다 연관관계이므로, `@ManyToMany`를 사용합니다.


#### 수업(Course) 엔티티: 관계의 종속

수업 쪽에서는 `mappedBy`를 사용하여 학생 쪽 필드에 매핑되어 있음을 알려줍니다.

```java
@Entity
public class Course {
    @Id
    @GeneratedValue
    private Long id;

    private String title;

    @ManyToMany(mappedBy = "courses") // Student 클래스의 courses 필드에 매핑
    private Set<Student> students = new HashSet<>();
}
```


#### 실행 흐름

```java
@Transactional
public void enrollmentExample() {
    // 1. 수업 생성
    Course javaCourse = new Course("자바 마스터 클래스");
    Course dbCourse = new Course("데이터베이스의 이해");

    // 2. 학생 생성
    Student student1 = new Student("김철수");
    Student student2 = new Student("이영희");

    // 3. 수강 신청 (서로 연결)
    student1.addCourse(javaCourse);
    student1.addCourse(dbCourse);   // 철수는 자바와 DB 둘 다 들음
    student2.addCourse(javaCourse); // 영희는 자바만 들음

    // 4. 저장 (CascadeType.PERSIST 덕분에 학생만 저장해도 수업이 저장됨)
    studentRepository.save(student1);
    studentRepository.save(student2);
}
```


## 2. 중간 엔티티 생성

중간 테이블에는 단순히 복합 기본키와 외래키로 링크만 저장하는 것이 아니라 이외의 추가 정보(생성자 정보, 날짜 정보, 상태 정보 등)가 필요할 수 있습니다. 이와 같은 경우에는 숨겨지는 단순 `@JoinTable` 보다는 명시적인 엔티티로 중간 테이블을 표현하는 것이 좋습니다. 엔티티로 승격함으로써 각각의 엔티티는 중간 엔티티와 일대다 관계가 됩니다.


### 시나리오

학생(`STUDENT`) ↔ 수강신청(`ENROLLMENT`) ↔ 수업(`COURSE`)의 관계로, 일대다로 풀 수 있습니다.

- **Student (1) ↔ Enrollment (N)**: 한 학생은 여러 번 수강신청을 할 수 있습니다.
- **Course (1) ↔ Enrollment (N)**: 한 수업에는 여러 개의 수강신청 데이터가 쌓입니다.
- **Enrollment (중간 엔티티)**: 수강 날짜, 성적 등 추가 정보를 담는 중간 엔티티입니다.


#### 수강신청(Enrollment) 엔티티 구현

가장 핵심이 되는 중간 엔티티입니다. 학생 ID와 수업 ID를 합친 **복합 키**를 사용합니다.

```java
@Entity
@Table(name = "STUDENT_COURSE")
public class Enrollment {

    @Embeddable
    public static class Id implements Serializable {
        @Column(name = "STUDENT_ID")
        private Long studentId;
        @Column(name = "COURSE_ID")
        private Long courseId;
        
        // 기본 생성자, equals, hashCode 구현 필수
    }

    @EmbeddedId
    private Id id = new Id();

    // 추가하고 싶은 데이터 필드
    private LocalDateTime enrolledDate;
    private String grade; // 성적 (A+, B... 등)

    @ManyToOne
    @JoinColumn(name = "STUDENT_ID", insertable = false, updatable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "COURSE_ID", insertable = false, updatable = false)
    private Course course;

    public Enrollment(Student student, Course course, String grade) {
        this.student = student;
        this.course = course;
        this.grade = grade;
        this.enrolledDate = LocalDateTime.now();
        
        // 복합 키 값 설정
        this.id.studentId = student.getId();
        this.id.courseId = course.getId();
        
        // 양방향 편의 로직
        student.getEnrollments().add(this);
        course.getEnrollments().add(this);
    }
    
    protected Enrollment() {} // JPA용 기본 생성자
}
```

- `@Immutable`: 한 번 생성된 연결 데이터는 수정하지 않겠다고 선언합니다. Hibernate가 변경 감지(Dirty Checking)를 하지 않아 성능이 좋아집니다.
- `@EmbeddedId`: 두 테이블의 PK를 합쳐서 자신의 PK로 쓰는 방식입니다.
- `insertable/updatable = false`: 실제 값은 `Id` 클래스 내의 필드들이 관리하므로, 연관 관계 필드는 읽기 전용으로 설정합니다.


#### 학생(Student) 및 수업(Course) 엔티티

이제 두 엔티티는 서로를 직접 참조하지 않고, `Enrollment`를 통해 연결됩니다.

```java
// Student.java
@Entity
public class Student {
    @Id
    @GeneratedValue
    private Long id;
    private String name;

    @OneToMany(mappedBy = "student")
    private Set<Enrollment> enrollments = new HashSet<>();
}

// Course.java
@Entity
public class Course {
    @Id
    @GeneratedValue
    private Long id;
    private String title;

    @OneToMany(mappedBy = "course")
    private Set<Enrollment> enrollments = new HashSet<>();
}
```


#### 실행 흐름

단순히 컬렉션에 객체를 넣는 게 아니라, '수강신청'이라는 행위(객체)를 직접 생성하여 저장합니다.

```java
@Transactional
public void processEnrollment() {
    // 1. 학생과 수업을 조회/저장해둔 상태
    Student student = studentRepository.save(new Student("김철수"));
    Course course = courseRepository.save(new Course("JPA 프로그래밍"));

    // 2. 수강신청 생성
    Enrollment enrollment = new Enrollment(student, course, "A+");

    // 3. 수강신청 엔티티 저장
    enrollmentRepository.save(enrollment);
}
```