; AMPLIFY Computer — NSIS custom installer script
; B37 Phase 6 — additional installer behaviors

; Kill any running AMPLIFY Computer process before installing
!macro customInstall
  nsExec::Exec 'taskkill /F /IM "AMPLIFY Computer.exe" /T'
!macroend

; On uninstall, leave user data intact (substrate cache, telemetry)
; Data lives in %APPDATA%\AMPLIFY Computer — not removed
!macro customUnInstall
  ; Intentionally leave %APPDATA%\AMPLIFY Computer
  DetailPrint "User data preserved at $APPDATA\AMPLIFY Computer"
!macroend
