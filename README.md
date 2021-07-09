# Tarkov Tools

[![Build Status](https://img.shields.io/github/workflow/status/kokarn/tarkov-tools/Deploy?style=flat-square)](https://github.com/kokarn/tarkov-tools/actions/workflows/deploy.yml)
[![Support me on Patreon](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.vercel.app%2Fapi%3Fusername%3Dkokarn%26type%3Dpatrons&style=flat)](https://patreon.com/kokarn)
![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m785748655-5631dd88e9569d8faf253651)

## If you wanna help out, please do!

I'm always looking for anybody contributing anything from simple spelling errors, icon updates, fixes for small css bugs or just posting issues to keep track of what needs to be done.

## Other parts of the site that you can also help out with
[Tarkov Tools API](https://github.com/kokarn/tarkov-data-api)
[Tarkov Data](https://github.com/TarkovTracker/tarkovdata/)


## Running in development

Everything should be pretty straightforward.

### Step 1: Install dependencies
`npm install`

### Step 2: Start development server
`npm start`

## Updating data
Most data can be updated just by running
`npm run prebuild`


### History

After reading the great post about [a single visualization for all ammo types](https://www.reddit.com/r/EscapefromTarkov/comments/ebvizg/ammo_table_visualized_on_one_graph/) I decided to create one where it automatically updates depending on the ["official" spreadsheet](https://docs.google.com/spreadsheets/d/1l_8zSZg-viVTZ2bavMEIIKhix6mFTXuVHWcNKZgBrjQ/htmlview?sle=true).

Then after a lot of feedback from the community I realized that was crap and switched to the one provided by the glorious [NoFoodAfterMidnight](https://www.twitch.tv/nofoodaftermidnight)s [spreadsheet](https://docs.google.com/spreadsheets/u/0/d/1jjWcIue0_PCsbLQAiL5VrIulPK8SzM5jjiCMx9zUuvE)

Since then it has evolved quite a long way, with a [Flea Market Price API](https://tarkov-tools.com/___graphql), [Gear guides](https://tarkov-tools.com/gear/) and so much more.