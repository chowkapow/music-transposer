const fs = require('fs');

const cheerio = require('cheerio');
const HTMLtoDOCX = require('html-to-docx');
const mammoth = require('mammoth');

const chords = [
  'C',
  'C#',
  'D',
  'Eb',
  'E',
  'F',
  'F#',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
];

const filePath = './10000 Reasons (E) EDIT.docx';

mammoth
  .convertToHtml({ path: './10000 Reasons (E).docx' }, { styleMap: 'b' })
  .then((result) => {
    const html = result.value;
    const $ = cheerio.load(html);
    console.log($.html());
    $('strong').each((i, e) => {
      const element = $(e);
      element.text(element.text() + ' TEST');
      console.log(element.text());
    });
    console.log($.html());

    (async () => {
      const fileBuffer = await HTMLtoDOCX($.html(), null, {});

      fs.writeFile(filePath, fileBuffer, (error) => {
        if (error) {
          console.log('Docx file creation failed');
          return;
        }
        console.log('Docx file created successfully');
      });
    })();
  })
  .done();
