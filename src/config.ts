/** Configuração única da empresa. Projeto de portfólio: tudo aqui é FICTÍCIO. */
export interface Telefone {
  prefixo: string;
  numero: string;
}

export interface Config {
  nome: string;
  /** Em modo demonstração o site mostra um aviso em vez de abrir o WhatsApp. */
  demo: boolean;
  ddd: string;
  whatsapp: string;
  telefone: Telefone;
  telefoneAlt: Telefone & { ativo: boolean };
  endereco: string;
  referencia: string;
  mensagemPadrao: string;
}

export const CONFIG: Config = {
  nome: 'Zênite Motoboy',
  demo: true,
  ddd: '00',
  whatsapp: '900000000',
  telefone: { prefixo: '0000', numero: '00000000' },
  telefoneAlt: { ativo: true, prefixo: '0000', numero: '00000001' },
  endereco: 'Rua das Entregas, 100',
  referencia: 'Cidade Exemplo · endereço fictício',
  mensagemPadrao: 'Olá, Zênite Motoboy! Vim pelo site e gostaria de chamar um motoboy.',
};
