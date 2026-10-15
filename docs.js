// openmoat.dev docs: copy buttons and tabs. Without JS every tab panel is shown.
(function () {
  document.querySelectorAll('.code .copy').forEach(function (btn) {
    if (!navigator.clipboard) { btn.hidden = true; return; }
    btn.addEventListener('click', function () {
      var code = btn.closest('.code').querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(function () {
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
      });
    });
  });

  document.querySelectorAll('.doc-tabs').forEach(function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
    if (tabs.length) select(tabs[0]);
  });

  // on a phone the menu starts closed
  var menu = document.querySelector('.side-menu');
  if (menu && window.matchMedia('(max-width: 900px)').matches) menu.open = false;
})();
