import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Ticker from '@/components/Ticker';
import Dor from '@/components/Dor';
import Diferenciais from '@/components/Diferenciais';
import ProvaSocial from '@/components/ProvaSocial';
import Modelos from '@/components/Modelos';
import ComoFunciona from '@/components/ComoFunciona';
import CondicoesDestaque from '@/components/CondicoesDestaque';
import Catalogo from '@/components/Catalogo';
import Sobre from '@/components/Sobre';
import Ebook from '@/components/Ebook';
import Faq from '@/components/Faq';
import Formulario from '@/components/Formulario';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main id="topo">
        <Hero />
        <Ticker />
        <Dor />
        <Diferenciais />
        <ProvaSocial />
        <Modelos />
        <ComoFunciona />
        <CondicoesDestaque />
        <Catalogo />
        <Sobre />
        <Ebook />
        <Faq />
        <Formulario />
      </main>
      <Footer />
    </>
  );
}
