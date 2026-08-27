# Authentification — TaskFlow V1

TaskFlow utilise des comptes e-mail et des JWT afin que chaque utilisateur accède uniquement à ses propres tâches.

## Parcours utilisateur

1. `POST /api/auth/register` crée un compte et retourne un jeton d'accès.
2. `POST /api/auth/login` vérifie l'e-mail et le mot de passe puis retourne un nouveau jeton.
3. Le frontend envoie `Authorization: Bearer <jeton>` sur les appels `/api/**`.
4. Spring Security vérifie le jeton et le service de tâches filtre les données par propriétaire.

## Points de sécurité

- Les mots de passe sont stockés sous forme de hash BCrypt, jamais en clair.
- `JWT_SECRET` doit être défini avec une valeur longue, aléatoire et secrète avant tout déploiement.
- Le jeton expire après 8 heures par défaut. La V2 pourra ajouter un refresh token stocké dans un cookie sécurisé.
- Un accès à la tâche d'un autre compte répond 404, sans révéler son existence.

## Test manuel

1. Lancer PostgreSQL, puis le backend et le frontend.
2. Ouvrir `/register`, créer un compte avec un mot de passe de 8 caractères minimum.
3. Créer une tâche, se déconnecter puis créer un deuxième compte.
4. Vérifier que le deuxième compte ne voit pas la première tâche.
