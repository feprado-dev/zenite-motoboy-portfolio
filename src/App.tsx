import { useCallback, useState } from 'react';
import { AvisoProvider } from './components/Aviso';
import { Cabecalho } from './components/Cabecalho';
import { Capa } from './components/Capa';
import { Fundo } from './components/Fundo';
import { Sprite } from './components/Icon';
import { Pedido } from './components/Pedido';
import { ComoFunciona, Cidade, Contato, Faixa, PorQue, Rodape, Servicos } from './components/Secoes';
import { useRevelar, useRolagem } from './hooks/hooks';
import { ORDEM_CHIPS } from './lib/servicos';
import { prefereMenosMovimento } from './lib/motion';

export default function App() {
  const [servico, setServico] = useState<string>(ORDEM_CHIPS[0]);
  const solido = useRolagem();
  useRevelar();

  /** Botão "Pedir" de um cartão: marca o serviço e leva ao formulário. */
  const pedir = useCallback((valor: string) => {
    setServico(valor);
    const form = document.getElementById('pedido');
    form?.scrollIntoView({ behavior: prefereMenosMovimento() ? 'auto' : 'smooth', block: 'center' });
    window.setTimeout(() => document.querySelector<HTMLInputElement>('#pedido input[name=origem]')?.focus({ preventScroll: true }), 450);
  }, []);

  return (
    <AvisoProvider>
      <Sprite />
      <Fundo />
      <div className="progress" aria-hidden="true">
        <i id="bar" />
      </div>
      <a className="skip" href="#conteudo">
        Ir para o conteúdo
      </a>
      <Cabecalho solido={solido} />
      <main id="conteudo">
        <Capa />
        <Pedido servico={servico} onServico={setServico} />
        <Faixa />
        <Servicos onPedir={pedir} />
        <ComoFunciona />
        <PorQue />
        <Cidade />
        <Contato />
      </main>
      <Rodape />
    </AvisoProvider>
  );
}
