import flask
from flask_cors import CORS
import sqlite3
from flask import jsonify, render_template, request
import os
from flask import request, redirect, session
from werkzeug.security import generate_password_hash, check_password_hash

app = flask.Flask(__name__)
CORS(app)

app.secret_key = "secret_key"  # Clé secrète pour la gestion des sessions


# Affiche la page d'accueil
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    print(session)
    if "user" in session and session.get("is_admin"):
        if request.method == "POST":
            username = request.form.get("username")
            password = request.form.get("password")
            is_admin = 1 if "user" in session and session.get("is_admin") else 0  # Seul un admin peut créer un autre admin

            if not username or not password:
                return render_template("register.html", error="Tous les champs sont obligatoires.")

            hashed_password = generate_password_hash(password)

            conn = sqlite3.connect("database.db")
            cursor = conn.cursor()

            try:
                cursor.execute("INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)", (username, hashed_password, is_admin))
                conn.commit()
                return redirect("/login")
            except sqlite3.IntegrityError:
                return render_template("register.html", error="Ce nom d'utilisateur est déjà pris.")
            finally:
                conn.close()
        return render_template("register.html")
    return redirect("/")

# Authentification
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")  # Affichage classique de la page de connexion

    if request.method == "POST":
        data = request.get_json()  # Récupère le JSON envoyé par fetch()
        username = data.get("username")
        password = data.get("password")

        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.execute("SELECT password, is_admin FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        conn.close()

        if user and check_password_hash(user[0], password):
            session["user"] = username
            session["is_admin"] = bool(user[1])  # Stocke le rôle admin
            return jsonify({"message": "Connexion réussie", "redirect": "/"})  # Retourne un JSON

        return jsonify({"error": "Identifiants incorrects"}), 401  # JSON en cas d'erreur


@app.route('/logout', methods=['POST', 'GET'])
def logout():
    session.pop("user", None)
    return redirect("/")

# Enregistre les présences des membres
@app.route('/submit' , methods=['POST'])
def submit():
    data = flask.request.json.get("members", [])  # Récupère la liste des membres


    if not data or not isinstance(data, list):
        return jsonify({"error (submit)": "Données invalides"}), 400

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.executemany("INSERT OR IGNORE INTO presences (nom) VALUES (?)", [(nom,) for nom in data])

    conn.commit()
    conn.close()

    return jsonify({"message (submit)": " " + ", ".join(data) + " sera présent !"}), 200


# Récupère la liste des membres du club (pour le front-end)
@app.route("/members", methods=["GET"])
def get_members():
    conn = sqlite3.connect("database.db")
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

    conn = sqlite3.connect("database.db")
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

    conn = sqlite3.connect("database.db")
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
    conn = sqlite3.connect("database.db")
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

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.executemany("DELETE FROM presences WHERE nom = ?", [(nom,) for nom in data])

    conn.commit()
    conn.close()

    return jsonify({"message (delete_presence)": "Présence supprimée pour " + ", ".join(data) + "!"}), 200

@app.route("/deleted_members", methods=["GET"])
def get_deleted_members():
    if "user" in session or session.get("is_admin"):
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.execute("SELECT nom FROM delete_members")
        deleted_members = [row[0] for row in cursor.fetchall()]
        return jsonify(deleted_members)
    else:
        return redirect("/")

# Remettre un membre dans la liste des membres
@app.route("/restore_members", methods=["POST"])
def restore_member():
    data = flask.request.json.get("members", [])
    if not data:
        return jsonify({"error (restore_member)": "Données invalides"}), 400

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.executemany("INSERT OR IGNORE INTO membres (nom) VALUES (?)", [(nom,) for nom in data])
    cursor.executemany("DELETE FROM delete_members WHERE nom = ?", [(nom,) for nom in data])

    conn.commit()
    conn.close()

    return jsonify({"message (restore_member)": " " + ", ".join(data) + " a été remis !"}), 200
    
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

