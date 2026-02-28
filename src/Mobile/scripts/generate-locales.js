const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const resxDir = path.resolve(__dirname, '../../Shared/Totem.Common/Localization/Resources');
const outputDir = path.resolve(__dirname, '../locales/pt-BR');
const typesOutputDir = path.resolve(__dirname, '../shared/localization');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(typesOutputDir)) {
    fs.mkdirSync(typesOutputDir, { recursive: true });
}

const parser = new xml2js.Parser();

let keysFileContent = `// AUTO-GENERATED FILE. DO NOT MODIFY DIRECTLY.\n\n`;
const files = fs.readdirSync(resxDir).filter(f => f.endsWith('.resx'));
let filesProcessed = 0;

files.forEach(file => {
    const filePath = path.join(resxDir, file);
    const xml = fs.readFileSync(filePath, 'utf-8');

    parser.parseString(xml, (err, result) => {
        if (err) {
            console.error(`Error parsing ${file}:`, err);
            return;
        }

        const json = {};
        const dataNodes = result?.root?.data || [];
        const filename = path.basename(file, '.resx'); 

        keysFileContent += `export const ${filename} = {\n`;

        dataNodes.forEach(node => {
            const key = node.$.name;
            const value = node.value && node.value[0] ? node.value[0] : '';
            json[key] = value;
            keysFileContent += `  ${key}: "${filename.toLowerCase()}:${key}",\n`;
        });

        keysFileContent += `} as const;\n\n`;

        const outputPath = path.join(outputDir, `${filename.toLowerCase()}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));
        console.log(`Generated ${outputPath}`);

        filesProcessed++;
        if (filesProcessed === files.length) {
            const typesOutputPath = path.join(typesOutputDir, 'keys.ts');
            fs.writeFileSync(typesOutputPath, keysFileContent);
            console.log(`Generated ${typesOutputPath}`);
        }
    });
});
