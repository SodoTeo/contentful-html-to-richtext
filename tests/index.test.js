const R = require('ramda');

const nl = (content) => process.stdout.write('\n' + content + '\n');

/**
 * Helper to find differences between two JSON objects
 */
const findDifferences = (obj1, obj2, path = '') => {
    const diffs = [];

    if (typeof obj1 !== typeof obj2) {
        diffs.push({ path, expected: obj2, actual: obj1 });
        return diffs;
    }

    if (typeof obj1 !== 'object' || obj1 === null) {
        if (obj1 !== obj2) {
            diffs.push({ path, expected: obj2, actual: obj1 });
        }
        return diffs;
    }

    if (Array.isArray(obj1)) {
        if (obj1.length !== obj2.length) {
            diffs.push({ path: `${path}.length`, expected: obj2.length, actual: obj1.length });
        }
        const maxLen = Math.max(obj1.length, obj2.length);
        for (let i = 0; i < maxLen; i++) {
            diffs.push(...findDifferences(obj1[i], obj2[i], `${path}[${i}]`));
        }
    } else {
        const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
        allKeys.forEach(key => {
            diffs.push(...findDifferences(obj1?.[key], obj2?.[key], path ? `${path}.${key}` : key));
        });
    }

    return diffs;
};

/**
 * compare original contentful data to generated data
 */
const compare = (transformed, richText, html, extension = [], json, testName) => {
    const gen = R.pathOr('undefined', extension, transformed);
    const cont = R.pathOr('undefined', extension, richText);
    const equal = JSON.stringify(gen) === JSON.stringify(cont);

    if (typeof json === 'boolean') {
        nl('**html**');
        console.log(html);

        if (json) {
            nl('**generated**');
            console.log(JSON.stringify(gen));
            nl('**contentful**');
            console.log(JSON.stringify(cont));
        } else {
            nl('**generated**');
            console.log(gen);
            nl('**contentful**');
            console.log(cont);
        }

        nl('**equal**');
        console.log(equal);
    }

    // Show differences if not equal and not in verbose mode
    if (!equal && typeof json !== 'boolean') {
        const diffs = findDifferences(gen, cont);
        if (diffs.length > 0 && diffs.length <= 10) { // Only show first 10 differences
            console.log(`\n  ${testName || 'Test'} failed with ${diffs.length} difference(s):`);
            diffs.slice(0, 10).forEach((diff, idx) => {
                console.log(`    ${idx + 1}. Path: ${diff.path}`);
                console.log(`       Expected: ${JSON.stringify(diff.expected)}`);
                console.log(`       Actual:   ${JSON.stringify(diff.actual)}`);
            });
            if (diffs.length > 10) {
                console.log(`    ... and ${diffs.length - 10} more difference(s)`);
            }
        }
    }

    return equal;
};

const { htmlToRichText } = require('../lib/index');
// let sample = htmlToRichText('<p><table><tr><th>Name</th><th>Age</th></tr><tr><td>John</td><td>30</td></tr></table></p>');
// console.log(JSON.stringify(sample, null, 2) );
// throw new Error('test');
const { documentToHtmlString } = require('@contentful/rich-text-html-renderer');
const { BLOCKS, INLINES } = require('@contentful/rich-text-types');

/**
 * Only for testing our `htmlToRichText()`
 */
const runTest = (richText, extension = [], json, testName) => {
    const options = {
        renderNode: {
            [BLOCKS.EMBEDDED_ASSET]: ({
                data: {
                    target: { fields },
                },
            }) =>
                `<img src="${fields.file.url}" height="${fields.file.details.image.height}" width="${fields.file.details.image.width}" alt="${fields.description}"/>`,
            [BLOCKS.EMBEDDED_ENTRY]: (node) => `<embedded-entry id="${node.data.target.sys.id}"/>`,
            [BLOCKS.EMBEDDED_ASSET]: (node) => `<embedded-asset id="${node.data.target.sys.id}"/>`,
            [INLINES.EMBEDDED_ENTRY]: (node) => `<inline-entry id="${node.data.target.sys.id}"/>`,
            [INLINES.ENTRY_HYPERLINK]: (node) => `<entry-hyperlink id="${node.data.target.sys.id}">${node.content[0].value}</entry-hyperlink>`,
            [INLINES.ASSET_HYPERLINK]: (node) => `<asset-hyperlink id="${node.data.target.sys.id}">${node.content[0].value}</asset-hyperlink>`,
        },
    };
    const html = documentToHtmlString(richText, options);
    // console.log(html);
    const transformed = htmlToRichText(html);
    // console.log(JSON.stringify(transformed, null, 2));
    return compare(transformed, richText, html, extension, json, testName);
};

const printRes = (title, file) => {
    console.log(`\n━━━ Running test: ${title} ━━━`);
    const res = runTest(require(file), [], undefined, title);
    const color = res ? '\x1b[42m' : '\x1b[41m';
    const status = res ? '✓' : '×';
    const result = res ? 'PASSED' : 'FAILED';
    console.log(`${color} ${status} ${result} \x1b[0m ${title}\n`);
    return res;
};

printRes('ul', './ul.json');
printRes('Bold, Italic, Underline', './boldItalicUnderline.json');
printRes('ol', './ol.json');
printRes('hr', './hr.json');
printRes('blockquote', './blockquote.json');
printRes('headings', './headings.json');
printRes('hyperlink', './hyperlink.json');
printRes('codeblock', './codeblock.json');
printRes('table', './table.json');
printRes('table-header-cell', './table.json');
printRes('table-row', './table.json');
printRes('table-cell', './table.json');
printRes('entry-hyperlink', './hyperlink-entry.json');
printRes('asset-hyperlink', './asset-hyperlink.json');
printRes('embedded-entry', './embedded-entry.json');
printRes('embedded-asset', './embedded-asset.json');
printRes('mixed', './mixed.json');


const htmlTest = (html, testHtml, log = false) => {
    const json = htmlToRichText(html);
    const options = {
        renderNode: {
            [BLOCKS.EMBEDDED_ASSET]: ({
                data: {
                    target: { fields }
                }
            }) =>
                `<img src="${fields.file.url}" height="${fields.file.details.image.height}" width="${fields.file.details.image.width}" alt="${fields.description}"/>`
        }
    };
    const newHtml = documentToHtmlString(json, options);
    if (log) {
        nl('** Original **');
        console.log(html);

        nl('** New **');
        console.log(newHtml);

        nl('** Test **');
        console.log(testHtml);

        nl('json');
        console.log(R.pathOr('wrong path', ['content'], json));
    }

    const res = testHtml === newHtml;

    if (!res) {
        console.log(`\n  HTML Test failed:`);
        console.log(`    Expected HTML: ${testHtml.substring(0, 200)}${testHtml.length > 200 ? '...' : ''}`);
        console.log(`    Actual HTML:   ${newHtml.substring(0, 200)}${newHtml.length > 200 ? '...' : ''}`);
    }

    const color = res ? '\x1b[42m' : '\x1b[41m';
    const status = res ? '✓' : '×';
    const result = res ? 'PASSED' : 'FAILED';
    console.log(`${color} ${status} ${result} \x1b[0m htmlTest\n`);
    return res;
};

htmlTest(
    '<ul><li><span><span>Lorem ipsum</span></span></li><li><span><span>dolor sit amet,</span></span></li><li><span><span>consectetur adipiscing elit.</span></span></li></ul>',
    '<ul><li><p>Lorem ipsum</p></li><li><p>dolor sit amet,</p></li><li><p>consectetur adipiscing elit.</p></li></ul>'
);
htmlTest(
    '<p>Hello</p><ul><li>world</li><li>would: <strong>${be}</strong></li><li>something.<br /><strong>4 -a ${yo}</strong></li></ul><p><img alt="something" data-entity-type="binary" data-entity-uuid="aa" height="500" src="/hero.png" width="500" /></p><ul><li>cc <u><a href="mailto:mail@mail.com">email@email.com</a></u> something.</li></ul>',
    '<p>Hello</p><ul><li><p>world</p></li><li><p>would: <b>${be}</b></p></li><li><p>something.</p><p><b>4 -a ${yo}</b></p></li></ul><p><img src="/hero.png" height="500" width="500" alt="something"/></p><ul><li><p>cc </p><a href="mailto:mail@mail.com">email@email.com</a><p> something.</p></li></ul>'
);
htmlTest(
    '<ul><li>Hello.<br /><strong>hello</strong> yo</li></ul>',
    '<ul><li><p>Hello.</p><p><b>hello</b> yo</p></li></ul>'
);

htmlTest(
    '<p>Before </p><ul><li>Plug-in read</li><li>Copy as<strong> C:\\{Number}</strong></li><li>Please <u>do not </u> the </li><li>Keep a backup</li><li>If  via $<u>{Email}</u></li></ul><h2><strong><a><strong>Lab</strong></a><strong> </strong></strong></h2><ul><li>Used </li><li>Uses </li><li>Access </li></ul><h2><strong><a><strong>Local</strong></a></strong></h2><ul><li>your</li><li>are </li></ul><p><span><span><span><span><span><span><span> </span></span></span></span></span></span></span></p>',
    '<p>Before </p><ul><li><p>Plug-in read</p></li><li><p>Copy as<b> C:\\{Number}</b></p></li><li><p>Please <u>do not </u> the </p></li><li><p>Keep a backup</p></li><li><p>If  via $<u>{Email}</u></p></li></ul><h2><a href=""><b>Lab</b></a></h2><ul><li><p>Used </p></li><li><p>Uses </p></li><li><p>Access </p></li></ul><h2><a href=""><b>Local</b></a></h2><ul><li><p>your</p></li><li><p>are </p></li></ul><p> </p>'
);
