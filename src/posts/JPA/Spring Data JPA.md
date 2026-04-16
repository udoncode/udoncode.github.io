---
slug: spring-data-jpa
title: Spring Data JPA
category: JPA
date: 2026-04-16
summary: Spring Data JPA의 개념과 기능 톺아보기
---

Spring Data는 다양한 데이터베이스 기술을 일관된 방식으로 사용할 수 있도록 추상화 계층을 제공하는 기술입니다. 이 덕분에 개발자는 적은 코드로도 여러 데이터베이스를 쉽게 다룰 수 있습니다.



# 1. Spring Data JPA란?

## 1. 구조

Spring Data는 2계층으로 구성됩니다.

- **Spring Data Commons:** 모든 Spring Data 프로젝트에서 사용하는 공통 기능 모듈
- **JPA Provider:** JPA 명세에 따라 데이터베이스와 상호작용하는 구현체 (예: Hibernate)

Spring Data JPA는 Spring Data Commons의 기능을 확장하여 JPA Provider와 같은 구현체 위에서 동작하는 추가적인 계층입니다.

## 2. 주요 기능

Spring Data JPA는 아래와 같은 기능을 제공하여 JPA의 사용을 쉽게 만들어 줍니다.

- `Datasource` 설정을 자동으로 처리합니다.
- `EntityManagerFactory` 빈을 자동 구성합니다.
- `TransactionManager` 빈을 자동 구성합니다.
- `@Transactional` 어노테이션 기반 트랜잭션 처리를 할 수 있도록 해줍니다.

JPA 하나만 사용하기보다는 Spring Data의 기능을 이용하면 번거로운 설정을 자동화해 주므로 비즈니스 로직에만 집중할 수 있게 됩니다.

## 3. 사용 흐름

Spring Data JPA를 사용하려면, 다음과 같은 단계를 거칩니다.

**1) pom.xml에 의존성을 추가합니다.**

```xml
<dependency>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

이외에도 데이터베이스와의 연결을 위한 DBMS 드라이버와 편리한 스프링 활용을 위한 스프링 부트 스타터 의존성을 포함합니다.

**2) 엔티티 클래스를 작성합니다.**

```java
@Entity
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;    // 이름
    private Integer grade;  // 학년
    private Integer score;  // 점수

    // 기본 생성자, Getter, Setter...
}
```

**3) 리포지터리 인터페이스를 정의합니다.**

`Student` 엔티티를 관리할 리포지터리를 생성합니다. 인터페이스만 선언해도 스프링이 구현체를 자동으로 만들어 줍니다.

```java
public interface StudentRepository extends JpaRepository<Student, Long> {
    // 여기에 쿼리 메서드들을 추가하게 됩니다.
}
```

**4) application.properties를 설정합니다.**

```java
spring.datasource.url=jdbc:mysql://localhost:3306/CH04_SPRINGDATAJPA?serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=

spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=create
```

---

# 2. 쿼리 메서드

## 1. 쿼리 생성 규칙

Spring Data JPA는 메서드 이름만으로 쿼리를 생성할 수 있습니다. 단순히 CRUD를 넘어서 다양한 조건 기반 조회를 SQL을 직접 사용하지 않고 메서드 이름만으로 처리할 수 있습니다.

| **키워드** | **설명** | **예시 코드 (StudentRepository 내부)** |
| --- | --- | --- |
| **findBy, getBy** | 조회 메서드 접두사 | `List<Student> findByName(String name);` |
| **And, Or** | 복합 조건 | `List<Student> findByNameAndGrade(String name, Integer grade);` |
| **GreaterThan, LessThan** | 비교 조건 | `List<Student> findByScoreGreaterThanEqual(Integer score);` |
| **Like, Containing** | 패턴 매칭 | `List<Student> findByNameContaining(String keyword);` |
| **OrderBy** | 정렬 | `List<Student> findByGradeOrderByScoreDesc(Integer grade);` |
| **IgnoreCase** | 대소문자 무시 | `List<Student> findByNameIgnoreCase(String name);` |
| **In, NotIn** | 컬렉션 조회 | `List<Student> findByGradeIn(List<Integer> grades);` |

## 2. 결과 수 제한하기

메서드 이름에 `First`나 `Top`을 사용하여 반환되는 결과의 개수를 제한할 수 있습니다.

```java
// 가장 점수가 높은 학생 1명 조회
Student findFirstByOrderByScoreDesc();

// 특정 학년에서 점수가 높은 상위 3명 조회
List<Student> findTop3ByGradeOrderByScoreDesc(Integer grade);
```

## 3. 정렬하기

Spring Data JPA는 `Sort` 객체를 통해 파라미터로 정렬 기준을 전달할 수 있습니다. 메서드 이름에 길게 정렬 조건을 적는 것보다 유연하게 동적 정렬을 구현할 수 있습니다.

### 주요 메서드

- `Sort.by(Sort.Direction, String... properties)`: 정렬 방향(ASC/DESC)과 기준이 될 엔티티의 필드명을 지정하여 `Sort` 객체를 생성합니다.
- `.and()`: 여러 개의 정렬 조건을 연결하여 복합 정렬을 구성할 때 사용합니다.

```java
// 리포지터리 선언
// 특정 학년의 학생들을 조회하되, 정렬 기준은 파라미터로 동적으로 받음
List<Student> findByGrade(Integer grade, Sort sort);

// 1. 단일 정렬 조건: 점수(score) 기준 내림차순(DESC)
Sort sortByScoreDesc = Sort.by(Sort.Direction.DESC, "score");
List<Student> students = studentRepository.findByGrade(3, sortByScoreDesc);

// 2. 다중 정렬 조건: 점수 내림차순, 점수가 같으면 이름(name) 오름차순(ASC)
Sort multiSort = Sort.by(Sort.Direction.DESC, "score")
                     .and(Sort.by(Sort.Direction.ASC, "name"));
List<Student> sortedStudents = studentRepository.findByGrade(3, multiSort);
```

## 4. 페이징 처리하기

`Pageable`은 페이징 정보를 담고 있는 인터페이스고, `PageRequest`가 대표적인 구현 클래스입니다. 페이지 번호는 0부터 시작하며, 정렬 기준도 함께 설정 가능합니다. 반환 타입을 `Page`로 받으면 전체 페이지 수 등 다양한 부가 정보도 얻을 수 있습니다.

### 주요 메서드

- `PageRequest.of(int page, int size)`: 페이지 번호와 한 페이지당 가져올 데이터 개수를 지정하여 생성합니다. **(페이지 번호는 0부터 시작합니다)**
- `PageRequest.of(int page, int size, Sort sort)`: 페이징과 정렬을 동시에 적용할 수 있습니다.
- `Page<T>` (반환 타입): 조회된 데이터 목록뿐만 아니라 전체 데이터 수, 전체 페이지 수 등의 부가 정보를 함께 제공하는 인터페이스입니다. (내부적으로 COUNT 쿼리가 추가 실행됩니다.)

```java
// 리포지터리 선언
Page<Student> findByGrade(Integer grade, Pageable pageable);

// 1. 페이징 및 정렬 정보 생성: 0번째 페이지(첫 페이지), 10개씩 가져오기, 점수 내림차순 정렬
PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "score"));

// 2. 리포지터리 호출
Page<Student> studentPage = studentRepository.findByGrade(3, pageRequest);

// 3. Page 객체에서 제공하는 유용한 메서드 활용
List<Student> content = studentPage.getContent(); // 실제 조회된 학생 데이터 목록 (최대 10건)
long totalElements = studentPage.getTotalElements(); // 조건에 맞는 전체 학생 수 (COUNT 쿼리 결과)
int totalPages = studentPage.getTotalPages();     // 전체 페이지 수
int number = studentPage.getNumber();             // 현재 페이지 번호 (0)
int size = studentPage.getSize();                 // 페이지당 데이터 개수 설정값 (10)
boolean hasNext = studentPage.hasNext();          // 다음 페이지가 존재하는지 여부
boolean isFirst = studentPage.isFirst();          // 첫 번째 페이지인지 여부
```

## 5. 스트리밍 방식으로 결과 처리하기

`Streamable`은 `Iterable`의 대안으로, Java Stream처럼 동작할 수 있는 기능을 제공합니다. 반환된 데이터 위에서 함수형 스타일(map, filter 등)의 조작을 쉽게 할 수 있습니다.

```java
// 리포지터리 선언
Streamable<Student> findByNameContaining(String keyword);

// 실제 사용 예시 (이름에 '김'이 들어가는 학생 중 점수가 80점 이상인 학생만 필터링)
Streamable<Student> result = studentRepository.findByNameContaining("김");
List<Student> topStudents = result.stream().filter(s -> s.getScore() >= 80).toList();
```

## 6. @Query 애너테이션 사용하기

메서드 이름이 너무 길어지거나 복잡한 조인이 필요할 때, `@Query`를 사용하여 직접 쿼리를 명시적으로 작성할 수 있습니다.

- **JPQL (기본값):** 데이터베이스 테이블이 아닌 엔티티 객체를 대상으로 쿼리합니다.
- **Native SQL:** 특정 DB에 종속적인 SQL문을 직접 사용할 때 `nativeQuery = true`를 설정합니다.

```java
`// 1. JPQL 위치 기반 파라미터 (?1, ?2)
@Query("SELECT s FROM Student s WHERE s.name = ?1")
List<Student> findByNameWithJpql(String name);

// 2. JPQL 이름 기반 파라미터 (:파라미터명) - 권장
@Query("SELECT s FROM Student s WHERE s.grade = :grade")
List<Student> findByGradeWithJpql(@Param("grade") Integer grade);

// 3. Native SQL 사용
@Query(value = "SELECT * FROM student WHERE score >= 90", nativeQuery = true)
List<Student> findExcellentStudentsNative();`
```

## 7. 프로젝션

데이터 조회 시 엔티티의 전체 데이터가 아닌, 필요한 일부 속성만 골라올 때 프로젝션을 사용합니다.

### 1. 인터페이스 기반 프로젝션

Getter 메서드만 선언해두면 스프링이 알아서 매핑해 줍니다.

```java
// 이름만 가져오기 위한 인터페이스
public interface StudentNameOnly {
    String getName();
}

// 리포지터리 선언
List<StudentNameOnly> findByGrade(Integer grade);`
```

### 2. 클래스 기반 프로젝션 (DTO)

일반 Java 클래스(DTO)로 선언하여 생성자를 통해 필드를 매핑합니다. 프록시 객체가 아닌 실제 인스턴스가 생성되므로 명확하고 안정적입니다.

```java
// DTO 클래스
public class StudentDto {
    private String name;
    private Integer score;

    public StudentDto(String name, Integer score) {
        this.name = name;
        this.score = score;
    }
    // Getter 생략
}

// 리포지터리 선언
List<StudentDto> findByScoreGreaterThan(Integer score);`
```

## 8. 수정 쿼리 작성하기

데이터를 조회하는 것 외에, 직접 벌크 변경(Update)이나 삭제(Delete)를 수행할 수도 있습니다. 이때는 `@Query`와 함께 `@Modifying`을 추가해야 하며, 서비스 계층에 `@Transactional`이 반드시 보장되어야 합니다.

### 주요 애너테이션

- `@Modifying`: 해당 쿼리가 데이터베이스에 변경을 주는 `UPDATE`, `DELETE`, `INSERT` 쿼리임을 스프링 데이터 JPA에 알려줍니다. (SELECT 쿼리가 아님을 명시)
- `@Transactional`: 데이터 변경 작업이므로 트랜잭션 안에서 실행되어야 합니다. 일반적으로 비즈니스 로직을 처리하는 Service 계층의 메서드에 붙여서 사용합니다.

#### 리포지토리 메서드
```java
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    // 1. UPDATE: 특정 학년 학생들의 점수를 일괄적으로 올려주는 수정 쿼리
    // 수정되거나 삭제된 엔티티의 개수(int)를 반환합니다.
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Student s SET s.score = s.score + :bonus WHERE s.grade = :grade")
    int addBonusScoreByGrade(
	    @Param("grade") Integer grade, @Param("bonus") Integer bonus);

    // 2. DELETE: 특정 점수 미달인 학생을 일괄 삭제하는 쿼리
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Student s WHERE s.score < :minScore")
    int deleteByScoreLessThan(@Param("minScore") Integer minScore);
}
```

#### 서비스 메서드
```java
@Service
public class StudentService {
    
    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // 서비스 메서드에 트랜잭션을 걸어줍니다.
    @Transactional
    public void updateStudentScores() {
        // 3학년 학생들의 점수를 일괄적으로 5점씩 올려줍니다.
        int updatedCount = studentRepository.addBonusScoreByGrade(3, 5);
        
        // 벌크 연산으로 몇 건의 데이터가 변경되었는지 확인할 수 있습니다.
        System.out.println("점수가 업데이트된 3학년 학생 수: " + updatedCount + "명");
    }

    @Transactional
    public void removeUnderperformingStudents() {
        // 점수가 50점 미만인 학생들을 일괄 삭제합니다.
        int deletedCount = studentRepository.deleteByScoreLessThan(50);
        System.out.println("삭제된 학생 수: " + deletedCount + "명");
    }
}
```