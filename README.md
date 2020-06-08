# Cabbage Patch
A prime item farming helper for Warframe.

## Features
Below is a list of Cabbage Patch's features and planned features.
- [x] Display the most common prime items (warframes and weapons), their components and their vaulted status.
- [x] Allow components to be selected and display the relics they drop from as well as the vaulted status of the relics.
- [x] Display the drop locations of relevant relics.
- [x] Allow for the filtering of prime items based on name and/or type (warframe, primary, meele, etc.)
- [x] Make site available offline through the use of a caching service worker.
- [x] Make site available as a PWA.
- [ ] Allow for drop locations to be filtered by mission type (capture, defense, sabotage, etc.)
- [ ] Add additonal prime items that were left out when the project was started (sentinels and forma)
- [ ] Add some system to allow players to save and share their item wishlists
- [ ] Calculate the expected number of relics a player would need to open to obtain the items they want as well as the ammount of void traces they would need to refine said relics.
- [ ] Calculate the ammount of forma a player could expect to obtain while opening the ammount of relics calculated above.
- [ ] Roughly calculate the amount of platinum a player could expect to make should they sell the undesired items they acrew while opening the ammount of relics calculated above.

# Getting Started
Should you wish to host this site yourself, whether for development or personal use, follow the instructions below

## Prerequisites
- Node.JS version 10.13.0 or later

## Installing
clone this repo

```git clone https://github.com/AmyHannahMorgan/cabbage-patch.git```

run npm install

```npm install```

and lastly run the server through either npm

```npm start```

or directly with node

```node index.js```
