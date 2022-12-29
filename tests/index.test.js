const R = require('ramda');

const nl = (content) => process.stdout.write('\n' + content + '\n');

/**
 * compare original contentful data to generated data
 */
const compare = (transformed, richText, html, extension = [], json) => {
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

    return equal;
};

const { htmlToRichText } = require('../lib/index');
// let sample = htmlToRichText('<p><table><tr><th>Name</th><th>Age</th></tr><tr><td>John</td><td>30</td></tr></table></p>');
// console.log(JSON.stringify(sample, null, 2) );
// throw new Error('test');
const { documentToHtmlString } = require('@contentful/rich-text-html-renderer');
const { BLOCKS } = require('@contentful/rich-text-types');

/**
 * Only for testing our `htmlToRichText()`
 */
const runTest = (richText, extension = [], json) => {
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
    const html = documentToHtmlString(richText, options);
    // console.log(html);
    const transformed = htmlToRichText(html);
    // console.log(JSON.stringify(transformed, null, 2));
    return compare(transformed, richText, html, extension, json);
};

const printRes = (title, file) => {
    const res = runTest(require(file));
    const color = res ? '\x1b[42m' : '\x1b[41m';
    const status = res ? '✓' : '×';
    console.log(color, status, '\x1b[0m', title); //valid
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
printRes('entry-hyperlink', './hyperlink.json');


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
    const color = res ? '\x1b[42m' : '\x1b[41m';
    const status = res ? '✓' : '×';
    console.log(color, status, '\x1b[0m', 'htmlTest'); //valid
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
/*
htmlTest(
    '<p>Before </p><ul><li>Plug-in read</li><li>Copy as<strong> C:\\{Number}</strong></li><li>Please <u>do not </u> the </li><li>Keep a backup</li><li>If  via $<u>{Email}</u></li></ul><h2><strong><a><strong>Lab</strong></a><strong> </strong></strong></h2><ul><li>Used </li><li>Uses </li><li>Access </li></ul><h2><strong><a><strong>Local</strong></a></strong></h2><ul><li>your</li><li>are </li></ul><p><span><span><span><span><span><span><span> </span></span></span></span></span></span></span></p>',
    '<p>Before </p><ul><li><p>Plug-in read</p></li><li><p>Copy as<b> C:\\{Number}</b></p></li><li><p>Please <u>do not </u> the </p></li><li><p>Keep a backup</p></li><li><p>If  via $<u>{Email}</u></p></li></ul><h2><a href=""><b>Lab</b></a></h2><ul><li><p>Used </p></li><li><p>Uses </p></li><li><p>Access </p></li></ul><h2><a href=""><b>Local</b></a></h2><ul><li><p>your</p></li><li><p>are </p></li></ul><p> </p>'
);*/
//not working
//console.log(htmlTest('<ul><li><a>Ping.<br /><strong>ping</strong> test</a></li></ul>', '<ul><li><a>Ping.<br /><strong>ping</strong> test</a></li></ul>'));
