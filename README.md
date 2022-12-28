# contentful-html-to-richtext

This is a JavaScript module that supports TypeScript types and converts HTML to the contentful rich-text model. 
It was developed to assist in the process of migrating rich text content into contentful, a popular content management system. 
The functionality has been thoroughly tested to ensure that it performs reliably. It is a useful tool for anyone who
needs to convert HTML to contentful's rich-text format, whether for the purpose of migrating existing content or integrating with contentful's platform.

**This module is under development and in beta**

## Installation

Using npm:

`npm install contentful-html-to-richtext`

## Usage

```
const { parseHtml } = require('contentful-html-to-richtext');

const html = '<ul><li><p>Hello</p></li><li><p>World</p></li><li><p>!</p></li></ul><p></p>';
const result = parseHtml(html);
console.log(result);
```

Output:

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

## Current Status

### Verified

- `<ul>`
- `<ol>`
- `<li>`
- `<b>`
- `<u>`
- `<i>`
- `<p>`
- `<hr>`
- `<blockquote>`
- `<p>`
- `<h{1-6}>`
- `<a>`
- `<code>`
- `<br />`

### In development

- `<img>`
- `<table>`
- `<tr>`
- `<th>`
- `<td>`
- `<entry-hyperlink>`
- `<embedded-entry>`
- `<inline-entry>`
- `<embedded-asset>`

##Git Repository


