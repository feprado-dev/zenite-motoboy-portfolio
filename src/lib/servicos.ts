export type IconName = 'box' | 'user' | 'bag' | 'road' | 'bank' | 'doc';

export interface Servico {
  /** Valor enviado na mensagem do WhatsApp. */
  valor: string;
  /** Rótulo curto do chip do formulário. */
  chip: string;
  titulo: string;
  texto: string;
  icone: IconName;
}

/** Ordem dos cartões do trilho de serviços. */
export const SERVICOS: Servico[] = [
  { valor: 'Delivery', chip: 'Delivery', titulo: 'Delivery', texto: 'Entregas rápidas de encomendas, refeições e pacotes.', icone: 'box' },
  { valor: 'Passageiros', chip: 'Passageiros', titulo: 'Passageiros', texto: 'Corridas ágeis para fugir do trânsito e chegar na hora.', icone: 'user' },
  { valor: 'Compras', chip: 'Compras', titulo: 'Compras', texto: 'Compramos o que você precisa e levamos até você.', icone: 'bag' },
  { valor: 'Viagens', chip: 'Viagens', titulo: 'Viagens', texto: 'Trajetos longos combinados com antecedência.', icone: 'road' },
  { valor: 'Serviços bancários', chip: 'Bancário', titulo: 'Serviços bancários', texto: 'Depósitos, pagamentos e idas ao banco por você.', icone: 'bank' },
  { valor: 'Coleta de documentos', chip: 'Documentos', titulo: 'Coleta de documentos', texto: 'Retirada e entrega de documentos com cuidado.', icone: 'doc' },
];

/** Ordem dos chips do formulário. */
export const ORDEM_CHIPS = ['Passageiros', 'Delivery', 'Compras', 'Viagens', 'Serviços bancários', 'Coleta de documentos'];
