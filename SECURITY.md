# Sécurité

TaskFlow est encore en phase de développement et ne possède pas d'authentification. N'y stockez aucune donnée sensible ou personnelle en production.

## Signaler un problème

Ne publiez pas une vulnérabilité exploitable dans une issue publique. Utilisez la fonctionnalité **Report a vulnerability** de l'onglet Security du dépôt GitHub lorsqu'elle est disponible.

## Secrets

- ne commitez jamais `.env` ;
- gardez uniquement `.env.example` avec des valeurs locales fictives ;
- fournissez les secrets de production depuis l'environnement de déploiement ;
- révoquez immédiatement tout secret publié par erreur.
