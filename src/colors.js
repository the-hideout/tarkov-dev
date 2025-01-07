// These colors should  always be the same as /app.css :root color vars.
// They are static, since color changes/additions are not likely to happen, 
// and dynamicly "getting" them on the client feels like a waste of resources.
const globalColors = {
  black: '#000',
  blackRgb: '0,0,0',

  colorWhite: '#fff',
  colorWhiteRgb: '255,255,255',

  colorYellowLight: '#E0DFD6',
  colorBlueLight: '#0292c0',
  colorGray: '#424242',
  colorGrayLight: '#636363',

  colorGunmetal: '#383945',
  colorGunmetalRgb: '56,57,69',

  colorGoldOne: '#c7c5b3',
  colorGoldOneRgba: '199,197,179',
  colorGoldTwo: '#9a8866',
  colorGoldTwoRgba: '154,136,102',

  colorBackgroundPrimary: '#2d2d2f',
  colorBackgroundPrimaryRgb: '45,45,47',
  colorBorderPrimary: '#1b1919',
  
  colorActionPositive: '#00a700',
  colorActionWarning: '#ca8a00',
  colorActionNegative: '#cd1e2f',

  colorRarityRare: '#8c6edf',
  colorRarityLegendary: '#ffe084',

  colorMutedGreen:'#6a9a66',
  colorMutedRed: '#9a6666'
};

export default globalColors;