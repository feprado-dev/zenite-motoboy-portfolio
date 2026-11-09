export interface Corrida {
  id: string;
  /** ISO local "AAAA-MM-DDTHH:MM". */
  quando: string;
  cliente: string;
  servico: string;
  valor: number;
  origem: string;
  destino: string;
  obs: string;
}

export type Periodo = 'hoje' | '7' | '30' | 'tudo';

export const K_DATA = 'zr_corridas';
export const K_PIN = 'zr_pin';
export const K_SESSION = 'zr_sessao';

export const SERVICOS_ADMIN = ['Passageiros', 'Delivery', 'Compras', 'Viagens', 'Serviços bancários', 'Coleta de documentos', 'Outro'];

export const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/* ---------- armazenamento com proteção para navegadores sem localStorage ---------- */
const memoria: Record<string, string> = {};

export function ler(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return memoria[chave] ?? null;
  }
}

export function gravar(chave: string, valor: string): void {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    memoria[chave] = valor;
  }
}

export function carregarCorridas(): Corrida[] {
  try {
    // O que vem do armazenamento é tratado como não confiável (mesma limpeza do backup).
    return limparBackup(JSON.parse(ler(K_DATA) ?? '[]')) ?? [];
  } catch {
    return [];
  }
}

export function salvarCorridas(lista: Corrida[]): void {
  gravar(K_DATA, JSON.stringify(lista));
}

/* ---------- PIN (SHA-256 com Web Crypto; fallback FNV simples) ---------- */
export async function hashPin(pin: string): Promise<string> {
  const bytes = new TextEncoder().encode(`zenite-real:${pin}`);
  if (window.crypto?.subtle) {
    const h = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(h), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 2166136261;
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, 16777619);
  }
  return `f${(h >>> 0).toString(16)}`;
}

/* ---------- utilidades ---------- */
export const pad = (n: number): string => String(n).padStart(2, '0');

export function agoraLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatarData(quando: string): string {
  const d = new Date(quando);
  return Number.isNaN(d.getTime()) ? '—' : `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "12,50" | "1.250,00" | "1.250" | "12.5" -> número. */
export function lerValor(texto: string): number {
  let s = texto.replace(/[^\d,.-]/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ''); // "1.250" = mil duzentos e cinquenta
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

export const normalizar = (s: string): string => s.toLowerCase().replace(/\s+/g, ' ').trim();
export const novoId = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function noPeriodo(c: Corrida, periodo: Periodo): boolean {
  if (periodo === 'tudo') return true;
  const d = new Date(c.quando);
  if (Number.isNaN(d.getTime())) return false;
  const ini = new Date();
  ini.setHours(0, 0, 0, 0);
  if (periodo !== 'hoje') ini.setDate(ini.getDate() - (Number(periodo) - 1));
  return d >= ini;
}

/** 40 corridas fictícias e determinísticas para a demonstração. */
export function corridasDeExemplo(): Corrida[] {
  const clientes = ['Padaria Central', 'Farmácia Vida', 'Mercado Bom Preço', 'Clínica Aurora', 'Ana Souza', 'Carlos Lima', 'Júlia Mendes', 'Papelaria Cores', 'Marcos Dias', 'Lívia Nunes'];
  const ruas = ['Rua das Entregas, 100', 'Av. Principal, 1200', 'Rua das Flores, 45', 'Praça da Matriz, 8', 'Rua do Comércio, 310', 'Av. dos Ipês, 77', 'Rua Nova, 22', 'Travessa Azul, 9'];
  const servicos = ['Delivery', 'Delivery', 'Passageiros', 'Passageiros', 'Compras', 'Serviços bancários', 'Coleta de documentos'];
  const valores = [8, 10, 12, 15, 15, 18, 22, 30];
  const obs = ['', '', '', 'Frágil', 'Ligar ao chegar', 'Entregar na portaria'];
  let semente = 7;
  const rnd = (n: number): number => {
    semente = (semente * 9301 + 49297) % 233280;
    return Math.floor((semente / 233280) * n);
  };
  const lista: Corrida[] = [];
  for (let i = 0; i < 40; i++) {
    const d = new Date();
    d.setDate(d.getDate() - rnd(30));
    d.setHours(8 + rnd(11), rnd(60), 0, 0);
    lista.push({
      id: novoId() + i,
      quando: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`,
      cliente: clientes[rnd(clientes.length)],
      servico: servicos[rnd(servicos.length)],
      origem: ruas[rnd(ruas.length)],
      destino: ruas[rnd(ruas.length)],
      valor: valores[rnd(valores.length)],
      obs: obs[rnd(obs.length)],
    });
  }
  return lista;
}

export function baixar(nome: string, conteudo: string, tipo: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function dataCarimbo(): string {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

/** Evita que o Excel interprete o texto como fórmula. */
export function celulaCsv(valor: unknown): string {
  let s = String(valor ?? '');
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function limparBackup(dados: unknown): Corrida[] | null {
  if (!Array.isArray(dados)) return null;
  return dados
    .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
    .map((r) => ({
      id: String(r.id || novoId()),
      quando: String(r.quando || agoraLocal()),
      cliente: String(r.cliente || '').slice(0, 60),
      servico: String(r.servico || 'Outro'),
      valor: Number.isFinite(Number(r.valor)) ? Math.round(Number(r.valor) * 100) / 100 : 0,
      origem: String(r.origem || '').slice(0, 120),
      destino: String(r.destino || '').slice(0, 120),
      obs: String(r.obs || '').slice(0, 200),
    }));
}
