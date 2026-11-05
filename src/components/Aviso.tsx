import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { CONFIG } from '../config';
import { telUrl, waUrl } from '../lib/contact';
import type { Telefone } from '../config';

type Notificar = (texto: string) => void;
const AvisoContext = createContext<Notificar>(() => undefined);

/** Toast do modo demonstração. */
export function AvisoProvider({ children }: { children: ReactNode }) {
  const [texto, setTexto] = useState('');
  const [visivel, setVisivel] = useState(false);
  const timer = useRef(0);

  const notificar = useCallback<Notificar>((t) => {
    setTexto(t);
    setVisivel(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisivel(false), 4200);
  }, []);

  return (
    <AvisoContext.Provider value={notificar}>
      {children}
      <div className={`toast${visivel ? ' on' : ''}`} role="status">
        {texto}
      </div>
    </AvisoContext.Provider>
  );
}

export const useAviso = (): Notificar => useContext(AvisoContext);

interface LinkProps {
  className?: string;
  href?: string;
  children: ReactNode;
}

/** Link do WhatsApp: abre o wa.me ou, em modo demonstração, mostra um aviso. */
export function WaLink({ className, children, href = '#contato' }: LinkProps) {
  const avisar = useAviso();
  return (
    <a
      className={className}
      href={CONFIG.demo ? href : waUrl(CONFIG.mensagemPadrao)}
      {...(CONFIG.demo ? {} : { target: '_blank', rel: 'noopener' })}
      onClick={(e) => {
        if (CONFIG.demo) {
          e.preventDefault();
          avisar('Demonstração: aqui o WhatsApp abriria com a mensagem pronta.');
        }
      }}
    >
      {children}
    </a>
  );
}

/** Link de telefone com o mesmo comportamento de demonstração. */
export function TelLink({ className, children, tel }: LinkProps & { tel: Telefone }) {
  const avisar = useAviso();
  return (
    <a
      className={className}
      href={CONFIG.demo ? '#contato' : telUrl(tel)}
      onClick={(e) => {
        if (CONFIG.demo) {
          e.preventDefault();
          avisar('Demonstração: aqui o telefone discaria para a empresa.');
        }
      }}
    >
      {children}
    </a>
  );
}
