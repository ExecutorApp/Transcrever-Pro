# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_data_files
from PyInstaller.utils.hooks import collect_dynamic_libs
from PyInstaller.utils.hooks import collect_submodules

datas = []
binaries = []
hiddenimports = []
datas += collect_data_files('faster_whisper')
datas += collect_data_files('tokenizers')
datas += collect_data_files('ctranslate2')
datas += collect_data_files('huggingface_hub')
binaries += collect_dynamic_libs('onnxruntime')
binaries += collect_dynamic_libs('ctranslate2')
hiddenimports += collect_submodules('onnxruntime')


a = Analysis(
    ['D:\\Downloads\\Transcrever Pro\\Transcrever Pro\\backend\\transcribe.py'],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='transcribe',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
