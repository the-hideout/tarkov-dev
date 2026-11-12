# End-to-end (e2e) tests for web

Browser tests written in plain English for [Kane CLI](https://www.testmuai.com/kane-cli/).

| Test | What it covers |
|---|---|
| `item_search_test.md` | Searching for an item from the home page and opening its item page |
| `traders_test.md` | Listing the traders and opening a trader page |

## Run

The tests check item and trader names, not prices, so they keep passing as the live API data changes. Build the site and serve it on port 3010:

```bash
pnpm install
pnpm run build
pnpm exec rsbuild preview --port 3010
npm install -g @testmuai/kane-cli
kane-cli login
kane-cli testmd run e2e/kane/item_search_test.md
```
