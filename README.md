# adventskalender-dashboard

- [adventskalender-dashboard](#adventskalender-dashboard)
    - [Installation](#installation)
        - [Firefox:](#firefox)
        - [Chrome:](#chrome)
    - [Nutzen](#nutzen)
    - [probleme](#probleme)

es hilft etwas mit den adventskalendern.

![](https://i.imgur.com/EXA9bxW.png)![](https://i.imgur.com/w60JGOk.png)

was man bisher machen kann:
- die URLs eingeben
- dann wird eine URL nach der anderen geöffnet, mit klick auf den pfeil kommt man zur nächsten seite
- man kann notizen machen
- die "sweepstake seiten" werden automatisch ausgefüllt und geklickt

## Installation

### Firefox: 
Füge das Addon hinzu: [https://addons.mozilla.org/de/firefox/addon/adventskalender-dashboard](https://addons.mozilla.org/de/firefox/addon/adventskalender-dashboard)

oder falls du den quelltext starten willst:
geht auf [about:debugging#addons](about:debugging#addons) und erlaubt temporäre addons. dort dann den beim hinzufügen die `manifest.json` auswählen. (ACHTUNG: wenn man firefox schließt wird die seiten liste gelöscht! macht also vor dem beenden ein backup!)

### Chrome: 
in den chrome store kann ich nichts hochladen, darum müsst ihr den quelltext nutzen. ladet also den ordner runter und dann
ei erweiterungen den entwickler modus aktivieren und dann "entpackte erweiterung laden". dort den ordner suchen und hinzufügen. chrome merkt sich die seitenliste scheinbar auch nach dem neustart bei beta-extensions.

## Nutzen
1. klickt auf das geschenk-icon
2. dann dashboard anklicken
3. dort added ihr eure seiten, oder geht zu "einstellungen" und pasted den inhalt aus z.b. `backup.json` damit habt ihr dann die 100 seiten die ich benutze
4. unter persönliche daten die e-mail eintragen, der rest ist egal wird noch nicht verwendet.
5. habt ihr alle seiten geadded, klickt ihr auf den roten start pfeil und füllt die formulare aus etc. oben erscheint eine blaue leiste ERST WENN DIE SEITE 100% geladen ist! dort ist dann der knopf zur nächsten seite.
## probleme
- wenn ihr den tab schließt müsste ihr nochmal den roten start knopf im dashboard klicken
- manchmal ist die leiste zu breit, macht dann das fenster schmaler dann sollte der next knopf erscheinen (manchmal taucht sie garnicht auf, notfalls gibt es einen next knopf auf dem geschenk icon)
- ihr solltet keine seiten adden während ihr den roten knopf schon gestartet habt. sie könnten in der reihenfolge so landen, dass sie erst am nächsten tag geöffnet werden.
