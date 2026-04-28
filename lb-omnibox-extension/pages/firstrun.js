'use strict';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('go-google').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.google.com' });
  });

  document.getElementById('go-settings').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  });
});
