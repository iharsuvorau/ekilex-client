# ekilex / sonaveeb.ee HTTP client

CLI client for sonaveeb.ee to fetch three most common noun (nimetav, omastav, osastav) and verb (ma-infinitiv, da-infinitiv, and singular I-conjugation) forms.

Ekilex API overview: https://github.com/keeleinstituut/ekilex/wiki/Ekilex-API

## Usage

```bash
# API key from https://ekilex.ee
export EKILEX_API_KEY=...

# for a noun
node src/index.ts -w banaan

# for a verb
node src/index.ts -w pidama -v
```

CLI options

```
--word, -w -- word to search for
--verb, -v -- set this flag for a verb to return infinitives instead of noun cases
```
