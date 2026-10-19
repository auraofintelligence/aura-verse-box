# Verse Box

A lower-cost public introduction to Aura of Intelligence: personal Aura building, Community Hours, learning and community participation. This revisits Luke Nathan Hayes's original Verse Box idea, documented in the [11 May 2014 iChooseInfinity archive](https://web.archive.org/web/20140511061053/http://ichooseinfinity.com/verse-box/), through the current October 2026 trial proposal.

Website: https://auraofintelligence.github.io/aura-verse-box/

Repository: https://github.com/auraofintelligence/aura-verse-box

## Project status

Verse Box is a proposed portable public demonstration on Minjerribah / North Stradbroke Island and across Redlands, Queensland. Hosts, funding, venues, dates, contacts, activities and costs require agreement before a public invitation. Suitable reused equipment is intended to keep costs low; no dollar price or quantified saving is asserted.

Aura Genesis is a separate optional programme. It is not required for Verse Box, an everyday Aura, C-Hours or civic participation. One C-Hour recognises one verified hour of voluntary human contribution, with no monetary conversion or financial entitlement.

## Explore the guide

- Welcome: the idea, its origins and connected pathways.
- The experience: a first visit, optional activities and the physical concept.
- Your Aura: personal context, ownership, permissions and development through use.
- C-Hours and community: contribution, P4A and Joyful Responsible Abundance.
- The proposed trial: equipment, hosts, access, handover and review.
- Documents and sources: 14 downloadable source documents, full source-link register, creator references and rights.
- Sitemap: every public chapter, with an optional local search.

Every chapter has a full-width original generated hero, an all-pages menu, circular previous/next routes, footer navigation and a floating return-to-top link. Text is at least 18px at the default root size, except image credits. The guide works without JavaScript; search and menu dismissal enhance it. No analytics, registration, recording or participant-data collection is included.

## Source documents and corrections

`content/documents.json` records editions, formats, byte lengths, SHA-256 hashes and source provenance for every document. Available supporting source files were collected from the user's recent local repositories. The teacher-training PDF and Geode Development Edition 3 PDF were separately supplied by the user.

The author withdrew the incomplete flatpack study reference. The distributed proposal is a **corrected public edition**: its page-3 citation and bibliography entry were removed, and the historical Verse Box entry was renumbered. All 15 embedded source links remain. The user's original file is untouched and the uncorrected proposal is not included in this repository.

The June 2018 mini-pitch is available as a 14-page PDF rather than the cited PowerPoint. The Virtual Cloning learning progression is available as a related DOCX rather than the cited 15-page PDF. Their differences are explicitly recorded. Other source editions retain their original bytes; bibliographic matches do not assert byte identity to unavailable numbered filenames.

Historical sources retain their context. The current non-financial C-Hour definition and operator choices in the Verse Box proposal govern this public introduction.

## Run and edit

Node.js 20 or later. No dependency installation is needed.

```sh
npm run build
npm run check
npm run dev
```

Open http://127.0.0.1:4192/. The preview server serves only public pages, assets and documents; source and working directories are denied.

| Location | Purpose |
| --- | --- |
| `content/pages.mjs` | Chapter text and page sequence |
| `content/documents.json` | Document editions, rights context and integrity |
| `content/proposal-hyperlinks.json` | Every embedded source URI and proposal page |
| `content/bibliography.json` | Corrected project bibliography |
| `content/artwork.json` | Seven original hero prompts, alt text and hashes |
| `scripts/build.mjs` | Static pages, shared navigation and discovery files |
| `scripts/check.mjs` | Link, anchor, navigation, metadata and source-integrity checks |
| `assets/style.css`, `assets/app.js` | Responsive presentation and optional search |

Rebuild and check after edits. Generated root HTML is committed for GitHub Pages. Seven high-resolution WebP heroes total approximately 1.07 MB. Production image assets and exact generation prompts are in the repository; the images illustrate proposed settings and do not depict completed installations.

## Publishing

`.github/workflows/pages.yml` builds, validates and deploys a public-only artifact containing pages, assets, documents and discovery files. The repository's Pages source must be **GitHub Actions**. Pushes to `main` then publish automatically. `.github/repository.json` records the intended public visibility, About description, canonical homepage and topics; the file itself does not apply GitHub settings.

## Crawler discovery

The XML sitemap covers all seven canonical chapter URLs. Each chapter links to `llms.txt`, which identifies the guide, sources, licence and rights. Discovery grants no additional commercial reuse or AI-training permission.

Crawler rules on GitHub Pages apply at the origin root, `https://auraofintelligence.github.io/robots.txt`. This project's `robots.txt` explains that limitation. `.github/robots-root-snippet.txt` provides narrowly scoped search-discovery and training-crawler directives for `/aura-verse-box/`, to be merged while preserving the existing origin rules. Crawler cooperation does not enforce copyright or guarantee indexing.

## Licence and attribution

Original material uses the [Strange But True Public Source Licence](LICENCE.md), retaining the partner's 30 June 2026 terms with only repository identifiers changed. This is a public source licence, not an open-source licence. Commercial and other restricted uses require written permission. Supporting documents, supplied imagery and third-party material retain the ownership and attribution described in [RIGHTS.md](RIGHTS.md).

Source direction: Luke Nathan Hayes / Aura of Intelligence.

- [Aura Genesis Protocol — partner website](https://auraofintelligence.github.io/aura-genesis-geode-atlas/index.html)
- [Community Hours introduction](https://auraofintelligence.github.io/C-Hour-introduction/)
- [Luke Nathan Hayes — Man and Mind](https://auraofintelligence.github.io/luke-nathan-hayes-man-and-mind/)
- [Luke Nathan Hayes — Open Record](https://github.com/auraofintelligence/open-record-luke-nathan-hayes/)