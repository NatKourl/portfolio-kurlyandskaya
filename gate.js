/* Client-side passcode gate for private case pages.
   On a gated page, add to <head> (before content), then load this file at end of body:
     <script>window.NK_GATE="<sha256-of-code>";document.documentElement.className+=' nk-gated';</script>
   Notes: this is "casual" protection — the page HTML is still in the served source,
   so it deters casual viewers, not determined ones. Share a ready link with ?key=CODE. */
(function(){
  var HASH = window.NK_GATE;
  if(!HASH){ document.documentElement.classList.remove('nk-gated'); return; }
  var KEY = 'nk-gate-' + HASH.slice(0,10);

  function reveal(){
    document.documentElement.classList.remove('nk-gated');
    var g = document.getElementById('nk-gate'); if(g) g.remove();
  }
  async function sha256(s){
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.from(new Uint8Array(buf)).map(function(x){return x.toString(16).padStart(2,'0');}).join('');
  }

  // already unlocked this session
  try{ if(sessionStorage.getItem(KEY)==='1'){ reveal(); return; } }catch(e){}

  function buildOverlay(){
    var ov = document.createElement('div'); ov.id = 'nk-gate';
    ov.innerHTML =
      '<div class="nk-gate-card">' +
        '<span class="material-symbols-outlined nk-gate-ic">lock</span>' +
        '<h2>Приватный кейс</h2>' +
        '<p>Этот кейс доступен по запросу. Введите код доступа, чтобы посмотреть.</p>' +
        '<form id="nk-gate-form">' +
          '<input id="nk-gate-input" type="password" autocomplete="off" placeholder="Код доступа" aria-label="Код доступа">' +
          '<button type="submit">Открыть</button>' +
        '</form>' +
        '<p class="nk-gate-err" id="nk-gate-err" hidden>Код не подошёл — попробуйте ещё раз.</p>' +
        '<p class="nk-gate-foot">Нет кода? Запросите доступ: <a id="nk-gate-mail" href="#"></a></p>' +
      '</div>';
    document.body.appendChild(ov);
    document.getElementById('nk-gate-form').addEventListener('submit', async function(e){
      e.preventDefault();
      var v = document.getElementById('nk-gate-input').value.trim(); if(!v) return;
      if((await sha256(v)) === HASH){ try{ sessionStorage.setItem(KEY,'1'); }catch(e){} reveal(); }
      else { document.getElementById('nk-gate-err').hidden = false; }
    });
    var mail = document.getElementById('nk-gate-mail');
    if(mail){ var addr = 'natk72' + String.fromCharCode(64) + 'gmail.com'; mail.href = 'mailto:' + addr; mail.textContent = addr; }
    setTimeout(function(){ var i=document.getElementById('nk-gate-input'); if(i) i.focus(); }, 60);
  }

  async function tryUrlKey(){
    var m = location.search.match(/[?&]key=([^&]+)/); if(!m) return false;
    if((await sha256(decodeURIComponent(m[1]))) === HASH){ try{ sessionStorage.setItem(KEY,'1'); }catch(e){} reveal(); return true; }
    return false;
  }

  tryUrlKey().then(function(ok){ if(!ok) buildOverlay(); });
})();
