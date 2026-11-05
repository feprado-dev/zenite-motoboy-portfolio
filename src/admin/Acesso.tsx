import { useRef, useState, type FormEvent } from 'react';
import { K_PIN, gravar, hashPin, ler } from './lib';

export type ModoAcesso = 'login' | 'create' | 'change';

interface Props {
  modo: ModoAcesso;
  onEntrar: () => void;
}

/** Tela do PIN: criar, trocar ou digitar. */
export function Acesso({ modo, onEntrar }: Props) {
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [erro, setErro] = useState('');
  const falhas = useRef(0);
  const bloqueio = useRef(0);
  const criando = modo === 'create' || modo === 'change';

  const enviar = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const v = pin.replace(/\D/g, '');
    if (criando) {
      if (v.length < 4) return setErro('Use pelo menos 4 números.');
      if (v !== pin2.replace(/\D/g, '')) return setErro('Os dois PINs não são iguais.');
      gravar(K_PIN, await hashPin(v));
      return onEntrar();
    }
    if (Date.now() < bloqueio.current) return setErro(`Muitas tentativas. Aguarde ${Math.ceil((bloqueio.current - Date.now()) / 1000)}s.`);
    if ((await hashPin(v)) === ler(K_PIN)) {
      falhas.current = 0;
      return onEntrar();
    }
    falhas.current++;
    setPin('');
    if (falhas.current >= 5) {
      bloqueio.current = Date.now() + 30000;
      falhas.current = 0;
      setErro('Muitas tentativas. Aguarde 30s.');
    } else setErro('PIN incorreto.');
  };

  return (
    <section className="gate" id="gate">
      <form className="gate-card" onSubmit={enviar} autoComplete="off">
        <img src="/assets/favicon.svg" width={64} height={64} alt="" />
        <h1>{modo === 'change' ? 'Trocar PIN' : criando ? 'Crie o seu PIN' : 'Área do dono'}</h1>
        <p>{criando ? 'Escolha um PIN de 4 a 12 números. Ele protege esta área neste aparelho.' : 'Digite o seu PIN para entrar.'}</p>
        <input type="password" inputMode="numeric" autoComplete={criando ? 'new-password' : 'current-password'} maxLength={12} placeholder="PIN" aria-label="PIN" required autoFocus value={pin} onChange={(e) => setPin(e.target.value)} />
        {criando && <input type="password" inputMode="numeric" autoComplete="new-password" maxLength={12} placeholder="Repita o PIN" aria-label="Repita o PIN" required value={pin2} onChange={(e) => setPin2(e.target.value)} />}
        {erro && (
          <p className="err" role="alert">
            {erro}
          </p>
        )}
        <button className="btn wa" type="submit">
          {criando ? 'Salvar PIN' : 'Entrar'}
        </button>
        <a className="back" href="/index.html">
          ← Voltar ao site
        </a>
      </form>
    </section>
  );
}
