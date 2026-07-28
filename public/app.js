async function loadPostings() {
  const listEl = document.getElementById('list');
  const updatedEl = document.getElementById('updated');
  const dataFile = document.body.dataset.source || 'postings.json';

  try {
    const res = await fetch(`data/${dataFile}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`데이터 조회 실패 (HTTP ${res.status})`);
    const data = await res.json();

    const updated = new Date(data.updatedAt);
    updatedEl.textContent = `마지막 확인: ${updated.toLocaleString('ko-KR')}`;

    if (!data.items || data.items.length === 0) {
      listEl.innerHTML = '<p class="empty">현재 게시된 서울시립대학교 즉시지원 공고가 없습니다.</p>';
      return;
    }

    listEl.innerHTML = data.items
      .map(
        (item) => `
      <article class="card">
        <span class="title">${escapeHtml(item.title)}</span>
        <a class="link-btn" href="${item.url}" target="_blank" rel="noopener noreferrer">바로가기</a>
      </article>
    `
      )
      .join('');
  } catch (err) {
    listEl.innerHTML = `<p class="error">불러오지 못했습니다: ${escapeHtml(err.message)}</p>`;
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

loadPostings();
