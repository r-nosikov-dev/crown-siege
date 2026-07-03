const fs = require('fs');
const path = require('path');

const FONT_FAMILY_CSS = "'Press Start 2P', cursive";
const STYLES_PATH = path.join(__dirname, 'src/styles/GameTypography.ts');

function extractCssBlock(source, name) {
    const pattern = new RegExp(`(?:const|export const) ${name} = \\\`([\\s\\S]*?)\\\`;`);
    const match = source.match(pattern);
    if (!match) {
        throw new Error(`CSS block "${name}" not found in GameTypography.ts`);
    }
    return match[1].replace(/\$\{FONT_FAMILY_CSS\}/g, FONT_FAMILY_CSS);
}

function loadInlineGameStyles() {
    const source = fs.readFileSync(STYLES_PATH, 'utf8');
    return extractCssBlock(source, 'LAYOUT_CSS') + extractCssBlock(source, 'TYPOGRAPHY_CSS');
}

module.exports = { loadInlineGameStyles };