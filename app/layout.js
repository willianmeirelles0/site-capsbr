import { Montserrat } from 'next/font/google';
import './globals.css';
import { FAQ_ITEMS } from '@/lib/faq';
import { GTM_ID, META_PIXEL_ID } from '@/lib/tracking';
import LogoSprite from '@/components/LogoSprite';
import Providers from '@/components/Providers';
import PolicyModal from '@/components/PolicyModal';
import CookieAviso from '@/components/CookieAviso';
import WhatsappFloat from '@/components/WhatsappFloat';
import RevealSystem from '@/components/RevealSystem';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap'
});

const SITE_URL = 'https://capsbr.com.br';
const TITULO = 'Terceirização de Suplementos White Label e Private Label | CapsBR';
const DESCRICAO =
  'A CapsBR terceiriza a produção da sua marca de suplementos no Brasil: fórmulas com teste de estabilidade, 100% dentro das normas da Anvisa, rótulo de alta qualidade e o melhor prazo do Brasil em White Label e Private Label. Mais de 30 marcas já lançadas.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITULO,
  description: DESCRICAO,
  keywords: 'terceirização de suplementos, white label suplementos, private label suplementos, fabricar suplementos, marca própria de suplementos, nutracêuticos, terceirização nutracêuticos Brasil',
  authors: [{ name: 'CapsBR Nutracêuticos' }],
  robots: 'index, follow',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'CapsBR',
    locale: 'pt_BR',
    title: TITULO,
    description: 'Fórmulas com teste de estabilidade, 100% dentro das normas da Anvisa e o melhor prazo do Brasil para colocar sua marca de suplementos no mercado. Mais de 30 marcas já lançadas.',
    images: ['/assets/logo-og.png']
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
    description: 'Fórmulas com teste de estabilidade, 100% dentro das normas da Anvisa e o melhor prazo do Brasil para colocar sua marca de suplementos no mercado.',
    images: ['/assets/logo-og.png']
  }
};

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CapsBR',
  legalName: 'CapsBR Nutracêuticos Ltda',
  url: SITE_URL + '/',
  logo: SITE_URL + '/assets/logo-og.png',
  image: SITE_URL + '/assets/logo-og.png',
  email: 'contato@capsbr.com.br',
  description: 'Terceirização de produção de suplementos (nutracêuticos) no modelo White Label e Private Label, com fórmulas testadas e dentro das normas da Anvisa.',
  areaServed: 'BR',
  sameAs: ['https://www.instagram.com/capsbr.nutra/']
};

const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.pergunta,
    acceptedAnswer: { '@type': 'Answer', text: item.resposta }
  }))
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={montserrat.variable}>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={'https://www.googletagmanager.com/ns.html?id=' + GTM_ID}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {/* Rede de segurança: se o JavaScript não rodar por qualquer motivo,
            o conteúdo (que começa com opacity:0 até o RevealSystem rodar)
            não pode ficar invisível para sempre. */}
        <noscript>
          <style>{'.reveal{opacity:1 !important;transform:none !important;}'}</style>
        </noscript>

        {/* Meta Pixel: fallback para quando o JS não roda (mesmo sem consentimento
            de cookies, igual ao comportamento do site original em HTML). */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={'https://www.facebook.com/tr?id=' + META_PIXEL_ID + '&ev=PageView&noscript=1'}
            alt=""
          />
        </noscript>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />

        <LogoSprite />

        <Providers>
          {children}
          <PolicyModal />
          <WhatsappFloat />
          <CookieAviso />
          <RevealSystem />
        </Providers>
      </body>
    </html>
  );
}
