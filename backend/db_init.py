import sqlite3  # Importation du module SQLite intégré à Python
from werkzeug.security import generate_password_hash
import os

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

# 2️⃣ Création de la table "membres" si elle n'existe pas déjà
cursor.execute("DROP TABLE IF EXISTS membres")

cursor.execute('''
    CREATE TABLE membres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,   
        nom TEXT NOT NULL UNIQUE,
        birthday TEXT,
        date TEXT DEFAULT CURRENT_TIMESTAMP
    )
''')

# Lire les membres depuis le fichier et diviser en nom et date si disponible
with open("backend/members.txt", "r") as f:
    lignes = [line.strip() for line in f.readlines()]  # Liste de chaînes sans espace inutile

    # Gérer les cas où certaines lignes n'ont pas de date
    data = [(line.split(":", 1)[0].strip(), line.split(":", 1)[1].strip() if ":" in line else None) for line in lignes]

# Insérer dans la base de données (NULL si pas de date)
cursor.executemany("INSERT INTO membres (nom, birthday) VALUES (?, ?)", data)

# 2️⃣ Création de la table "delete_members" si elle n'existe pas déjà
cursor.execute('''
    CREATE TABLE IF NOT EXISTS delete_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,  -- ID unique qui s'incrémente automatiquement
        nom TEXT NOT NULL,              -- Nom du membre (obligatoire)
        date TEXT DEFAULT CURRENT_TIMESTAMP     -- Date d'enregistrement (par défaut : aujourd'hui)
    )
''')



# 2️⃣ Création de la table "users" si elle n'existe pas deja
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
