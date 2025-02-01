import flask
from flask_cors import CORS
import sqlite3
from flask import jsonify, render_template
import os
app = flask.Flask(__name__)
CORS(app)

# Affiche la page d'accueil
@app.route("/")
def home():
    return render_template("frontend\index.html")


# Enregistre les présences des membres
@app.route('/submit' , methods=['POST'])
def submit():
    data = flask.request.json.get("members", [])  # Récupère la liste des membres


    if not data or not isinstance(data, list):
        return jsonify({"error (submit)": "Données invalides"}), 400

    conn = sqlite3.connect("backend/database.db")
    cursor = conn.cursor()

    cursor.executemany("INSERT OR IGNORE INTO presences (nom) VALUES (?)", [(nom,) for nom in data])

    conn.commit()
    conn.close()

    return jsonify({"message (submit)": " " + ", ".join(data) + " sera présent !"}), 200


# Récupère la liste des membres du club (pour le front-end)
@app.route("/members", methods=["GET"])
def get_members():
    conn = sqlite3.connect("backend/database.db")
    cursor = conn.cursor()
    cursor.execute("SELECT nom FROM membres")
    members = [row[0] for row in cursor.fetchall()]
    return jsonify(members)


# Ajoute les nouveaux membres à la base de données
@app.route("/add_members", methods=["POST"])
def add_members():
    data = flask.request.json.get("member", [])
    if not data:
        return jsonify({"error (add_members)": "Données invalides"}), 400

    conn = sqlite3.connect("backend/database.db")
    cursor = conn.cursor()

    cursor.executemany("INSERT OR IGNORE INTO membres (nom) VALUES (?)", [(nom,) for nom in data])
    conn.commit()
    conn.close()

    return jsonify({"message (add_members)": " " + ", ".join(data) + " est ajoutés !"}), 200

# Supprime un membre de la base de données
@app.route("/delete_members", methods=["POST"])
def delete_member():
    data = flask.request.json.get("members", [])
    if not data:
        return jsonify({"error (delete_member)": "Données invalides"}), 400

    conn = sqlite3.connect("backend/database.db")
    cursor = conn.cursor()

    cursor.executemany("DELETE FROM membres WHERE nom = ?", [(nom,) for nom in data])
    cursor.executemany("INSERT INTO delete_members (nom) VALUES (?)", [(nom,) for nom in data])
    cursor.executemany("DELETE FROM presences WHERE nom = ?", [(nom,) for nom in data])
    
    conn.commit()
    conn.close()

    return jsonify({"message (delete_member)": "Membres " + ", ".join(data) + " supprimés !"}), 200


# recupere la liste des presences (pour le front-end)
@app.route("/presences", methods=["GET"])
def get_presences():
    conn = sqlite3.connect("backend/database.db")
    cursor = conn.cursor()
    cursor.execute("SELECT nom FROM presences")
    presences = [row[0] for row in cursor.fetchall()]
    return jsonify(presences)

# supprime un membre de la liste des presences
@app.route("/delete_presences", methods=["POST"])
def delete_presence():
    data = flask.request.json.get("members", [])
    if not data:
        return jsonify({"error (delete_presence)": "Données invalides"}), 400

    conn = sqlite3.connect("backend/database.db")
    cursor = conn.cursor()

    cursor.executemany("DELETE FROM presences WHERE nom = ?", [(nom,) for nom in data])

    conn.commit()
    conn.close()

    return jsonify({"message (delete_presence)": "Présence supprimée pour " + ", ".join(data) + "!"}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
