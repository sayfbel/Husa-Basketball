import os

files_to_update = [
    r"server\controllers\authController.js",
    r"client\src\pages\PresidentDashboard\pages\Profile.jsx",
    r"client\src\pages\PresidentDashboard\pages\AddUser.jsx",
    r"client\src\pages\PlayerDashboard\pages\Tactics.jsx",
    r"client\src\pages\PlayerDashboard\pages\Profile.jsx",
    r"client\src\pages\PlayerDashboard\pages\Match.jsx",
    r"client\src\pages\CoachDashboard\pages\Profile.jsx",
    r"client\src\pages\CoachDashboard\pages\Overview.jsx",
    r"client\src\pages\CoachDashboard\pages\MatchTacticsBoard.jsx",
    r"client\src\pages\CoachDashboard\pages\Match.jsx"
]

for f in files_to_update:
    path = os.path.join(r"c:\Users\hamza\Desktop\husa-basketball", f)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        new_content = content.replace("/assets/players/", "http://localhost:5000/uploads/")
        
        if content != new_content:
            with open(path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Updated {f}")
