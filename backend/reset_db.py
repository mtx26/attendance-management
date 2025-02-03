import sqlite3

DB_PATH = "../database.db"

def reset_presences():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Supprime toutes les entrées de la table `presences` sans supprimer la structure
    cursor.execute("DELETE FROM presences")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    reset_presences()
    print("Table `presences` réinitialisée avec succès.")
