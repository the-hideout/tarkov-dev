const fs = require('fs');
const path = require('path');

const templateString = fs.readFileSync(path.join(__dirname, '..', 'assets', 'guide-template.tpl'), 'utf8');
const allGuides = fs.readdirSync(path.join(__dirname, '..', 'assets', 'guides'));

for(const guide of allGuides){
    const guideName = guide.replace('.md', '');

    let guideContent = fs.readFileSync(path.join(__dirname, '..', 'assets', 'guides', guide), 'utf8');

    guideContent = guideContent.replace(/`/g, '\\`');

    const guideString = templateString
        .replace(/GUIDE_NAME/g, guideName)
        .replace('GUIDE_CONTENT_GOES_HERE', guideContent);

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'pages', 'guides', `${guideName}.js`), guideString);
}