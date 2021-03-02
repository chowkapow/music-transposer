const fs = require('fs');

const cheerio = require('cheerio');
const HTMLtoDOCX = require('html-to-docx');
const inquirer = require('inquirer');
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

let chords;
const regExp = /\(([^)]+)\)/;

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
    chord = chord.substring(0, chord.indexOf('m'));
  }
  if (chord.length > 1) {
    if (chord.indexOf('#') != -1 || chord.indexOf('b') != -1) {
      chord = chord.substring(0, 2);
      restOfChord = chord.substring(2);
    } else {
      chord = chord.substring(0, 1);
      restOfChord = chord.substring(1);
    }
  }
  let diff = chords.indexOf(chord) + halfSteps;
  if (diff < 0) {
    diff = chords.length + diff;
  } else if (diff >= chords.length) {
    diff = diff - chords.length;
  }
  return minor ? chords[diff] + 'm' + restOfChord : chords[diff] + restOfChord;
};

const questions = [
  {
    type: 'input',
    name: 'music',
    message: 'What is the music?',
  },
  {
    type: 'input',
    name: 'newKey',
    message: 'What is the new key?',
  },
  {
    type: 'confirm',
    name: 'flats',
    message: 'Do you prefer flats?',
    default: false,
  },
];

(async () => {
  const response = await inquirer.prompt(questions);
  const html = await mammoth.convertToHtml({
    path: './' + response.music + '.docx',
  });
  const $ = cheerio.load(html.value);

  chords = response.flats ? flatChords : sharpChords;
  const origKey = response.music.match(regExp)[1];
  const halfSteps = chords.indexOf(response.newKey) - chords.indexOf(origKey);

  $('strong').each((i, e) => {
    const element = $(e);
    element.text(transposeChord(element.text(), halfSteps));
  });

  const filePath =
    './' + response.music.split('(')[0] + '(' + response.newKey + ')' + '.docx';
  const fileBuffer = await HTMLtoDOCX($.html(), null, {});

  fs.writeFile(filePath, fileBuffer, (error) => {
    if (error) {
      console.log('Docx file creation failed');
      return;
    }
    console.log('Docx file created successfully');
  });
})();
