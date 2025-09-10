#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script: transcribe.py
Descrição: Executa transcrição de áudio/vídeo usando Faster-Whisper e imprime JSON no stdout.
Saída JSON exemplo:
{
  "ok": true,
  "text": "...",
  "language": "pt",
  "duration": 123.45,
  "segments": [
    {"start": 0.0, "end": 3.2, "text": "..."}
  ]
}
Em caso de erro: {"ok": false, "error": "mensagem"}
"""

import argparse
import json
import sys
import os
from typing import List

# Adições: suporte a diretório de modelos embutidos e ffmpeg local
import platform


def map_mode_to_model(mode: str) -> str:
    # Ajuste conforme necessidade: tradeoff entre qualidade e desempenho
    mode = (mode or "balanced").lower()
    if mode == "fast":
        return "base"
    if mode == "perfect":
        return "medium"
    return "small"  # balanced


# Novo: resolver diretórios de runtime (PyInstaller ou script)
def _runtime_base_dir() -> str:
    # Quando empacotado com PyInstaller (onefile), sys._MEIPASS existe; usamos a pasta do executável
    if getattr(sys, 'frozen', False):  # PyInstaller
        return os.path.dirname(sys.executable)
    # Execução via Python: usar diretório deste arquivo
    return os.path.dirname(os.path.abspath(__file__))


def _resolve_ffmpeg_dir() -> str | None:
    # Preferir variável de ambiente fornecida pelo backend
    env_dir = os.environ.get('FFMPEG_DIR')
    if env_dir and os.path.isdir(env_dir):
        return env_dir
    base = _runtime_base_dir()
    arch = 'win-ia32' if platform.architecture()[0].startswith('32') else 'win-x64'
    candidate = os.path.abspath(os.path.join(base, '..', 'ffmpeg', arch))
    if os.path.isdir(candidate):
        return candidate
    return None


def _inject_ffmpeg_into_path():
    ffdir = _resolve_ffmpeg_dir()
    if ffdir and os.path.isdir(ffdir):
        os.environ['PATH'] = ffdir + os.pathsep + os.environ.get('PATH', '')


# Novo: resolver diretório de modelos local

def _resolve_models_root() -> str | None:
    # 1) Variável de ambiente
    env_dir = os.environ.get('WHISPER_MODELS_DIR')
    if env_dir and os.path.isdir(env_dir):
        return env_dir
    # 2) Pasta ao lado: ../models
    base = _runtime_base_dir()
    candidate = os.path.abspath(os.path.join(base, '..', 'models'))
    if os.path.isdir(candidate):
        return candidate
    return None


def _maybe_local_model_path(model_size: str) -> str | None:
    root = _resolve_models_root()
    if not root:
        return None
    # Aceitar tanto layout raiz/<size> quanto raiz/faster-whisper-<size>
    variants = [
        os.path.join(root, model_size),
        os.path.join(root, f"faster-whisper-{model_size}"),
    ]
    for p in variants:
        if os.path.isdir(p):
            return p
    return None


def main():
    parser = argparse.ArgumentParser(description="Transcrição via Faster-Whisper")
    parser.add_argument("--input", required=True, help="Caminho do arquivo de áudio/vídeo")
    parser.add_argument("--mode", default="balanced", choices=["fast", "balanced", "perfect"], help="Modo de transcrição")
    parser.add_argument("--language", default=None, help="Código do idioma (ex.: pt, en). Se omitido, detecção automática")
    # Opcional explícito para testes/manutenção
    parser.add_argument("--models-dir", default=None, help="Diretório raiz com os modelos CTranslate2 (opcional)")
    args = parser.parse_args()

    try:
        media_path = args.input
        if not os.path.isfile(media_path):
            raise FileNotFoundError(f"Arquivo não encontrado: {media_path}")

        # Garantir ffmpeg no PATH se empacotado
        _inject_ffmpeg_into_path()

        # Importar aqui para não falhar antes com ambientes sem dependências
        from faster_whisper import WhisperModel

        model_size = map_mode_to_model(args.mode)

        # Resolver modelo local primeiro (offline). Se não existir, usa identificador online.
        local_root = args.models_dir or _resolve_models_root()
        local_model = _maybe_local_model_path(model_size) if not args.models_dir else (
            os.path.join(args.models_dir, model_size)
            if os.path.isdir(os.path.join(args.models_dir, model_size)) else args.models_dir
        )

        model_arg = local_model if local_model and os.path.isdir(local_model) else model_size

        # Preferência por CPU com int8 para compatibilidade ampla; use GPU se disponível
        model = WhisperModel(model_arg, device="cpu", compute_type="int8")

        # Primeira tentativa direta; em caso de falha, reencode com FFmpeg para WAV PCM 16 kHz mono e tenta novamente
        tmp_wav = None
        try:
            segments_gen, info = model.transcribe(
                media_path,
                language=args.language,
                vad_filter=True,
                beam_size=5 if model_size in ("small", "medium") else 1,
            )
        except Exception as e1:
            try:
                import ffmpeg  # ffmpeg-python
                tmp_wav = os.path.join(os.path.dirname(media_path), os.path.basename(media_path) + ".norm.wav")
                (
                    ffmpeg
                    .input(media_path)
                    .output(tmp_wav, ac=1, ar=16000, acodec="pcm_s16le", format="wav", loglevel="error")
                    .overwrite_output()
                    .run(capture_stdout=True, capture_stderr=True)
                )
                segments_gen, info = model.transcribe(
                    tmp_wav,
                    language=args.language,
                    vad_filter=True,
                    beam_size=5 if model_size in ("small", "medium") else 1,
                )
            except Exception as e2:
                raise RuntimeError(f"Falha ao processar arquivo de entrada: {e1}") from e2

        segments: List[dict] = []
        full_text_parts: List[str] = []
        total_duration = 0.0

        # Garantir stdout/stderr em UTF-8 e normalização NFC
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            sys.stderr.reconfigure(encoding="utf-8")
        except Exception:
            pass

        import unicodedata
        def _norm(s: str) -> str:
            try:
                return unicodedata.normalize("NFC", s or "")
            except Exception:
                return s or ""

        for seg in segments_gen:
            # seg: start, end, text, words (opcional)
            nt = _norm(seg.text.strip())
            segments.append({
                "start": float(seg.start),
                "end": float(seg.end),
                "text": nt,
            })
            full_text_parts.append(nt)
            total_duration = max(total_duration, float(seg.end or 0))

        text = " ".join([p for p in full_text_parts if p])

        payload = {
            "ok": True,
            "text": text,
            "language": getattr(info, "language", None) or args.language or "auto",
            "duration": total_duration,
            "segments": segments,
        }
        # Limpeza de arquivo temporário de normalização, se houver
        try:
            if 'tmp_wav' in locals() and tmp_wav and os.path.exists(tmp_wav):
                os.remove(tmp_wav)
        except Exception:
            pass

        sys.stdout.write(json.dumps(payload, ensure_ascii=False))
        sys.stdout.flush()
    except Exception as e:
        err = {"ok": False, "error": str(e)}
        sys.stdout.write(json.dumps(err, ensure_ascii=False))
        sys.stdout.flush()
        sys.exit(1)


if __name__ == "__main__":
    main()