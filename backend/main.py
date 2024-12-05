from app import create_app, db
 
app = create_app()
 
if __name__ == "__main__":
    # Initialiser la base de données
    with app.app_context():
        db.create_all()  # Crée les tables dans SQLite si elles n'existent pas
        print("Base de données SQLite initialisée avec succès !")
    app.run(debug=True)
