import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  SERVICOS_ADMIN, agoraLocal, baixar, brl, celulaCsv, corridasDeExemplo, dataCarimbo, formatarData, lerValor, limparBackup,
  noPeriodo, normalizar, novoId, salvarCorridas, type Corrida, type Periodo,
} from './lib';

interface Props {
  corridas: Corrida[];
  onMudar: (lista: Corrida[]) => void;
  onSair: () => void;
  onTrocarPin: () => void;
}

interface Formulario {
  id: string;
  quando: string;
  cliente: string;
  servico: string;
  valor: string;
  origem: string;
  destino: string;
  obs: string;
}

const vazio = (): Formulario => ({ id: '', quando: agoraLocal(), cliente: '', servico: SERVICOS_ADMIN[0], valor: '', origem: '', destino: '', obs: '' });

const PERIODOS: Array<[Periodo, string]> = [
  ['hoje', 'Hoje'],
  ['7', '7 dias'],
  ['30', '30 dias'],
  ['tudo', 'Tudo'],
];

export function Painel({ corridas, onMudar, onSair, onTrocarPin }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('hoje');
  const [busca, setBusca] = useState('');
  const [form, setForm] = useState<Formulario>(vazio);
  const [colar, setColar] = useState('');
  const [aviso, setAviso] = useState('');
  const refForm = useRef<HTMLFormElement>(null);

  const mudar = (lista: Corrida[]): void => {
    salvarCorridas(lista);
    onMudar(lista);
  };
  const avisar = (t: string): void => {
    setAviso(t);
    window.setTimeout(() => setAviso(''), 5000);
  };

  /* ---------- números derivados ---------- */
  const lista = useMemo(() => {
    const b = normalizar(busca);
    return corridas
      .filter((r) => noPeriodo(r, periodo) && (!b || normalizar(`${r.cliente} ${r.origem} ${r.destino} ${r.servico} ${r.obs}`).includes(b)))
      .sort((a, c) => (a.quando < c.quando ? 1 : -1));
  }, [corridas, periodo, busca]);

  const soma = lista.reduce((s, r) => s + r.valor, 0);
  const maior = lista.reduce((m, r) => Math.max(m, r.valor), 0);

  const topEnderecos = useMemo(() => {
    const cont = new Map<string, { nome: string; n: number }>();
    lista.forEach((r) =>
      [r.origem, r.destino].forEach((e) => {
        const k = normalizar(e);
        if (!k) return;
        const atual = cont.get(k);
        cont.set(k, { nome: atual?.nome ?? e, n: (atual?.n ?? 0) + 1 });
      }),
    );
    return Array.from(cont.values()).sort((a, b) => b.n - a.n).slice(0, 5);
  }, [lista]);

  const porServico = useMemo(() => {
    const m = new Map<string, { n: number; v: number }>();
    lista.forEach((r) => {
      const a = m.get(r.servico) ?? { n: 0, v: 0 };
      m.set(r.servico, { n: a.n + 1, v: a.v + r.valor });
    });
    return Array.from(m.entries()).sort((a, b) => b[1].n - a[1].n);
  }, [lista]);

  const sugestoes = useMemo(() => {
    const vistos = new Map<string, string>();
    corridas.forEach((r) => [r.origem, r.destino].forEach((e) => { const k = normalizar(e); if (k && !vistos.has(k)) vistos.set(k, e); }));
    return Array.from(vistos.values());
  }, [corridas]);

  /* ---------- formulário ---------- */
  const campo = (k: keyof Formulario) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  const salvar = (e: FormEvent): void => {
    e.preventDefault();
    const r: Corrida = {
      id: form.id || novoId(), quando: form.quando || agoraLocal(), cliente: form.cliente.trim(), servico: form.servico,
      valor: lerValor(form.valor), origem: form.origem.trim(), destino: form.destino.trim(), obs: form.obs.trim(),
    };
    mudar(corridas.some((x) => x.id === r.id) ? corridas.map((x) => (x.id === r.id ? r : x)) : [...corridas, r]);
    setForm(vazio());
  };

  const editar = (r: Corrida): void => {
    setForm({ ...r, valor: String(r.valor).replace('.', ',') });
    refForm.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const excluir = (r: Corrida): void => {
    if (confirm(`Excluir a corrida de ${r.cliente}?`)) mudar(corridas.filter((x) => x.id !== r.id));
  };

  /** Preenche o formulário a partir da mensagem copiada do WhatsApp. */
  const preencherDaMensagem = (): void => {
    const pegar = (rotulo: string): string => colar.match(new RegExp(`\\*${rotulo}:\\*\\s*(.+)`, 'i'))?.[1].trim() ?? '';
    const serv = pegar('Servi[çc]o');
    setForm({
      ...form,
      cliente: pegar('Nome') || form.cliente,
      servico: serv ? (SERVICOS_ADMIN.includes(serv) ? serv : 'Outro') : form.servico,
      origem: pegar('Retirada/embarque') || form.origem,
      destino: pegar('Destino/entrega') || form.destino,
      obs: pegar('Observa[çc][õo]es') || form.obs,
    });
  };

  /* ---------- dados ---------- */
  const exemplo = (): void => {
    if (corridas.length && !confirm('Isso adiciona 40 corridas de exemplo às que já existem. Continuar?')) return;
    mudar([...corridas, ...corridasDeExemplo()]);
    avisar('40 corridas de exemplo adicionadas. Use os filtros de período no topo.');
  };
  const csv = (): void => {
    const linhas = [['Data', 'Cliente', 'Serviço', 'Origem', 'Destino', 'Valor', 'Observações'].map(celulaCsv).join(';')];
    [...corridas].sort((a, b) => (a.quando < b.quando ? -1 : 1)).forEach((r) =>
      linhas.push([formatarData(r.quando), r.cliente, r.servico, r.origem, r.destino, String(r.valor).replace('.', ','), r.obs].map(celulaCsv).join(';')));
    baixar(`zenite-corridas-${dataCarimbo()}.csv`, `﻿${linhas.join('\r\n')}`, 'text/csv;charset=utf-8');
    avisar('Planilha baixada.');
  };
  const json = (): void => {
    baixar(`zenite-backup-${dataCarimbo()}.json`, JSON.stringify(corridas, null, 1), 'application/json');
    avisar('Backup baixado.');
  };
  const restaurar = (e: ChangeEvent<HTMLInputElement>): void => {
    const arquivo = e.target.files?.[0];
    const entrada = e.target;
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      let limpos: Corrida[] | null = null;
      try {
        limpos = limparBackup(JSON.parse(String(leitor.result)));
      } catch {
        limpos = null;
      }
      if (!limpos) alert('Arquivo de backup inválido.');
      else if (confirm(`Restaurar ${limpos.length} corridas? Isso substitui os dados atuais.`)) {
        mudar(limpos);
        avisar('Backup restaurado.');
      }
      entrada.value = '';
    };
    leitor.readAsText(arquivo);
  };
  const apagar = (): void => {
    if (confirm('Apagar TODAS as corridas deste aparelho? Baixe um backup antes.') && confirm('Tem certeza? Esta ação não pode ser desfeita.')) {
      mudar([]);
      avisar('Todos os dados foram apagados.');
    }
  };

  const maxServ = porServico.length ? porServico[0][1].n : 1;

  return (
    <div className="app" id="app">
      <header className="top">
        <div className="wrap top-in">
          <div className="brand">
            <img src="/assets/favicon.svg" width={36} height={36} alt="" />
            <span>
              <b>ZÊNITE</b> <i>MOTOBOY</i> <small>Área do dono</small>
            </span>
          </div>
          <div className="top-act">
            <a className="btn ghost sm" href="/index.html">
              Ver site
            </a>
            <button className="btn dark sm" type="button" onClick={onSair}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="wrap main">
        <section className="block">
          <div className="head">
            <h2>Resumo</h2>
            <div className="seg" role="group" aria-label="Período">
              {PERIODOS.map(([p, rotulo]) => (
                <button key={p} type="button" data-p={p} aria-pressed={periodo === p} onClick={() => setPeriodo(p)}>
                  {rotulo}
                </button>
              ))}
            </div>
          </div>
          <div className="kpis">
            <div className="kpi"><small>Corridas</small><b id="kCount">{lista.length}</b></div>
            <div className="kpi hot"><small>Faturamento</small><b id="kSum">{brl.format(soma)}</b></div>
            <div className="kpi"><small>Valor médio</small><b>{brl.format(lista.length ? soma / lista.length : 0)}</b></div>
            <div className="kpi"><small>Maior corrida</small><b>{brl.format(maior)}</b></div>
          </div>
        </section>

        <section className="block">
          <div className="head">
            <h2>{form.id ? 'Editar corrida' : 'Registrar corrida'}</h2>
          </div>
          <details className="paste">
            <summary>Colar mensagem do WhatsApp (preenche sozinho)</summary>
            <textarea rows={4} placeholder="Cole aqui a mensagem do pedido recebida no WhatsApp…" value={colar} onChange={(e) => setColar(e.target.value)} />
            <button className="btn dark sm" type="button" onClick={preencherDaMensagem}>
              Preencher campos
            </button>
          </details>
          <form ref={refForm} className="grid" onSubmit={salvar}>
            <label>Data e hora<input type="datetime-local" required value={form.quando} onChange={campo('quando')} /></label>
            <label>Cliente<input type="text" maxLength={60} placeholder="Nome do cliente" required value={form.cliente} onChange={campo('cliente')} /></label>
            <label>
              Serviço
              <select required value={form.servico} onChange={campo('servico')}>
                {SERVICOS_ADMIN.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label>Valor (R$)<input type="text" inputMode="decimal" placeholder="0,00" required value={form.valor} onChange={campo('valor')} /></label>
            <label className="w2">Endereço de origem<input type="text" maxLength={120} placeholder="Rua, número e bairro" list="dlEnd" required value={form.origem} onChange={campo('origem')} /></label>
            <label className="w2">Endereço de destino<input type="text" maxLength={120} placeholder="Rua, número e bairro" list="dlEnd" value={form.destino} onChange={campo('destino')} /></label>
            <label className="w2">Observações<input type="text" maxLength={200} placeholder="Opcional" value={form.obs} onChange={campo('obs')} /></label>
            <datalist id="dlEnd">{sugestoes.map((s) => <option key={s} value={s} />)}</datalist>
            <div className="row">
              <button className="btn wa" type="submit">{form.id ? 'Salvar alterações' : 'Salvar corrida'}</button>
              {form.id && <button className="btn ghost" type="button" onClick={() => setForm(vazio())}>Cancelar edição</button>}
            </div>
          </form>
        </section>

        <section className="block">
          <div className="head">
            <h2>Corridas <span className="count">{lista.length ? `(${lista.length})` : ''}</span></h2>
            <input className="search" type="search" placeholder="Buscar cliente ou endereço…" aria-label="Buscar" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          {lista.length > 0 ? (
            <div className="tbl" role="table" aria-label="Lista de corridas">
              <div className="tr th" role="row"><span role="columnheader">Data</span><span role="columnheader">Cliente / serviço</span><span role="columnheader">Trajeto</span><span role="columnheader" className="r">Valor</span><span role="columnheader" /></div>
              <div>
                {lista.map((r) => (
                  <div className="tr" role="row" key={r.id}>
                    <span>{formatarData(r.quando)}</span>
                    <span><b>{r.cliente}</b><small>{r.servico + (r.obs ? ` · ${r.obs}` : '')}</small></span>
                    <span>{r.origem}{r.destino && <><span className="arrow"> → </span>{r.destino}</>}</span>
                    <span className="val">{brl.format(r.valor)}</span>
                    <span className="act">
                      <button type="button" className="ib" title="Editar" aria-label={`Editar corrida de ${r.cliente}`} onClick={() => editar(r)}>✎</button>
                      <button type="button" className="ib del" title="Excluir" aria-label={`Excluir corrida de ${r.cliente}`} onClick={() => excluir(r)}>✕</button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="empty">Nenhuma corrida neste período. Registre a primeira acima.</p>
          )}
        </section>

        <section className="block two">
          <div>
            <div className="head"><h2>Endereços mais usados</h2></div>
            <ol className="rank">
              {topEnderecos.length ? topEnderecos.map((e) => <li key={e.nome}><span>{e.nome}</span><em>{e.n}×</em></li>) : <li className="muted">Sem dados ainda.</li>}
            </ol>
          </div>
          <div>
            <div className="head"><h2>Por serviço</h2></div>
            <ul className="bars">
              {porServico.length ? porServico.map(([nome, v]) => (
                <li key={nome}>
                  <div className="l"><span>{nome}</span><span>{v.n} · {brl.format(v.v)}</span></div>
                  <div className="t"><i style={{ width: `${(v.n / maxServ) * 100}%` }} /></div>
                </li>
              )) : <li className="muted">Sem dados ainda.</li>}
            </ul>
          </div>
        </section>

        <section className="block data">
          <div className="head"><h2>Dados e segurança</h2></div>
          <p className="note"><b>Importante:</b> as corridas ficam salvas somente <u>neste aparelho e navegador</u> (não vão para a internet). Faça backup com frequência. O PIN é só uma trava de conveniência, não protege contra quem tem acesso ao aparelho.</p>
          <div className="row wrapbtn">
            <button className="btn wa" type="button" id="seedDemo" onClick={exemplo}>Carregar dados de exemplo</button>
            <button className="btn dark" type="button" onClick={csv}>Baixar planilha (CSV)</button>
            <button className="btn dark" type="button" onClick={json}>Backup (JSON)</button>
            <label className="btn dark file">Restaurar backup<input type="file" accept="application/json,.json" hidden onChange={restaurar} /></label>
            <button className="btn ghost" type="button" onClick={onTrocarPin}>Trocar PIN</button>
            <button className="btn danger" type="button" onClick={apagar}>Apagar tudo</button>
          </div>
          {aviso && <p className="ok" role="status">{aviso}</p>}
        </section>
      </main>
    </div>
  );
}
