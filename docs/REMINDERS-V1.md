# Rappels de tâches — V1

## Objectif

TaskFlow attire l’attention au bon moment sans multiplier les notifications. Un rappel appartient à une tâche et reste privé à son propriétaire.

## Parcours utilisateur

1. Dans le formulaire d’une tâche, l’utilisateur choisit une date et une heure de rappel.
2. Il peut demander une répétition après 5, 10, 30, 45 ou 60 minutes.
3. Le nombre d’occurrences est limité à trois pour éviter le spam.
4. Une fois l’heure atteinte, le rappel apparaît dans le centre visible sur la page des tâches.
5. L’utilisateur peut terminer la tâche, reporter le rappel ou le marquer comme lu.

Le mini-guide est contextuel : il est proposé dans la section des rappels lors de la première utilisation, puis son affichage est mémorisé dans le navigateur.

## Architecture

- Flyway `V8` ajoute la configuration du rappel à `tasks`.
- Les DTO Java valident les durées de report et le nombre maximal d’occurrences.
- Les routes sécurisées `PATCH /api/tasks/{id}/reminder/read` et `PATCH /api/tasks/{id}/reminder/snooze` vérifient le propriétaire grâce au service existant.
- Angular conserve les rappels dans le store partagé et affiche uniquement ceux qui sont arrivés, non lus et associés à une tâche non terminée.

## Limites volontaires

- La V1 affiche les rappels dans l’application web ; les notifications système, e-mails et SMS sont reportés.
- Le déclenchement est évalué au chargement ou à la mise à jour des tâches. Un ordonnanceur serveur et une diffusion temps réel seront étudiés après validation de l’usage.
- La gestion fine du fuseau horaire sera nécessaire avant un déploiement international.
