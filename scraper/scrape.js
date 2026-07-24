// 진학프로 채용공고 목록에서 "즉시지원" 공고를 가져와 서울시립대학교 공고만 골라 data/postings.json에 저장한다.
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// JINHAKPRO_BASE 환경변수로 알파(테스트) 사이트 등 다른 호스트를 지정할 수 있다.
// 예: JINHAKPRO_BASE=https://www-alpha.jinhakpro.com npm run scrape
const BASE_URL = process.env.JINHAKPRO_BASE || 'https://www.jinhakpro.com';
const LIST_URL = `${BASE_URL}/recruit/list?isOnlyOnlineApply=true`;
const TARGET_INSTITUTION = '서울시립대학교';
// JINHAKPRO_OUTPUT 환경변수로 저장 파일명을 바꿀 수 있다 (알파용 postings.alpha.json 등).
const OUTPUT_PATH = path.join(__dirname, '..', 'data', process.env.JINHAKPRO_OUTPUT || 'postings.json');

async function fetchListHtml() {
  const res = await fetch(LIST_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
  });
  if (!res.ok) {
    throw new Error(`진학프로 목록 조회 실패: HTTP ${res.status}`);
  }
  return res.text();
}

function parsePostings(html) {
  const $ = cheerio.load(html);
  const postings = [];

  $('a[href^="/recruit/"]').each((_, el) => {
    const $a = $(el);
    const href = $a.attr('href');
    const id = (href.match(/\/recruit\/(\d+)/) || [])[1];
    if (!id) return;

    const title = $a.find('.card_recr_tit').first().text().trim();
    const institution = $a.find('img').first().attr('alt') || '';
    if (!title) return;

    postings.push({
      id,
      institution: institution.trim(),
      title,
      url: `${BASE_URL}${href}`,
    });
  });

  return postings;
}

async function main() {
  const html = await fetchListHtml();
  const allImmediateApply = parsePostings(html);
  const matched = allImmediateApply.filter((p) => p.institution.includes(TARGET_INSTITUTION));

  const output = {
    updatedAt: new Date().toISOString(),
    sourceUrl: LIST_URL,
    targetInstitution: TARGET_INSTITUTION,
    totalImmediateApplyCount: allImmediateApply.length,
    count: matched.length,
    items: matched,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`즉시지원 전체 ${allImmediateApply.length}건 중 ${TARGET_INSTITUTION} ${matched.length}건 저장 완료 -> ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('스크래핑 실패:', err.message);
  process.exitCode = 1;
});
