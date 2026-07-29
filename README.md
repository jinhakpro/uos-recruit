# 서울시립대학교 즉시지원 채용 공고 알림 페이지

진학프로(jinhakpro.com)에 게시된 **서울시립대학교 즉시지원** 채용 공고를 모아,
공고 제목·접수기간·바로가기 링크를 보여주는 페이지입니다.

## 구조
```
public/index.html   - 운영 사이트 기준 화면
public/alpha.html    - 알파(테스트) 사이트 기준 화면
public/app.js        - Val Town 데이터 API를 읽어 목록 렌더링 (body[data-source]로 real/alpha 구분)
public/style.css     - 서울시립대학교(UOS) 브랜드 컬러 + SaaS 스타일
.github/workflows/deploy-pages.yml - public/* 를 GitHub Pages로 배포하는 워크플로
scraper/scrape.js     - 로컬 개발/디버깅용 참고 구현 (실제 운영은 Val Town에서 동작)
scraper/serve.js      - 로컬에서 public/ 을 미리보기 위한 간단한 정적 서버
PRD.md               - 기획서
```

## 동작 원리 (실제 수집·저장은 Val Town에서 실행)
데이터 수집은 이 저장소가 아니라 **Val Town**(https://www.val.town) 이라는 서버리스 서비스에서 동작합니다.
GitHub Actions(Azure IP)와 Cloudflare Workers로 시도했을 때 진학프로의 Cloudflare 봇 차단(`Just a moment...` 챌린지)에
막혔는데, Val Town의 인프라(Deno Deploy 계열)는 현재 차단되지 않아 이 방식을 채택했습니다.

Val Town 프로젝트: `https://www.val.town/x/jinhakproscrap/uos-recruit-scraper`
- **`scrape.ts`** (Cron, 매시 1분/31분 실행)
  1. `{BASE_URL}/recruit/list?isOnlyOnlineApply=true` 요청 (운영: `www.jinhakpro.com`, 알파: `www-alpha.jinhakpro.com`)
  2. 응답 HTML에서 공고 카드의 기관명(이미지 alt)·제목·링크 추출
  3. 기관명에 "서울시립대학교"가 포함된 공고만 필터링
  4. 매칭된 공고의 상세 페이지에서 접수기간(`.recr_info_list`의 "접수 기간" 항목)을 추가로 조회
  5. 결과를 Val Town Blob Storage에 `postings.json`(운영), `postings.alpha.json`(알파)로 저장
- **`data.ts`** (HTTP 엔드포인트)
  - `GET /?key=postings.json` 또는 `?key=postings.alpha.json` 요청 시 Blob Storage에 저장된 JSON을 CORS 허용 헤더와 함께 반환
  - 엔드포인트: `https://jinhakproscrap--f623e5748aea11f1961f1607ee4eb77e.web.val.run`

`public/app.js`는 이 엔드포인트를 직접 fetch해서 카드(제목/접수기간/바로가기 버튼)를 렌더링합니다.

## 페이지 배포 (GitHub Pages)
`.github/workflows/deploy-pages.yml` 워크플로가 `public/*`를 GitHub Pages로 배포합니다.
`main`에 `public/**` 변경이 푸시되면 자동 실행됩니다.

- 운영 페이지: **https://jinhakpro.github.io/uos-recruit/**
- 알파 페이지: **https://jinhakpro.github.io/uos-recruit/alpha.html**

리포지토리 Settings → Pages 에서 Source가 "GitHub Actions"로 설정되어 있어야 합니다.

## 로컬에서 미리보기 (선택)
```bash
npm install
npm run serve   # http://localhost:5173 로 public/ 확인 (데이터는 여전히 Val Town에서 가져옴)
```
`scraper/scrape.js`는 Val Town으로 옮기기 전 사용하던 원본 스크래핑 로직으로, 지금은 실제 운영에
쓰이지 않습니다. 사이트 구조가 바뀌어 `scrape.ts` 선택자를 수정해야 할 때 로컬에서 먼저
`node scraper/scrape.js`로 빠르게 검증해보는 용도로만 남겨뒀습니다.

## Val Town 코드 수정 방법
1. https://www.val.town/x/jinhakproscrap/uos-recruit-scraper/code/ 접속 (jinhakproscrap 계정으로 로그인)
2. `scrape.ts` 또는 `data.ts` 수정 후 저장
3. Cron 스케줄 변경은 `scrape.ts` 상단의 스케줄 배지 클릭 → Edit schedule

## 참고
- 진학프로 서버 부담을 고려해 수집 주기는 최소 5~10분을 권장합니다 (현재 매시 1분/31분, Val Town 무료 플랜 최소 15분 제한을 충족).
- 사이트 구조가 바뀌면 Val Town `scrape.ts`의 선택자(`.card_recr_tit`, `img[alt]`, `.recr_info_list` 등)를 다시 확인해야 합니다.
- Val Town 무료 플랜: Blob 10MB, 실행 1분/회, 하루 10만 회, public val만 가능(코드가 공개됨 — 민감정보 없음).
