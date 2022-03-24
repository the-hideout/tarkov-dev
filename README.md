# Tarkov Tools

## If you wanna help out, please do

I'm always looking for anybody contributing anything from simple spelling errors, icon updates, fixes for small css bugs or just posting issues to keep track of what needs to be done.

## Other parts of the site that you can also help out with

[Tarkov Tools Discord Bot](https://github.com/the-hideout/stash)
The official tarkov tools discord bot

[Tarkov Tools API](https://github.com/the-hideout/tarkov-data-api)
The API that powers everything

[Tarkov Data](https://github.com/TarkovTracker/tarkovdata/)
Open source structured data source

[Tarkov image Generator](https://github.com/the-hideout/tarkov-image-generator)
Tool to generate images from the local Icon Cache

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

After reading the great post about [a single visualization for all ammo types](https://www.reddit.com/r/EscapefromTarkov/comments/ebvizg/ammo_table_visualized_on_one_graph/) kokarn decided to create one where it automatically updates depending on the ["official" spreadsheet](https://docs.google.com/spreadsheets/d/1l_8zSZg-viVTZ2bavMEIIKhix6mFTXuVHWcNKZgBrjQ/htmlview?sle=true).

Then after a lot of feedback from the community kokarn realized that was crap and switched to the one provided by the glorious [NoFoodAfterMidnight](https://www.twitch.tv/nofoodaftermidnight)s [spreadsheet](https://docs.google.com/spreadsheets/u/0/d/1jjWcIue0_PCsbLQAiL5VrIulPK8SzM5jjiCMx9zUuvE)

Since then it has evolved quite a long way, with a [Flea Market Price API](https://tarkov.dev/___graphql), [Gear guides](https://tarkov.dev.com/gear/) and so much more.

After kokarn decided to no longer support his Tarkov Tools project, Tarkov.dev was forked from his repo. Much love and respect to kokarn for all the work he put into Tarkov Tools!
