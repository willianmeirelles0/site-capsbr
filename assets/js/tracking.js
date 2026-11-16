/* =========================================================
   CapsBR · rastreamento (Meta Pixel, GA4, GTM) + consentimento de cookies
   Nada disso roda até a pessoa aceitar o aviso de cookies (ou já ter
   aceitado antes, guardado no localStorage). Site inteiro (index, catálogo,
   produto) carrega este arquivo.
   ========================================================= */
(() => {
  const META_PIXEL_ID = '1024961890342249';
  const GA4_ID = 'G-LNGH1V1WSN';
  const GTM_ID = 'GTM-WVWQDVNS';
  const GOOGLE_ADS_ID = 'AW-18387904448';
  const CONSENT_KEY = 'capsbr_cookie_consent';

  function iniciarMetaPixel() {
    if (window.__metaPixelIniciado) return;
    window.__metaPixelIniciado = true;
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s)
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function iniciarGoogleTracking() {
    if (window.__googleTrackingIniciado) return;
    window.__googleTrackingIniciado = true;
    /* eslint-disable */
    (function (w, d, s, l, i) {
      w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', GTM_ID);
    /* eslint-enable */
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(gtagScript);
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID);
    window.gtag('config', GOOGLE_ADS_ID);
  }

  function iniciarRastreamento() {
    iniciarMetaPixel();
    iniciarGoogleTracking();
  }
  window.CapsTracking = { iniciarRastreamento };

  /* ---------- Consentimento de cookies ---------- */
  function boot() {
    const aviso = document.querySelector('.js-cookie-aviso');
    if (localStorage.getItem(CONSENT_KEY) === 'aceito') {
      iniciarRastreamento();
    } else if (aviso) {
      aviso.hidden = false;
    }
    const aceitar = document.querySelector('.js-cookie-aceitar');
    if (aceitar) aceitar.addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'aceito');
      if (aviso) aviso.hidden = true;
      iniciarRastreamento();
    });

    /* ---------- Modal de política de privacidade ---------- */
    const modal = document.querySelector('.js-policy-modal');
    if (!modal) return;
    const open = () => { modal.hidden = false; document.body.style.overflow = 'hidden'; };
    const close = () => { modal.hidden = true; document.body.style.overflow = ''; };
    document.querySelectorAll('.js-policy-trigger').forEach(el => el.addEventListener('click', open));
    document.querySelectorAll('.js-policy-close').forEach(el => el.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
  }

  // Evento padrão da Meta: 'Contact' é para contato direto (WhatsApp) sem
  // passar pelo formulário. 'Lead' fica só pra submissão do formulário.
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href*="wa.me"]');
    if (!a) return;
    if (typeof window.fbq === 'function') window.fbq('track', 'Contact');
    if (typeof window.gtag === 'function') window.gtag('event', 'contact_whatsapp', { event_category: 'engajamento' });
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
