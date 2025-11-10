; FORGE Inno Setup Script (STAGED - Wire up after validation)

[Setup]
AppName=FORGE
AppVersion=0.1.0
DefaultDirName={pf}\FORGE
DefaultGroupName=FORGE
OutputBaseFilename=forge-setup
Compression=lzma
SolidCompression=yes

[Files]
Source: "..\..\launcher\dist\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\FORGE"; Filename: "{app}\FORGE.exe"
Name: "{commondesktop}\FORGE"; Filename: "{app}\FORGE.exe"

[Run]
Filename: "{app}\FORGE.exe"; Description: "Launch FORGE"; Flags: nowait postinstall skipifsilent
