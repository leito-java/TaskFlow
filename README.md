# TaskFlow

> Une application de gestion de tâches full-stack : Angular, Spring Boot, PostgreSQL et authentification JWT.

TaskFlow est une application full-stack de gestion de tâches construite avec Angular, Spring Boot et PostgreSQL. Ce dépôt contient le produit ; les cours et exercices restent dans les dépôts pédagogiques séparés.

## Fonctionnalités actuelles

- créer, consulter, modifier et supprimer une tâche ;
- définir une description, une priorité, un statut, une échéance, une durée estimée et un projet ;
- créer des projets personnels et y associer des tâches ;
- filtrer les tâches à faire, en cours ou terminées ;
- rechercher une tâche et trier la liste par priorité ou échéance ;
- conserver les données dans PostgreSQL ;
- créer un compte, se connecter, se déconnecter et modifier son mot de passe ;
- gérer les états de chargement, d'erreur et de liste vide ;
- naviguer entre accueil, liste, formulaire et page À propos.
- visualiser la charge totale estimée des trois priorités du jour.

## Architecture

```text
Navigateur
   ↓ HTTP /api
frontend/ — Angular
   ↓ proxy de développement
backend/ — Spring Boot
   ↓ Spring Data JPA
PostgreSQL — schéma versionné par Flyway
```

Consultez la [documentation d'architecture](docs/ARCHITECTURE.md) pour les responsabilités et le trajet des données.

## Prérequis

- Node.js `22.22.3` ou une version compatible avec Angular 22 ;
- Java 21 ;
- Maven 3.9 ou supérieur ;
- PostgreSQL 16 ou supérieur, ou Docker Compose.

Vérifiez l'environnement :

```powershell
node --version
npm --version
java -version
mvn -version
docker compose version
```

## Démarrage rapide

### 1. PostgreSQL

Avec Docker, depuis la racine :

```powershell
Copy-Item .env.example .env
docker compose up -d postgres
docker compose ps
```

Le port par défaut est `5432`. Si ce port est occupé, modifiez `POSTGRES_PORT` dans `.env`, puis fournissez le même port à Spring Boot avec `DB_URL`.

### 2. Backend

Dans un deuxième terminal :

```powershell
cd backend
mvn spring-boot:run
```

Pour PostgreSQL sur `5433` :

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5433/taskflow"
$env:DB_USERNAME = "taskflow"
$env:DB_PASSWORD = "taskflow_dev"
mvn spring-boot:run
```

### 3. Frontend

Dans un troisième terminal :

```powershell
cd frontend
npm ci
npm start
```

Ouvrez ensuite :

- application : `http://localhost:4200` ;
- API : `http://localhost:8080/api/tasks` ;
- Swagger UI : `http://localhost:8080/swagger-ui.html`.

## Vérifications

Frontend :

```powershell
cd frontend
npm test
npm run build
```

Parcours end-to-end (le backend et PostgreSQL doivent être disponibles ; Playwright réutilise les serveurs déjà lancés) :

```powershell
cd frontend
npm run test:e2e:install
npm run test:e2e
```

Le scénario crée un compte temporaire unique, puis vérifie l'inscription, les projets, les tâches, le focus quotidien, la déconnexion et la persistance après reconnexion. Le rapport HTML est écrit dans `frontend/playwright-report/` uniquement pour le diagnostic local ou la CI.

Backend :

```powershell
cd backend
mvn verify
```

La CI exécute ces vérifications avec Node 24, Java 21, Chromium et un vrai service PostgreSQL isolé.

## Organisation

```text
frontend/              application Angular
backend/               API Spring Boot et migrations Flyway
docs/                  architecture et feuille de route produit
.github/workflows/     intégration continue full-stack
compose.yml            PostgreSQL local reproductible
```

## Origine pédagogique

TaskFlow est le projet fil rouge issu de :

- [Angular-revision](https://github.com/leito-java/Angular-revision), pour le frontend ;
- [Java-revision](https://github.com/leito-java/Java-revision), pour le backend.

Ces deux dépôts enseignent les notions étape par étape. TaskFlow est désormais la source de vérité pour l'évolution du produit.

## État du produit

Le socle full-stack, l'authentification et l'isolation des données par utilisateur sont fonctionnels. Le déploiement de production reste planifié dans la [feuille de route](docs/ROADMAP.md). N'utilisez pas encore cette version pour stocker des données sensibles.

## Contribution

Consultez [CONTRIBUTING.md](CONTRIBUTING.md). Après le commit initial, tout changement passe par une branche dédiée, une Pull Request et une CI verte.

## Licence

Ce projet est distribué sous licence [MIT](LICENSE).
