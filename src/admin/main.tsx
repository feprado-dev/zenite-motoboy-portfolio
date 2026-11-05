import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Acesso, type ModoAcesso } from './Acesso';
import { Painel } from './Painel';
import { K_PIN, K_SESSION, carregarCorridas, ler, type Corrida } from './lib';
import '../styles/admin.css';

type Tela = ModoAcesso | 'painel';

function logadoNaSessao(): boolean {
  try {
    return sessionStorage.getItem(K_SESSION) === '1';
  } catch {
    return false;
  }
}

function telaInicial(): Tela {
  if (!ler(K_PIN)) return 'create';
  return logadoNaSessao() ? 'painel' : 'login';
}

function Admin() {
  const [tela, setTela] = useState<Tela>(telaInicial);
  const [corridas, setCorridas] = useState<Corrida[]>(carregarCorridas);

  const entrar = (): void => {
    try {
      sessionStorage.setItem(K_SESSION, '1');
    } catch {
      /* sem sessionStorage: segue sem lembrar a sessão */
    }
    setTela('painel');
  };
  const sair = (): void => {
    try {
      sessionStorage.removeItem(K_SESSION);
    } catch {
      /* ignora */
    }
    setTela('login');
  };

  if (tela === 'painel') return <Painel corridas={corridas} onMudar={setCorridas} onSair={sair} onTrocarPin={() => setTela('change')} />;
  return <Acesso key={tela} modo={tela} onEntrar={entrar} />;
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Admin />
  </StrictMode>,
);
