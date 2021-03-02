module.exports = {
  flatChords: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],

  sharpChords: [
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
  ],

  questions: [
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
  ],

  regExp: /\(([^)]+)\)/,
};
