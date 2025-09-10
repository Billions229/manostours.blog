# 🚀 Guide Complet de Personnalisation - Blog Next.js i18n

Ce guide vous explique étape par étape comment personnaliser votre blog multilingue basé sur le starter Next.js i18n.

## 📋 Table des Matières

1. [Configuration Initiale](#configuration-initiale)
2. [Personnalisation de Base](#personnalisation-de-base)
3. [Gestion des Langues](#gestion-des-langues)
4. [Création d'Articles](#création-darticles)
5. [Gestion des Auteurs](#gestion-des-auteurs)
6. [Personnalisation Avancée](#personnalisation-avancée)
7. [Fonctionnalités Optionnelles](#fonctionnalités-optionnelles)

---

## 🎯 Configuration Initiale

### 1. Informations de Base du Site

**Fichier à modifier :** `data/siteMetadata.js`

```javascript
const siteMetadata = {
  title: 'Mon Blog Personnel',                    // Titre principal
  author: 'Votre Nom',                           // Votre nom
  headerTitle: 'MonBlog',                        // Titre dans l'en-tête
  description: 'Mon blog personnel sur...',      // Description
  language: 'fr',                                // Langue par défaut
  siteUrl: 'https://monblog.com',               // URL de votre site
  siteRepo: 'https://github.com/vous/repo',     // Lien GitHub
  email: 'votre@email.com',                     // Votre email
  // Réseaux sociaux
  github: 'https://github.com/votrenom',
  twitter: 'https://twitter.com/votrenom',
  linkedin: 'https://linkedin.com/in/votrenom',
  // ... autres réseaux
}
```

### 2. Métadonnées Multilingues

**Fichier à modifier :** `data/localeMetadata.ts`

```typescript
export const maintitle: Metadata = {
  fr: 'Mon Blog Personnel',
  en: 'My Personal Blog',
}

export const maindescription: Metadata = {
  fr: 'Un blog sur le développement web et la tech',
  en: 'A blog about web development and tech',
}
```

---

## 🌍 Gestion des Langues

### Configuration des Langues

**Fichier :** `app/[locale]/i18n/locales.js`

```javascript
// Pour français par défaut et anglais secondaire
const fallbackLng = 'fr'  // Langue par défaut
const secondLng = 'en'    // Langue secondaire

// Pour ajouter une 3ème langue (ex: espagnol)
const thirdLng = 'es'

module.exports = { fallbackLng, secondLng, thirdLng }
```

### Traductions de l'Interface

**Dossier :** `app/[locale]/i18n/locales/`

Structure :
```
locales/
├── fr/
│   ├── common.json      # Traductions communes
│   ├── home.json        # Page d'accueil
│   ├── about.json       # Page à propos
│   └── footer.json      # Pied de page
└── en/
    ├── common.json
    ├── home.json
    ├── about.json
    └── footer.json
```

**Exemple - `locales/fr/common.json` :**
```json
{
  "darkmode": "Mode sombre",
  "content": "Contenu",
  "search": "Rechercher",
  "tags": "Tags"
}
```

---

## ✍️ Création d'Articles

### Structure des Articles

Les articles sont organisés par langue :
```
data/blog/
├── fr/
│   ├── mon-premier-article.mdx
│   └── guide-nextjs.mdx
└── en/
    ├── my-first-article.mdx
    └── nextjs-guide.mdx
```

### Format d'un Article

**Exemple :** `data/blog/fr/mon-premier-article.mdx`

```mdx
---
title: Mon Premier Article
date: '2024-01-15'
lastmod: '2024-01-16'
language: fr
tags: ['nextjs', 'blog', 'tutorial']
authors: ['votrenom']
images: ['/static/images/article-cover.jpg']
draft: false
featured: true
summary: Une introduction à mon blog et mes projets
series:
  order: 1
  title: "Guide du Blogueur"
---

# Mon Premier Article

Bienvenue sur mon blog ! Dans cet article, je vais vous présenter...

## Section 1

Contenu de votre article en Markdown...

### Sous-section

Plus de contenu...

```javascript
// Exemple de code
const hello = "Bonjour le monde !";
console.log(hello);
```

## Conclusion

Merci d'avoir lu cet article !
```

### Propriétés des Articles

| Propriété | Description | Obligatoire |
|-----------|-------------|-------------|
| `title` | Titre de l'article | ✅ |
| `date` | Date de création | ✅ |
| `language` | Langue de l'article (fr/en) | ✅ |
| `authors` | Liste des auteurs | ✅ |
| `tags` | Tags de l'article | ❌ |
| `draft` | Brouillon (true/false) | ❌ |
| `featured` | Article mis en avant | ❌ |
| `summary` | Résumé de l'article | ❌ |
| `images` | Images de couverture | ❌ |
| `series` | Série d'articles | ❌ |

---

## 👤 Gestion des Auteurs

### Structure des Auteurs

```
data/authors/
├── fr/
│   └── votrenom.mdx
└── en/
    └── votrenom.mdx
```

### Format d'un Auteur

**Exemple :** `data/authors/fr/votrenom.mdx`

```mdx
---
default: true
name: Votre Nom
avatar: /static/images/votre-avatar.jpg
occupation: Développeur Full-Stack
company: Votre Entreprise
email: votre@email.com
twitter: https://twitter.com/votrenom
linkedin: https://linkedin.com/in/votrenom
github: https://github.com/votrenom
language: fr
---

Votre biographie en français...

Parlez de votre parcours, vos compétences, vos passions...
```

---

## 🎨 Personnalisation Avancée

### 1. Logo et Images

- **Logo :** Remplacez `/public/static/images/logo.png`
- **Avatar :** Ajoutez votre photo dans `/public/static/images/`
- **Favicon :** Remplacez les fichiers dans `/public/`

### 2. Couleurs et Thème

**Fichier :** `tailwind.config.js`

Personnalisez les couleurs :
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3B82F6', // Votre couleur principale
          600: '#2563EB',
        }
      }
    }
  }
}
```

### 3. Navigation

**Fichier :** `data/headerNavLinks.ts`

```typescript
const headerNavLinks = [
  { href: '/', title: 'Accueil' },
  { href: '/blog', title: 'Blog' },
  { href: '/tags', title: 'Tags' },
  { href: '/projects', title: 'Projets' },
  { href: '/about', title: 'À propos' },
]
```

### 4. Projets

**Fichier :** `data/projectsData.ts`

```typescript
const projectsData: ProjectsData = {
  fr: [
    {
      title: 'Mon Super Projet',
      description: 'Description de votre projet...',
      imgSrc: '/static/images/projet1.jpg',
      href: 'https://github.com/vous/projet',
    },
  ],
  en: [
    {
      title: 'My Awesome Project',
      description: 'Project description...',
      imgSrc: '/static/images/projet1.jpg',
      href: 'https://github.com/you/project',
    },
  ],
}
```

---

## 🔧 Fonctionnalités Optionnelles

### 1. Commentaires

**Options disponibles :**
- **Giscus** (recommandé) - Basé sur GitHub Discussions
- **Waline** - Système de commentaires open source

**Configuration Giscus :**
1. Activez GitHub Discussions sur votre repo
2. Allez sur [giscus.app](https://giscus.app)
3. Configurez et copiez les paramètres dans `siteMetadata.js`

### 2. Analytics

**Options supportées :**
- Google Analytics
- Plausible
- Umami
- PostHog

**Configuration :**
```javascript
analytics: {
  googleAnalytics: {
    googleAnalyticsId: 'G-XXXXXXXXXX',
  },
}
```

### 3. Newsletter

**Providers supportés :**
- Buttondown
- Mailchimp
- ConvertKit
- Klaviyo

### 4. Contact Form (Formspree)

1. Créez un compte sur [formspree.io](https://formspree.io)
2. Obtenez votre clé
3. Modifiez `components/formspree/useContactForm.ts`

---

## 🚀 Déploiement

### 1. Vercel (Recommandé)

1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

### 2. Variables d'Environnement

Créez un fichier `.env.local` :
```
NEXT_PUBLIC_GISCUS_REPO=votre-username/votre-repo
NEXT_PUBLIC_GISCUS_REPOSITORY_ID=votre-id
# ... autres variables
```

---

## 📝 Checklist de Personnalisation

### Étapes Essentielles
- [ ] Modifier `siteMetadata.js` avec vos informations
- [ ] Mettre à jour `localeMetadata.ts`
- [ ] Configurer les langues dans `locales.js`
- [ ] Créer votre profil auteur
- [ ] Ajouter votre logo et avatar
- [ ] Écrire votre premier article
- [ ] Personnaliser la navigation
- [ ] Configurer les réseaux sociaux

### Étapes Optionnelles
- [ ] Configurer les commentaires
- [ ] Ajouter Google Analytics
- [ ] Configurer la newsletter
- [ ] Personnaliser les couleurs
- [ ] Ajouter vos projets
- [ ] Configurer le formulaire de contact

---

## 🆘 Aide et Support

### Problèmes Courants

1. **Articles non affichés :** Vérifiez `draft: false` et la langue
2. **Traductions manquantes :** Assurez-vous d'avoir les mêmes clés dans tous les fichiers JSON
3. **Images non affichées :** Vérifiez le chemin `/static/images/`

### Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Repo original](https://github.com/PxlSyl/tailwind-nextjs-starter-blog-i18n)

---

**Bon blogging ! 🎉**
