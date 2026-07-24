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
data/postings.json        - 운영 사이트 수집 결과 (gitignore 대상, 실행 시 생성됨)
data/postings.alpha.json  - 알파 사이트 수집 결과 (gitignore 대상, 실행 시 생성됨)
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

- 운영 페이지: http://localhost:5173/public/index.html
- 알파 페이지: http://localhost:5173/public/alpha.html

## 자동 갱신 (Windows 작업 스케줄러)
Windows 작업 스케줄러에 아래 3개 작업을 등록해 사용 중입니다 (경로는 실제 프로젝트 위치로 지정).
- `scraper/run_scrape.bat` — 운영 사이트 수집, 10분 간격
- `scraper/scrape_alpha.bat` — 알파 사이트 수집, 10분 간격
- `scraper/ensure_server.bat` — 서버가 꺼져 있으면 재기동, 10분 간격

`.bat` 파일은 Node.js 설치 경로(`C:\Program Files\nodejs\node.exe`)를 하드코딩하고 있으므로,
다른 PC에서 그대로 쓰려면 해당 경로를 실제 설치 위치에 맞게 수정해야 합니다.

## 다른 PC(같은 네트워크)에서 접속하기
`scraper/serve.js` 는 `0.0.0.0`(모든 인터페이스)에서 수신하므로, 같은 사내망/공유기에 연결된
다른 PC에서는 `http://<이 PC의 사설 IP>:5173/public/index.html` 로 접속할 수 있습니다.
단, Windows 방화벽에서 5173/TCP 인바운드를 허용해야 합니다 (관리자 권한 필요):
```powershell
New-NetFirewallRule -DisplayName "Sicu Jinhakpro Page (5173)" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow -Profile Any
```
사설 IP이므로 외부 인터넷이나 다른 네트워크에서는 접속할 수 없습니다. 그 경우에는 별도의
서버/클라우드 호스팅에 배포해야 합니다.

## 참고
- 사이트 구조가 바뀌면 `scraper/scrape.js` 의 선택자(`.card_recr_tit`, `img[alt]` 등)를 다시 확인해야 합니다.
- 진학프로 서버 부담을 고려해 수집 주기는 최소 5~10분을 권장합니다.
