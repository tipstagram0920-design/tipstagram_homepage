@echo off
chcp 65001 >nul
title 팁스타그램 스튜디오 설치
echo 설치를 시작해요. 잠시만요...
powershell -NoProfile -ExecutionPolicy Bypass -Command "irm \"https://tipstagram-homepage.vercel.app/studio/installer.ps1\" | iex"
if errorlevel 1 pause
