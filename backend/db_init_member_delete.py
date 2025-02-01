import sqlite3  # Importation du module SQLite intégré à Python

# 1️⃣ Connexion à la base de données (ou création si elle n'existe pas)
conn = sqlite3.connect("database.db")
cursor = conn.cursor()  # Création d'un objet "curseur" pour exécuter des requêtes SQL

# 2️⃣ Création de la table "presences" si elle n'existe pas déjà
cursor.execute('''
    CREATE TABLE IF NOT EXISTS delete_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,  -- ID unique qui s'incrémente automatiquement
        nom TEXT NOT NULL,              -- Nom du membre (obligatoire)
        date TEXT DEFAULT CURRENT_TIMESTAMP     -- Date d'enregistrement (par défaut : aujourd'hui)
    )
''')
# 3️⃣ Validation des changements et fermeture de la connexion
conn.commit()  # Enregistre les modifications dans la base de données
conn.close()   # Ferme la connexion
