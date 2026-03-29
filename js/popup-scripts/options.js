const settings = document.getElementById('settings');

settings.addEventListener('click', () => {
  chrome.tabs.create({ url: './../../html/views/home.html' }, () => {});
});
