; MnemosyneC — NSIS custom installer script
; B37 Phase 6 — additional installer behaviors
; BP067 v0.1.24 — transparent install copy (Truth-Always: Ollama attribution)
; BP081 SEG-2 v0.1.55 — Ollama LAN binding (OLLAMA_HOST=0.0.0.0:11434)

!include "WinMessages.nsh"

!define OLLAMA_HOST_VALUE "0.0.0.0:11434"
!define OLLAMA_HOST_HKLM "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"
!define OLLAMA_HOST_HKCU "Environment"

; SEG-2 FIX (Knight BP081): INSTALL_REGISTRY_KEY is an electron-builder internal
; not passed as a makensis command-line define. Use a self-contained scope key instead.
!define MNEM_INSTALLER_SCOPE_KEY "Software\Liana Banyan Corporation\MnemosyneC\Installer"

!define MUI_WELCOMEPAGE_TEXT "MnemosyneC(TM) — your private AI on your computer.$\r$\n$\r$\nDuring first launch, MnemosyneC will set up Ollama — a free, open-source AI engine (MIT license, created by a Y-Combinator startup). Your questions and files never leave your machine. Free, forever.$\r$\n$\r$\nMnemosyneC is READ-ONLY toward your files:$\r$\n- Reads ONLY folders you explicitly choose$\r$\n- Creates verified records in its own data folder$\r$\n- Your originals are NEVER moved, modified, or uploaded$\r$\n$\r$\nClick Next to install."

!macro MnemosyneC_BroadcastEnvironmentChange
  SendMessage ${HWND_BROADCAST} ${WM_SETTINGCHANGE} 0 "STR:Environment" /TIMEOUT=5000
!macroend

!macro MnemosyneC_RestartOllamaService
  DetailPrint "Restarting Ollama service (if installed)..."
  nsExec::ExecToStack 'net stop ollama'
  Pop $0
  Pop $1
  nsExec::ExecToStack 'net start ollama'
  Pop $0
  Pop $1
!macroend

!macro MnemosyneC_ShowOllamaHostPerUserToast
  DetailPrint "OLLAMA_HOST set for current user only — LAN federation needs Administrator install."
  DetailPrint "NOTE: For LAN federation on all accounts, right-click the installer and choose Run as administrator."
!macroend

!macro MnemosyneC_SetOllamaHostEnv
  DetailPrint "Configuring Ollama for LAN federation (OLLAMA_HOST=${OLLAMA_HOST_VALUE})..."

  ClearErrors
  WriteRegExpandStr HKLM "${OLLAMA_HOST_HKLM}" "OLLAMA_HOST" "${OLLAMA_HOST_VALUE}"
  IfErrors MnemosyneC_OllamaHostHkcuFallback

  ReadRegStr $0 HKLM "${OLLAMA_HOST_HKLM}" "OLLAMA_HOST"
  StrCmp $0 "${OLLAMA_HOST_VALUE}" MnemosyneC_OllamaHostHklmOk MnemosyneC_OllamaHostHkcuFallback

  MnemosyneC_OllamaHostHklmOk:
    WriteRegStr SHELL_CONTEXT "${MNEM_INSTALLER_SCOPE_KEY}" "OllamaHostScope" "HKLM"
    DetailPrint "OLLAMA_HOST set system-wide (all users) — LAN federation enabled."
    Goto MnemosyneC_OllamaHostEnvDone

  MnemosyneC_OllamaHostHkcuFallback:
    DetailPrint "Administrator rights unavailable — setting OLLAMA_HOST for current user only."
    ClearErrors
    WriteRegExpandStr HKCU "${OLLAMA_HOST_HKCU}" "OLLAMA_HOST" "${OLLAMA_HOST_VALUE}"
    IfErrors MnemosyneC_OllamaHostEnvFailed
    WriteRegStr SHELL_CONTEXT "${MNEM_INSTALLER_SCOPE_KEY}" "OllamaHostScope" "HKCU"
    !insertmacro MnemosyneC_ShowOllamaHostPerUserToast
    Goto MnemosyneC_OllamaHostEnvDone

  MnemosyneC_OllamaHostEnvFailed:
    MessageBox MB_ICONEXCLAMATION|MB_OK "MnemosyneC could not set OLLAMA_HOST for LAN federation.$\r$\n$\r$\nRe-run the installer as Administrator, or set OLLAMA_HOST=${OLLAMA_HOST_VALUE} manually in Windows Environment Variables."

  MnemosyneC_OllamaHostEnvDone:
    !insertmacro MnemosyneC_BroadcastEnvironmentChange
    !insertmacro MnemosyneC_RestartOllamaService
!macroend

!macro MnemosyneC_RemoveOllamaHostEnv
  DetailPrint "Removing OLLAMA_HOST (MnemosyneC LAN binding)..."

  ReadRegStr $0 SHELL_CONTEXT "${MNEM_INSTALLER_SCOPE_KEY}" "OllamaHostScope"
  StrCmp $0 "HKCU" MnemosyneC_RemoveOllamaHostHkcu MnemosyneC_RemoveOllamaHostTryHklm

  MnemosyneC_RemoveOllamaHostTryHklm:
    ReadRegStr $1 HKLM "${OLLAMA_HOST_HKLM}" "OLLAMA_HOST"
    StrCmp $1 "${OLLAMA_HOST_VALUE}" 0 MnemosyneC_RemoveOllamaHostTryHkcuOnly
    DeleteRegValue HKLM "${OLLAMA_HOST_HKLM}" "OLLAMA_HOST"
    Goto MnemosyneC_RemoveOllamaHostCleanupMarker

  MnemosyneC_RemoveOllamaHostHkcu:
    ReadRegStr $1 HKCU "${OLLAMA_HOST_HKCU}" "OLLAMA_HOST"
    StrCmp $1 "${OLLAMA_HOST_VALUE}" 0 MnemosyneC_RemoveOllamaHostCleanupMarker
    DeleteRegValue HKCU "${OLLAMA_HOST_HKCU}" "OLLAMA_HOST"
    Goto MnemosyneC_RemoveOllamaHostCleanupMarker

  MnemosyneC_RemoveOllamaHostTryHkcuOnly:
    ReadRegStr $1 HKCU "${OLLAMA_HOST_HKCU}" "OLLAMA_HOST"
    StrCmp $1 "${OLLAMA_HOST_VALUE}" 0 MnemosyneC_RemoveOllamaHostCleanupMarker
    DeleteRegValue HKCU "${OLLAMA_HOST_HKCU}" "OLLAMA_HOST"

  MnemosyneC_RemoveOllamaHostCleanupMarker:
    DeleteRegValue SHELL_CONTEXT "${MNEM_INSTALLER_SCOPE_KEY}" "OllamaHostScope"
    !insertmacro MnemosyneC_BroadcastEnvironmentChange
    !insertmacro MnemosyneC_RestartOllamaService
!macroend

Section "-Ollama LAN binding (federation)" SEC_MNEM_OLLAMA_HOST
  SectionIn RO
  !insertmacro MnemosyneC_SetOllamaHostEnv
SectionEnd

; Kill any running Mnemosyne process before installing
!macro customInstall
  DetailPrint "Installing MnemosyneC ${VERSION} — private AI · family-install release"
  nsExec::Exec 'taskkill /F /IM "MnemosyneC.exe" /T'
  nsExec::Exec 'taskkill /F /IM "Mnemosyne.exe" /T'
  ; Legacy process name cleanup (pre-v0.1.2 installs)
  nsExec::Exec 'taskkill /F /IM "AMPLIFY Computer.exe" /T'
  ; Copy A2 disclosure README to install dir
  SetOutPath "$INSTDIR"
  File /nonfatal "${BUILD_RESOURCES_DIR}\..\assets\post_install_message.txt"
  IfFileExists "$INSTDIR\post_install_message.txt" 0 +2
    Rename "$INSTDIR\post_install_message.txt" "$INSTDIR\README_INSTALL.txt"

  ; BP080 / SEG-V0147-FIX-4 — VC++ 2019 x64 Redistributable
  ; Ollama v0.30.7+ requires the VC++ 2019 x64 runtime to start.
  ; Detect registry key; install silently if missing.
  ; Exit code 0 = success. 1638 = newer version already present — treat as success.
  ReadRegStr $0 HKLM "SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64" "Installed"
  ${If} $0 != "1"
    DetailPrint "Installing Microsoft VC++ 2019 x64 Redistributable (required for Ollama AI engine)..."
    ExecWait '"$INSTDIR\resources\vcredist\vc_redist.x64.exe" /install /quiet /norestart' $0
    ${If} $0 != 0
    ${AndIf} $0 != 1638
      MessageBox MB_ICONEXCLAMATION "VC++ 2019 x64 install returned code $0.$\r$\nThe AI engine (Ollama) may not function correctly.$\r$\nIf Ollama fails to start, run vc_redist.x64.exe manually from:$\r$\n$INSTDIR\resources\vcredist\vc_redist.x64.exe"
    ${EndIf}
    DetailPrint "VC++ 2019 x64 Redistributable ready."
  ${Else}
    DetailPrint "VC++ 2019 x64 Redistributable already installed — skipping."
  ${EndIf}

  DetailPrint "Mnemosyne ${VERSION} install ready — SSPL · Pledge #2260 · No Ads · No Strings"
!macroend

; On uninstall, leave user data intact (substrate cache, telemetry)
; Data lives in %APPDATA%\Mnemosyne — not removed (cooperative sovereignty right)
!macro customUnInstall
  !insertmacro MnemosyneC_RemoveOllamaHostEnv
  DetailPrint "Mnemosyne ${VERSION} uninstall: user data preserved (cooperative sovereignty right)"
  ; Intentionally leave %APPDATA%\Mnemosyne substrate cache + telemetry
  DetailPrint "Substrate data preserved at $APPDATA\Mnemosyne"
!macroend
