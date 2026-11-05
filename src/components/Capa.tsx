import type { CSSProperties } from 'react';
import { useRelogio } from '../hooks/hooks';
import { Icon } from './Icon';
import { WaLink } from './Aviso';

const atraso = (i: number): CSSProperties => ({ ['--i' as string]: i });

export function Capa() {
  const hora = useRelogio();
  return (
    <section className="cover" id="inicio">
      <div className="cover-in">
        <p className="chip a" style={atraso(0)}>
          <i className="dot" />
          Demonstração · Cidade Exemplo · <b>{hora}</b>
        </p>
        <h1 className="a" style={atraso(1)}>
          Do ponto A
          <br />
          ao <em>ponto B.</em>
        </h1>
        <p className="lead a" style={atraso(2)}>
          A Zênite Motoboy leva o que você precisa, do jeito certo. Peça em poucos toques e a mensagem já vai pronta para o WhatsApp.
        </p>
        <div className="cta a" style={atraso(3)}>
          <a className="btn red big" href="#peca">
            Chamar motoboy
          </a>
          <WaLink className="btn wa big">
            <Icon name="wa" className="ic" />
            <span>WhatsApp</span>
          </WaLink>
        </div>
        <ul className="facts a" style={atraso(4)}>
          <li>
            <b>24h</b>
            <span>todos os dias</span>
          </li>
          <li>
            <b>Centro</b>
            <span>Cidade Exemplo</span>
          </li>
          <li>
            <b>Zap</b>
            <span>mensagem pronta</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
