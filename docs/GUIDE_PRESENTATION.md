# Guide de Présentation du Projet

## 📋 Comment Présenter le Projet

### Introduction (2 minutes)

"J'ai développé un système de portefeuille électronique pour HaitiPay qui permet de gérer des wallets électroniques avec un système de double écriture comptable. Le projet implémente toutes les fonctionnalités demandées : création de wallets, rechargement depuis un compte principal, transferts entre wallets, et consultation des historiques."

### Architecture (3 minutes)

"J'ai choisi une architecture MVC + Services avec Node.js et TypeScript. La structure sépare clairement les responsabilités :
- Les **Models** gèrent l'accès à la base de données
- Les **Services** contiennent la logique métier
- Les **Controllers** gèrent les requêtes HTTP
- Les **Routes** définissent les endpoints

Cette architecture permet un code maintenable, testable et évolutif."

### Fonctionnalités Principales (5 minutes)

**1. Création de Wallet**
"J'ai implémenté une validation stricte : format téléphone haïtien (+509XXXXXXXX), vérification de l'âge minimum (16 ans), validation du PIN (4 chiffres exactement), et vérification de l'unicité du numéro de téléphone."

**2. Recharge depuis Ledger**
"Le système calcule automatiquement les frais de 2%, vérifie que le Ledger a suffisamment de fonds, et exécute l'opération dans une transaction SQL atomique pour garantir l'intégrité."

**3. Transfert entre Wallets**
"Les transferts incluent la gestion des frais (2% débités de l'émetteur), la vérification du solde suffisant, et le respect de la limite journalière de 100,000 HTG par wallet."

**4. Sécurité**
"Les PINs sont hashés avec bcrypt et jamais stockés en clair. L'authentification se fait via un header `x-pin` qui vérifie le wallet et le PIN avant d'autoriser l'accès."

### Sécurité et Intégrité (3 minutes)

"Pour garantir l'intégrité des données financières, j'utilise des transactions SQL. Toutes les opérations financières sont exécutées dans une seule transaction : soit tout réussit, soit tout est annulé. Cela évite les états incohérents en cas d'erreur.

J'ai aussi implémenté un système de double écriture comptable : chaque transaction enregistre le compte source et le compte destination, permettant une traçabilité complète."

### Défis et Solutions (2 minutes)

"Parmi les défis rencontrés :
1. Configuration TypeScript avec modules ES - résolu en utilisant ESNext
2. Gestion de l'atomicité - résolu avec transactions SQL
3. Calcul précis de l'âge - prise en compte du mois et jour
4. Mapping DB ↔ TypeScript - utilisation d'alias SQL"

---

## ❓ Réponses aux Questions Probables

### Q1 : Pourquoi avez-vous choisi cette architecture ?

**Réponse** : "J'ai choisi une architecture MVC + Services pour séparer clairement les responsabilités. Les contrôleurs gèrent uniquement le HTTP, la logique métier est dans les services, et l'accès aux données est dans les modèles. Cela rend le code plus maintenable, testable et évolutif."

### Q2 : Comment gérez-vous la sécurité des PINs ?

**Réponse** : "Les PINs sont hashés avec bcrypt (10 rounds de salage) avant stockage. Ils ne sont jamais stockés en clair. Lors de la vérification, j'utilise `bcrypt.compare()` qui est timing-safe pour éviter les attaques par timing. Le format est validé pour être exactement 4 chiffres."

### Q3 : Comment garantissez-vous l'intégrité des transactions ?

**Réponse** : "J'utilise des transactions SQL avec `BEGIN TRANSACTION`, `COMMIT` et `ROLLBACK`. Toutes les opérations financières sont exécutées dans une seule transaction atomique. Si une erreur survient, tout est annulé automatiquement, garantissant la cohérence des données."

### Q4 : Pourquoi les montants sont en centimes ?

**Réponse** : "C'est une pratique standard dans les systèmes financiers. Les nombres flottants peuvent causer des problèmes de précision (ex: 0.1 + 0.2 = 0.30000000000000004). En utilisant des entiers (centimes), tous les calculs sont exacts. C'est aussi plus performant."

### Q5 : Comment calculez-vous la limite journalière ?

**Réponse** : "J'exécute une requête SQL qui somme tous les transferts du wallet dans la journée. La requête filtre sur `created_at` entre le début et la fin de la journée, et sur le type 'wallet_transfer'. Je vérifie cette limite avant chaque transfert."

### Q6 : Comment gérez-vous les frais de transaction ?

**Réponse** : "Les frais sont calculés à 2% du montant. Pour les recharges, les frais sont débités du Ledger mais restent dans le Ledger comme revenu. Pour les transferts, les frais sont débités du wallet émetteur et crédités au Ledger comme commission. Tous les frais sont enregistrés dans la table transactions."

### Q7 : Que se passe-t-il si le Ledger n'a pas assez de fonds ?

**Réponse** : "Avant chaque recharge, je vérifie que le solde du Ledger est suffisant pour couvrir le montant + les frais. Si ce n'est pas le cas, je retourne une erreur 400 avec un message clair, et la transaction n'est même pas commencée."

### Q8 : Comment testez-vous votre code ?

**Réponse** : "J'ai créé des scripts de test automatisés (bash et Node.js) qui testent tous les endpoints. J'ai aussi fait des tests manuels avec curl pour vérifier les cas limites : validation des formats, gestion des erreurs, sécurité avec PIN incorrect, etc."

### Q9 : Quelles difficultés avez-vous rencontrées ?

**Réponse** : "Les principales difficultés étaient :
1. Configuration TypeScript avec modules ES - j'ai dû ajuster le tsconfig.json et utiliser ts-node/esm
2. Gestion de l'atomicité - résolu avec transactions SQL
3. Calcul précis de l'âge - j'ai dû prendre en compte le mois et le jour, pas seulement l'année
4. Mapping entre snake_case de la DB et camelCase TypeScript - résolu avec des alias SQL"

### Q10 : Comment pourriez-vous améliorer ce projet ?

**Réponse** : "Plusieurs améliorations possibles :
- Ajouter des tests unitaires et d'intégration avec Jest
- Implémenter une documentation API avec Swagger
- Ajouter un système de logs plus robuste avec Winston
- Implémenter un cache Redis pour les requêtes fréquentes
- Ajouter un système de rate limiting
- Implémenter des webhooks pour les notifications"

---

## 🎯 Points Clés à Mettre en Avant

1. ✅ **Architecture propre** : MVC + Services, séparation claire
2. ✅ **Sécurité** : PIN hashé, validation stricte, transactions SQL
3. ✅ **Intégrité** : Double écriture comptable, atomicité garantie
4. ✅ **Code maintenable** : TypeScript, structure claire
5. ✅ **Respect des spécifications** : 100% des fonctionnalités implémentées

## 💬 Phrases Clés à Retenir

- "J'ai choisi une architecture MVC + Services pour séparer clairement les responsabilités"
- "Tous les montants sont stockés en centimes pour éviter les problèmes de précision"
- "J'utilise des transactions SQL pour garantir l'atomicité des opérations financières"
- "Les PINs sont hashés avec bcrypt et jamais stockés en clair"
- "J'ai implémenté un système de double écriture comptable pour la traçabilité complète"

## 🚨 Si Vous Ne Savez Pas Répondre

**Ne paniquez pas !** Utilisez ces phrases :

- "C'est une excellente question. Je n'ai pas encore approfondi ce point mais je serais ravi d'en discuter et de l'implémenter si nécessaire."
- "Je pourrais améliorer cela en [suggestion basée sur votre compréhension]"
- "C'est un point que j'aimerais explorer davantage. Avez-vous des suggestions ?"

## 📊 Statistiques du Projet

- **Temps de développement** : 4-5 heures
- **Lignes de code** : ~2000
- **Endpoints implémentés** : 8
- **Fonctionnalités** : 100% des spécifications
- **Tables de base de données** : 4
- **Services métier** : 3
- **Contrôleurs** : 2

## 🎓 Structure de Présentation Recommandée

1. **Introduction** (2 min) : Contexte et objectifs
2. **Architecture** (3 min) : Structure et choix techniques
3. **Fonctionnalités** (5 min) : Détails des principales fonctionnalités
4. **Sécurité** (3 min) : PIN hashé, transactions SQL
5. **Défis** (2 min) : Difficultés et solutions
6. **Questions** (5 min) : Réponses aux questions

**Total : ~20 minutes**

---

## ✅ Checklist Avant la Présentation

- [ ] Avoir testé tous les endpoints
- [ ] Connaître la structure du projet
- [ ] Comprendre chaque fonctionnalité
- [ ] Savoir expliquer les choix techniques
- [ ] Avoir préparé des réponses aux questions probables
- [ ] Avoir le projet compilé et fonctionnel
- [ ] Avoir la base de données configurée

---

**Bonne chance pour votre présentation ! 🚀**
