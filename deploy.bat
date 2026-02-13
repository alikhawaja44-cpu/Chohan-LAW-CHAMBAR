@echo off
echo Deploying Chohan Law Chamber...
cd "C:\Users\Jin\Desktop\Chohan Law Chamber"
git init
git add .
git commit -m "Deploy Law Firm App"
git branch -M main
git remote add origin https://github.com/alikhawaja44-cpu/chohan-law.git
git push -u origin main --force
echo Deployment Complete! ⚖️
pause