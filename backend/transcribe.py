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


def map_mode_to_model(mode: str) -> str:
    # Ajuste conforme necessidade: tradeoff entre qualidade e desempenho
    mode = (mode or "balanced").lower()
    if mode == "fast":
        return "base"
    if mode == "perfect":
        return "medium"
    return "small"  # balanced


def main():
    parser = argparse.ArgumentParser(description="Transcrição via Faster-Whisper")
    parser.add_argument("--input", required=True, help="Caminho do arquivo de áudio/vídeo")
    parser.add_argument("--mode", default="balanced", choices=["fast", "balanced", "perfect"], help="Modo de transcrição")
    parser.add_argument("--language", default=None, help="Código do idioma (ex.: pt, en). Se omitido, detecção automática")
    args = parser.parse_args()

    try:
        media_path = args.input
        if not os.path.isfile(media_path):
            raise FileNotFoundError(f"Arquivo não encontrado: {media_path}")

        # Importar aqui para não falhar antes com ambientes sem dependências
        from faster_whisper import WhisperModel

        model_size = map_mode_to_model(args.mode)
        # Preferência por CPU com int8 para compatibilidade ampla; use GPU se disponível
        model = WhisperModel(model_size, device="cpu", compute_type="int8")

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