const state = {
  accessToken: localStorage.getItem('accessToken') || '',
  user: JSON.parse(localStorage.getItem('user') || 'null')
};