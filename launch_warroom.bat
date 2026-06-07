@echo off
title AI War Room Launcher
cd /d "C:\Users\admin\Documents\ICDF"
echo Launching Antigravity Voice AI War Room on port 8709...
streamlit run war_room_app.py --server.port 8709
pause
