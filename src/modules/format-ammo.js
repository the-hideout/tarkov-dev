const caliberMap = {
    Caliber366TKM: '.366',
    Caliber556x45NATO: '5.56x45 mm',
    Caliber1143x23ACP: '.45 ACP',
    Caliber127x55: '12.7x55 mm',
    Caliber23x75: '23x75 mm',
    Caliber46x30: '4.6x30 mm',
    Caliber545x39: '5.45x39 mm',
    Caliber57x28: '5.7x28 mm',
    Caliber762x25TT: '7.62x25 mm TT',
    Caliber762x35: '.300 Blackout',
    Caliber762x39: '7.62x39 mm',
    Caliber762x51: '7.62x51 mm',
    Caliber762x54R: '7.62x54R',
    Caliber86x70: '.338 Lapua Magnum',
    Caliber9x18PM: '9x18 mm',
    Caliber9x19PARA: '9x19 mm',
    Caliber9x21: '9x21 mm',
    Caliber9x39: '9x39 mm',
    Caliber20g: '20 Gauge',
    Caliber12g: '12 Gauge Shot',
};

module.exports = (caliber) => {
    return caliberMap[caliber] || caliber.replace('Caliber', '');
};
