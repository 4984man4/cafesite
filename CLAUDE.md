# 도네페미 웹사이트 프로젝트 규칙

## 프로젝트 소개
- 도네: 카페 소개 및 메뉴 안내 웹사이트
- Node.js/Express 백엔드 + HTML/CSS/JS 프론트엔드
- 관리자 로그인 및 메뉴 관리 기능 포함

## 빌드 & 실행
- 초기 설정: `npm install`
- 서버 실행: `npm start` (포트 3000)
- 메뉴 페이지: http://localhost:3000/menu.html
- 관리자 페이지: http://localhost:3000/admin.html (비밀번호: config.json에서 설정)

## 코딩 스타일
- HTML/CSS/JavaScript 사용 (프레임워크 없음)
- 클래스 이름 영문으로 (예: menu-section, hero-banner)
- 색상은 CSS 변수로 관리 (--primary-color, --accent-color)
- 모바일 우선 반응형 디자인

## 폴더 구조
- index.html - 메인 페이지
- menu.html - 메뉴 페이지
- css/ - 스타일시트
- images/ - 사진 파일
- js/ - 스크립트

## 관리 규칙
- 원칙: 콘텐츠는 웹 관리자 페이지에서 관리
- 메뉴 항목은 admin.html에서 추가/수정/삭제
- data.json은 서버에 의해 자동으로 업데이트됨
- 이미지는 WebP 포맷, 최대 500KB
- 관리자 비밀번호는 config.json에 저장
