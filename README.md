# contentful-html-to-richtext

Module that converts HTML to the [contentful](https://www.contentful.com/) rich-text model. 
It was developed to assist in the process of migrating rich text content into contentful, a popular content management system. 
The functionality has been thoroughly tested to ensure that it performs reliably. It is a useful tool for anyone who
needs to convert HTML to contentful's rich-text format, whether for the purpose of migrating existing content or integrating with contentful's platform.

**This module is under development and in beta**

## Current Status

| Verified      | In development     |
| ------------- |:------------------:|
| `<ul>`        | `<embedded-asset>` |
| `<li>`        | `<inline-entry>`   |
| `<ol>`        | `<embedded-entry>` |
| `<b>`         | `<entry-hyperlink>`|
| `<u>`         | `<td>`             |
| `<i>`         | `<th>`             |
| `<p>`         | `<tr>`             |
| `<br />`      | `<table>`          |
| `<code>`      | `<img>`            |
| `<a>`         |                    |
| `<h{1-6}>`    |                    |
| `<hr>`        |                    |
| `<blockquote>`|                    |
| `<p>`         |                    |

## Installation

Using [npm](https://www.npmjs.com/package/html-to-richtext-contentful):

`npm i html-to-richtext-contentful`

## Usage

```
const { htmlToRichText } = require('html-to-richtext-contentfult');

const html = '<ul><li><p>Hello</p></li><li><p>World</p></li></ul><p></p>';
const result = htmlToRichText(html);
```

## Output:

```
  {
  "data": {},
  "content": [
    {
      "data": {},
      "content": [
        {
          "data": {},
          "content": [
            {
              "data": {},
              "marks": [],
              "value": "Hello",
              "nodeType": "text"
            }
          ],
          "nodeType": "paragraph"
        }
      ],
      "nodeType": "list-item"
    },
    {
      "data": {},
      "content": [
        {
          "data": {},
          "content": [
            {
              "data": {},
              "marks": [],
              "value": "World",
              "nodeType": "text"
            }
          ],
          "nodeType": "paragraph"
        }
      ],
      "nodeType": "list-item"
    }
  ],
  "nodeType": "unordered-list"
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
            [BLOCKS.EMBEDDED_ENTRY]: (node:any) =>
                `<embedded-entry id="${node.data.target.sys.id}"/>`,
            [BLOCKS.EMBEDDED_ASSET]: (node:any) =>
                `<embedded-asset id="${node.data.target.sys.id}"/>`,
            [INLINES.EMBEDDED_ENTRY]: (node:any) =>
                `<inline-entry id="${node.data.target.sys.id}"/>`,
            [INLINES.ENTRY_HYPERLINK]: (node:any) =>
                `<entry-hyperlink id="${node.data.target.sys.id}">${node.content[0].value}</entry-hyperlink>`
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

