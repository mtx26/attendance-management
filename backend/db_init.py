import sqlite3  # Importation du module SQLite intégré à Python
from werkzeug.security import generate_password_hash

# 1️⃣ Connexion à la base de données (ou création si elle n'existe pas)
conn = sqlite3.connect("database.db")
cursor = conn.cursor()  # Création d'un objet "curseur" pour exécuter des requêtes SQL

# 2️⃣ Création de la table "presences" si elle n'existe pas déjà
cursor.execute('''
    CREATE TABLE IF NOT EXISTS presences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,  -- ID unique qui s'incrémente automatiquement
        nom TEXT NOT NULL UNIQUE,              -- Nom du membre (obligatoire)
        date TEXT DEFAULT CURRENT_TIMESTAMP         -- Date d'enregistrement (par défaut : aujourd'hui)
    )
''')
cursor.execute("DROP TABLE IF EXISTS membres")

cursor.execute('''
    CREATE TABLE membres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,   
        nom TEXT NOT NULL UNIQUE,
        date TEXT DEFAULT CURRENT_TIMESTAMP
    )
''')

with open("backend/members.txt", "r") as f:
    membres_defaut = [(line.strip(),) for line in f.readlines()]  # Convertir en tuple

cursor.executemany("INSERT INTO membres (nom) VALUES (?)", membres_defaut)

cursor.execute('''
    CREATE TABLE IF NOT EXISTS delete_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,  -- ID unique qui s'incrémente automatiquement
        nom TEXT NOT NULL,              -- Nom du membre (obligatoire)
        date TEXT DEFAULT CURRENT_TIMESTAMP     -- Date d'enregistrement (par défaut : aujourd'hui)
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin INTEGER DEFAULT 0  
    )
''')
password = "Elisamatis26"
# achage du mot de passe de l'admin
hashed_password = generate_password_hash(password)
cursor.executemany("INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)", [("Matis Gillet", hashed_password, 1)])

# 3️⃣ Validation des changements et fermeture de la connexion
conn.commit()  # Enregistre les modifications dans la base de données
conn.close()   # Ferme la connexion
