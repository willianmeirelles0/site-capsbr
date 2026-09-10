// Rastreamento (Meta Pixel, GA4, GTM, Google Ads) — só é iniciado depois que
// a pessoa aceita o aviso de cookies (ver context/CookieConsentContext.js).
// Enquanto não há consentimento, fbq()/gtag() nem existem no navegador.

export const META_PIXEL_ID = '1024961890342249';
export const GA4_ID = 'G-LNGH1V1WSN';
export const GTM_ID = 'GTM-WVWQDVNS';
export const GOOGLE_ADS_ID = 'AW-18387904448';

export const WHATSAPP_NUMERO = '5554997090147'; // (54) 99709-0147
export const WHATSAPP_MENSAGEM_PADRAO = 'Olá! Quero terceirizar a produção da minha marca de suplementos com a CapsBR.';

export function linkWhatsapp(mensagem) {
  return 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + encodeURIComponent(mensagem);
}

let metaPixelIniciado = false;
export function iniciarMetaPixel() {
  if (metaPixelIniciado || typeof window === 'undefined') return;
  metaPixelIniciado = true;
  /* eslint-disable */
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}

let googleTrackingIniciado = false;
export function iniciarGoogleTracking() {
  if (googleTrackingIniciado || typeof window === 'undefined') return;
  googleTrackingIniciado = true;

  // Google Tag Manager
  /* eslint-disable */
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer',GTM_ID);
  /* eslint-enable */

  // Google tag (gtag.js) — carrega uma vez, configura GA4 e Google Ads
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

export function iniciarRastreamento() {
  iniciarMetaPixel();
  iniciarGoogleTracking();
}
