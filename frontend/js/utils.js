const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3200);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
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

function setInput(formSelector, name, value) {
  const input = $(`${formSelector} [name="${name}"]`);
  if (input) {
    input.value = value;
    input.focus();
  }
}