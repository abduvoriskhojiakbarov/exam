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