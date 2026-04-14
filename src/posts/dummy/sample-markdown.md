---
slug: sample-markdown
title: 샘플 마크다운 문서
category: test
date: 2026-04-14
summary: 마크다운 문서가 HTML로 제대로 변환되는지 확인
---

# 샘플 마크다운 문서

이 문서는 **마크다운 → HTML 렌더링 테스트**를 위해 만든 예시 문서입니다.  
기본 문법부터 표, 코드 블록, 인용문, 체크리스트, 이미지, 링크, HTML 태그까지 한 번에 확인할 수 있도록 구성했습니다.

---

## 1. 문단과 줄바꿈

마크다운에서 문단은 빈 줄로 구분됩니다.

이 문장은 같은 문단이 아니라, 위 문단과 분리된 새로운 문단입니다.

줄 끝에 공백 두 칸을 넣으면  
이렇게 줄바꿈이 들어갑니다.

또는 <br> 태그를 사용해서<br>
강제로 줄바꿈을 넣을 수도 있습니다.

---

## 2. 제목 테스트

# H1 제목
## H2 제목
### H3 제목
#### H4 제목
##### H5 제목
###### H6 제목

---

## 3. 강조 스타일

이 문장에는 **굵게**, *기울임*, ***굵은 기울임*** 이 들어 있습니다.

또한 ~~취소선~~ 도 사용할 수 있습니다.

인라인 코드: `const name = "markdown";`

---

## 4. 목록 테스트

- 사과
- 바나나
- 오렌지

1. 첫 번째
2. 두 번째
3. 세 번째

---

## 5. 체크리스트

- [x] 완료된 항목
- [ ] 미완료 항목

---

## 6. 링크 테스트

[OpenAI](https://openai.com)

---

## 7. 이미지 테스트

![샘플 이미지](https://via.placeholder.com/400x120.png)

---

## 8. 인용문

> 이것은 인용문입니다.
> 여러 줄도 가능합니다.

---

## 9. 코드 블록

### JavaScript

```js
function hello() {
  console.log("Hello Markdown");
}
```

### HTML

```html
<div>
  <h1>테스트</h1>
</div>
```

### CSS

```css
.box {
  color: red;
}
```

---

## 10. 표 테스트

| 이름 | 역할 |
|---|---|
| 민수 | 프론트 |
| 지훈 | 백엔드 |

---

## 11. HTML 혼합

<div style="padding:10px; border:1px solid #ccc;">
HTML 박스
</div>

---

## 12. details 테스트

<details>
<summary>열기</summary>

숨겨진 내용입니다.

```js
console.log("inside details");
```

</details>

---

## 끝
