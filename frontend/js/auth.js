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

function logout() {
  state.accessToken = '';
  state.user = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  renderUser();
  showToast('Tizimdan chiqildi');
}