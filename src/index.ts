const R = require('ramda');
import { decode } from 'html-entities';
import { Parser, DefaultHandler } from 'htmlparser2';

const htmlAattribute = {
  tag: {
    h1: 'heading-1',
    h2: 'heading-2',
    h3: 'heading-3',
    h4: 'heading-4',
    h5: 'heading-5',
    h6: 'heading-6',
    ul: 'unordered-list',
    ol: 'ordered-list',
    li: 'list-item',
    blockquote: 'blockquote',
    p: 'paragraph',
    hr: 'hr',
    table: 'table',
    tr: 'table-row',
    th: 'table-header-cell',
    td: 'table-cell',
    br: 'br',
    a: 'hyperlink',
    b: 'bold',
    strong: 'bold',
    code: 'text',
    i: 'italic',
    em: 'italic',
    u: 'underline',
    img: 'embedded-asset-block',
    span: 'text',
    'entry-hyperlink': 'entry-hyperlink',
    'embedded-entry': 'embedded-entry-block',
    'inline-entry': 'embedded-entry-inline',
    'embedded-asset': 'embedded-asset-block',
  },
  text: 'text',
};

let finalRichTextObj: object = [];

const transform = (dom: HTMLElement) => {
  let result: object[] = [];

  interface Element {
    type: string;
    name: string;
    data: string;
    attribs: { [key: string]: string };
    children: any;
  }

  R.forEach((element: Element) => {
    const { type, name, data, attribs, children } = element;
    // console.log(element);
    let content = [];
    let newData = {};
    if (children) {
      content = transform(children);
    }

    if (type === 'text') {
      if (!data.trim()) {
        return;
      }
      newData = {
        data: {},
        marks: [],
        value: data,
        nodeType: type,
      };
    } else if (type === 'tag') {
      switch (name) {
        case 'embedded-asset':
          newData = {
            data: {
              target: {
                sys: {
                  id: `${attribs.id}`,
                  type: 'Link',
                  linkType: 'Asset',
                },
              },
            },
            content: [],
            nodeType: htmlAattribute[type][name],
          };
          break;
        case 'embedded-entry':
        case 'inline-entry':
          newData = {
            data: {
              target: {
                sys: {
                  id: `${attribs.id}`,
                  type: 'Link',
                  linkType: 'Entry',
                },
              },
            },
            content: [],
            nodeType: htmlAattribute[type][name],
          };
          break;
        case 'entry-hyperlink':
          newData = {
            data: {
              target: {
                sys: {
                  id: `${attribs.id}`,
                  type: 'Link',
                  linkType: 'Entry',
                },
              },
            },
            content: [
              {
                nodeType: 'text',
                value: `${children[0].data}`,
                marks: [],
                data: {},
              },
            ],
            nodeType: htmlAattribute[type][name],
          };
          break;
        case 'span':
          newData = content;
          break;
        case 'code':
          newData = R.map((node: any) => {
            node = R.assoc('value', decode(node.value), node);
            node = R.assoc('marks', R.append({ type: 'code' }, node.marks), node);
            return node;
          }, content);
          break;
        case 'img':
          const fileName: any = R.last(R.split('/', attribs.src));

          newData = {
            data: {
              target: {
                sys: {
                  space: {},
                  type: 'Asset',
                  createdAt: '',
                  updatedAt: '',
                  environment: {},
                  revision: null,
                  locale: 'en-US',
                },
                fields: {
                  title: R.head(R.split('.', fileName)),
                  description: attribs.alt,
                  file: {
                    url: attribs.src,
                    details: {
                      size: 46234, // @TODO - allocate the correct size
                      image: {
                        width: parseInt(attribs.width, 10),
                        height: parseInt(attribs.height, 10),
                      },
                    },
                    fileName,
                    contentType: 'image/' + R.last(R.split('.', fileName)),
                  },
                },
              },
            },
            content: [],
            nodeType: htmlAattribute[type][name],
          };
          break;
        case 'i':
        case 'b':
        case 'strong':
        case 'u':
          newData = R.assoc('marks', R.append({ type: htmlAattribute[type][name] }, content[0].marks), content[0]);
          break;
        case 'a':
          newData = {
            data: { uri: R.propOr('', 'href', attribs) },
            content,
            nodeType: htmlAattribute[type][name],
          };
          break;
        case 'li':
          // @TODO shouldn't need to cast to an array...
          content = R.type(content) === 'Array' ? content : [content];
          let newContent: any = [];

          // Seems to want text wrapped in some type of content tag (p, h*, etc)
          content = R.forEach((node: any) => {
            if (node.nodeType === 'text') {
              // if the last of new content isn't a `paragraph`
              if (R.propOr(false, 'nodeType', R.last(newContent)) !== 'paragraph') {
                // append a p node
                newContent = R.append(
                  {
                    data: {},
                    content: [],
                    nodeType: 'paragraph',
                  },
                  newContent,
                );
              }

              // put node in R.last(newContent).content

              newContent[newContent.length - 1].content.push(node);
            } else {
              newContent = R.append(node, newContent);
            }
          }, content);

          newData = {
            data: {},
            content: newContent,
            nodeType: htmlAattribute[type][name],
          };
          break;
        case 'p':
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          newData = paragraph(content, htmlAattribute[type][name]);
          break;
        default:
          if (!htmlAattribute[type][name]) {
            console.warn('*** new data needed under -', type, name);
          }

          newData = {
            data: {},
            content,
            nodeType: htmlAattribute[type][name],
          };
          break;
      }
    } else {
      console.warn('***new type needed -', type, data);
    }

    result = R.type(newData) === 'Array' ? R.concat(result, newData) : R.append(newData, result);
  }, dom);
  return result;
};

function paragraph(subContent, nodeType) {
  let subNodes = [];
  if (!subContent.length) {
    subNodes = [
      [
        {
          data: {},
          marks: [],
          value: '',
          nodeType: 'text',
        },
      ],
    ];
  } else {
    subNodes = [subContent];
    let brIndex = R.findIndex(R.propEq('nodeType', 'br'), R.last(subNodes));

    while (brIndex !== -1) {
      const last = subNodes.pop();

      const split = R.splitAt(brIndex, last);
      split[1].shift(); // remove the br node
      subNodes = R.concat(subNodes, split);
      brIndex = R.findIndex(R.propEq('nodeType', 'br'), R.last(subNodes));
    }
  }
  const newData = R.map(
    (content) => ({
      data: {},
      content,
      nodeType,
    }),
    subNodes,
  );

  return newData;
}

const manage = (err: Error, dom: any) => {
  if (err) {
    throw err;
  }

  finalRichTextObj = {
    data: {},
    content: transform(dom),
    nodeType: 'document',
  };
};

export const htmlToRichText = (html: string) => {
  new Parser(new DefaultHandler(manage)).parseComplete(html);
  return finalRichTextObj;
};
