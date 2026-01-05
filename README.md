# contentful-html-to-richtext
![npm type definitions](https://img.shields.io/npm/types/html-to-richtext-contentful)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/SodoTeo/contentful-html-to-richtext?color=success)
![GitHub](https://img.shields.io/github/license/SodoTeo/contentful-html-to-richtext)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/e80bd35b11d848c7a427c4efe6d923fc)](https://www.codacy.com/gh/SodoTeo/contentful-html-to-richtext/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=SodoTeo/contentful-html-to-richtext&amp;utm_campaign=Badge_Grade)


Module that converts HTML to the [Contentful](https://www.contentful.com/) rich-text model. 
It was developed to assist in the process of migrating rich text content into contentful, a popular content management system. 
The functionality has been thoroughly tested to ensure that it performs reliably. It is a useful tool for anyone who
needs to convert HTML to contentful's rich-text format, whether for the purpose of migrating existing content or integrating with contentful's platform.

**This module is under development**

## Current Status

| Verified      | Verified           | Beta           |
| ------------- |:------------------:|:--------------:|
| `<ul>`        | `<embedded-asset>` | `<img>`        |
| `<li>`        | `<inline-entry>`   | `<asset-hyperlink>`|
| `<ol>`        | `<embedded-entry>` |                |
| `<b>`         | `<entry-hyperlink>`|                |
| `<u>`         | `<td>`             |                |
| `<i>`         | `<th>`             |                |
| `<p>`         | `<tr>`             |                |
| `<br />`      | `<table>`          |                |
| `<code>`      | `<p>`              |                |
| `<a>`         | `<hr>`             |                |
| `<blockquote>`| `<h{1-6}>`         |                |

## Installation

Using [npm](https://www.npmjs.com/package/html-to-richtext-contentful):

`npm i html-to-richtext-contentful`

## Usage

```
import { htmlToRichText } from 'html-to-richtext-contentful';

const html = '<table><tr><th><p>Name</p></th></tr><tr><td><p>SodoTeo</p></td></tr></table>';
const result = htmlToRichText(html);
```

## Output:

```
  {
  "nodeType": "document",
  "data": {},
  "content": [
    {
      "nodeType": "table",
      "data": {},
      "content": [
        {
          "nodeType": "table-row",
          "data": {},
          "content": [
            {
              "nodeType": "table-header-cell",
              "data": {},
              "content": [
                {
                  "nodeType": "paragraph",
                  "data": {},
                  "content": [
                    {
                      "nodeType": "text",
                      "value": "Name",
                      "marks": [],
                      "data": {}
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "nodeType": "table-row",
          "data": {},
          "content": [
            {
              "nodeType": "table-cell",
              "data": {},
              "content": [
                {
                  "nodeType": "paragraph",
                  "data": {},
                  "content": [
                    {
                      "nodeType": "text",
                      "value": "SodoTeo",
                      "marks": [],
                      "data": {}
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

```
const { htmlToRichText } = require('html-to-richtext-contentfult');
// id="<contentful-entry-id>"
const html = '<p><entry-hyperlink id="main-nav-title-industry">title</entry-hyperlink></p>';
const result = htmlToRichText(html);
```

```
{
  "nodeType": "document",
  "data": {},
  "content": [
    {
      "nodeType": "paragraph",
      "data": {},
      "content": [
        {
          "nodeType": "entry-hyperlink",
          "data": {
            "target": {
              "sys": {
                "id": "main-nav-title-industry",
                "type": "Link",
                "linkType": "Entry"
              }
            }
          },
          "content": [
            {
              "nodeType": "text",
              "value": "title",
              "marks": [],
              "data": {}
            }
          ]
        }
      ]
    }
  ]
}
```

## Note

To use hyperlinks as entry blocks, as well as embedded and inline entries and assets, you will need to render your custom node constructor and (most likely) Contentful's rich-[text-html-renderer](https://www.npmjs.com/package/@contentful/rich-text-html-renderer), [rich-text-types](https://www.npmjs.com/package/@contentful/rich-text-types). 
Below is a snippet on how to do this:

```
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';

if (field.type === 'RichText') {
    const options = {
        renderNode: {
            [BLOCKS.EMBEDDED_ENTRY]: (node) =>
                `<embedded-entry id="${node.data.target.sys.id}"/>`,
            [BLOCKS.EMBEDDED_ASSET]: (node) =>
                `<embedded-asset id="${node.data.target.sys.id}"/>`,
            [INLINES.EMBEDDED_ENTRY]: (node) =>
                `<inline-entry id="${node.data.target.sys.id}"/>`,
            [INLINES.ENTRY_HYPERLINK]: (node) =>
                `<entry-hyperlink id="${node.data.target.sys.id}">${node.content[0].value}</entry-hyperlink>`,
            [INLINES.ASSET_HYPERLINK]: (node) =>
                `<asset-hyperlink id="${node.data.target.sys.id}">${node.content[0].value}</asset-hyperlink>`
        }
    };

    if (field.values['en-US']) {
        field.values['en-US'] = formatHTML(
            documentToHtmlString(field.values['en-US'], options)
        );
    }

    return field;
}
```

## Git Repository

https://github.com/SodoTeo/contentful-html-to-richtext

