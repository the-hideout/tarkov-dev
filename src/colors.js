// src/colors.js


// These colors should  always be the same as /app.css :root color vars.
// They are static, since color changes/additions are not likely to happen, 
// and dynamicly "getting" them on the client feels like a waste of resources.
const colors = {
  black: '#000',
  blackRgb: '0,0,0',

  colorWhite: '#fff',
  colorWhiteRgb: '255,255,255',

  colorBlueLight: '#0292c0',
  colorGray: '#424242',
  colorGrayLight: '#636363',

  colorGunmetal: '#383945',
  colorGunmetalRgb: '56,57,69',

  colorGoldOne: '#c7c5b3',
  colorGoldOneRgba: '199,197,179',
  colorGoldTwo: '#9a8866',
  colorGoldTwoRgba: '154,136,102',

  /*
  --background-primary: #2d2d2f;
    --background-primary-rgb: 45,45,47;
  --border-primary: #1b1919;

  --color-action-positive: #00a700;
  --color-action-warning : #ca8a00;
  --color-action-negative: #cd1e2f;

  --color-rarity-rare: #8c6edf;
  --color-rarity-legendary: #ffe084;

  --color-muted-green: #6a9a66;
  --color-muted-red: #9a6666;
  */
};

window.colors = colors; // Add colors to the global `window` object

export default colors;