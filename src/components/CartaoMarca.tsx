import { CONFIG } from '../config';
import { formatNumero } from '../lib/contact';
import { Icon } from './Icon';

interface Props {
  /** Versão do rodapé: só logo e nome, sem números. */
  compacto?: boolean;
  className?: string;
}

/** Cartão da marca fictícia (logo em SVG + nome + números). */
export function CartaoMarca({ compacto = false, className = '' }: Props) {
  return (
    <div className={`logo-card ${className}`.trim()}>
      <div className="lc">
        <img src="/assets/logo-color.svg" width={200} height={200} alt={compacto ? 'Logo Zênite Motoboy' : ''} loading={compacto ? 'lazy' : undefined} />
        <b>ZÊNITE</b>
        <span>MOTOBOY</span>
        {!compacto && (
          <div className="nums" aria-hidden="true">
            <p>
              <b>{CONFIG.demo ? '24H' : CONFIG.telefone.prefixo}</b> <span>{CONFIG.demo ? 'TODO DIA' : formatNumero(CONFIG.telefone.numero)}</span>
            </p>
            <p>
              <Icon name="wa" />
              <span>{CONFIG.demo ? 'ZAP PRONTO' : formatNumero(CONFIG.whatsapp)}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
