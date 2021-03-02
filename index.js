const fs = require('fs');

const cheerio = require('cheerio');
const HTMLtoDOCX = require('html-to-docx');
const mammoth = require('mammoth');

const flatChords = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
];

const sharpChords = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

const filePath = './10000 Reasons (E) EDIT.docx';
const transpose = -2;
let flat = false;

const chords = flat ? flatChords : sharpChords;

const transposeChord = (chord, halfSteps) => {
  let minor = false;
  let restOfChord = '';
  if (chord.indexOf('/') != -1) {
    chordSplit = chord.split('/');
    return (
      transposeChord(chordSplit[0], halfSteps) +
      '/' +
      transposeChord(chordSplit[1], halfSteps)
    );
  }
  if (chord.indexOf('m') != -1) {
    minor = true;
    chord = chord.substring(0, chord.length - 1);
  }
  if (chord.length > 1) {
    restOfChord =
      chord.indexOf('#') != -1 ? chord.substring(2) : chord.substring(1);
    chord =
      chord.indexOf('#') != -1 ? chord.substring(0, 2) : chord.substring(0, 1);
  }
  let diff = chords.indexOf(chord) + halfSteps;
  if (diff < 0) {
    diff = chords.length + diff;
  } else if (diff >= chords.length) {
    diff = diff - chords.length;
  }
  if (minor) {
    return chords[diff] + 'm' + restOfChord;
  } else {
    return chords[diff] + restOfChord;
  }
};

(async () => {
  const html = await mammoth.convertToHtml({
    path: './10000 Reasons (E).docx',
  });
  const $ = cheerio.load(html.value);
  $('strong').each((i, e) => {
    const element = $(e);
    element.text(transposeChord(element.text(), transpose));
  });

  const fileBuffer = await HTMLtoDOCX($.html(), null, {});

  fs.writeFile(filePath, fileBuffer, (error) => {
    if (error) {
      console.log('Docx file creation failed');
      return;
    }
    console.log('Docx file created successfully');
  });
})();
