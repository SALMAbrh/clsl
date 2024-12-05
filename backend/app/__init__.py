from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth

# Initialisation des extensions
db = SQLAlchemy()
oauth = OAuth()

def create_app():
    app = Flask(__name__)

    # Configuration de l'application
    app.secret_key = '382fbfc5a563b9e69e6f13dfded913bd6d354b0b28ef4c76'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///reservations.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialisation des extensions
    db.init_app(app)
    oauth.init_app(app)
    CORS(app, origins="http://localhost:3000")

    # Configuration de Google OAuth
    oauth.register(
        name='google',
        client_id='16844726883-nktuvt7v0fvoua9h948nvvl5ljddau9p.apps.googleusercontent.com',
        client_secret='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',
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid email profile'},
    )

    # Importer et enregistrer les routes principales (Client et Provider)
    from .routes import main_routes
    app.register_blueprint(main_routes)

    return app
