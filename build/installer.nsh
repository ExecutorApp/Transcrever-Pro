!macro preInit
  ; Limpeza pré-instalação: remover sobras de builds antigos
  ; Executa apenas em instalação nova (não em update)
  ${ifNot} ${isUpdated}
    ; Limpar diretórios no contexto do usuário atual
    SetShellVarContext current

    ; 1) Remover instalador antigo (vite-react-typescript-starter) em LocalAppData\Programs
    StrCpy $0 "$LOCALAPPDATA\Programs\vite-react-typescript-starter"
    IfFileExists "$0\*.*" 0 +3
      DetailPrint "Removendo resíduo: $0"
      RMDir /r "$0"

    ; 2) Remover dados de app antigo em AppData\Roaming
    StrCpy $0 "$APPDATA\vite-react-typescript-starter"
    IfFileExists "$0\*.*" 0 +3
      DetailPrint "Removendo resíduo: $0"
      RMDir /r "$0"

    ; 3) (Opcional) Remover pasta de cache do antigo app (se existir)
    StrCpy $0 "$LOCALAPPDATA\vite-react-typescript-starter"
    IfFileExists "$0\*.*" 0 +3
      DetailPrint "Removendo resíduo: $0"
      RMDir /r "$0"
  ${endIf}
!macroend