import os
from app import create_app, db

app = create_app()

# Créer les tables dans SQLite si elles n'existent pas (uniquement au démarrage, avant le déploiement)
with app.app_context():
    db.create_all()
    print("Base de données SQLite initialisée avec succès !")

if __name__ == "__main__":
    # Récupérer le port depuis l'environnement ou utiliser 5000 par défaut
    port = int(os.environ.get("PORT", 5000))
    # Lancer l'application sur le port donné par Azure
    app.run(host="0.0.0.0", port=port, debug=True)
