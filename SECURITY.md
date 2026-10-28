# Security

Low-ink Playtest Magic is a static site: it runs entirely in the browser, has no server, no accounts and no database, and only talks to [Scryfall](https://scryfall.com)'s public API and to the image URLs users give it. Settings and the card list are saved in the browser's own storage.

## Supported versions

Only the live site, [playtest-magic.adriem.me](https://playtest-magic.adriem.me/), built from `main`. There are no other releases to patch.

## Reporting a vulnerability

Please don't open a public issue. Report it privately instead, through GitHub's [private vulnerability reporting](https://github.com/Adriem/low-ink-playtest-magic/security/advisories/new) (the **Security** tab → **Report a vulnerability**), with:

- What the problem is, and what someone could do with it
- How to reproduce it: the steps, card names, settings or URLs involved
- The browser and device, if it matters

This is a personal project, maintained in spare time: expect a first answer within a week, and a fix as soon as it's understood. Reports are credited in the fix, unless you'd rather not be.

## Out of scope

- Scryfall's API and images, and Cloudflare, which serves the site: report those to them
- Problems that need a compromised browser or device, or that only affect the reporter's own saved data
- Missing security headers without a way to exploit them
