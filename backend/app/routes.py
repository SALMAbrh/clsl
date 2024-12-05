from flask import   Blueprint, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from .models import Reservation, db,User 
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from authlib.integrations.flask_client import OAuth
import os
from datetime import datetime
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# Initialisation des extensions
db = SQLAlchemy()
oauth = OAuth()
 

# Enregistrement des routes
main_routes = Blueprint('main', __name__)

# Route pour la page d'accueil
@main_routes.route('/')
def home():
    return "Welcome to the Reservation App!"

# === ROUTES CLIENT (Google OAuth) ===

# Route pour lancer l'authentification Google
@main_routes.route('/login')
def login():
    session['nonce'] = os.urandom(16).hex()  # Générer un nonce unique
    redirect_uri = url_for('main.auth', _external=True)  # Redirige vers `/auth`
    return oauth.google.authorize_redirect(redirect_uri, nonce=session['nonce'])

# Route de retour après l'authentification Google
@main_routes.route('/auth', methods=['GET'])
def auth():
    try:
        token = oauth.google.authorize_access_token()  # Récupérer le token
        nonce = session.get('nonce')  # Vérifier le nonce
        if not nonce:
            return "Erreur : nonce manquant.", 400
        user = oauth.google.parse_id_token(token, nonce=nonce)  # Décoder l'utilisateur
        if not user:
            return "Erreur : impossible de récupérer les informations utilisateur.", 400
        session['user'] = {'email': user['email']}  # Stocker l'utilisateur dans la session
        return redirect('http://localhost:3000/calendar')  # Rediriger vers React
    except Exception as e:
        return f"Erreur lors de l'authentification : {str(e)}", 500

# === ROUTES PROVIDER (Email & Password) ===

# Connexion du Provider
@main_routes.route('/provider/login', methods=['POST'])
def login_email():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    # Vérifiez si l'utilisateur existe avec l'email et le mot de passe en clair
    user = User.query.filter_by(email=email, password=password).first()

    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401

    # Créer une session utilisateur
    session['user'] = {'email': user.email}
    return jsonify({'message': 'Login successful', 'email': user.email}), 200
# Déconnexion du Provider
@main_routes.route('/logout', methods=['POST'])
def logout():
    
    session.pop('provider_user', None)
    return jsonify({'message': 'Logged out successfully'}), 200

# === ROUTES RÉSERVATION (Communes pour Client & Provider) ===

# Récupérer toutes les réservations
@main_routes.route('/api/reservations', methods=['GET'])
def get_reservations():
    reservations = Reservation.query.all()
    return jsonify([
        {
            'id': r.id,
            'room_id': r.room_id,
            'email': r.email,
            'start_time': r.start_time.isoformat(),
            'end_time': r.end_time.isoformat()
        } for r in reservations
    ])

# Ajouter une réservation
@main_routes.route('/api/reservations', methods=['POST'])
def add_reservation():
    data = request.json
    room_id = data.get('room_id')
    email = data.get('email')
    start_time = datetime.fromisoformat(data.get('start_time'))
    end_time = datetime.fromisoformat(data.get('end_time'))

    new_reservation = Reservation(
        room_id=room_id,
        email=email,
        start_time=start_time,
        end_time=end_time
    )
    db.session.add(new_reservation)
    db.session.commit()
    send_confirmation_email(email, room_id, start_time, end_time)
    return jsonify({
        'id': new_reservation.id,
        'room_id': new_reservation.room_id,
        'email': new_reservation.email,
        'start_time': new_reservation.start_time.isoformat(),
        'end_time': new_reservation.end_time.isoformat()
    }), 201

# Fonction pour envoyer un email de confirmation
def send_confirmation_email(email, room_id, start_time, end_time):
    message = Mail(
        from_email='reservationdesalleesi@gmail.com',
        to_emails=email,
        subject='Confirmation de réservation',
        html_content=f"""
        <strong>Bonjour,</strong><br>
        Votre réservation a été confirmée.<br>
        <ul>
            <li><strong>Salle : </strong>{room_id}</li>
            <li><strong>Début : </strong>{start_time}</li>
            <li><strong>Fin : </strong>{end_time}</li>
        </ul>
        """
    )
    try:
        sg = SendGridAPIClient("YOUR_SENDGRID_API_KEY")
        sg.send(message)
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'email : {e}")
