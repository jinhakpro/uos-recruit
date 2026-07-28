# 서울시립대학교 즉시지원 채용 공고 알림 페이지

진학프로(jinhakpro.com)에 게시된 **서울시립대학교 즉시지원** 채용 공고를 모아,
공고 제목과 바로가기 링크를 보여주는 페이지입니다.

## 구조
```
scraper/scrape.js         - 진학프로에서 즉시지원 공고를 가져와 data/*.json 으로 저장
scraper/serve.js          - public/, data/ 를 로컬에서 서비스하는 간단한 서버
scraper/run_scrape.bat    - 운영 사이트 수집 실행 (스케줄 등록용)
scraper/scrape_alpha.bat  - 알파(테스트) 사이트 수집 실행 (스케줄 등록용)
scraper/ensure_server.bat - 서버가 꺼져 있으면 재기동 (워치독, 스케줄 등록용)
public/index.html         - 운영 사이트 기준 화면
public/alpha.html         - 알파(테스트) 사이트 기준 화면
public/app.js             - data/*.json 을 읽어 목록 렌더링 (body[data-source] 로 파일 선택)
public/style.css          - 서울시립대학교(UOS) 브랜드 컬러 적용 스타일
data/postings.json        - 운영 사이트 수집 결과 (GitHub Actions가 주기적으로 커밋)
data/postings.alpha.json  - 알파 사이트 수집 결과 (GitHub Actions가 주기적으로 커밋)
.github/workflows/scrape.yml - 15분마다 두 사이트를 수집해 결과를 저장소에 커밋하는 워크플로
PRD.md                    - 기획서
```

## 동작 원리
1. `scraper/scrape.js` 가 `{BASE_URL}/recruit/list?isOnlyOnlineApply=true` 를 요청합니다.
   이 쿼리는 진학프로 목록 페이지에서 "즉시지원만 보기" 체크박스를 켠 것과 동일하며, 서버가 즉시지원 공고만 걸러서 내려줍니다.
   `JINHAKPRO_BASE` 환경변수로 운영(`www.jinhakpro.com`)/알파(`www-alpha.jinhakpro.com`) 대상을 바꿀 수 있습니다.
2. 응답 HTML에서 각 공고 카드(`<a href="/recruit/{id}">`)의 기관명(이미지 alt), 제목(`.card_recr_tit`), 링크를 추출합니다.
3. 기관명에 "서울시립대학교"가 포함된 공고만 걸러 `JINHAKPRO_OUTPUT` 환경변수로 지정한 JSON 파일(기본 `data/postings.json`)에 저장합니다.
4. 웹페이지(`public/index.html` 또는 `public/alpha.html`)는 이 JSON 파일을 읽어 제목과 "바로가기" 버튼을 표시합니다.

## 실행 방법
```bash
npm install        # 최초 1회
npm run scrape     # 운영 사이트 수집 (data/postings.json 갱신)
npm run serve      # http://localhost:5173 로 페이지 확인
```

알파 사이트 수집은 환경변수를 지정해서 실행합니다.
```bash
JINHAKPRO_BASE=https://www-alpha.jinhakpro.com JINHAKPRO_OUTPUT=postings.alpha.json node scraper/scrape.js
```

- 운영 페이지: http://localhost:5173/
- 알파 페이지: http://localhost:5173/alpha.html

## 자동 갱신 (GitHub Actions, 클라우드)
`.github/workflows/scrape.yml` 워크플로가 15분마다 GitHub의 서버에서 실행되어
운영/알파 사이트를 수집하고, 결과가 바뀌면 `data/postings.json`, `data/postings.alpha.json`을
저장소에 자동으로 커밋·푸시합니다. 개인 PC를 켜둘 필요가 없습니다.
- 수동 실행: GitHub 저장소 → Actions 탭 → "서울시립대학교 즉시지원 공고 수집" → Run workflow
- GitHub Actions의 `schedule` cron은 트래픽이 몰리면 몇 분 지연될 수 있습니다(정확히 15분마다 보장되지는 않음).

## 페이지 배포 (GitHub Pages)
`.github/workflows/deploy-pages.yml` 워크플로가 `public/*`와 `data/*.json`을 합쳐
GitHub Pages로 배포합니다. `main`에 관련 변경이 푸시될 때(또는 수집 워크플로가 데이터를
커밋할 때) 자동 실행됩니다.

- 배포 URL: **https://jinhakpro.github.io/uos-recruit/** (운영)
- 알파 페이지: **https://jinhakpro.github.io/uos-recruit/alpha.html**

리포지토리 Settings → Pages 에서 Source가 "GitHub Actions"로 설정되어 있어야 합니다.

## (참고) 로컬 PC에서 직접 돌리던 방식
과거에는 Windows 작업 스케줄러(`scraper/run_scrape.bat`, `scraper/scrape_alpha.bat`,
`scraper/ensure_server.bat`)로 개인 PC에서 수집·서빙했으나, 클라우드(GitHub Actions + 정적 호스팅)로
이전하면서 더 이상 사용하지 않습니다. 로컬에서 테스트하고 싶을 때만 아래처럼 실행하면 됩니다.

`.bat` 파일은 Node.js 설치 경로(`C:\Program Files\nodejs\node.exe`)를 하드코딩하고 있으므로,
다른 PC에서 그대로 쓰려면 해당 경로를 실제 설치 위치에 맞게 수정해야 합니다.

## 참고
- 사이트 구조가 바뀌면 `scraper/scrape.js` 의 선택자(`.card_recr_tit`, `img[alt]` 등)를 다시 확인해야 합니다.
- 진학프로 서버 부담을 고려해 수집 주기는 최소 5~10분을 권장합니다.
