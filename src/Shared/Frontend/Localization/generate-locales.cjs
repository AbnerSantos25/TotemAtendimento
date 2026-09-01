const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

// resx are in src/Shared/Totem.Common/Localization/Resources
const resxDir = path.resolve(__dirname, '../../Totem.Common/Localization/Resources');

const parser = new xml2js.Parser();
const files = fs.readdirSync(resxDir).filter(f => f.endsWith('.resx'));

// Define the output directories we want to write to
const webOutputLocales = path.resolve(__dirname, '../../../Web/src/locales/pt-BR');
const webOutputTypes = path.resolve(__dirname, '../../../Web/src/shared/localization');
const mobileOutputLocales = path.resolve(__dirname, '../../../Mobile/locales/pt-BR');
const mobileOutputTypes = path.resolve(__dirname, '../../../Mobile/shared/localization');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

[webOutputLocales, webOutputTypes, mobileOutputLocales, mobileOutputTypes].forEach(ensureDir);

let keysFileContent = `// AUTO-GENERATED FILE. DO NOT MODIFY DIRECTLY.\n\n`;
let filesProcessed = 0;

if (files.length === 0) {
    console.log("No .resx files found.");
    process.exit(0);
}

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
            keysFileContent += `  "${key}": "${filename.toLowerCase()}:${key}",\n`;
        });

        keysFileContent += `} as const;\n\n`;

        const jsonString = JSON.stringify(json, null, 2);

        // Write to Web
        fs.writeFileSync(path.join(webOutputLocales, `${filename.toLowerCase()}.json`), jsonString);
        // Write to Mobile
        fs.writeFileSync(path.join(mobileOutputLocales, `${filename.toLowerCase()}.json`), jsonString);
        
        console.log(`Generated JSON for ${filename}`);

        filesProcessed++;
        if (filesProcessed === files.length) {
            // Write keys.ts to Web
            fs.writeFileSync(path.join(webOutputTypes, 'keys.ts'), keysFileContent);
            // Write keys.ts to Mobile
            fs.writeFileSync(path.join(mobileOutputTypes, 'keys.ts'), keysFileContent);
            console.log(`Generated keys.ts for Web and Mobile`);
        }
    });
});
