document.addEventListener('click', function(e) {
  if (!e.target.classList.contains('copy-card-button')) return;
  var targetId = e.target.dataset.target;
  var pre = document.getElementById(targetId);
  if (!pre) return;
  var text = pre.innerText || pre.textContent;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      showCopied(e.target);
    }).catch(function() {
      fallbackCopy(pre, e.target);
    });
  } else {
    fallbackCopy(pre, e.target);
  }
});

function showCopied(btn) {
  var orig = btn.textContent;
  btn.textContent = 'Copied! \u2713';
  btn.style.background = '#22c55e';
  setTimeout(function() {
    btn.textContent = orig;
    btn.style.background = '';
  }, 1200);
}

function fallbackCopy(pre, btn) {
  var range = document.createRange();
  range.selectNode(pre);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  try { document.execCommand('copy'); showCopied(btn); } catch(err) {}
  window.getSelection().removeAllRanges();
}
