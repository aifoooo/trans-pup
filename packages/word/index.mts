import { WordLookup } from './lib/word-lookup.js';
import path from 'path';

const coreWordsPath = path.resolve(__dirname, './lib/core-words.json');
const wordLookup = WordLookup.fromFile(coreWordsPath);

export { wordLookup };
