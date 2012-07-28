@echo off
set YUI=%~dp0\yuicompressor-2.4.7.jar
rd "..\release" /s /q
md "..\release"
xcopy "..\main" "..\release" /e
rd "..\release\scripts" /s /q
md "..\release\scripts"
java -jar "%YUI%" --charset=utf-8 -o "..\release\scripts\background.js" "..\main\scripts\background.js"
md "..\release\scripts\lib"
copy "..\main\scripts\lib\*.js" "..\release\scripts\lib"
rd "..\release\styles" /s /q
md "..\release\styles"
for /f "delims=" %%i in ('dir "..\main\styles" /b') do (java -jar "%YUI%" --charset=utf-8 -o "..\release\styles\%%i" "..\main\styles\%%i")
call spm build "../main/scripts/init.js" --combine_all --app_url "/" --out_path "../release/scripts"
chrome --pack-extension="%cd%/../release" --pack-extension-key="%cd%/chrome-hosts-manager.pem"


