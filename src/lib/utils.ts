import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utilitário: obter o nome base do arquivo (sem diretórios e sem extensão)
// Sanitiza caracteres inválidos no Windows para uso em nomes de arquivos
export function getFileBaseName(name: string): string {
  try {
    const justName = (name || '').split(/[\\/]/).pop() || '';
    const dot = justName.lastIndexOf('.');
    const noExt = dot > 0 ? justName.slice(0, dot) : justName;
    return noExt
      .replace(/[<>:\"/\\|?*\x00-\x1F]/g, '-') // caracteres inválidos em nomes de arquivo no Windows
      .replace(/\s+/g, ' ')
      .trim() || 'arquivo';
  } catch {
    return 'arquivo';
  }
}

// Utilitário: conteúdo padrão para arquivos de transcrição
export function buildDefaultTranscriptContent(originalName: string, dateStr?: string): string {
  const when = dateStr || new Date().toLocaleString();
  const header = [
    'Transcrição gerada automaticamente',
    `Arquivo: ${originalName || 'desconhecido'}`,
    `Data: ${when}`,
    ''
  ].join('\n');

  const body = 'O conteúdo completo da transcrição será preenchido após o processamento.\n';
  return `${header}\n${body}`;
}
