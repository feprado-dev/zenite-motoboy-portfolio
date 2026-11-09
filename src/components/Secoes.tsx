import { CONFIG } from '../config';
import { formatNumero, formatTelefone, mapaUrl } from '../lib/contact';
import { SERVICOS } from '../lib/servicos';
import { useRelogio } from '../hooks/hooks';
import { prefereMenosMovimento } from '../lib/motion';
import { useRef, type CSSProperties } from 'react';
import { CartaoMarca } from './CartaoMarca';
import { Icon } from './Icon';
import { TelLink, WaLink, useAviso } from './Aviso';

const TEXTO_FAIXA = 'Atendimento 24 hrs — Delivery — Passageiros — Compras — Viagens — Serviços bancários — Coleta de documentos — ';

export function Faixa() {
  return (
    <div className="marq" aria-hidden="true">
      <div>
        <span>{TEXTO_FAIXA}</span>
        <span>{TEXTO_FAIXA}</span>
      </div>
    </div>
  );
}

export function Servicos({ onPedir }: { onPedir: (valor: string) => void }) {
  return (
    <section className="sec" id="servicos">
      <div className="wrap">
        <p className="kicker rv">Serviços</p>
        <h2 className="h2 rv">
          Uma moto.
          <br />
          <em>Seis jeitos de ajudar.</em>
        </h2>
      </div>
      <div className="rail" id="rail">
        {SERVICOS.map((s, i) => (
          <article className="sv rv" key={s.valor}>
            <span className="n">{String(i + 1).padStart(2, '0')}</span>
            <Icon name={s.icone} className="ico" />
            <h3>{s.titulo}</h3>
            <p>{s.texto}</p>
            <button type="button" onClick={() => onPedir(s.valor)}>
              Pedir <Icon name="arrow" />
            </button>
          </article>
        ))}
      </div>
      <p className="wrap swipe">Deslize para ver mais →</p>
    </section>
  );
}

const PASSOS = [
  { n: 1, titulo: 'Chame', texto: 'Escolha o serviço no pedido, toque no WhatsApp ou ligue para nós.' },
  { n: 2, titulo: 'Informe', texto: 'Diga onde buscar e para onde ir ou entregar.' },
  { n: 3, titulo: 'Pronto!', texto: 'Um motociclista da Zênite vai até você e leva tudo com agilidade.' },
];

export function ComoFunciona() {
  return (
    <section className="sec alt" id="como">
      <div className="wrap">
        <p className="kicker rv">Como funciona</p>
        <h2 className="h2 rv">
          Três passos.
          <br />
          <em>Zero burocracia.</em>
        </h2>
        <ol className="how">
          {PASSOS.map((p) => (
            <li className="rv" key={p.n}>
              <span className="big-n">{p.n}</span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const MOTIVOS = [
  { titulo: '24 horas por dia', texto: 'Dia, noite ou madrugada: a Zênite está de plantão para atender você.' },
  { titulo: 'Agilidade no trânsito', texto: 'A moto passa por onde o carro para: você chega e entrega mais rápido.' },
  { titulo: 'Atendimento direto', texto: 'Peça por WhatsApp ou telefone, sem aplicativo e sem cadastro.' },
  { titulo: 'Vários serviços em um', texto: 'Passageiros, entregas, compras, banco e documentos com uma só chamada.' },
];

export function PorQue() {
  const hora = useRelogio();
  return (
    <section className="sec" id="porque">
      <div className="wrap why">
        <div>
          <p className="kicker rv">Por que a Zênite</p>
          <h2 className="h2 rv">
            Direto,
            <br />
            <em>rápido e sempre aberto.</em>
          </h2>
          <div className="clock rv">
            <span>{hora}</span>
            <small>agora · atendendo</small>
          </div>
        </div>
        <ul className="list">
          {MOTIVOS.map((m) => (
            <li className="rv" key={m.titulo}>
              <Icon name="check" />
              <div>
                <h3>{m.titulo}</h3>
                <p>{m.texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Cidade() {
  return (
    <section className="city" id="cidade">
      <div className="city-bg" id="cityBg" aria-hidden="true" />
      <div className="wrap city-grid">
        <div className="city-copy">
          <p className="kicker rv">24 horas por dia</p>
          <h2 className="rv">
            A cidade dorme.
            <br />
            <em>A Zênite não.</em>
          </h2>
          <p className="city-p rv">Madrugada, fim de plantão, entrega de última hora: chamou, a Zênite vai.</p>
          <div className="cta rv">
            <WaLink className="btn wa big">
              <Icon name="wa" className="ic" />
              <span>Chamar agora</span>
            </WaLink>
            <a className="btn ghost big" href="#peca">
              <span>Fazer um pedido</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Número de contato: cada caractere "pula" ao passar o mouse ou tocar. */
function NumeroGrande() {
  const mega = useRef<HTMLAnchorElement>(null);
  const txt = useRef<HTMLSpanElement>(null);
  const ondulando = useRef(false);
  // Em demonstração mostra uma chamada em vez de um número fictício ("90000-0000" parecia site inacabado).
  const valor = CONFIG.demo ? 'CHAME\u00a0JÁ' : formatNumero(CONFIG.whatsapp);
  const reduz = prefereMenosMovimento();
  const avisar = useAviso();

  const ondular = (): void => {
    if (reduz || ondulando.current || !mega.current) return;
    ondulando.current = true;
    mega.current.classList.add('wave');
    window.setTimeout(() => {
      mega.current?.classList.remove('wave');
      ondulando.current = false;
    }, 520 + valor.length * 38);
  };
  const seguir = (e: React.PointerEvent): void => {
    if (reduz || !mega.current || !txt.current) return;
    const r = mega.current.getBoundingClientRect();
    txt.current.style.translate = `${(((e.clientX - r.left) / r.width - 0.5) * 18).toFixed(1)}px ${(((e.clientY - r.top) / r.height - 0.5) * 10).toFixed(1)}px`;
  };
  const soltar = (): void => {
    if (txt.current) txt.current.style.translate = '';
  };

  return (
    <a
      ref={mega}
      className="mega rv"
      href="#contato"
      aria-label={CONFIG.demo ? 'Chamar no WhatsApp' : `Chamar no WhatsApp: ${valor}`}
      onClick={(e) => {
        if (CONFIG.demo) {
          e.preventDefault();
          avisar('Demonstração: aqui o WhatsApp abriria com a mensagem pronta.');
        }
      }}
      onPointerEnter={ondular}
      onPointerDown={ondular}
      onPointerMove={seguir}
      onPointerLeave={soltar}
      onPointerUp={soltar}
      onPointerCancel={soltar}
    >
      <Icon name="wa" className="ic" />
      <span className="txt" aria-hidden="true" ref={txt}>
        {valor.split('').map((c, i) => (
          <span className="ch" key={i} style={{ ['--i' as string]: i } as CSSProperties}>
            {c}
          </span>
        ))}
      </span>
    </a>
  );
}

export function Contato() {
  return (
    <section className="contact" id="contato">
      <div className="wrap">
        <p className="kicker dk rv">Contato</p>
        <NumeroGrande />
        <p className="mega-s rv">
          {CONFIG.demo ? 'Toque e chame agora no WhatsApp.' : 'Toque no número e chame agora no WhatsApp.'} Atendemos a cidade e região, 24 horas por dia. Viagens: consulte valor e horário. <b>Projeto fictício de portfólio.</b>
        </p>
        <div className="cards">
          <TelLink className="cc rv" tel={CONFIG.telefone}>
            <Icon name="phone" className="ic" />
            <span>
              <small>Telefone</small>
              <b>{CONFIG.demo ? 'Ligar agora' : formatTelefone(CONFIG.telefone)}</b>
            </span>
          </TelLink>
          {CONFIG.telefoneAlt.ativo && (
            <TelLink className="cc rv" tel={CONFIG.telefoneAlt}>
              <Icon name="phone" className="ic" />
              <span>
                <small>Telefone alternativo</small>
                <b>{CONFIG.demo ? 'Segunda linha' : formatTelefone(CONFIG.telefoneAlt)}</b>
              </span>
            </TelLink>
          )}
          <a className="cc rv" href={mapaUrl()} target="_blank" rel="noopener">
            <Icon name="pin" className="ic" />
            <span>
              <small>Endereço</small>
              <b>{CONFIG.endereco}</b>
              <em>{CONFIG.referencia}</em>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function Rodape() {
  return (
    <>
      <footer className="foot">
        <div className="wrap foot-in">
          <CartaoMarca compacto className="foot-logo" />
          <div>
            <p className="fc">Delivery · Passageiros · Compras · Viagens · Serviços bancários · Coleta de documentos</p>
            <p className="fs">
              Projeto fictício de portfólio · © {new Date().getFullYear()} Zênite Motoboy ·{' '}
              <a className="own" href="/admin.html" rel="nofollow">
                Área do dono (demo)
              </a>
            </p>
          </div>
        </div>
      </footer>
      <div className="dock">
        <WaLink className="btn wa">
          <Icon name="wa" className="ic" />
          <span>WhatsApp</span>
        </WaLink>
        <TelLink className="btn dark" tel={CONFIG.telefone}>
          <Icon name="phone" className="ic" />
          <span>Ligar</span>
        </TelLink>
      </div>
    </>
  );
}
