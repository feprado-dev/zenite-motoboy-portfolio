import { Icon } from './Icon';
import { WaLink } from './Aviso';

const LINKS: Array<[string, string]> = [
  ['#servicos', 'Serviços'],
  ['#como', 'Como funciona'],
  ['#porque', 'Por que a Zênite'],
  ['#contato', 'Contato'],
];

export function Cabecalho({ solido }: { solido: boolean }) {
  return (
    <header className={`nav${solido ? ' solid-bar' : ''}`} id="top">
      <div className="wrap nav-in">
        <a className="brand" href="#inicio" aria-label="Zênite Motoboy — início">
          <img src="/assets/favicon.svg" width={38} height={38} alt="" />
          <span>
            <b>ZÊNITE</b> <i>MOTOBOY</i>
          </span>
        </a>
        <nav className="links" aria-label="Principal">
          {LINKS.map(([href, texto]) => (
            <a key={href} href={href}>
              {texto}
            </a>
          ))}
        </nav>
        <WaLink className="btn wa sm">
          <Icon name="wa" className="ic" />
          <span>WhatsApp</span>
        </WaLink>
      </div>
    </header>
  );
}
