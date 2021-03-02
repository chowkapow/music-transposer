const fs = require('fs');

const cheerio = require('cheerio');
const HTMLtoDOCX = require('html-to-docx');
const inquirer = require('inquirer');
const mammoth = require('mammoth');

const { flatChords, sharpChords, questions, regExp } = require('./constants');

let startingChords, finalChords;

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
      restOfChord = chord.substring(2);
      chord = chord.substring(0, 2);
    } else {
      restOfChord = chord.substring(1);
      chord = chord.substring(0, 1);
    }
  }
  let diff = startingChords.indexOf(chord) + halfSteps;
  if (diff < 0) {
    diff = startingChords.length + diff;
  } else if (diff >= startingChords.length) {
    diff = diff - startingChords.length;
  }
  return minor
    ? finalChords[diff] + 'm' + restOfChord
    : finalChords[diff] + restOfChord;
};

(async () => {
  const response = await inquirer.prompt(questions);
  const html = await mammoth.convertToHtml({
    path: './' + response.music + '.docx',
  });
  const $ = cheerio.load(html.value);

  const origKey = response.music.match(regExp)[1];
  startingChords = origKey.indexOf('b') != -1 ? flatChords : sharpChords;
  finalChords = response.newKey.indexOf('b') != -1 ? flatChords : sharpChords;
  const halfSteps =
    finalChords.indexOf(response.newKey) - startingChords.indexOf(origKey);

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
