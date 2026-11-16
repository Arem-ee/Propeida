/**
 * IUPAC Standard Periodic Table Dataset (All 118 Elements)
 * Prepared with full accuracy for Nigerian Secondary & University Admissions (JAMB UTME, WAEC, Post-UTME).
 */

export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'transition-metal'
  | 'post-transition'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide';

export interface ChemicalElement {
  z: number;              // Atomic number
  s: string;              // Chemical symbol
  n: string;              // Full English name
  m: number;              // Relative atomic mass
  p: number;              // Period (1-7)
  g: number;              // Group (1-18)
  c: ElementCategory;     // Category/Block
  st: 'gas' | 'liquid' | 'solid'; // State at 298.15 K
  shells: number[];       // Electrons per shell [K, L, M, N...]
  cfg: string;            // Electron configuration (spdf)
  val: string;            // Common valency / oxidation states
  en: number | null;      // Pauling electronegativity
}

export const CATEGORY_LABELS: Record<ElementCategory, string> = {
  'alkali-metal': 'Alkali Metals',
  'alkaline-earth': 'Alkaline Earth',
  'transition-metal': 'Transition Metals',
  'post-transition': 'Post-Transition',
  'metalloid': 'Metalloids',
  'nonmetal': 'Reactive Non-metals',
  'halogen': 'Halogens',
  'noble-gas': 'Noble Gases',
  'lanthanide': 'Lanthanides',
  'actinide': 'Actinides',
};

export const CATEGORY_COLORS: Record<ElementCategory, { bg: string; text: string; border: string; badge: string }> = {
  'alkali-metal': { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-200', badge: 'bg-rose-500 text-white' },
  'alkaline-earth': { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200', badge: 'bg-amber-500 text-white' },
  'transition-metal': { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-200', badge: 'bg-blue-500 text-white' },
  'post-transition': { bg: 'bg-indigo-50', text: 'text-indigo-900', border: 'border-indigo-200', badge: 'bg-indigo-500 text-white' },
  'metalloid': { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200', badge: 'bg-emerald-500 text-white' },
  'nonmetal': { bg: 'bg-teal-50', text: 'text-teal-900', border: 'border-teal-200', badge: 'bg-teal-500 text-white' },
  'halogen': { bg: 'bg-cyan-50', text: 'text-cyan-900', border: 'border-cyan-200', badge: 'bg-cyan-500 text-white' },
  'noble-gas': { bg: 'bg-purple-50', text: 'text-purple-900', border: 'border-purple-200', badge: 'bg-purple-500 text-white' },
  'lanthanide': { bg: 'bg-pink-50', text: 'text-pink-900', border: 'border-pink-200', badge: 'bg-pink-500 text-white' },
  'actinide': { bg: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-200', badge: 'bg-orange-500 text-white' },
};

export const ELEMENTS: ChemicalElement[] = [
  {
    "z": 1,
    "s": "H",
    "n": "Hydrogen",
    "m": 1.008,
    "p": 1,
    "g": 1,
    "c": "nonmetal",
    "st": "gas",
    "shells": [
      1
    ],
    "cfg": "1s¹",
    "val": "±1",
    "en": 2.2
  },
  {
    "z": 2,
    "s": "He",
    "n": "Helium",
    "m": 4.003,
    "p": 1,
    "g": 18,
    "c": "noble-gas",
    "st": "gas",
    "shells": [
      2
    ],
    "cfg": "1s²",
    "val": "0",
    "en": null
  },
  {
    "z": 3,
    "s": "Li",
    "n": "Lithium",
    "m": 6.94,
    "p": 2,
    "g": 1,
    "c": "alkali-metal",
    "st": "solid",
    "shells": [
      2,
      1
    ],
    "cfg": "[He] 2s¹",
    "val": "+1",
    "en": 0.98
  },
  {
    "z": 4,
    "s": "Be",
    "n": "Beryllium",
    "m": 9.012,
    "p": 2,
    "g": 2,
    "c": "alkaline-earth",
    "st": "solid",
    "shells": [
      2,
      2
    ],
    "cfg": "[He] 2s²",
    "val": "+2",
    "en": 1.57
  },
  {
    "z": 5,
    "s": "B",
    "n": "Boron",
    "m": 10.81,
    "p": 2,
    "g": 13,
    "c": "metalloid",
    "st": "solid",
    "shells": [
      2,
      3
    ],
    "cfg": "[He] 2s² 2p¹",
    "val": "+3",
    "en": 2.04
  },
  {
    "z": 6,
    "s": "C",
    "n": "Carbon",
    "m": 12.011,
    "p": 2,
    "g": 14,
    "c": "nonmetal",
    "st": "solid",
    "shells": [
      2,
      4
    ],
    "cfg": "[He] 2s² 2p²",
    "val": "±4, +2",
    "en": 2.55
  },
  {
    "z": 7,
    "s": "N",
    "n": "Nitrogen",
    "m": 14.007,
    "p": 2,
    "g": 15,
    "c": "nonmetal",
    "st": "gas",
    "shells": [
      2,
      5
    ],
    "cfg": "[He] 2s² 2p³",
    "val": "±3, +5",
    "en": 3.04
  },
  {
    "z": 8,
    "s": "O",
    "n": "Oxygen",
    "m": 15.999,
    "p": 2,
    "g": 16,
    "c": "nonmetal",
    "st": "gas",
    "shells": [
      2,
      6
    ],
    "cfg": "[He] 2s² 2p⁴",
    "val": "-2",
    "en": 3.44
  },
  {
    "z": 9,
    "s": "F",
    "n": "Fluorine",
    "m": 18.998,
    "p": 2,
    "g": 17,
    "c": "halogen",
    "st": "gas",
    "shells": [
      2,
      7
    ],
    "cfg": "[He] 2s² 2p⁵",
    "val": "-1",
    "en": 3.98
  },
  {
    "z": 10,
    "s": "Ne",
    "n": "Neon",
    "m": 20.18,
    "p": 2,
    "g": 18,
    "c": "noble-gas",
    "st": "gas",
    "shells": [
      2,
      8
    ],
    "cfg": "[He] 2s² 2p⁶",
    "val": "0",
    "en": null
  },
  {
    "z": 11,
    "s": "Na",
    "n": "Sodium",
    "m": 22.99,
    "p": 3,
    "g": 1,
    "c": "alkali-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      1
    ],
    "cfg": "[Ne] 3s¹",
    "val": "+1",
    "en": 0.93
  },
  {
    "z": 12,
    "s": "Mg",
    "n": "Magnesium",
    "m": 24.305,
    "p": 3,
    "g": 2,
    "c": "alkaline-earth",
    "st": "solid",
    "shells": [
      2,
      8,
      2
    ],
    "cfg": "[Ne] 3s²",
    "val": "+2",
    "en": 1.31
  },
  {
    "z": 13,
    "s": "Al",
    "n": "Aluminium",
    "m": 26.982,
    "p": 3,
    "g": 13,
    "c": "post-transition",
    "st": "solid",
    "shells": [
      2,
      8,
      3
    ],
    "cfg": "[Ne] 3s² 3p¹",
    "val": "+3",
    "en": 1.61
  },
  {
    "z": 14,
    "s": "Si",
    "n": "Silicon",
    "m": 28.085,
    "p": 3,
    "g": 14,
    "c": "metalloid",
    "st": "solid",
    "shells": [
      2,
      8,
      4
    ],
    "cfg": "[Ne] 3s² 3p²",
    "val": "±4",
    "en": 1.9
  },
  {
    "z": 15,
    "s": "P",
    "n": "Phosphorus",
    "m": 30.974,
    "p": 3,
    "g": 15,
    "c": "nonmetal",
    "st": "solid",
    "shells": [
      2,
      8,
      5
    ],
    "cfg": "[Ne] 3s² 3p³",
    "val": "±3, +5",
    "en": 2.19
  },
  {
    "z": 16,
    "s": "S",
    "n": "Sulfur",
    "m": 32.06,
    "p": 3,
    "g": 16,
    "c": "nonmetal",
    "st": "solid",
    "shells": [
      2,
      8,
      6
    ],
    "cfg": "[Ne] 3s² 3p⁴",
    "val": "-2, +4, +6",
    "en": 2.58
  },
  {
    "z": 17,
    "s": "Cl",
    "n": "Chlorine",
    "m": 35.45,
    "p": 3,
    "g": 17,
    "c": "halogen",
    "st": "gas",
    "shells": [
      2,
      8,
      7
    ],
    "cfg": "[Ne] 3s² 3p⁵",
    "val": "-1, +1, +3, +5, +7",
    "en": 3.16
  },
  {
    "z": 18,
    "s": "Ar",
    "n": "Argon",
    "m": 39.95,
    "p": 3,
    "g": 18,
    "c": "noble-gas",
    "st": "gas",
    "shells": [
      2,
      8,
      8
    ],
    "cfg": "[Ne] 3s² 3p⁶",
    "val": "0",
    "en": null
  },
  {
    "z": 19,
    "s": "K",
    "n": "Potassium",
    "m": 39.098,
    "p": 4,
    "g": 1,
    "c": "alkali-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      8,
      1
    ],
    "cfg": "[Ar] 4s¹",
    "val": "+1",
    "en": 0.82
  },
  {
    "z": 20,
    "s": "Ca",
    "n": "Calcium",
    "m": 40.078,
    "p": 4,
    "g": 2,
    "c": "alkaline-earth",
    "st": "solid",
    "shells": [
      2,
      8,
      8,
      2
    ],
    "cfg": "[Ar] 4s²",
    "val": "+2",
    "en": 1
  },
  {
    "z": 21,
    "s": "Sc",
    "n": "Scandium",
    "m": 44.956,
    "p": 4,
    "g": 3,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      9,
      2
    ],
    "cfg": "[Ar] 3d¹ 4s²",
    "val": "+3",
    "en": 1.36
  },
  {
    "z": 22,
    "s": "Ti",
    "n": "Titanium",
    "m": 47.867,
    "p": 4,
    "g": 4,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      10,
      2
    ],
    "cfg": "[Ar] 3d² 4s²",
    "val": "+4, +3",
    "en": 1.54
  },
  {
    "z": 23,
    "s": "V",
    "n": "Vanadium",
    "m": 50.942,
    "p": 4,
    "g": 5,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      11,
      2
    ],
    "cfg": "[Ar] 3d³ 4s²",
    "val": "+5, +4, +3, +2",
    "en": 1.63
  },
  {
    "z": 24,
    "s": "Cr",
    "n": "Chromium",
    "m": 51.996,
    "p": 4,
    "g": 6,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      13,
      1
    ],
    "cfg": "[Ar] 3d⁵ 4s¹",
    "val": "+3, +6, +2",
    "en": 1.66
  },
  {
    "z": 25,
    "s": "Mn",
    "n": "Manganese",
    "m": 54.938,
    "p": 4,
    "g": 7,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      13,
      2
    ],
    "cfg": "[Ar] 3d⁵ 4s²",
    "val": "+2, +4, +7",
    "en": 1.55
  },
  {
    "z": 26,
    "s": "Fe",
    "n": "Iron",
    "m": 55.845,
    "p": 4,
    "g": 8,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      14,
      2
    ],
    "cfg": "[Ar] 3d⁶ 4s²",
    "val": "+2, +3",
    "en": 1.83
  },
  {
    "z": 27,
    "s": "Co",
    "n": "Cobalt",
    "m": 58.933,
    "p": 4,
    "g": 9,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      15,
      2
    ],
    "cfg": "[Ar] 3d⁷ 4s²",
    "val": "+2, +3",
    "en": 1.88
  },
  {
    "z": 28,
    "s": "Ni",
    "n": "Nickel",
    "m": 58.693,
    "p": 4,
    "g": 10,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      16,
      2
    ],
    "cfg": "[Ar] 3d⁸ 4s²",
    "val": "+2, +3",
    "en": 1.91
  },
  {
    "z": 29,
    "s": "Cu",
    "n": "Copper",
    "m": 63.546,
    "p": 4,
    "g": 11,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      1
    ],
    "cfg": "[Ar] 3d¹⁰ 4s¹",
    "val": "+1, +2",
    "en": 1.9
  },
  {
    "z": 30,
    "s": "Zn",
    "n": "Zinc",
    "m": 65.38,
    "p": 4,
    "g": 12,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      2
    ],
    "cfg": "[Ar] 3d¹⁰ 4s²",
    "val": "+2",
    "en": 1.65
  },
  {
    "z": 31,
    "s": "Ga",
    "n": "Gallium",
    "m": 69.723,
    "p": 4,
    "g": 13,
    "c": "post-transition",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      3
    ],
    "cfg": "[Ar] 3d¹⁰ 4s² 4p¹",
    "val": "+3",
    "en": 1.81
  },
  {
    "z": 32,
    "s": "Ge",
    "n": "Germanium",
    "m": 72.63,
    "p": 4,
    "g": 14,
    "c": "metalloid",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      4
    ],
    "cfg": "[Ar] 3d¹⁰ 4s² 4p²",
    "val": "+4, +2",
    "en": 2.01
  },
  {
    "z": 33,
    "s": "As",
    "n": "Arsenic",
    "m": 74.922,
    "p": 4,
    "g": 15,
    "c": "metalloid",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      5
    ],
    "cfg": "[Ar] 3d¹⁰ 4s² 4p³",
    "val": "±3, +5",
    "en": 2.18
  },
  {
    "z": 34,
    "s": "Se",
    "n": "Selenium",
    "m": 78.971,
    "p": 4,
    "g": 16,
    "c": "nonmetal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      6
    ],
    "cfg": "[Ar] 3d¹⁰ 4s² 4p⁴",
    "val": "-2, +4, +6",
    "en": 2.55
  },
  {
    "z": 35,
    "s": "Br",
    "n": "Bromine",
    "m": 79.904,
    "p": 4,
    "g": 17,
    "c": "halogen",
    "st": "liquid",
    "shells": [
      2,
      8,
      18,
      7
    ],
    "cfg": "[Ar] 3d¹⁰ 4s² 4p⁵",
    "val": "-1, +1, +5",
    "en": 2.96
  },
  {
    "z": 36,
    "s": "Kr",
    "n": "Krypton",
    "m": 83.798,
    "p": 4,
    "g": 18,
    "c": "noble-gas",
    "st": "gas",
    "shells": [
      2,
      8,
      18,
      8
    ],
    "cfg": "[Ar] 3d¹⁰ 4s² 4p⁶",
    "val": "0, +2",
    "en": 3
  },
  {
    "z": 37,
    "s": "Rb",
    "n": "Rubidium",
    "m": 85.468,
    "p": 5,
    "g": 1,
    "c": "alkali-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      8,
      1
    ],
    "cfg": "[Kr] 5s¹",
    "val": "+1",
    "en": 0.82
  },
  {
    "z": 38,
    "s": "Sr",
    "n": "Strontium",
    "m": 87.62,
    "p": 5,
    "g": 2,
    "c": "alkaline-earth",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      8,
      2
    ],
    "cfg": "[Kr] 5s²",
    "val": "+2",
    "en": 0.95
  },
  {
    "z": 39,
    "s": "Y",
    "n": "Yttrium",
    "m": 88.906,
    "p": 5,
    "g": 3,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      9,
      2
    ],
    "cfg": "[Kr] 4d¹ 5s²",
    "val": "+3",
    "en": 1.22
  },
  {
    "z": 40,
    "s": "Zr",
    "n": "Zirconium",
    "m": 91.224,
    "p": 5,
    "g": 4,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      10,
      2
    ],
    "cfg": "[Kr] 4d² 5s²",
    "val": "+4",
    "en": 1.33
  },
  {
    "z": 41,
    "s": "Nb",
    "n": "Niobium",
    "m": 92.906,
    "p": 5,
    "g": 5,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      12,
      1
    ],
    "cfg": "[Kr] 4d⁴ 5s¹",
    "val": "+5, +3",
    "en": 1.6
  },
  {
    "z": 42,
    "s": "Mo",
    "n": "Molybdenum",
    "m": 95.95,
    "p": 5,
    "g": 6,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      13,
      1
    ],
    "cfg": "[Kr] 4d⁵ 5s¹",
    "val": "+6, +4",
    "en": 2.16
  },
  {
    "z": 43,
    "s": "Tc",
    "n": "Technetium",
    "m": 98,
    "p": 5,
    "g": 7,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      13,
      2
    ],
    "cfg": "[Kr] 4d⁵ 5s²",
    "val": "+7, +4",
    "en": 1.9
  },
  {
    "z": 44,
    "s": "Ru",
    "n": "Ruthenium",
    "m": 101.07,
    "p": 5,
    "g": 8,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      15,
      1
    ],
    "cfg": "[Kr] 4d⁷ 5s¹",
    "val": "+3, +4, +8",
    "en": 2.2
  },
  {
    "z": 45,
    "s": "Rh",
    "n": "Rhodium",
    "m": 102.91,
    "p": 5,
    "g": 9,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      16,
      1
    ],
    "cfg": "[Kr] 4d⁸ 5s¹",
    "val": "+3",
    "en": 2.28
  },
  {
    "z": 46,
    "s": "Pd",
    "n": "Palladium",
    "m": 106.42,
    "p": 5,
    "g": 10,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      18
    ],
    "cfg": "[Kr] 4d¹⁰",
    "val": "+2, +4",
    "en": 2.2
  },
  {
    "z": 47,
    "s": "Ag",
    "n": "Silver",
    "m": 107.87,
    "p": 5,
    "g": 11,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      18,
      1
    ],
    "cfg": "[Kr] 4d¹⁰ 5s¹",
    "val": "+1",
    "en": 1.93
  },
  {
    "z": 48,
    "s": "Cd",
    "n": "Cadmium",
    "m": 112.41,
    "p": 5,
    "g": 12,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      18,
      2
    ],
    "cfg": "[Kr] 4d¹⁰ 5s²",
    "val": "+2",
    "en": 1.69
  },
  {
    "z": 49,
    "s": "In",
    "n": "Indium",
    "m": 114.82,
    "p": 5,
    "g": 13,
    "c": "post-transition",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      18,
      3
    ],
    "cfg": "[Kr] 4d¹⁰ 5s² 5p¹",
    "val": "+3",
    "en": 1.78
  },
  {
    "z": 50,
    "s": "Sn",
    "n": "Tin",
    "m": 118.71,
    "p": 5,
    "g": 14,
    "c": "post-transition",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      18,
      4
    ],
    "cfg": "[Kr] 4d¹⁰ 5s² 5p²",
    "val": "+2, +4",
    "en": 1.96
  },
  {
    "z": 51,
    "s": "Sb",
    "n": "Antimony",
    "m": 121.76,
    "p": 5,
    "g": 15,
    "c": "metalloid",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      18,
      5
    ],
    "cfg": "[Kr] 4d¹⁰ 5s² 5p³",
    "val": "±3, +5",
    "en": 2.05
  },
  {
    "z": 52,
    "s": "Te",
    "n": "Tellurium",
    "m": 127.6,
    "p": 5,
    "g": 16,
    "c": "metalloid",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      18,
      6
    ],
    "cfg": "[Kr] 4d¹⁰ 5s² 5p⁴",
    "val": "-2, +4, +6",
    "en": 2.1
  },
  {
    "z": 53,
    "s": "I",
    "n": "Iodine",
    "m": 126.9,
    "p": 5,
    "g": 17,
    "c": "halogen",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      18,
      7
    ],
    "cfg": "[Kr] 4d¹⁰ 5s² 5p⁵",
    "val": "-1, +1, +5, +7",
    "en": 2.66
  },
  {
    "z": 54,
    "s": "Xe",
    "n": "Xenon",
    "m": 131.29,
    "p": 5,
    "g": 18,
    "c": "noble-gas",
    "st": "gas",
    "shells": [
      2,
      8,
      18,
      18,
      8
    ],
    "cfg": "[Kr] 4d¹⁰ 5s² 5p⁶",
    "val": "0, +2, +4, +6",
    "en": 2.6
  },
  {
    "z": 55,
    "s": "Cs",
    "n": "Caesium",
    "m": 132.91,
    "p": 6,
    "g": 1,
    "c": "alkali-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      18,
      8,
      1
    ],
    "cfg": "[Xe] 6s¹",
    "val": "+1",
    "en": 0.79
  },
  {
    "z": 56,
    "s": "Ba",
    "n": "Barium",
    "m": 137.33,
    "p": 6,
    "g": 2,
    "c": "alkaline-earth",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      18,
      8,
      2
    ],
    "cfg": "[Xe] 6s²",
    "val": "+2",
    "en": 0.89
  },
  {
    "z": 57,
    "s": "La",
    "n": "Lanthanum",
    "m": 138.91,
    "p": 6,
    "g": 3,
    "c": "lanthanide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      18,
      9,
      2
    ],
    "cfg": "[Xe] 5d¹ 6s²",
    "val": "+3",
    "en": 1.1
  },
  {
    "z": 58,
    "s": "Ce",
    "n": "Cerium",
    "m": 140.12,
    "p": 6,
    "g": 3,
    "c": "lanthanide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      19,
      9,
      2
    ],
    "cfg": "[Xe] 4f¹ 5d¹ 6s²",
    "val": "+3, +4",
    "en": 1.12
  },
  {
    "z": 59,
    "s": "Pr",
    "n": "Praseodymium",
    "m": 140.91,
    "p": 6,
    "g": 3,
    "c": "lanthanide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      21,
      8,
      2
    ],
    "cfg": "[Xe] 4f³ 6s²",
    "val": "+3, +4",
    "en": 1.13
  },
  {
    "z": 60,
    "s": "Nd",
    "n": "Neodymium",
    "m": 144.24,
    "p": 6,
    "g": 3,
    "c": "lanthanide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      22,
      8,
      2
    ],
    "cfg": "[Xe] 4f⁴ 6s²",
    "val": "+3",
    "en": 1.14
  },
  {
    "z": 61,
    "s": "Pm",
    "n": "Promethium",
    "m": 145,
    "p": 6,
    "g": 3,
    "c": "lanthanide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      23,
      8,
      2
    ],
    "cfg": "[Xe] 4f⁵ 6s²",
    "val": "+3",
    "en": 1.13
  },
  {
    "z": 62,
    "s": "Sm",
    "n": "Samarium",
    "m": 150.36,
    "p": 6,
    "g": 3,
    "c": "lanthanide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      24,
      8,
      2
    ],
    "cfg": "[Xe] 4f⁶ 6s²",
    "val": "+3, +2",
    "en": 1.17
  },
  {
    "z": 63,
    "s": "Eu",
    "n": "Europium",
    "m": 151.96,
    "p": 6,
    "g": 3,
    "c": "lanthanide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      25,
      8,
      2
    ],
    "cfg": "[Xe] 4f⁷ 6s²",
    "val": "+3, +2",
    "en": 1.2
  },
  {
    "z": 64,
    "s": "Gd",
    "n": "Gadolinium",
    "m": 157.25,
    "p": 6,
    "g": 3,
    "c": "lanthanide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      25,
      9,
      2
    ],
    "cfg": "[Xe] 4f⁷ 5d¹ 6s²",
    "val": "+3",
    "en": 1.2
  },
  {
    "z": 65,
    "s": "Tb",
    "n": "Terbium",
    "m": 158.93,
    "p": 6,
    "g": 3,
    "c": "lanthanide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      27,
      8,
      2
    ],
    "cfg": "[Xe] 4f⁹ 6s²",
    "val": "+3, +4",
    "en": 1.2
  },
  {
    "z": 66,
    "s": "Dy",
    "n": "Dysprosium",
    "m": 162.5,
    "p": 6,
    "g": 3,
    "c": "lanthanide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      28,
      8,
      2
    ],
    "cfg": "[Xe] 4f¹⁰ 6s²",
    "val": "+3",
    "en": 1.22
  },
  {
    "z": 67,
    "s": "Ho",
    "n": "Holmium",
    "m": 164.93,
    "p": 6,
    "g": 3,
    "c": "lanthanide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      29,
      8,
      2
    ],
    "cfg": "[Xe] 4f¹¹ 6s²",
    "val": "+3",
    "en": 1.23
  },
  {
    "z": 68,
    "s": "Er",
    "n": "Erbium",
    "m": 167.26,
    "p": 6,
    "g": 3,
    "c": "lanthanide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      30,
      8,
      2
    ],
    "cfg": "[Xe] 4f¹² 6s²",
    "val": "+3",
    "en": 1.24
  },
  {
    "z": 69,
    "s": "Tm",
    "n": "Thulium",
    "m": 168.93,
    "p": 6,
    "g": 3,
    "c": "lanthanide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      31,
      8,
      2
    ],
    "cfg": "[Xe] 4f¹³ 6s²",
    "val": "+3, +2",
    "en": 1.25
  },
  {
    "z": 70,
    "s": "Yb",
    "n": "Ytterbium",
    "m": 173.05,
    "p": 6,
    "g": 3,
    "c": "lanthanide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      8,
      2
    ],
    "cfg": "[Xe] 4f¹⁴ 6s²",
    "val": "+3, +2",
    "en": 1.1
  },
  {
    "z": 71,
    "s": "Lu",
    "n": "Lutetium",
    "m": 174.97,
    "p": 6,
    "g": 3,
    "c": "lanthanide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      9,
      2
    ],
    "cfg": "[Xe] 4f¹⁴ 5d¹ 6s²",
    "val": "+3",
    "en": 1.27
  },
  {
    "z": 72,
    "s": "Hf",
    "n": "Hafnium",
    "m": 178.49,
    "p": 6,
    "g": 4,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      10,
      2
    ],
    "cfg": "[Xe] 4f¹⁴ 5d² 6s²",
    "val": "+4",
    "en": 1.3
  },
  {
    "z": 73,
    "s": "Ta",
    "n": "Tantalum",
    "m": 180.95,
    "p": 6,
    "g": 5,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      11,
      2
    ],
    "cfg": "[Xe] 4f¹⁴ 5d³ 6s²",
    "val": "+5",
    "en": 1.5
  },
  {
    "z": 74,
    "s": "W",
    "n": "Tungsten",
    "m": 183.84,
    "p": 6,
    "g": 6,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      12,
      2
    ],
    "cfg": "[Xe] 4f¹⁴ 5d⁴ 6s²",
    "val": "+6, +4",
    "en": 2.36
  },
  {
    "z": 75,
    "s": "Re",
    "n": "Rhenium",
    "m": 186.21,
    "p": 6,
    "g": 7,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      13,
      2
    ],
    "cfg": "[Xe] 4f¹⁴ 5d⁵ 6s²",
    "val": "+7, +4",
    "en": 1.9
  },
  {
    "z": 76,
    "s": "Os",
    "n": "Osmium",
    "m": 190.23,
    "p": 6,
    "g": 8,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      14,
      2
    ],
    "cfg": "[Xe] 4f¹⁴ 5d⁶ 6s²",
    "val": "+4, +8",
    "en": 2.2
  },
  {
    "z": 77,
    "s": "Ir",
    "n": "Iridium",
    "m": 192.22,
    "p": 6,
    "g": 9,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      15,
      2
    ],
    "cfg": "[Xe] 4f¹⁴ 5d⁷ 6s²",
    "val": "+3, +4",
    "en": 2.2
  },
  {
    "z": 78,
    "s": "Pt",
    "n": "Platinum",
    "m": 195.08,
    "p": 6,
    "g": 10,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      17,
      1
    ],
    "cfg": "[Xe] 4f¹⁴ 5d⁹ 6s¹",
    "val": "+2, +4",
    "en": 2.28
  },
  {
    "z": 79,
    "s": "Au",
    "n": "Gold",
    "m": 196.97,
    "p": 6,
    "g": 11,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      18,
      1
    ],
    "cfg": "[Xe] 4f¹⁴ 5d¹⁰ 6s¹",
    "val": "+3, +1",
    "en": 2.54
  },
  {
    "z": 80,
    "s": "Hg",
    "n": "Mercury",
    "m": 200.59,
    "p": 6,
    "g": 12,
    "c": "transition-metal",
    "st": "liquid",
    "shells": [
      2,
      8,
      18,
      32,
      18,
      2
    ],
    "cfg": "[Xe] 4f¹⁴ 5d¹⁰ 6s²",
    "val": "+1, +2",
    "en": 2
  },
  {
    "z": 81,
    "s": "Tl",
    "n": "Thallium",
    "m": 204.38,
    "p": 6,
    "g": 13,
    "c": "post-transition",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      18,
      3
    ],
    "cfg": "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹",
    "val": "+1, +3",
    "en": 1.62
  },
  {
    "z": 82,
    "s": "Pb",
    "n": "Lead",
    "m": 207.2,
    "p": 6,
    "g": 14,
    "c": "post-transition",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      18,
      4
    ],
    "cfg": "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²",
    "val": "+2, +4",
    "en": 2.33
  },
  {
    "z": 83,
    "s": "Bi",
    "n": "Bismuth",
    "m": 208.98,
    "p": 6,
    "g": 15,
    "c": "post-transition",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      18,
      5
    ],
    "cfg": "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³",
    "val": "+3, +5",
    "en": 2.02
  },
  {
    "z": 84,
    "s": "Po",
    "n": "Polonium",
    "m": 209,
    "p": 6,
    "g": 16,
    "c": "post-transition",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      18,
      6
    ],
    "cfg": "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴",
    "val": "+2, +4",
    "en": 2
  },
  {
    "z": 85,
    "s": "At",
    "n": "Astatine",
    "m": 210,
    "p": 6,
    "g": 17,
    "c": "halogen",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      18,
      7
    ],
    "cfg": "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵",
    "val": "±1, +3, +5",
    "en": 2.2
  },
  {
    "z": 86,
    "s": "Rn",
    "n": "Radon",
    "m": 222,
    "p": 6,
    "g": 18,
    "c": "noble-gas",
    "st": "gas",
    "shells": [
      2,
      8,
      18,
      32,
      18,
      8
    ],
    "cfg": "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶",
    "val": "0, +2",
    "en": 2.2
  },
  {
    "z": 87,
    "s": "Fr",
    "n": "Francium",
    "m": 223,
    "p": 7,
    "g": 1,
    "c": "alkali-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      18,
      8,
      1
    ],
    "cfg": "[Rn] 7s¹",
    "val": "+1",
    "en": 0.7
  },
  {
    "z": 88,
    "s": "Ra",
    "n": "Radium",
    "m": 226,
    "p": 7,
    "g": 2,
    "c": "alkaline-earth",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      18,
      8,
      2
    ],
    "cfg": "[Rn] 7s²",
    "val": "+2",
    "en": 0.9
  },
  {
    "z": 89,
    "s": "Ac",
    "n": "Actinium",
    "m": 227,
    "p": 7,
    "g": 3,
    "c": "actinide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      18,
      9,
      2
    ],
    "cfg": "[Rn] 6d¹ 7s²",
    "val": "+3",
    "en": 1.1
  },
  {
    "z": 90,
    "s": "Th",
    "n": "Thorium",
    "m": 232.04,
    "p": 7,
    "g": 3,
    "c": "actinide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      18,
      10,
      2
    ],
    "cfg": "[Rn] 6d² 7s²",
    "val": "+4",
    "en": 1.3
  },
  {
    "z": 91,
    "s": "Pa",
    "n": "Protactinium",
    "m": 231.04,
    "p": 7,
    "g": 3,
    "c": "actinide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      20,
      9,
      2
    ],
    "cfg": "[Rn] 5f² 6d¹ 7s²",
    "val": "+5, +4",
    "en": 1.5
  },
  {
    "z": 92,
    "s": "U",
    "n": "Uranium",
    "m": 238.03,
    "p": 7,
    "g": 3,
    "c": "actinide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      21,
      9,
      2
    ],
    "cfg": "[Rn] 5f³ 6d¹ 7s²",
    "val": "+6, +4, +3",
    "en": 1.38
  },
  {
    "z": 93,
    "s": "Np",
    "n": "Neptunium",
    "m": 237,
    "p": 7,
    "g": 3,
    "c": "actinide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      22,
      9,
      2
    ],
    "cfg": "[Rn] 5f⁴ 6d¹ 7s²",
    "val": "+5, +6",
    "en": 1.36
  },
  {
    "z": 94,
    "s": "Pu",
    "n": "Plutonium",
    "m": 244,
    "p": 7,
    "g": 3,
    "c": "actinide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      24,
      8,
      2
    ],
    "cfg": "[Rn] 5f⁶ 7s²",
    "val": "+4, +6",
    "en": 1.28
  },
  {
    "z": 95,
    "s": "Am",
    "n": "Americium",
    "m": 243,
    "p": 7,
    "g": 3,
    "c": "actinide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      25,
      8,
      2
    ],
    "cfg": "[Rn] 5f⁷ 7s²",
    "val": "+3, +4",
    "en": 1.13
  },
  {
    "z": 96,
    "s": "Cm",
    "n": "Curium",
    "m": 247,
    "p": 7,
    "g": 3,
    "c": "actinide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      25,
      9,
      2
    ],
    "cfg": "[Rn] 5f⁷ 6d¹ 7s²",
    "val": "+3",
    "en": 1.28
  },
  {
    "z": 97,
    "s": "Bk",
    "n": "Berkelium",
    "m": 247,
    "p": 7,
    "g": 3,
    "c": "actinide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      27,
      8,
      2
    ],
    "cfg": "[Rn] 5f⁹ 7s²",
    "val": "+3, +4",
    "en": 1.3
  },
  {
    "z": 98,
    "s": "Cf",
    "n": "Californium",
    "m": 251,
    "p": 7,
    "g": 3,
    "c": "actinide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      28,
      8,
      2
    ],
    "cfg": "[Rn] 5f¹⁰ 7s²",
    "val": "+3",
    "en": 1.3
  },
  {
    "z": 99,
    "s": "Es",
    "n": "Einsteinium",
    "m": 252,
    "p": 7,
    "g": 3,
    "c": "actinide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      29,
      8,
      2
    ],
    "cfg": "[Rn] 5f¹¹ 7s²",
    "val": "+3",
    "en": 1.3
  },
  {
    "z": 100,
    "s": "Fm",
    "n": "Fermium",
    "m": 257,
    "p": 7,
    "g": 3,
    "c": "actinide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      30,
      8,
      2
    ],
    "cfg": "[Rn] 5f¹² 7s²",
    "val": "+3",
    "en": 1.3
  },
  {
    "z": 101,
    "s": "Md",
    "n": "Mendelevium",
    "m": 258,
    "p": 7,
    "g": 3,
    "c": "actinide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      31,
      8,
      2
    ],
    "cfg": "[Rn] 5f¹³ 7s²",
    "val": "+2, +3",
    "en": 1.3
  },
  {
    "z": 102,
    "s": "No",
    "n": "Nobelium",
    "m": 259,
    "p": 7,
    "g": 3,
    "c": "actinide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      32,
      8,
      2
    ],
    "cfg": "[Rn] 5f¹⁴ 7s²",
    "val": "+2, +3",
    "en": 1.3
  },
  {
    "z": 103,
    "s": "Lr",
    "n": "Lawrencium",
    "m": 266,
    "p": 7,
    "g": 3,
    "c": "actinide",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      32,
      8,
      3
    ],
    "cfg": "[Rn] 5f¹⁴ 7s² 7p¹",
    "val": "+3",
    "en": 1.3
  },
  {
    "z": 104,
    "s": "Rf",
    "n": "Rutherfordium",
    "m": 267,
    "p": 7,
    "g": 4,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      32,
      10,
      2
    ],
    "cfg": "[Rn] 5f¹⁴ 6d² 7s²",
    "val": "+4",
    "en": null
  },
  {
    "z": 105,
    "s": "Db",
    "n": "Dubnium",
    "m": 268,
    "p": 7,
    "g": 5,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      32,
      11,
      2
    ],
    "cfg": "[Rn] 5f¹⁴ 6d³ 7s²",
    "val": "+5",
    "en": null
  },
  {
    "z": 106,
    "s": "Sg",
    "n": "Seaborgium",
    "m": 269,
    "p": 7,
    "g": 6,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      32,
      12,
      2
    ],
    "cfg": "[Rn] 5f¹⁴ 6d⁴ 7s²",
    "val": "+6",
    "en": null
  },
  {
    "z": 107,
    "s": "Bh",
    "n": "Bohrium",
    "m": 270,
    "p": 7,
    "g": 7,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      32,
      13,
      2
    ],
    "cfg": "[Rn] 5f¹⁴ 6d⁵ 7s²",
    "val": "+7",
    "en": null
  },
  {
    "z": 108,
    "s": "Hs",
    "n": "Hassium",
    "m": 277,
    "p": 7,
    "g": 8,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      32,
      14,
      2
    ],
    "cfg": "[Rn] 5f¹⁴ 6d⁶ 7s²",
    "val": "+8",
    "en": null
  },
  {
    "z": 109,
    "s": "Mt",
    "n": "Meitnerium",
    "m": 278,
    "p": 7,
    "g": 9,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      32,
      15,
      2
    ],
    "cfg": "[Rn] 5f¹⁴ 6d⁷ 7s²",
    "val": "+9",
    "en": null
  },
  {
    "z": 110,
    "s": "Ds",
    "n": "Darmstadtium",
    "m": 281,
    "p": 7,
    "g": 10,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      32,
      17,
      1
    ],
    "cfg": "[Rn] 5f¹⁴ 6d⁸ 7s²",
    "val": "+8",
    "en": null
  },
  {
    "z": 111,
    "s": "Rg",
    "n": "Roentgenium",
    "m": 282,
    "p": 7,
    "g": 11,
    "c": "transition-metal",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      32,
      18,
      1
    ],
    "cfg": "[Rn] 5f¹⁴ 6d⁹ 7s²",
    "val": "+3",
    "en": null
  },
  {
    "z": 112,
    "s": "Cn",
    "n": "Copernicium",
    "m": 285,
    "p": 7,
    "g": 12,
    "c": "transition-metal",
    "st": "liquid",
    "shells": [
      2,
      8,
      18,
      32,
      32,
      18,
      2
    ],
    "cfg": "[Rn] 5f¹⁴ 6d¹⁰ 7s²",
    "val": "+2",
    "en": null
  },
  {
    "z": 113,
    "s": "Nh",
    "n": "Nihonium",
    "m": 286,
    "p": 7,
    "g": 13,
    "c": "post-transition",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      32,
      18,
      3
    ],
    "cfg": "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹",
    "val": "+1",
    "en": null
  },
  {
    "z": 114,
    "s": "Fl",
    "n": "Flerovium",
    "m": 289,
    "p": 7,
    "g": 14,
    "c": "post-transition",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      32,
      18,
      4
    ],
    "cfg": "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²",
    "val": "+2",
    "en": null
  },
  {
    "z": 115,
    "s": "Mc",
    "n": "Moscovium",
    "m": 290,
    "p": 7,
    "g": 15,
    "c": "post-transition",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      32,
      18,
      5
    ],
    "cfg": "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³",
    "val": "+1, +3",
    "en": null
  },
  {
    "z": 116,
    "s": "Lv",
    "n": "Livermorium",
    "m": 293,
    "p": 7,
    "g": 16,
    "c": "post-transition",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      32,
      18,
      6
    ],
    "cfg": "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴",
    "val": "+2, +4",
    "en": null
  },
  {
    "z": 117,
    "s": "Ts",
    "n": "Tennessine",
    "m": 294,
    "p": 7,
    "g": 17,
    "c": "halogen",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      32,
      18,
      7
    ],
    "cfg": "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵",
    "val": "-1, +1, +3",
    "en": null
  },
  {
    "z": 118,
    "s": "Og",
    "n": "Oganesson",
    "m": 294,
    "p": 7,
    "g": 18,
    "c": "noble-gas",
    "st": "solid",
    "shells": [
      2,
      8,
      18,
      32,
      32,
      18,
      8
    ],
    "cfg": "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶",
    "val": "0, +2, +4",
    "en": null
  }
];

export const FIRST_20_ELEMENTS = ELEMENTS.slice(0, 20);

export function getElementBySymbol(symbol: string): ChemicalElement | undefined {
  const norm = symbol.trim().toLowerCase();
  return ELEMENTS.find((el) => el.s.toLowerCase() === norm);
}

export function getElementByAtomicNumber(z: number): ChemicalElement | undefined {
  return ELEMENTS.find((el) => el.z === z);
}
