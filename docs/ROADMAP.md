# Feuille de route TaskFlow

## Version 0.1 — Socle full-stack

- [x] frontend Angular avec routing et composants standalone ;
- [x] formulaires réactifs et validations ;
- [x] API REST Spring Boot ;
- [x] persistance PostgreSQL et migrations Flyway ;
- [x] tests frontend et backend ;
- [x] CI full-stack ;
- [x] séparation du produit et des dépôts pédagogiques.

## Version 0.2 — Expérience utilisateur

- [x] recherche et tri ;
- [x] projets personnels et filtre par projet ;
- [x] confirmation de suppression ;
- [x] notifications de succès et d'erreur ;
- [x] accessibilité et responsive renforcés ;
- [x] projets reconnaissables par icône et couleur ;
- [x] parcours guidé de première utilisation ;
- [ ] tests end-to-end du parcours critique.

## Version 0.3 — Comptes et sécurité

- [x] inscription et connexion ;
- [x] authentification par jeton ;
- [x] tâches et projets isolés par utilisateur ;
- [x] routes et endpoints protégés ;
- [ ] rôles utilisateur et administrateur ;
- [ ] tests d'autorisation.

## Version 0.4 — Focus quotidien

- [x] V1 `Mes 3 priorités du jour` ([spécification](FOCUS-THREE-V1.md)) ;
- [x] limite de trois contrôlée par le backend ;
- [x] tests des priorités et de l'isolation par utilisateur ;
- [ ] validation du besoin auprès de 5 à 8 utilisateurs.

## Idées à évaluer après la V1

- [ ] proposer au maximum deux priorités inachevées de la veille, avec reprise manuelle ;
- [ ] durée estimée d'une tâche et charge totale des trois priorités ;
- [ ] date de planification distincte de la date d'échéance ;
- [ ] comparaison entre temps estimé et temps réellement passé.

## Version 0.5 — Déploiement

- [ ] images Docker frontend et backend ;
- [ ] environnement de production ;
- [ ] déploiement automatisé ;
- [ ] journaux, métriques et alertes ;
- [ ] sauvegardes et procédure de restauration.

## Version 1 — Produit SaaS validé

- [ ] espaces de travail et équipes ;
- [ ] partage et attribution des tâches ;
- [ ] offre gratuite et offre payante ;
- [ ] facturation ;
- [ ] mesure d'usage respectueuse de la vie privée.

Une fonctionnalité SaaS n'est développée qu'après validation du besoin auprès d'utilisateurs réels.
