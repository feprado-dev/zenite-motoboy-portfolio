import { useState, type FormEvent } from 'react';
import { CONFIG } from '../config';
import { waUrl } from '../lib/contact';
import { ORDEM_CHIPS, SERVICOS } from '../lib/servicos';
import { CartaoMarca } from './CartaoMarca';
import { Icon } from './Icon';

interface Props {
  servico: string;
  onServico: (valor: string) => void;
}

interface Dados {
  origem: string;
  destino: string;
  nome: string;
}

/** Monta as linhas da mensagem do WhatsApp. */
export function montarMensagem(servico: string, d: Dados): string[] {
  const linhas = [
    `Olá, ${CONFIG.nome}! Gostaria de solicitar um serviço.`,
    '',
    `*Nome:* ${d.nome.trim()}`,
    `*Serviço:* ${servico}`,
    `*Retirada/embarque:* ${d.origem.trim()}`,
  ];
  if (d.destino.trim()) linhas.push(`*Destino/entrega:* ${d.destino.trim()}`);
  return linhas;
}

export function Pedido({ servico, onServico }: Props) {
  const [dados, setDados] = useState<Dados>({ origem: '', destino: '', nome: '' });
  const [previa, setPrevia] = useState<string[] | null>(null);
  const [url, setUrl] = useState('');

  const campo = (k: keyof Dados) => (e: React.ChangeEvent<HTMLInputElement>) => setDados({ ...dados, [k]: e.target.value });

  const enviar = (e: FormEvent): void => {
    e.preventDefault();
    const linhas = montarMensagem(servico, dados);
    const link = waUrl(linhas.join('\n'));
    setUrl(link);
    setPrevia(linhas);
    if (CONFIG.demo) return; // demonstração: só mostra a prévia
    const w = window.open(link, '_blank', 'noopener');
    if (!w) window.location.href = link;
  };

  return (
    <section className="sec peca" id="peca">
      <div className="wrap peca-in">
        <div className="peca-txt">
          <p className="kicker rv">Peça agora</p>
          <h2 className="h2 rv">
            Quatro campos.
            <br />
            <em>Mensagem pronta.</em>
          </h2>
          <p className="peca-p rv">Escolha o serviço, diga onde buscar e para onde ir. O WhatsApp abre com tudo escrito, é só enviar.</p>
        </div>
        <div className="deck">
          <CartaoMarca />
          <form className="order" id="pedido" aria-labelledby="pedido-t" onSubmit={enviar}>
            <h2 id="pedido-t">
              Peça agora <small>Preencha e o WhatsApp abre com a mensagem pronta</small>
            </h2>
            <fieldset>
              <legend>1. O que você precisa?</legend>
              <div className="chips">
                {ORDEM_CHIPS.map((valor, i) => {
                  const s = SERVICOS.find((x) => x.valor === valor);
                  return (
                    <span key={valor} style={{ display: 'contents' }}>
                      <input type="radio" name="servico" id={`sv${i}`} value={valor} required checked={servico === valor} onChange={() => onServico(valor)} />
                      <label htmlFor={`sv${i}`}>{s?.chip ?? valor}</label>
                    </span>
                  );
                })}
              </div>
            </fieldset>
            <label className="fld">
              <span>2. Onde buscamos?</span>
              <input name="origem" type="text" autoComplete="street-address" maxLength={120} required placeholder="Rua, número e bairro" value={dados.origem} onChange={campo('origem')} />
            </label>
            <label className="fld">
              <span>
                3. Para onde vamos? <em>(opcional)</em>
              </span>
              <input name="destino" type="text" maxLength={120} placeholder="Rua, número e bairro" value={dados.destino} onChange={campo('destino')} />
            </label>
            <label className="fld">
              <span>4. Seu nome</span>
              <input name="nome" type="text" autoComplete="name" maxLength={60} required placeholder="Como podemos chamar você?" value={dados.nome} onChange={campo('nome')} />
            </label>
            <button className="btn wa big full" type="submit">
              <Icon name="wa" className="ic" />
              <span>Enviar pelo WhatsApp</span>
            </button>
            {previa && (
              <p className="fb" id="fb">
                {CONFIG.demo ? (
                  <>
                    <b>Demonstração:</b> o WhatsApp abriria com esta mensagem pronta:
                    <br />
                    <br />
                    {previa.map((l, i) => (
                      <span key={i}>
                        {l.replace(/\*/g, '')}
                        <br />
                      </span>
                    ))}
                  </>
                ) : (
                  <>
                    Abrindo o WhatsApp… Se não abrir,{' '}
                    <a href={url} target="_blank" rel="noopener">
                      toque aqui
                    </a>
                    .
                  </>
                )}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
