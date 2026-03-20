; PulsePoint POS - One-Click Installer Script
; Built with Inno Setup (https://jrsoftware.org/isinfo.php)
; -----------------------------------------------------------------------------
; INSTRUCTIONS BEFORE COMPILING:
; 1. Download Node.js MSI installer (v20+ recommended) and place it in this folder.
;    Rename it exactly to: node-installer.msi
; 2. Download MySQL Community Installer MSI and place it in this folder.
;    Rename it exactly to: mysql-installer.msi
; 3. Ensure your frontend is built (`npm run build` in the frontend folder).
; 4. Open this .iss file in Inno Setup Compiler and click "Compile".
; -----------------------------------------------------------------------------

[Setup]
AppName=PulsePoint POS
AppVersion=1.0.0
AppPublisher=Better With Coffee
DefaultDirName={autopf}\PulsePoint
DefaultGroupName=PulsePoint POS
OutputDir=.\Output
OutputBaseFilename=PulsePoint-Setup
Compression=lzma
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64
SetupIconFile=compiler:SetupClassicIcon.ico
UninstallDisplayIcon={app}\Start PulsePoint.bat
DisableWelcomePage=no
AllowNoIcons=yes
PrivilegesRequired=admin

[Files]
; 1. Bundle External Dependencies
Source: "node-v24.14.0-x64.msi"; DestDir: "{tmp}"; Flags: ignoreversion
Source: "mysql-installer-web-community-8.0.45.0.msi"; DestDir: "{tmp}"; Flags: ignoreversion

; 2. Bundle Installer Scripts
Source: "setup-db.js"; DestDir: "{app}"; Flags: ignoreversion
Source: "start.bat"; DestDir: "{app}"; Flags: ignoreversion

; 3. Bundle Backend (excluding node_modules to run npm install on client PC, but you CAN bundle node_modules if you prefer a fully offline install)
Source: "..\backend_rewrite\*"; DestDir: "{app}\backend_rewrite"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "node_modules\*, .git\*"

; 4. Bundle Pre-built Frontend
Source: "..\frontend\dist\*"; DestDir: "{app}\frontend\dist"; Flags: ignoreversion recursesubdirs createallsubdirs

[Dirs]
Name: "{app}"; Permissions: users-modify

[Icons]
; Desktop Shortcut
Name: "{autodesktop}\Start PulsePoint"; Filename: "{app}\start.bat"; WorkingDir: "{app}"; Comment: "Launch PulsePoint POS"
; Start Menu Shortcut
Name: "{group}\Start PulsePoint"; Filename: "{app}\start.bat"; WorkingDir: "{app}"
Name: "{group}\Uninstall PulsePoint"; Filename: "{uninstallexe}"

[Run]
; 1. Install Node.js silently
Filename: "msiexec.exe"; Parameters: "/i ""{tmp}\node-v24.14.0-x64.msi"" /qn /norestart"; StatusMsg: "Installing Node.js... (This may take a minute)"; Flags: waituntilterminated

; 2. Install MySQL silently (Assumes default root/root credentials or prompts user if they already have it)
; NOTE: Silent config for MySQL MSI can be complex. This runs the basic install. 
; For production, supplying a custom my.ini or using the zipped portable MySQL is often smoother.
Filename: "msiexec.exe"; Parameters: "/i ""{tmp}\mysql-installer-web-community-8.0.45.0.msi"" /qn"; StatusMsg: "Installing MySQL Server... (This may take a few minutes)"; Flags: waituntilterminated

; 3. Run NPM Install for the backend
Filename: "cmd.exe"; Parameters: "/c ""cd /d ""{app}\backend_rewrite"" && npm install"""; StatusMsg: "Installing internal dependencies..."; Flags: waituntilterminated runhidden

; 4. Initialize Database & Seed Models
Filename: "cmd.exe"; Parameters: "/c ""cd /d ""{app}"" && node setup-db.js"""; StatusMsg: "Setting up database tables and master user..."; Flags: waituntilterminated runhidden

; 5. Launch app when finished
Filename: "{app}\start.bat"; Description: "Launch PulsePoint POS now"; Flags: postinstall shellexec skipifsilent
