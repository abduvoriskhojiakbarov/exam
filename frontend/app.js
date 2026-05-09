const API_URL = 'http://localhost:3000/api';

const state = {
  accessToken: localStorage.getItem('accessToken') || '',
  user: JSON.parse(localStorage.getItem('user') || 'null')
};

const permissions = {
  ADMIN: {
    dashboard: 'Admin can manage users, courses, modules, lessons, assignments, and all results.',
    auth: 'You are logged in as admin. Switch accounts here when testing another role.',
    courses: 'Admin can create, update, and delete all courses.',
    learning: 'Admin can create modules and lessons for any course.',
    assignments: 'Admin can grade assignments.',
    results: 'Admin can load all results.',
    users: 'Admin can load and manage users.'
  },
  TEACHER: {
    dashboard: 'Teacher can create own courses, modules, lessons, and grade assignments.',
    auth: 'You are logged in as teacher. Switch accounts here when testing student-only actions.',
    courses: 'Teacher can create courses and manage only own courses.',
    learning: 'Teacher can create modules and lessons for own courses.',
    assignments: 'Teacher can grade assignments for own courses.',
    results: 'Teacher can load all results.',
    users: 'Only admin can load users.'
  },
  STUDENT: {
    dashboard: 'Student can enroll in courses, view lessons, submit assignments, and view own results.',
    auth: 'You are logged in as student. Switch accounts here when testing teacher/admin actions.',
    courses: 'Student can view courses, but cannot create courses.',
    learning: 'Student must enroll before viewing modules or lessons.',
    assignments: 'Student can submit and view own assignments.',
    results: 'Student can load only own results.',
    users: 'Only admin can load users.'
  },
  GUEST: {
    dashboard: 'Login first. Use Auth page and choose the role needed for your test.',
    auth: 'Login or register. Teacher creates content, Student enrolls/submits, Admin manages users.',
    courses: 'Guests can view public courses only.',
    learning: 'Login first to use course content.',
    assignments: 'Login first to use assignments.',
    results: 'Login first to see results.',
    users: 'Login as admin to load users.'
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
  $('#userBadge').textContent = state.user ? `${state.user.name} · ${state.user.role}` : 'Guest';
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
  const message = error?.message || 'Request failed';
  if (message.includes('permission')) {
    return `${message}. Current role: ${role()}. Go to Auth and login with the correct role.`;
  }
  if (message.includes('Internal server error')) {
    return 'Internal server error. Check the backend terminal logs; usually database data, table sync, or a wrong ID caused it.';
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
    const message = data?.error?.message || data?.message || data?.error || 'Request failed';
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
            <p>${escapeHtml(description || 'No description')}</p>
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
      <button class="mini-btn" data-action="use-course" data-id="${escapeHtml(id)}" type="button">Use for module</button>
      <button class="mini-btn" data-action="enroll-course" data-id="${escapeHtml(id)}" type="button">Enroll</button>
    `;
  }

  if (type === 'learning' && item.courseId) {
    return `
      <button class="mini-btn" data-action="use-module" data-id="${escapeHtml(id)}" type="button">Use for lesson</button>
      <button class="mini-btn" data-action="use-assignment-module" data-id="${escapeHtml(id)}" type="button">Use for assignment</button>
    `;
  }

  if (type === 'assignments') {
    return `<button class="mini-btn" data-action="grade-assignment" data-id="${escapeHtml(id)}" type="button">Grade</button>`;
  }

  return '';
}

function scoreText(item) {
  if (item.totalScore !== undefined) {
    return `Score ${item.totalScore}`;
  }
  if (item.score !== undefined && item.score !== null) {
    return `Score ${item.score}`;
  }
  return '';
}

function dateText(item) {
  const value = item.enrolledAt || item.createdAt || item.submittedAt;
  if (!value) {
    return '';
  }
  return new Date(value).toLocaleDateString();
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
  renderList('#coursesList', courses, 'No courses found', 'courses');
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
      showToast('Account created and logged in');
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
      showToast('Logged in');
      await loadDashboard();
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#logoutBtn').addEventListener('click', async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Local session should still be cleared if the server is unavailable.
    }
    state.accessToken = '';
    state.user = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    renderUser();
    showToast('Logged out');
  });

  $('#courseForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      if (!['ADMIN', 'TEACHER'].includes(role())) {
        showToast('Course creation needs TEACHER or ADMIN role. Go to Auth and login with that role.');
        return;
      }
      const payload = numberFields(formData(event.currentTarget), ['price']);
      await api('/courses', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Course created');
      await loadCourses();
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#moduleForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      if (!['ADMIN', 'TEACHER'].includes(role())) {
        showToast('Module creation needs TEACHER or ADMIN role.');
        return;
      }
      const payload = numberFields(formData(event.currentTarget), ['order']);
      const { courseId, ...body } = payload;
      const created = await api(`/courses/${courseId}/modules`, { method: 'POST', body: JSON.stringify(body) });
      renderList('#learningList', [created], 'No module created', 'learning');
      showToast('Module created');
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#lessonForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      if (!['ADMIN', 'TEACHER'].includes(role())) {
        showToast('Lesson creation needs TEACHER or ADMIN role.');
        return;
      }
      const payload = numberFields(formData(event.currentTarget), ['order']);
      const { moduleId, ...body } = payload;
      const created = await api(`/modules/${moduleId}/lessons`, { method: 'POST', body: JSON.stringify(body) });
      renderList('#learningList', [created], 'No lesson created', 'learning');
      showToast('Lesson created');
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#enrollForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      if (role() !== 'STUDENT') {
        showToast('Enrollment needs STUDENT role. Go to Auth and login as student.');
        return;
      }
      const { courseId } = formData(event.currentTarget);
      await api(`/courses/${courseId}/enroll`, { method: 'POST' });
      const myCourses = await api('/my-courses');
      $('#myCourseCount').textContent = myCourses.length;
      renderList('#learningList', myCourses, 'No enrolled courses');
      showToast('Enrolled successfully');
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#loadLessonsForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const { moduleId } = formData(event.currentTarget);
      const lessons = await api(`/modules/${moduleId}/lessons`);
      renderList('#learningList', lessons, 'No lessons found', 'learning');
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#assignmentForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      if (role() !== 'STUDENT') {
        showToast('Submitting assignments needs STUDENT role.');
        return;
      }
      const { moduleId, ...body } = formData(event.currentTarget);
      const created = await api(`/modules/${moduleId}/assignments`, { method: 'POST', body: JSON.stringify(body) });
      renderList('#assignmentsList', [created], 'No assignment submitted', 'assignments');
      showToast('Assignment submitted');
    } catch (error) {
      showToast(explainError(error));
    }
  });

  $('#gradeForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      if (!['ADMIN', 'TEACHER'].includes(role())) {
        showToast('Grading assignments needs TEACHER or ADMIN role.');
        return;
      }
      const payload = numberFields(formData(event.currentTarget), ['score']);
      const { assignmentId, ...body } = payload;
      const graded = await api(`/assignments/${assignmentId}/grade`, { method: 'PATCH', body: JSON.stringify(body) });
      renderList('#assignmentsList', [graded], 'No assignment graded', 'assignments');
      showToast('Assignment graded');
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
        showToast('My assignments works only for STUDENT role.');
        return;
      }
      const assignments = await api('/assignments/my');
      $('#assignmentCount').textContent = assignments.length;
      renderList('#assignmentsList', assignments, 'No assignments found', 'assignments');
    } catch (error) {
      showToast(explainError(error));
    }
  });
  $('#loadMyResultsBtn').addEventListener('click', async () => {
    try {
      if (role() !== 'STUDENT') {
        showToast('My results works only for STUDENT role. Teacher/Admin should use All results.');
        return;
      }
      const results = await api('/results/me');
      $('#resultCount').textContent = results.length;
      renderList('#resultsList', results, 'No results found');
    } catch (error) {
      showToast(explainError(error));
    }
  });
  $('#loadAllResultsBtn').addEventListener('click', async () => {
    try {
      if (!['ADMIN', 'TEACHER'].includes(role())) {
        showToast('All results needs TEACHER or ADMIN role.');
        return;
      }
      const results = await api('/results');
      renderList('#resultsList', results, 'No results found');
    } catch (error) {
      showToast(explainError(error));
    }
  });
  $('#loadUsersBtn').addEventListener('click', async () => {
    try {
      if (role() !== 'ADMIN') {
        showToast('Users page needs ADMIN role.');
        return;
      }
      const users = await api('/users');
      renderList('#usersList', users, 'No users found');
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
      showToast('Course ID added to learning forms');
    }

    if (action === 'enroll-course') {
      setInput('#enrollForm', 'courseId', id);
      if (role() !== 'STUDENT') {
        showToast('Enrollment needs STUDENT role. Go to Auth and login as student.');
        return;
      }
      try {
        await api(`/courses/${id}/enroll`, { method: 'POST' });
        showToast('Enrolled successfully');
      } catch (error) {
        showToast(explainError(error));
      }
    }

    if (action === 'use-module') {
      setInput('#lessonForm', 'moduleId', id);
      setInput('#loadLessonsForm', 'moduleId', id);
      showToast('Module ID added to lesson forms');
    }

    if (action === 'use-assignment-module') {
      setInput('#assignmentForm', 'moduleId', id);
      showToast('Module ID added to assignment form');
    }

    if (action === 'grade-assignment') {
      setInput('#gradeForm', 'assignmentId', id);
      showToast('Assignment ID added to grade form');
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
