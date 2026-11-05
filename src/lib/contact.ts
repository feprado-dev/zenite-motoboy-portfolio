import { CONFIG, type Telefone } from '../config';

/** "900000000" -> "90000-0000" */
export function formatNumero(num: string): string {
  const n = num.replace(/\D/g, '');
  return `${n.slice(0, -4)}-${n.slice(-4)}`;
}

export function formatTelefone(t: Telefone): string {
  return `${t.prefixo} ${formatNumero(t.numero)}`;
}

export function waUrl(mensagem: string): string {
  return `https://wa.me/55${CONFIG.ddd}${CONFIG.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

export function telUrl(t: Telefone): string {
  return `tel:+55${CONFIG.ddd}${t.numero}`;
}

export function mapaUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.endereco)}`;
}
