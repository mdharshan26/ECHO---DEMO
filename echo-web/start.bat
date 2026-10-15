@echo off
title ECHO Queue Simulation Platform - LOGICFORGE
echo ========================================================
echo   Starting ECHO: Predictive Queue Management Platform
echo   Team: LOGICFORGE
echo ========================================================
echo.

set AGY_NODE="C:\Users\Dharshan M\AppData\Roaming\Antigravity\bin\agy-node.cmd"

if exist %AGY_NODE% (
    echo Launching local HTTP server via Node runtime...
    %AGY_NODE% server.js
) else (
    echo Launching directly in your default browser...
    start index.html
)
pause
