import sqlite3


conn = sqlite3.connect("backend/database.db")
cursor = conn.cursor()

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

conn.commit()
conn.close()
