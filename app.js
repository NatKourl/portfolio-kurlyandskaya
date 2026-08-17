/* Assemble email links at runtime so the address never sits in the HTML
   (basic bots don't run JS and won't scrape it). Markup:
   <a class="js-mail" data-u="natk72" data-d="gmail.com" data-show>
      <span class="material-symbols-outlined">mail</span><span data-mail></span></a>
   data-show + a [data-mail] span → the address is also rendered as text. */
(function(){
  function build(a){
    var u=a.getAttribute('data-u'), d=a.getAttribute('data-d');
    if(!u || !d) return;
    var addr = u + '@' + d;
    a.setAttribute('href', 'mailto:' + addr);
    if(a.hasAttribute('data-show')){
      var slot = a.querySelector('[data-mail]');
      if(slot) slot.textContent = addr; else a.textContent = addr;
    }
  }
  document.querySelectorAll('a.js-mail').forEach(build);
})();
