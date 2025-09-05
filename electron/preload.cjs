'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  // Abre um seletor de diretório e retorna o path selecionado
  selectDirectory: (opts) => ipcRenderer.invoke('dialog:selectDirectory', opts),

  // Abre o explorador do sistema em uma pasta/arquivo
  showInFolder: (targetPath) => ipcRenderer.invoke('shell:showItemInFolder', targetPath),

  // Salvar arquivo de texto (.txt) no disco usando o processo principal
  // params: { directory: string, filename: string (com extensão .txt), content: string }
  saveTextFile: (params) => ipcRenderer.invoke('fs:saveTextFile', params),
});