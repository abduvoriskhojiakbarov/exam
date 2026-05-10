const API_URL = 'http://localhost:3000/api';

const state = {
  accessToken: localStorage.getItem('accessToken') || '',
  user: JSON.parse(localStorage.getItem('user') || 'null')
};

const permissions = {
  ADMIN: {
    dashboard: 'Admin foydalanuvchilar, kurslar, modullar, darslar, vazifalar va barcha natijalarni boshqara oladi.',
    auth: "Siz admin sifatida tizimga kirgansiz. Boshqa rol sinashda bu yerda hisob almashtiring.",
    courses: "Admin barcha kurslarni yaratishi, yangilashi va o'chirishi mumkin.",
    learning: "Admin istalgan kurs uchun modul va darslar yarata oladi.",
    assignments: "Admin vazifalarni baholashi mumkin.",
    results: "Admin barcha natijalarni yuklay oladi.",
    users: "Admin foydalanuvchilarni yuklab boshqara oladi."
  },
  TEACHER: {
    dashboard: "O'qituvchi o'z kurslarini, modul va darslarni yarata oladi va vazifalarni baholashi mumkin.",
    auth: "Siz o'qituvchi sifatida tizimga kirgansiz. Faqat talaba amallari uchun hisob almashtiring.",
    courses: "O'qituvchi kurs yaratishi va faqat o'z kurslarini boshqara oladi.",
    learning: "O'qituvchi o'z kurslari uchun modul va darslar yarata oladi.",
    assignments: "O'qituvchi o'z kurslari uchun vazifalarni baholashi mumkin.",
    results: "O'qituvchi barcha natijalarni yuklay oladi.",
    users: "Faqat admin foydalanuvchilarni yuklay oladi."
  },
  STUDENT: {
    dashboard: "Talaba kurslarga yozilishi, darslarni ko'rishi, vazifalar topshirishi va o'z natijalarini ko'rishi mumkin.",
    auth: "Siz talaba sifatida tizimga kirgansiz. O'qituvchi/admin amallari uchun hisob almashtiring.",
    courses: "Talaba kurslarni ko'rishi mumkin, lekin kurs yarata olmaydi.",
    learning: "Modul yoki darslarni ko'rish uchun avval kursga yozilish kerak.",
    assignments: "Talaba o'z vazifalarini topshirishi va ko'rishi mumkin.",
    results: "Talaba faqat o'z natijalarini yuklay oladi.",
    users: "Faqat admin foydalanuvchilarni yuklay oladi."
  },
  GUEST: {
    dashboard: "Avval tizimga kiring. Auth sahifasiga o'ting va kerakli rolni tanlang.",
    auth: "Kiring yoki ro'yxatdan o'ting. O'qituvchi kontent yaratadi, talaba yoziladi/topshiradi, admin foydalanuvchilarni boshqaradi.",
    courses: "Mehmonlar faqat ochiq kurslarni ko'rishi mumkin.",
    learning: "Kurs kontentidan foydalanish uchun avval tizimga kiring.",
    assignments: "Vazifalardan foydalanish uchun avval tizimga kiring.",
    results: "Natijalarni ko'rish uchun avval tizimga kiring.",
    users: "Foydalanuvchilarni ko'rish uchun admin sifatida kiring."
  }
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3200);
}

function setSession(payload) {
  state.accessToken = payload.accessToken;
  state.user = payload.user;
  localStorage.setItem('accessToken', payload.accessToken);
  localStorage.setItem('user', JSON.stringify(payload.user));
  renderUser();
}

function renderUser() {
  $('#userBadge').textContent = state.user ? `${state.user.name} · ${state.user.role}` : 'Mehmon';
  renderRoleHelp();
}

function role() {
  return state.user?.role || 'GUEST';
}

function renderRoleHelp(view = getActiveView()) {
  $('#roleHelp').textContent = permissions[role()]?.[view] || permissions.GUEST.dashboard;
}

function getActiveView() {
  return $('.nav-item.active')?.dataset.view || 'dashboard';
}

function explainError(error) {
  const message = error?.message || "So'rov muvaffaqiyatsiz";
  if (message.includes('permission')) {
    return `${message}. Joriy rol: ${role()}. Kirish sahifasiga o'ting va to'g'ri rol bilan kiring.`;
  }
  if (message.includes('Internal server error')) {
    return "Ichki server xatosi. Backend terminal loglarini tekshiring; odatda ma'lumotlar bazasi ma'lumotlari, jadval sinxronlashishi yoki noto'g'ri ID sabab bo'ladi.";
  }
  return message;
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (state.accessToken) {
    headers.Authorization = `Bearer ${state.accessToken}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const message = data?.error?.message || data?.message || data?.error || "So'rov muvaffaqiyatsiz";
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
  return data.data ?? data;
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function numberFields(input, fields) {
  const result = { ...input };
  fields.forEach((field) => {
    if (result[field] !== undefined && result[field] !== '') {
      result[field] = Number(result[field]);
    }
  });
  return result;
}

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

function scoreText(item) {
  if (item.totalScore !== undefined) {
    return `Ball ${item.totalScore}`;
  }
  if (item.score !== undefined && item.score !== null) {
    return `Ball ${item.score}`;
  }
  return '';
}

function dateText(item) {
  const value = item.enrolledAt || item.createdAt || item.submittedAt;
  if (!value) {
    return '';
  }
  return new Date(value).toLocaleDateString('uz-UZ');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadDashboard() {
  try {
    const courses = await api('/courses');
    $('#courseCount').textContent = courses.total ?? courses.items?.length ?? 0;
  } catch {
    $('#courseCount').textContent = '0';
  }

  if (!state.accessToken) {
    return;
  }

  if (role() !== 'STUDENT') {
    $('#myCourseCount').textContent = '-';
    $('#assignmentCount').textContent = '-';
    $('#resultCount').textContent = '-';
    return;
  }

  try {
    const myCourses = await api('/my-courses');
    $('#myCourseCount').textContent = myCourses.length;
  } catch {
    $('#myCourseCount').textContent = '0';
  }

  try {
    const assignments = await api('/assignments/my');
    $('#assignmentCount').textContent = assignments.length;
  } catch {
    $('#assignmentCount').textContent = '0';
  }

  try {
    const results = await api('/results/me');
    $('#resultCount').textContent = results.length;
  } catch {
    $('#resultCount').textContent = '0';
  }
}

async function loadCourses() {
  const result = await api('/courses');
  const courses = [...(result.items || [])].sort((a, b) => a.title.localeCompare(b.title));
  renderList('#coursesList', courses, 'Kurs topilmadi', 'courses');
  $('#courseCount').textContent = result.total ?? 0;
}

function setInput(formSelector, name, value) {
  const input = $(`${formSelector} [name="${name}"]`);
  if (input) {
    input.value = value;
    input.focus();
  }
}

function bindNavigation() {
  $$('.nav-item').forEach((button) => {
    button.addEventListener('click', () => {
      $$('.nav-item').forEach((item) => item.classList.remove('active'));
      $$('.view').forEach((view) => view.classList.remove('active'));
      button.classList.add('active');
      $(`#${button.dataset.view}View`).classList.add('active');
      $('#pageTitle').textContent = button.textContent;
      renderRoleHelp(button.dataset.view);
    });
  });
}

function bindAuthTabs() {
  $$('.auth-tab').forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.authTab;
      $$('.auth-tab').forEach((tab) => tab.classList.toggle('active', tab === button));
      $$('[data-auth-panel]').forEach((panel) => {
        panel.classList.toggle('active', panel.dataset.authPanel === mode);
      });
    });
  });
}

function bindForms() {
  $('#registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const payload = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData(event.currentTarget))
      });
      setSession(payload);
      showToast('Hisob yaratildi va tizimga kirildi');
      await loadDashboard();
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const payload = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData(event.currentTarget))
      });
      setSession(payload);
      showToast('Tizimga kirildi');
      await loadDashboard();
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#logoutBtn').addEventListener('click', async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Server mavjud bo'lmasa ham lokal sessiya tozalanadi.
    }
    state.accessToken = '';
    state.user = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    renderUser();
    showToast('Tizimdan chiqildi');
  });

  $('#courseForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      if (!['ADMIN', 'TEACHER'].includes(role())) {
        showToast("Kurs yaratish uchun O'QITUVCHI yoki ADMIN roli kerak. Kirish sahifasiga o'ting.");
        return;
      }
      const payload = numberFields(formData(event.currentTarget), ['price']);
      await api('/courses', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Kurs yaratildi');
      await loadCourses();
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#moduleForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      if (!['ADMIN', 'TEACHER'].includes(role())) {
        showToast("Modul yaratish uchun O'QITUVCHI yoki ADMIN roli kerak.");
        return;
      }
      const payload = numberFields(formData(event.currentTarget), ['order']);
      const { courseId, ...body } = payload;
      const created = await api(`/courses/${courseId}/modules`, { method: 'POST', body: JSON.stringify(body) });
      renderList('#learningList', [created], 'Modul yaratilmadi', 'learning');
      showToast('Modul yaratildi');
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#lessonForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      if (!['ADMIN', 'TEACHER'].includes(role())) {
        showToast("Dars yaratish uchun O'QITUVCHI yoki ADMIN roli kerak.");
        return;
      }
      const payload = numberFields(formData(event.currentTarget), ['order']);
      const { moduleId, ...body } = payload;
      const created = await api(`/modules/${moduleId}/lessons`, { method: 'POST', body: JSON.stringify(body) });
      renderList('#learningList', [created], 'Dars yaratilmadi', 'learning');
      showToast('Dars yaratildi');
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#enrollForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      if (role() !== 'STUDENT') {
        showToast("Yozilish uchun TALABA roli kerak. Kirish sahifasiga o'ting.");
        return;
      }
      const { courseId } = formData(event.currentTarget);
      await api(`/courses/${courseId}/enroll`, { method: 'POST' });
      const myCourses = await api('/my-courses');
      $('#myCourseCount').textContent = myCourses.length;
      renderList('#learningList', myCourses, "Yozilgan kurslar yo'q");
      showToast('Muvaffaqiyatli yozildingiz');
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#loadLessonsForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const { moduleId } = formData(event.currentTarget);
      const lessons = await api(`/modules/${moduleId}/lessons`);
      renderList('#learningList', lessons, 'Darslar topilmadi', 'learning');
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#assignmentForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      if (role() !== 'STUDENT') {
        showToast('Vazifa topshirish uchun TALABA roli kerak.');
        return;
      }
      const { moduleId, ...body } = formData(event.currentTarget);
      const created = await api(`/modules/${moduleId}/assignments`, { method: 'POST', body: JSON.stringify(body) });
      renderList('#assignmentsList', [created], 'Vazifa topshirilmadi', 'assignments');
      showToast('Vazifa topshirildi');
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#gradeForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      if (!['ADMIN', 'TEACHER'].includes(role())) {
        showToast("Baholash uchun O'QITUVCHI yoki ADMIN roli kerak.");
        return;
      }
      const payload = numberFields(formData(event.currentTarget), ['score']);
      const { assignmentId, ...body } = payload;
      const graded = await api(`/assignments/${assignmentId}/grade`, { method: 'PATCH', body: JSON.stringify(body) });
      renderList('#assignmentsList', [graded], 'Baholanmagan vazifa', 'assignments');
      showToast('Vazifa baholandi');
    } catch (error) {
      showToast(explainError(error));
    }
  });
}

function bindButtons() {
  $('#loadCoursesBtn').addEventListener('click', () => loadCourses().catch((error) => showToast(explainError(error))));

  $('#loadAssignmentsBtn').addEventListener('click', async () => {
    try {
      if (role() !== 'STUDENT') {
        showToast("Mening vazifalarim faqat TALABA roli uchun ishlaydi.");
        return;
      }
      const assignments = await api('/assignments/my');
      $('#assignmentCount').textContent = assignments.length;
      renderList('#assignmentsList', assignments, 'Vazifalar topilmadi', 'assignments');
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#loadMyResultsBtn').addEventListener('click', async () => {
    try {
      if (role() !== 'STUDENT') {
        showToast("Mening natijalarim faqat TALABA roli uchun. O'qituvchi/Admin barcha natijalardan foydalaning.");
        return;
      }
      const results = await api('/results/me');
      $('#resultCount').textContent = results.length;
      renderList('#resultsList', results, 'Natijalar topilmadi');
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#loadAllResultsBtn').addEventListener('click', async () => {
    try {
      if (!['ADMIN', 'TEACHER'].includes(role())) {
        showToast("Barcha natijalar uchun O'QITUVCHI yoki ADMIN roli kerak.");
        return;
      }
      const results = await api('/results');
      renderList('#resultsList', results, 'Natijalar topilmadi');
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#loadUsersBtn').addEventListener('click', async () => {
    try {
      if (role() !== 'ADMIN') {
        showToast('Foydalanuvchilar sahifasi uchun ADMIN roli kerak.');
        return;
      }
      const users = await api('/users');
      renderList('#usersList', users, 'Foydalanuvchilar topilmadi');
    } catch (error) {
      showToast(explainError(error));
    }
  });
}

function bindListActions() {
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) {
      return;
    }

    const { action, id } = button.dataset;
    if (!id) {
      return;
    }

    if (action === 'use-course') {
      setInput('#moduleForm', 'courseId', id);
      setInput('#enrollForm', 'courseId', id);
      showToast("Kurs ID o'quv shakllariga qo'shildi");
    }

    if (action === 'enroll-course') {
      setInput('#enrollForm', 'courseId', id);
      if (role() !== 'STUDENT') {
        showToast("Yozilish uchun TALABA roli kerak. Kirish sahifasiga o'ting.");
        return;
      }
      try {
        await api(`/courses/${id}/enroll`, { method: 'POST' });
        showToast('Muvaffaqiyatli yozildingiz');
      } catch (error) {
        showToast(explainError(error));
      }
    }

    if (action === 'use-module') {
      setInput('#lessonForm', 'moduleId', id);
      setInput('#loadLessonsForm', 'moduleId', id);
      showToast("Modul ID dars shakllariga qo'shildi");
    }

    if (action === 'use-assignment-module') {
      setInput('#assignmentForm', 'moduleId', id);
      showToast("Modul ID vazifa shakliga qo'shildi");
    }

    if (action === 'grade-assignment') {
      setInput('#gradeForm', 'assignmentId', id);
      showToast("Vazifa ID baholash shakliga qo'shildi");
    }
  });
}

bindNavigation();
bindAuthTabs();
bindForms();
bindButtons();
bindListActions();
renderUser();
loadDashboard();
loadCourses().catch(() => {});
