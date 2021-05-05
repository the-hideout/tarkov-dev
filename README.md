# Tarkov Tools

## If you wanna help out, please do!

I'm always looking for anybody contributing anything from simple spelling errors, icons updates, fixes for small css bugs or just posting issues to keep track of what needs to be done.


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

[![Build Status](https://travis-ci.org/kokarn/tarkov-tools.svg?branch=master)](https://travis-ci.org/kokarn/tarkov-tools)

After reading the great post about [a single visualization for all ammo types](https://www.reddit.com/r/EscapefromTarkov/comments/ebvizg/ammo_table_visualized_on_one_graph/) I decided to create one where it automatically updates depending on the ["official" spreadsheet](https://docs.google.com/spreadsheets/d/1l_8zSZg-viVTZ2bavMEIIKhix6mFTXuVHWcNKZgBrjQ/htmlview?sle=true).

Then after a lot of feedback from the community I realized that was crap and switched to the one provided by the glorious [NoFoodAfterMidnight](https://www.twitch.tv/nofoodaftermidnight)s [spreadsheet](https://docs.google.com/spreadsheets/u/0/d/1jjWcIue0_PCsbLQAiL5VrIulPK8SzM5jjiCMx9zUuvE)

This site isn't as pretty as the original chart but instead includes auto-updates and interactivity.

Simply click the type of ammo you wanna see the stats for and voila!

![How to use](./utility-preview.gif)