# V1 — Mes 3 priorités du jour

## Problème résolu

Une longue liste de tâches crée de la surcharge mentale : l'utilisateur sait ce qu'il doit faire, mais ne sait pas par quoi commencer. TaskFlow doit aider à choisir l'essentiel sans cacher le reste de son travail.

## Proposition de valeur

Chaque jour, l'utilisateur sélectionne au maximum trois tâches importantes. La page d'accueil montre ces priorités, leur avancement et un accès direct aux autres tâches.

La fonctionnalité s'adresse d'abord aux étudiants, juniors développeurs et freelances qui veulent une méthode simple pour organiser leur journée.

## Périmètre de la V1

### Parcours utilisateur

1. L'utilisateur ouvre la page `Mes tâches` ou l'accueil.
2. Il choisit une tâche existante et clique sur `Ajouter aux priorités du jour`.
3. La tâche apparaît dans le bloc `Mes 3 priorités aujourd'hui`.
4. Il peut terminer, modifier ou retirer une priorité.
5. Une fois trois priorités sélectionnées, toute nouvelle sélection est bloquée avec une explication claire.

### Règles métier

- Une priorité appartient à un utilisateur et à une date.
- Maximum : **3 priorités actives par utilisateur et par jour**.
- Une même tâche ne peut être ajoutée qu'une fois au même jour.
- Une tâche terminée reste visible dans les priorités du jour, avec son état `Terminée`.
- Retirer une priorité ne supprime jamais la tâche.
- Les tâches d'un projet peuvent devenir des priorités ; les projets ne sont pas modifiés.
- À minuit, le nouveau jour commence avec zéro priorité. Les tâches non terminées restent disponibles dans la liste générale.
- Une priorité non terminée n'est jamais reconduite automatiquement.
- Le lendemain, TaskFlow propose au maximum deux priorités inachevées de la veille avec l'action `Reprendre`.
- L'utilisateur peut reprendre zéro, une ou deux suggestions ; chaque choix occupe une place parmi les trois priorités du nouveau jour.
- Une suggestion ignorée reste une tâche normale dans son projet et n'est ni supprimée ni modifiée.
- La date d'échéance aide à suggérer les tâches urgentes, mais ne décide jamais automatiquement du focus de l'utilisateur.

### Expérience attendue

Le bloc affiche :

- le compteur `0/3`, `1/3`, `2/3` ou `3/3` ;
- les trois tâches dans un ordre modifiable ;
- une phrase d'aide : `Choisis ce qui fera vraiment avancer ta journée.` ;
- un bouton de retrait accessible au clavier et avec un libellé explicite ;
- un état vide proposant d'ajouter une première priorité.

## Critères d'acceptation

- L'utilisateur ne peut pas ajouter une quatrième priorité.
- La limite est contrôlée par le backend, pas seulement par le navigateur.
- Après actualisation de la page, les priorités du jour sont conservées.
- Un utilisateur ne voit jamais les priorités d'un autre utilisateur.
- Les tests couvrent l'ajout, le retrait, la limite de trois et l'isolation par utilisateur.
- L'interface reste utilisable sur mobile et au clavier.

## Évolution technique proposée

Backend : créer l'entité `DailyPriority` contenant `userId`, `taskId`, `priorityDate` et `position`. Une contrainte de base de données doit empêcher le doublon `(user_id, task_id, priority_date)`.

Frontend : ajouter un service API dédié, un état local des priorités du jour et un composant réutilisable `DailyPrioritiesComponent`.

## Hors périmètre V1

- Priorités planifiées sur plusieurs jours.
- Suggestions automatiques par IA.
- Rappels et notifications.
- Partage des priorités avec une équipe.
- Statistiques hebdomadaires.

Ces idées seront évaluées après validation de l'usage réel de la V1.
