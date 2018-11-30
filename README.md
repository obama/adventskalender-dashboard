# adventskalender-dashboard

Diese Webextension (Browser-Erweiterung) soll euch beim Adventskalendern helfen. Das Konzept ist folgendes:
Ihr gebt alle Seiten ein, bei denen ihr teilnehmen wollt und dann öffnet die Webextension eine Seite nach der anderen und hilft euch beim ausfüllen der Formulare.

Soweit zur Theorie, in der Praxis funktioniert es natürlich (noch) nicht so perfekt. Ihr könnte gerne am Code mitarbeiten!

## Inhalt:
- [adventskalender-dashboard](#adventskalender-dashboard)
    - [Inhalt:](#inhalt)
    - [Vorschau:](#vorschau)
    - [Installation](#installation)
        - [Firefox](#firefox)
        - [Chrome](#chrome)
    - [Nutzen](#nutzen)
    - [Knöpfe der Leiste](#kn%C3%B6pfe-der-leiste)
    - [probleme](#probleme)

## Vorschau:
![](https://i.imgur.com/EXA9bxW.png)![](https://i.imgur.com/w60JGOk.png)

was man bisher machen kann:
- die URLs eingeben
- dann wird eine URL nach der anderen geöffnet, mit klick auf den pfeil kommt man zur nächsten seite
- man kann notizen machen
- die "sweepstake seiten" werden automatisch ausgefüllt und geklickt

## Installation

### Firefox 
Füge das Addon hinzu: [https://addons.mozilla.org/de/firefox/addon/adventskalender-dashboard](https://addons.mozilla.org/de/firefox/addon/adventskalender-dashboard)

oder falls du den quelltext starten willst:
downloade das github repository in einen ordner und
geh auf [about:debugging#addons](about:debugging#addons) und erlaube temporäre addons. dort dann den beim hinzufügen die `manifest.json` auswählen. (ACHTUNG: wenn man firefox schließt wird die seiten liste gelöscht! macht also vor dem beenden ein backup! *nachtrag: im neuen firefox scheint es doch gespeichert zu werden*)

### Chrome
in den chrome store kann ich nichts hochladen (weil es 5$ kostet sich als entwickler zu melden, zahlbar per CC), darum müsst ihr den quelltext nutzen. ladet also den ordner runter und dann
bei `erweiterungen` den `entwickler modus` aktivieren und dann `entpackte erweiterung laden`. dort den ordner suchen und hinzufügen. chrome merkt sich die seitenliste scheinbar auch nach dem neustart bei beta-extensions.

## Nutzen
1. klickt auf das geschenk-icon 🎁 in der oberen Leiste wo die Extensions sind.
2. dann `dashboard` anklicken
3. dort added ihr eure seiten, oder geht zu `"einstellungen"` und ladet euch die Liste von MyDealz runter. Alternativ könnt ihr auch ein backup-`JSON-Objekt` in das Text feld pasten, falls ihr eines habt.
4. unter `persönliche daten` könnt ihr eure adresse eingeben, die dann von dem autofill versucht wird einzupasten (funktioniert noch nicht).
5. habt ihr alle seiten geadded, klickt ihr auf den `roten start pfeil` und füllt die Formulare aus etc. oben erscheint eine blaue leiste **ERST WENN DIE SEITE 100% geladen ist**! dort ist dann der Knopf zur nächsten Seite.

## Knöpfe der Leiste
* ![](https://i.imgur.com/mCNrii9.png) Auto fill: es versucht die felder auszufüllen. funktionert bisher aber kaum ;) Klickt man es ein 2. mal so werden die eingegeben daten gespeichert, sodass sie nächstes mal genauso wieder eingefüllt werden können. aber auch das klappt bisher nur auf einigen seiten.
* ![](https://i.imgur.com/gE0b86T.png) Notiz: man kann sich eine Notiz abspeichern, die dann in der blauen leiste angezeigt wird.
* ![](https://i.imgur.com/iwXxwzB.png) Nächste seite.

## probleme
- wenn ihr den tab schließt müsste ihr nochmal den roten start knopf im dashboard klicken
- der `weiter` knopf ist nicht sichtbar. Klickt auf das kleine 🎁 Icon und klickt dort auf `NEXT PAGE`.
- ihr solltet keine seiten adden während ihr den roten knopf schon gestartet habt. sie könnten in der reihenfolge so landen, dass sie erst am nächsten tag geöffnet werden.
