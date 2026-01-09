# Variables d'Environnement pour Render

## Liste Complète des Variables

Voici **exactement** les variables d'environnement à configurer dans le dashboard Render :

### Variables OBLIGATOIRES (à configurer manuellement)

| Variable | Valeur | Description |
|----------|--------|-------------|
| `DB_HOST` | `votre-host-mysql.com` | Adresse de votre serveur MySQL (ex: `aws-xxx.rds.amazonaws.com` ou `xxx.planetscale.com`) |
| `DB_PORT` | `3306` | Port MySQL (généralement 3306) |
| `DB_USER` | `votre_username` | Nom d'utilisateur MySQL |
| `DB_PASSWORD` | `votre_password` | Mot de passe MySQL |
| `DB_NAME` | `haitipay_wallet` | Nom de la base de données |

### Variables OPTIONNELLES (déjà dans render.yaml, mais vous pouvez les modifier)

| Variable | Valeur par défaut | Description |
|----------|-------------------|-------------|
| `NODE_ENV` | `production` | Environnement (production/development) |
| `PORT` | `10000` | Port sur lequel le serveur écoute (Render définit automatiquement, mais vous pouvez forcer) |
| `CORS_ORIGIN` | `*` | Origines autorisées pour CORS (mettez votre domaine frontend si vous en avez un) |

## Configuration dans Render

### Étapes :

1. **Allez dans votre service** sur le dashboard Render
2. **Cliquez sur "Environment"** dans le menu de gauche
3. **Pour chaque variable obligatoire, cliquez sur "Add Environment Variable"** et ajoutez :

```
Key: DB_HOST
Value: votre-host-mysql.com
```

```
Key: DB_PORT
Value: 3306
```

```
Key: DB_USER
Value: votre_username
```

```
Key: DB_PASSWORD
Value: votre_password_secret
```

```
Key: DB_NAME
Value: haitipay_wallet
```

## Exemple avec PlanetScale

Si vous utilisez PlanetScale (gratuit), voici un exemple :

```
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_USER=votre_username_planetscale
DB_PASSWORD=votre_password_planetscale
DB_NAME=haitipay_wallet
NODE_ENV=production
PORT=10000
CORS_ORIGIN=*
```

## Exemple avec AWS RDS

Si vous utilisez AWS RDS :

```
DB_HOST=your-db-instance.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=votre_password_rds
DB_NAME=haitipay_wallet
NODE_ENV=production
PORT=10000
CORS_ORIGIN=*
```

## Exemple avec Railway

Si vous utilisez Railway :

```
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_password_railway
DB_NAME=railway
NODE_ENV=production
PORT=10000
CORS_ORIGIN=*
```

## Checklist

Avant de déployer, assurez-vous d'avoir configuré :

- [ ] `DB_HOST` - Adresse de votre serveur MySQL
- [ ] `DB_PORT` - Port MySQL (généralement 3306)
- [ ] `DB_USER` - Nom d'utilisateur MySQL
- [ ] `DB_PASSWORD` - Mot de passe MySQL
- [ ] `DB_NAME` - Nom de la base de données

Les autres variables (`NODE_ENV`, `PORT`, `CORS_ORIGIN`) sont déjà dans `render.yaml` et seront appliquées automatiquement, mais vous pouvez les modifier si nécessaire.

## Important

⚠️ **Ne partagez JAMAIS vos variables d'environnement publiquement !**
- Le `DB_PASSWORD` doit rester secret
- Render stocke ces variables de manière sécurisée
- Ne les commitez pas dans votre code (elles sont déjà dans `.gitignore`)

## Après Configuration

Une fois toutes les variables configurées :

1. **Redéployez le service** (Render le fera automatiquement ou cliquez sur "Manual Deploy")
2. **Vérifiez les logs** pour voir si la connexion à la base de données fonctionne
3. **Initialisez la base de données** avec `src/database/create-database.sql`
