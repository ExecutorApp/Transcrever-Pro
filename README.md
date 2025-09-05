# Sistema de Transcrição de Áudio e Vídeo

Este sistema utiliza o Whisper AI para transcrever arquivos de áudio e vídeo para texto de forma automática.

## 🚀 Configuração Inicial

### 1. Instalar Dependências
Execute o arquivo `setup_environment.bat` para instalar automaticamente todas as dependências necessárias:

```bash
.\setup_environment.bat
```

### 2. Verificar Instalação
O sistema verificará automaticamente:
- ✅ Python 3.8+
- ✅ FFmpeg (necessário para processamento de vídeo)
- ✅ Faster-Whisper (biblioteca de transcrição)

## 📝 Como Usar

### Método 1: Arrastar e Soltar
1. Arraste seu arquivo de áudio/vídeo para o arquivo `Solte seu arquivo aqui.bat`
2. Escolha o modelo de transcrição:
   - **1 - Tiny**: Mais rápido, menos preciso
   - **2 - Base**: Rápido, com um pouco mais de precisão
   - **3 - Small**: Equilíbrio entre velocidade e precisão
   - **4 - Medium**: Mais preciso, mas mais lento
   - **5 - Large**: Máxima precisão, mais lento

### Método 2: Linha de Comando
```bash
python "Transcrever Videos 01.py" "caminho/para/arquivo.mp4" "small"
```

## 📁 Formatos Suportados

### Áudio
- MP3, WAV, FLAC, AAC, OGG
- M4A, WMA, AIFF

### Vídeo
- MP4, AVI, MOV, MKV
- WMV, FLV, WEBM
- M4V, 3GP

## ⚙️ Modelos Disponíveis

| Modelo | Tamanho | Velocidade | Precisão | Uso Recomendado |
|--------|---------|------------|----------|------------------|
| tiny   | ~39 MB  | Muito Rápido | Básica | Testes rápidos |
| base   | ~74 MB  | Rápido | Boa | Uso geral |
| small  | ~244 MB | Médio | Muito Boa | Recomendado |
| medium | ~769 MB | Lento | Excelente | Alta qualidade |
| large  | ~1550 MB| Muito Lento | Máxima | Profissional |

## 📊 Saída

O sistema gera:
- **Arquivo de texto**: `nome_do_arquivo.txt` com a transcrição completa
- **Informações no console**: Idioma detectado, progresso e tempo de processamento

## 🔧 Solução de Problemas

### Erro: "FFmpeg não encontrado"
1. Baixe o FFmpeg de: https://ffmpeg.org/download.html
2. Adicione o FFmpeg ao PATH do sistema
3. Reinicie o terminal

### Erro: "Módulo não encontrado"
1. Execute novamente: `.\setup_environment.bat`
2. Verifique se o Python está instalado corretamente

### Arquivo muito grande
- Use o modelo "tiny" ou "base" para arquivos grandes
- Considere dividir o arquivo em partes menores

## 📋 Requisitos do Sistema

- **Sistema Operacional**: Windows 10/11
- **Python**: 3.8 ou superior
- **RAM**: Mínimo 4GB (8GB recomendado para modelos grandes)
- **Espaço em Disco**: 2GB livres para modelos
- **FFmpeg**: Para processamento de vídeo

## 🎯 Dicas de Performance

1. **Para velocidade**: Use modelo "tiny" ou "base"
2. **Para precisão**: Use modelo "medium" ou "large"
3. **Arquivos longos**: Considere usar "small" como compromisso
4. **Múltiplos arquivos**: Processe um por vez para melhor performance

## 📞 Suporte

Em caso de problemas:
1. Verifique se todas as dependências estão instaladas
2. Teste com um arquivo pequeno primeiro
3. Consulte os logs de erro no terminal

---

**Desenvolvido com Faster-Whisper para máxima eficiência e compatibilidade.**