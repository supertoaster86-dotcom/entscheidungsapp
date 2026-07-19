# Wir Entscheiden – Setup

Eine kleine private Web-App für euch zwei: Glücksrad, Filmkarten, Münzwurf, Kochplan.
Alle Daten (Listen, Namen, Verlauf) bleiben lokal auf dem jeweiligen Handy gespeichert
(im Browser-Speicher, `localStorage`) – es gibt keinen Server, keine Datenbank.

## 1. Passwort setzen

Öffne `app.js`, ganz oben steht:

```js
const APP_PASSWORD = "aendermich";
```

Ändere das zu eurem eigenen Passwort. Fertig.

## 2. Auf GitHub Pages veröffentlichen (empfohlen: privates Repo)

1. Gehe auf github.com und erstelle ein neues Repository, z. B. `wir-entscheiden`.
   Stelle es auf **Private**.
2. Lade alle Dateien aus diesem Ordner ins Repo hoch (per Weboberfläche: "Add file" →
   "Upload files", einfach alle Dateien reinziehen, dann "Commit changes").
3. Gehe in den Repo-Einstellungen zu **Settings → Pages**.
4. Bei "Source" wählst du den `main`-Branch und Ordner `/ (root)`, dann Speichern.
5. Nach ein bis zwei Minuten bekommst du eine URL wie
   `https://deinname.github.io/wir-entscheiden/`.

> Hinweis: GitHub Pages bei privaten Repos ist für persönliche kostenlose Accounts
> verfügbar, kann sich aber je nach Plan/Kontotyp unterscheiden – falls die Pages-Option
> in den Settings fehlt oder ausgegraut ist, schau kurz in GitHubs aktueller Doku nach
> ("GitHub Pages private repository") oder sag mir Bescheid, dann prüfen wir das zusammen.

## 3. App aufs Handy holen (Samsung / Chrome)

1. Öffne die GitHub-Pages-URL im Chrome-Browser auf dem Handy.
2. Passwort eingeben.
3. Menü (⋮ oben rechts) → **"Zum Startbildschirm hinzufügen"**.
4. Fertig – ab jetzt startet die App per Icon, im Vollbild, ohne Browserleiste.

Das Gleiche macht dein Partner auf seinem Handy mit derselben URL.

## 4. Updates

Wenn ihr später Code ändert: Dateien im GitHub-Repo aktualisieren (Upload/Commit),
GitHub Pages baut automatisch neu. Beim nächsten Öffnen der App laden beide Handys
die neue Version.

## Aufbau der Dateien

- `index.html` – Struktur der App (Bildschirme, Buttons)
- `style.css` – gesamtes Design
- `app.js` – Logik: Passwortsperre, Rad, Karten, Münze, Kochplan, Speicherung
- `manifest.json` – macht die Seite "app-artig" (Icon, Vollbildmodus)
- `icon-192.png` / `icon-512.png` – Platzhalter-App-Icons (kannst du gern ersetzen)

Der Code ist bewusst einfach gehalten (kein Framework, kein Build-Schritt) – du kannst
direkt in den drei Dateien lesen und rumprobieren.
