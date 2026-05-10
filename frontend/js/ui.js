function renderList(target, items, emptyText, type = 'default') {
  const element = $(target);
  if (!items?.length) {
    element.innerHTML = `<article class="list-item"><div><strong>${emptyText}</strong></div></article>`;
    return;
  }

  element.innerHTML = items
    .map((item) => {
      const title = item.title || item.name || item.course?.title || item.module?.title || item.id;
      const description = item.description || item.email || item.answer || item.feedback || item.course?.description || '';
      const meta = item.role || item.level || item.status || item.category || scoreText(item) || dateText(item) || '';
      const id = item.id || item.courseId || item.moduleId || '';
      return `
        <article class="list-item">
          <div class="list-main">
            <div class="list-title">
              <strong>${escapeHtml(title)}</strong>
              ${meta ? `<span class="meta">${escapeHtml(String(meta))}</span>` : ''}
            </div>
            <p>${escapeHtml(description || "Tavsif yo'q")}</p>
            ${id ? `<p><span class="id-chip">${escapeHtml(id)}</span></p>` : ''}
          </div>
          <div class="list-actions">${renderActions(item, type)}</div>
        </article>
      `;
    })
    .join('');
}

function renderActions(item, type) {
  const id = item.id || item.courseId || item.moduleId || '';

  if (type === 'courses') {
    return `
      <button class="mini-btn" data-action="use-course" data-id="${escapeHtml(id)}" type="button">Modul uchun</button>
      <button class="mini-btn" data-action="enroll-course" data-id="${escapeHtml(id)}" type="button">Yozilish</button>
    `;
  }

  if (type === 'learning' && item.courseId) {
    return `
      <button class="mini-btn" data-action="use-module" data-id="${escapeHtml(id)}" type="button">Dars uchun</button>
      <button class="mini-btn" data-action="use-assignment-module" data-id="${escapeHtml(id)}" type="button">Vazifa uchun</button>
    `;
  }

  if (type === 'assignments') {
    return `<button class="mini-btn" data-action="grade-assignment" data-id="${escapeHtml(id)}" type="button">Baholash</button>`;
  }

  return '';
}