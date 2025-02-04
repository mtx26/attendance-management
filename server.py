import flask
from flask_cors import CORS
import sqlite3
from flask import jsonify, render_template, request
import os
from flask import request, redirect, session
from werkzeug.security import generate_password_hash, check_password_hash
import re
import logging


# Configuration du système de logs
LOG_FILE = "server.log"
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,  # Niveau INFO, peut être changé en DEBUG pour plus de détails
    format="%(asctime)s [%(levelname)s] - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# Ajoute un affichage des logs dans la console
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
formatter = logging.Formatter("%(asctime)s [%(levelname)s] - %(message)s")
console_handler.setFormatter(formatter)
logging.getLogger().addHandler(console_handler)

class NoAnsiFormatter(logging.Formatter):
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')

    def format(self, record):
        log_message = super().format(record)
        return self.ansi_escape.sub('', log_message)  # Supprime les codes ANSI

logging.getLogger().handlers[0].setFormatter(NoAnsiFormatter())  # Applique le nouveau formatteur

app = flask.Flask(__name__)
CORS(app)

app.secret_key = "secret_key"  # Clé secrète pour la gestion des sessions


# Affiche la page d'accueil (pour le front-end)
@app.route("/", methods=["GET"])
def home():
    logging.info("Accès à la page d'accueil")
    return render_template("index.html")

# Inscription
@app.route("/register", methods=["GET", "POST"])
def register():
    if "user" in session and session.get("is_admin"):
        if request.method == "POST":
            username = request.form.get("username")
            password = request.form.get("password")
            is_admin = 1

            if not username or not password:
                logging.warning("Tous les champs sont obligatoires.")
                return render_template("register.html", error="Tous les champs sont obligatoires.")

            hashed_password = generate_password_hash(password)

            try:
                conn = sqlite3.connect("database.db")
                cursor = conn.cursor()
                cursor.execute("INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)", (username, hashed_password, is_admin))
                conn.commit()
                return redirect("/login")
            except sqlite3.IntegrityError:
                logging.warning("Ce nom d'utilisateur est déjà pris.")
                return render_template("register.html", error="Le nom {} d'utilisateur est déjà pris.".format(username))
            finally:
                conn.close()
                logging.info("Utilisateur {} enregistré avec succès.".format(username))
        return render_template("register.html")
    return redirect("/")

# Authentification
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        logging.info("Accès à la page de connexion")
        return render_template("login.html")  # Affichage classique de la page de connexion

    if request.method == "POST":
        data = request.get_json()  # Récupère le JSON envoyé par fetch()
        username = data.get("username")
        password = data.get("password")
        try:
            conn = sqlite3.connect("database.db")
            cursor = conn.cursor()
            cursor.execute("SELECT password, is_admin FROM users WHERE username = ?", (username,))
            user = cursor.fetchone()
            conn.close()
        except sqlite3.Error:
            logging.error("Erreur lors de la récupération des données de l'utilisateur {}".format(username))
            return jsonify({"error": "Erreur lors de la récupération des données de l'utilisateur"}), 500

        if user and check_password_hash(user[0], password):
            session["user"] = username
            session["is_admin"] = bool(user[1])  # Stocke le rôle admin
            logging.info("Connexion réussie pour l'utilisateur {}".format(username))
            return jsonify({"message": "Connexion réussie", "redirect": "/"})  # Retourne un JSON
        logging.warning("Identifiants incorrects pour l'utilisateur {}".format(username))
        return jsonify({"error": "Identifiants incorrects"}), 401  # JSON en cas d'erreur

# Deconnexion
@app.route('/logout', methods=['GET'])
def logout():
    session.pop("user", None)
    session.pop("is_admin", None)
    logging.info("Déconnexion de l'utilisateur {}".format(session.get("user")))
    return redirect("/")

# Enregistre les présences des membres
@app.route('/submit' , methods=['POST'])
def submit():
    data = flask.request.json.get("members", [])  # Récupère la liste des membres
    
    if not data or not isinstance(data, list):
        logging.warning("Données invalides pour l'ajout de présences")
        return jsonify({"error (submit)": "Données invalides"}), 400
    
    try:

        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.executemany("INSERT OR IGNORE INTO presences (nom) VALUES (?)", [(nom,) for nom in data])
        conn.commit()
        conn.close()
    except sqlite3.Error:
        logging.error("Erreur lors de l'enregistrement des présences")
        return jsonify({"error": "Erreur lors de l'enregistrement des présences"}), 500

    logging.info("Présence enregistrée pour " + ", ".join(data))
    return jsonify({"message (submit)": " " + ", ".join(data) + " sera présent !"}), 200


# Récupère la liste des membres du club (pour le front-end)
@app.route("/members", methods=["GET"])
def get_members():
    try:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.execute("SELECT nom FROM membres")
        members = [row[0] for row in cursor.fetchall()]
        conn.close()
    except sqlite3.Error:
        logging.error("Erreur lors de la récupération des membres")
        return jsonify({"error": "Erreur lors de la récupération des membres"}), 500
    logging.info("Récupération de la liste des membres")
    return jsonify(members)


# Ajoute les nouveaux membres à la base de données
@app.route("/add_members", methods=["POST"])
def add_members():
    data = flask.request.json.get("members", [])  # Correspond à la clé "members"
    print(data)

    if not data or not isinstance(data, list):
        logging.warning("Données invalides pour l'ajout de membres")
        return jsonify({"error (add_members)": "Données invalides"}), 400

    try:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.executemany(
            "INSERT OR IGNORE INTO membres (nom, birthday) VALUES (?, ?)",
            [(member["nom"].title(), member["birthday"]) for member in data]
        )
        conn.commit()
        conn.close()
    except KeyError:
        logging.warning("Format de données incorrect pour l'ajout de membres")
        return jsonify({"error": "Format de données incorrect"}), 400
    except sqlite3.Error:
        logging.error("Erreur lors de l'ajout de membres")
        return jsonify({"error": "Erreur lors de l'ajout de membres"}), 500

    logging.info("Membres ajoutés : " + ", ".join([member["nom"] for member in data]))
    return jsonify({"message (add_members)": ", ".join([member["nom"] for member in data]) + " a été ajouté !"}), 200


# Supprime un membre de la base de données
@app.route("/delete_members", methods=["POST"])
def delete_member():
    data = flask.request.json.get("members", [])
    if not data:
        logging.warning("Données invalides pour la suppression de membres")
        return jsonify({"error (delete_member)": "Données invalides"}), 400
    try:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        cursor.executemany("DELETE FROM membres WHERE nom = ?", [(nom,) for nom in data])
        cursor.executemany("INSERT INTO delete_members (nom) VALUES (?)", [(nom,) for nom in data])
        cursor.executemany("DELETE FROM presences WHERE nom = ?", [(nom,) for nom in data])
        
        conn.commit()
        conn.close()
    except sqlite3.Error:
        logging.error("Erreur lors de la suppression de membres")
        return jsonify({"error": "Erreur lors de la suppression de membres"}), 500

    logging.info("Membres supprimés : " + ", ".join(data))
    return jsonify({"message (delete_member)": "Membres " + ", ".join(data) + " supprimés !"}), 200

# recupere la liste des presences (pour le front-end)
@app.route("/presences", methods=["GET"])
def get_presences():
    try:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.execute("SELECT nom FROM presences")
        presences = [row[0] for row in cursor.fetchall()]
        conn.close()
    except sqlite3.Error:
        logging.error("Erreur lors de la récupération des-presences")
        return jsonify({"error": "Erreur lors de la récupération des-presences"}), 500
    logging.info("Récupération de la liste des présences")
    return jsonify(presences)

# supprime un membre de la liste des presences
@app.route("/delete_presences", methods=["POST"])
def delete_presence():
    data = flask.request.json.get("members", [])
    if not data:
        logging.warning("Données invalides pour la suppression de presences")
        return jsonify({"error (delete_presence)": "Données invalides"}), 400
    try:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        cursor.executemany("DELETE FROM presences WHERE nom = ?", [(nom,) for nom in data])

        conn.commit()
        conn.close()
    except sqlite3.Error:
        logging.error("Erreur lors de la suppression de présences")
        return jsonify({"error": "Erreur lors de la suppression de présences"}), 500

    logging.info("Présence supprimée pour " + ", ".join(data))
    return jsonify({"message (delete_presence)": "Présence supprimée pour " + ", ".join(data) + "!"}), 200

# Recupere la liste des membres supprimés (pour le front-end)
@app.route("/get_deleted_members", methods=["GET"])
def get_deleted_members():
    if "user" in session and session.get("is_admin"):
        try:
            conn = sqlite3.connect("database.db")
            cursor = conn.cursor()
            cursor.execute("SELECT nom FROM delete_members")
            deleted_members = [row[0] for row in cursor.fetchall()]
            conn.close()
        except sqlite3.Error:
            logging.error("Erreur lors de la récupération des membres supprimés")
            return jsonify({"error": "Erreur lors de la récupération des membres supprimés"}), 500
        if not deleted_members:
            logging.info("Aucun membre supprimé")
            return jsonify([])
        logging.info("Récupération de la liste des membres supprimés")
        return jsonify(deleted_members)
    else:
        logging.warning("Tentative d'accès non autorisé à la liste des membres supprimés")
        return redirect("/")

# Restoré un membre
@app.route("/restore_members", methods=["POST"])
def restore_member():
    data = flask.request.json.get("members", [])
    if not data:
        logging.warning("Données invalides pour le restauration de membres")
        return jsonify({"error (restore_member)": "Données invalides"}), 400

    try:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        cursor.executemany("INSERT OR IGNORE INTO membres (nom) VALUES (?)", [(nom,) for nom in data])
        cursor.executemany("DELETE FROM delete_members WHERE nom = ?", [(nom,) for nom in data])

        conn.commit()
        conn.close()
    except sqlite3.Error:
        logging.error("Erreur lors de la restauration de membres")
        return jsonify({"error": "Erreur lors de la restauration de membres"}), 500

    logging.info(" " + ", ".join(data) + " a été remis !")
    return jsonify({"message (restore_member)": " " + ", ".join(data) + " a été remis !"}), 200

# Recupere la liste des anniversaires (pour le front-end)
@app.route("/get_birthdays", methods=["GET"])
def get_birthdays():
    try:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        
        cursor.execute("SELECT nom, birthday FROM membres")
        birthdays = cursor.fetchall()  # Liste de tuples (nom, birthday)
        
        conn.close()
    except sqlite3.Error:
        logging.error("Erreur lors de la récupération des anniversaires")
        return jsonify({"error": "Erreur lors de la récupération des anniversaires"}), 500

    # Transformer les dates pour le bon format
    birthday_list = [
        {
            "nom": nom,
            "birthday": birthday  # Stocké en YYYY-MM-DD, déjà utilisable
        }
        for nom, birthday in birthdays
    ]
    logging.info("Récupération de la liste des anniversaires")
    return jsonify(birthday_list)

# Affiche la page des anniversaires (pour le front-end)
@app.route("/birthdays", methods=["GET"])
def birthdays():
    logging.info("Accès à la page des anniversaires")
    return render_template("birthdays.html")

# Affiche la page des membres supprimés (pour le front-end)
@app.route("/admin", methods=["GET"])
def admin():
    if "user" in session and session.get("is_admin"):
        logging.info("Accès à la page d'administration pour l'utilisateur {}".format(session.get("user")))
        return render_template("admin.html")
    logging.warning("Tentative d'accès non autorisé à la page d'administration")
    return redirect("/")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

