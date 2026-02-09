$git = "C:\Program Files\Git\cmd\git.exe"

Write-Host "Initializing new git repository..."
& $git init

Write-Host "Adding files..."
& $git add .

Write-Host "Committing..."
# check if user config exists, if not set dummy
if (!(& $git config user.email)) {
    Write-Host "Setting dummy git user..."
    & $git config user.email "antigravity@example.com"
    & $git config user.name "Antigravity Assistant"
}

& $git commit -m "Initial commit for Husa-Basketball"

Write-Host "Renaming branch to main..."
& $git branch -M main

Write-Host "Setting remote..."
$remotes = & $git remote
if ($remotes -contains "origin") {
    Write-Host "Remote origin exists, updating URL..."
    & $git remote set-url origin https://github.com/sayfbel/Husa-Basketball
}
else {
    Write-Host "Adding remote origin..."
    & $git remote add origin https://github.com/sayfbel/Husa-Basketball
}

Write-Host "Pushing to remote..."
& $git push -u origin main
