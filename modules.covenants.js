import { createCovenant } from './arm5.js';

const covenants = [
  createCovenant('Fengheld'),
  createCovenant('Jaferia')
];

export function getCovenants() {
  return [...covenants];
}