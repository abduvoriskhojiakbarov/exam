const API_URL = 'http://13.62.51.67/';

const permissions = {
  GUEST: {
    dashboard: 'Guest access'
  },
  STUDENT: {
    dashboard: 'Student access'
  },
  TEACHER: {
    dashboard: 'Teacher access'
  },
  ADMIN: {
    dashboard: 'Admin access'
  }
};

function showToast(message) {
  console.log(message);
  alert(message);
}

let savedUser = null;

try {
  const userData = localStorage.getItem('user');

  if (userData) {
    savedUser = JSON.parse(userData);
  }
} catch (error) {
  console.error('Invalid localStorage user:', error);

  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
}

const state = {
  accessToken: localStorage.getItem('accessToken') || '',
  user: savedUser
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function setSession(payload) {
  state.accessToken = payload.accessToken;
  state.user = payload.user;

  localStorage.setItem('accessToken', payload.accessToken);
  localStorage.setItem('user', JSON.stringify(payload.user));

  renderUser();
}

function renderUser() {
  const userBadge = $('#userBadge');

  if (!userBadge) return;

  userBadge.textContent = state.user
    ? `${state.user.name} · ${state.user.role}`
    : 'Mehmon';

  renderRoleHelp();
}

function role() {
  return state.user?.role || 'GUEST';
}

function renderRoleHelp(view = getActiveView()) {
  const roleHelp = $('#roleHelp');

  if (!roleHelp) return;

  roleHelp.textContent =
    permissions[role()]?.[view] ||
    permissions.GUEST.dashboard;
}

function getActiveView() {
  return $('.nav-item.active')?.dataset.view || 'dashboard';
}

function explainError(error) {
  return error?.message || "So'rov muvaffaqiyatsiz";
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

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error?.message ||
      'Server error'
    );
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
      const num = Number(result[field]);

      if (!Number.isNaN(num)) {
        result[field] = num;
      }
    }
  });

  return result;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
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
  const value =
    item.enrolledAt ||
    item.createdAt ||
    item.submittedAt;

  if (!value) return '';

  return new Date(value).toLocaleDateString('uz-UZ');
}

function renderActions(item, type) {
  const id =
    item.id ||
    item.courseId ||
    item.moduleId ||
    '';

  if (type === 'courses') {
    return `
      <button class="mini-btn"
        data-action="use-course"
        data-id="${escapeHtml(id)}"
        type="button">
        Modul uchun
      </button>

      <button class="mini-btn"
        data-action="enroll-course"
        data-id="${escapeHtml(id)}"
        type="button">
        Yozilish
      </button>
    `;
  }

  if (type === 'assignments') {
    return `
      <button class="mini-btn"
        data-action="grade-assignment"
        data-id="${escapeHtml(id)}"
        type="button">
        Baholash
      </button>
    `;
  }

  return '';
}

function renderList(target, items, emptyText, type = 'default') {
  const element = $(target);

  if (!element) return;

  if (!items?.length) {
    element.innerHTML = `
      <article class="list-item">
        <div>
          <strong>${emptyText}</strong>
        </div>
      </article>
    `;
    return;
  }

  element.innerHTML = items.map((item) => {
    const title =
      item.title ||
      item.name ||
      item.course?.title ||
      item.module?.title ||
      item.id;

    const description =
      item.description ||
      item.email ||
      item.answer ||
      item.feedback ||
      '';

    const meta =
      item.role ||
      item.level ||
      item.status ||
      scoreText(item) ||
      dateText(item) ||
      '';

    const id =
      item.id ||
      item.courseId ||
      item.moduleId ||
      '';

    return `
      <article class="list-item">
        <div class="list-main">
          <div class="list-title">
            <strong>${escapeHtml(title)}</strong>

            ${
              meta
                ? `<span class="meta">${escapeHtml(String(meta))}</span>`
                : ''
            }
          </div>

          <p>${escapeHtml(description || "Tavsif yo'q")}</p>

          ${
            id
              ? `<p><span class="id-chip">${escapeHtml(id)}</span></p>`
              : ''
          }
        </div>

        <div class="list-actions">
          ${renderActions(item, type)}
        </div>
      </article>
    `;
  }).join('');
}

async function loadDashboard() {
  try {
    const courses = await api('/courses');

    const courseCount = $('#courseCount');

    if (courseCount) {
      courseCount.textContent =
        courses.total ??
        courses.items?.length ??
        0;
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadCourses() {
  try {
    const result = await api('/courses');

    const courses = [...(result.items || [])]
      .sort((a, b) => a.title.localeCompare(b.title));

    renderList(
      '#coursesList',
      courses,
      'Kurs topilmadi',
      'courses'
    );
  } catch (error) {
    console.error(error);
  }
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
      $$('.nav-item').forEach((item) => {
        item.classList.remove('active');
      });

      $$('.view').forEach((view) => {
        view.classList.remove('active');
      });

      button.classList.add('active');

      const view = $(`#${button.dataset.view}View`);

      if (view) {
        view.classList.add('active');
      }

      const pageTitle = $('#pageTitle');

      if (pageTitle) {
        pageTitle.textContent = button.textContent;
      }

      renderRoleHelp(button.dataset.view);
    });
  });
}

function bindForms() {
  const loginForm = $('#loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
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
  }

  const registerForm = $('#registerForm');

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {
        const payload = await api('/auth/register', {
          method: 'POST',
          body: JSON.stringify(formData(event.currentTarget))
        });

        setSession(payload);

        showToast('Hisob yaratildi');
      } catch (error) {
        showToast(explainError(error));
      }
    });
  }
}

function bindButtons() {
  const loadCoursesBtn = $('#loadCoursesBtn');

  if (loadCoursesBtn) {
    loadCoursesBtn.addEventListener('click', () => {
      loadCourses();
    });
  }
}

function bindListActions() {
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');

    if (!button) return;

    const { action, id } = button.dataset;

    if (!id) return;

    if (action === 'use-course') {
      setInput('#moduleForm', 'courseId', id);
      setInput('#enrollForm', 'courseId', id);

      showToast("Kurs ID qo'shildi");
    }

    if (action === 'enroll-course') {
      try {
        await api(`/courses/${id}/enroll`, {
          method: 'POST'
        });

        showToast('Muvaffaqiyatli yozildingiz');
      } catch (error) {
        showToast(explainError(error));
      }
    }

    if (action === 'grade-assignment') {
      setInput('#gradeForm', 'assignmentId', id);

      showToast("Vazifa ID qo'shildi");
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindNavigation();
  bindForms();
  bindButtons();
  bindListActions();

  renderUser();

  loadDashboard();

  loadCourses();
});