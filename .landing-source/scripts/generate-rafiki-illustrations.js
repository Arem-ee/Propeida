import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const outputDirs = ['assets', 'public/assets'];
outputDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Common reusable defs for Rafiki styling
function getDefs() {
  return `
    <defs>
      <!-- Skin tone gradients: Diverse Nigerian deep chocolate & rich brown tones -->
      <linearGradient id="skin-1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4E2B18"/>
        <stop offset="100%" stop-color="#361B0E"/>
      </linearGradient>
      <linearGradient id="skin-2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5E351E"/>
        <stop offset="100%" stop-color="#422212"/>
      </linearGradient>
      <linearGradient id="skin-3" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#703E22"/>
        <stop offset="100%" stop-color="#522B15"/>
      </linearGradient>
      <linearGradient id="skin-4" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#402012"/>
        <stop offset="100%" stop-color="#2C1409"/>
      </linearGradient>
      <linearGradient id="skin-5" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#64361C"/>
        <stop offset="100%" stop-color="#492512"/>
      </linearGradient>
      <linearGradient id="skin-6" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#552C16"/>
        <stop offset="100%" stop-color="#3B1C0E"/>
      </linearGradient>
      <linearGradient id="skin-7" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7B4527"/>
        <stop offset="100%" stop-color="#5C3018"/>
      </linearGradient>

      <!-- Clothing Gradients (Rafiki vibrant palette) -->
      <linearGradient id="grad-amber" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F59E0B"/><stop offset="100%" stop-color="#D97706"/>
      </linearGradient>
      <linearGradient id="grad-teal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0D9488"/><stop offset="100%" stop-color="#0F766E"/>
      </linearGradient>
      <linearGradient id="grad-coral" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F43F5E"/><stop offset="100%" stop-color="#E11D48"/>
      </linearGradient>
      <linearGradient id="grad-indigo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6366F1"/><stop offset="100%" stop-color="#4F46E5"/>
      </linearGradient>
      <linearGradient id="grad-emerald" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#10B981"/><stop offset="100%" stop-color="#059669"/>
      </linearGradient>
      <linearGradient id="grad-purple" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8B5CF6"/><stop offset="100%" stop-color="#7C3AED"/>
      </linearGradient>
      <linearGradient id="grad-blue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3B82F6"/><stop offset="100%" stop-color="#1D4ED8"/>
      </linearGradient>
      <linearGradient id="grad-orange" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FB923C"/><stop offset="100%" stop-color="#EA580C"/>
      </linearGradient>
      <linearGradient id="grad-slate" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#475569"/><stop offset="100%" stop-color="#1E293B"/>
      </linearGradient>

      <!-- Soft hair shading -->
      <linearGradient id="hair-dark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#24140D"/><stop offset="100%" stop-color="#130B07"/>
      </linearGradient>
    </defs>
  `;
}

// ---------------------------------------------------------------------------
// 1. STUDENT 1: Nigerian girl cross-legged reading a thick book
// ---------------------------------------------------------------------------
function getStudent1Svg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 600" width="500" height="600">
    ${getDefs()}
    <g id="student-1-figure">
      <!-- Shadow on floor -->
      <ellipse cx="250" cy="580" rx="180" ry="16" fill="#1E293B" opacity="0.08"/>

      <!-- Cross-legged trousers (Teal culottes) -->
      <path d="M 120 530 C 110 470 180 460 250 460 C 320 460 390 470 380 530 C 365 570 300 580 250 580 C 200 580 135 570 120 530 Z" fill="url(#grad-teal)"/>
      <!-- Trouser fold shadows -->
      <path d="M 160 510 Q 250 535 340 510 Q 250 545 160 510 Z" fill="#0F766E"/>
      <path d="M 190 535 Q 250 555 310 535" stroke="#0B5751" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Stylish shoes / flats peeking out -->
      <ellipse cx="140" cy="550" rx="22" ry="12" fill="#24140D" transform="rotate(-15 140 550)"/>
      <ellipse cx="138" cy="548" rx="16" ry="6" fill="#F59E0B" transform="rotate(-15 138 548)"/>
      <ellipse cx="360" cy="550" rx="22" ry="12" fill="#24140D" transform="rotate(15 360 550)"/>
      <ellipse cx="362" cy="548" rx="16" ry="6" fill="#F59E0B" transform="rotate(15 362 548)"/>

      <!-- Torso / Amber Mustard Blouse -->
      <path d="M 195 330 C 185 380 175 440 180 480 L 320 480 C 325 440 315 380 305 330 Z" fill="url(#grad-amber)"/>
      <!-- Blouse drape folds -->
      <path d="M 210 370 Q 250 410 290 370" stroke="#D97706" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M 200 420 Q 250 450 300 420" stroke="#D97706" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 245 340 L 245 475" stroke="#B45309" stroke-width="2.5" stroke-dasharray="4 4"/>

      <!-- Left Arm & Forearm holding book -->
      <path d="M 195 340 C 150 380 160 450 205 455" stroke="url(#skin-1)" stroke-width="32" stroke-linecap="round" fill="none"/>
      <!-- Sleeve cuff -->
      <ellipse cx="180" cy="380" rx="20" ry="14" fill="#D97706" transform="rotate(-30 180 380)"/>

      <!-- Right Arm & Forearm holding book -->
      <path d="M 305 340 C 350 380 340 450 295 455" stroke="url(#skin-1)" stroke-width="32" stroke-linecap="round" fill="none"/>
      <!-- Sleeve cuff -->
      <ellipse cx="320" cy="380" rx="20" ry="14" fill="#D97706" transform="rotate(30 320 380)"/>

      <!-- Thick Open Book -->
      <!-- Cover -->
      <path d="M 170 435 Q 250 455 330 435 L 335 485 Q 250 505 165 485 Z" fill="#1E3A8A"/>
      <!-- Pages thickness -->
      <path d="M 172 438 Q 250 457 328 438 L 325 478 Q 250 497 175 478 Z" fill="#FEF3C7"/>
      <line x1="250" y1="448" x2="250" y2="492" stroke="#D97706" stroke-width="3"/>
      <!-- Page text lines -->
      <line x1="195" y1="452" x2="235" y2="455" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="195" y1="462" x2="230" y2="465" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="195" y1="472" x2="232" y2="475" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="265" y1="455" x2="305" y2="452" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="268" y1="465" x2="305" y2="462" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="265" y1="475" x2="302" y2="472" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Silk bookmark ribbon hanging down -->
      <path d="M 250 490 Q 255 520 245 540 L 250 545 L 255 540 Q 248 520 250 490 Z" fill="#EF4444"/>

      <!-- Hands with anatomical fingers clasping the book edges -->
      <!-- Left hand -->
      <g transform="translate(195, 435)">
        <ellipse cx="10" cy="15" rx="14" ry="12" fill="url(#skin-1)"/>
        <!-- Thumb -->
        <path d="M 12 5 Q 18 8 20 18" stroke="url(#skin-1)" stroke-width="7" stroke-linecap="round" fill="none"/>
        <!-- Fingers curled over top edge -->
        <circle cx="22" cy="18" r="4.5" fill="url(#skin-1)"/>
        <circle cx="20" cy="26" r="4.5" fill="url(#skin-1)"/>
        <circle cx="16" cy="33" r="4" fill="url(#skin-1)"/>
      </g>
      <!-- Right hand -->
      <g transform="translate(275, 435)">
        <ellipse cx="20" cy="15" rx="14" ry="12" fill="url(#skin-1)"/>
        <!-- Thumb -->
        <path d="M 18 5 Q 12 8 10 18" stroke="url(#skin-1)" stroke-width="7" stroke-linecap="round" fill="none"/>
        <!-- Fingers curled over top edge -->
        <circle cx="8" cy="18" r="4.5" fill="url(#skin-1)"/>
        <circle cx="10" cy="26" r="4.5" fill="url(#skin-1)"/>
        <circle cx="14" cy="33" r="4" fill="url(#skin-1)"/>
      </g>

      <!-- Neck -->
      <path d="M 235 290 L 235 340 Q 250 348 265 340 L 265 290 Z" fill="url(#skin-1)"/>
      <!-- Collarbone shadow -->
      <path d="M 238 335 Q 250 342 262 335" stroke="#361B0E" stroke-width="2.5" fill="none"/>

      <!-- Head / Face (Chocolate complexion) -->
      <ellipse cx="250" cy="245" rx="42" ry="52" fill="url(#skin-1)"/>
      <!-- Soft cheek shading -->
      <ellipse cx="230" cy="255" rx="14" ry="10" fill="#3D1D0F" opacity="0.4"/>
      <ellipse cx="270" cy="255" rx="14" ry="10" fill="#3D1D0F" opacity="0.4"/>

      <!-- Facial features: Rafiki drawn expressive face -->
      <!-- Eyebrows -->
      <path d="M 222 225 Q 234 220 244 225" stroke="#170F0B" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M 256 225 Q 266 220 278 225" stroke="#170F0B" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- Eyes looking down lovingly at book -->
      <ellipse cx="233" cy="237" rx="6" ry="4" fill="#FFFFFF"/>
      <circle cx="233" cy="238" r="3.2" fill="#170F0B"/>
      <circle cx="232" cy="236.5" r="1.1" fill="#FFFFFF"/>
      <path d="M 226 235 Q 233 231 240 235" stroke="#170F0B" stroke-width="2" fill="none"/>

      <ellipse cx="267" cy="237" rx="6" ry="4" fill="#FFFFFF"/>
      <circle cx="267" cy="238" r="3.2" fill="#170F0B"/>
      <circle cx="266" cy="236.5" r="1.1" fill="#FFFFFF"/>
      <path d="M 260 235 Q 267 231 274 235" stroke="#170F0B" stroke-width="2" fill="none"/>

      <!-- Nose -->
      <path d="M 248 244 Q 253 255 246 257 Q 252 258 255 256" stroke="#2C1409" stroke-width="2.5" fill="none" stroke-linecap="round"/>

      <!-- Smiling Mouth -->
      <path d="M 238 272 Q 250 282 262 272" stroke="#241007" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 241 273 Q 250 279 259 273" fill="#FFFFFF"/>

      <!-- Hair: Braided crown bun & hanging braids -->
      <ellipse cx="250" cy="180" rx="42" ry="32" fill="url(#hair-dark)"/>
      <path d="M 205 230 C 205 180 295 180 295 230 C 285 190 215 190 205 230 Z" fill="url(#hair-dark)"/>
      <!-- Braided textures -->
      <path d="M 220 185 Q 250 165 280 185" stroke="#3D2114" stroke-width="4" fill="none"/>
      <path d="M 225 195 Q 250 178 275 195" stroke="#3D2114" stroke-width="4" fill="none"/>
      <!-- Hanging box braids with golden cuffs -->
      <path d="M 210 230 Q 190 280 195 340" stroke="url(#hair-dark)" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M 220 235 Q 205 290 208 350" stroke="url(#hair-dark)" stroke-width="9" stroke-linecap="round" fill="none"/>
      <path d="M 290 230 Q 310 280 305 340" stroke="url(#hair-dark)" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M 280 235 Q 295 290 292 350" stroke="url(#hair-dark)" stroke-width="9" stroke-linecap="round" fill="none"/>
      <!-- Gold cuffs -->
      <rect x="190" y="295" width="10" height="7" rx="3" fill="#F59E0B"/>
      <rect x="204" y="305" width="9" height="6" rx="3" fill="#F59E0B"/>
      <rect x="300" y="295" width="10" height="7" rx="3" fill="#F59E0B"/>
      <rect x="287" y="305" width="9" height="6" rx="3" fill="#F59E0B"/>
    </g>
  </svg>`;
}

// ---------------------------------------------------------------------------
// 2. STUDENT 2: Nigerian boy lying on stomach reading, feet in air
// ---------------------------------------------------------------------------
function getStudent2Svg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
    ${getDefs()}
    <g id="student-2-figure">
      <!-- Shadow under chest, elbows and body -->
      <ellipse cx="320" cy="425" rx="240" ry="16" fill="#1E293B" opacity="0.08"/>

      <!-- Sneaker feet kicked up in air (left and right) -->
      <g transform="translate(60, 100)">
        <!-- Back leg jeans -->
        <path d="M 75 220 C 50 170 45 100 80 70 C 95 90 75 160 115 210" fill="url(#grad-blue)"/>
        <!-- Sneaker 1 (Red & White) -->
        <path d="M 65 65 C 75 45 100 50 105 70 C 95 80 75 80 65 65 Z" fill="#EF4444"/>
        <path d="M 68 70 L 105 70 L 100 78 L 65 75 Z" fill="#FFFFFF"/>
        <circle cx="85" cy="62" r="3" fill="#FFFFFF"/>
      </g>
      <g transform="translate(100, 120)">
        <!-- Fore leg jeans -->
        <path d="M 85 200 C 65 150 65 95 98 75 C 110 95 95 150 130 195" fill="url(#grad-indigo)"/>
        <!-- Sneaker 2 -->
        <path d="M 85 70 C 95 50 120 55 125 75 C 115 85 95 85 85 70 Z" fill="#EF4444"/>
        <path d="M 88 75 L 125 75 L 120 83 L 85 80 Z" fill="#FFFFFF"/>
        <circle cx="105" cy="67" r="3" fill="#FFFFFF"/>
      </g>

      <!-- Torso in Orange / Coral Polo shirt -->
      <path d="M 170 340 C 190 280 280 270 380 290 L 400 375 C 320 395 200 395 170 340 Z" fill="url(#grad-orange)"/>
      <!-- Polo collar and folds -->
      <path d="M 370 295 L 395 320 L 365 330 Z" fill="#EA580C"/>
      <path d="M 230 330 Q 300 310 370 340" stroke="#C2410C" stroke-width="4" fill="none"/>

      <!-- Left arm propped on ground supporting chin -->
      <path d="M 350 330 Q 400 390 435 345" stroke="url(#skin-2)" stroke-width="32" stroke-linecap="round" fill="none"/>
      <!-- Left Hand cradling jaw -->
      <g transform="translate(425, 330)">
        <ellipse cx="14" cy="14" rx="15" ry="13" fill="url(#skin-2)"/>
        <!-- Fingers curled along cheek -->
        <path d="M 10 2 Q 18 8 20 22" stroke="url(#skin-2)" stroke-width="7" stroke-linecap="round" fill="none"/>
        <circle cx="22" cy="12" r="4.5" fill="url(#skin-2)"/>
        <circle cx="22" cy="20" r="4.5" fill="url(#skin-2)"/>
      </g>

      <!-- Right arm reaching forward towards book page -->
      <path d="M 310 345 Q 360 405 405 400" stroke="url(#skin-2)" stroke-width="28" stroke-linecap="round" fill="none"/>
      <!-- Right hand resting on page edge turning it -->
      <g transform="translate(405, 390)">
        <ellipse cx="12" cy="8" rx="14" ry="10" fill="url(#skin-2)"/>
        <path d="M 18 4 Q 28 6 34 14" stroke="url(#skin-2)" stroke-width="6" stroke-linecap="round" fill="none"/>
        <circle cx="26" cy="16" r="4" fill="url(#skin-2)"/>
      </g>

      <!-- Open Book flat on the ground -->
      <path d="M 390 405 Q 460 395 530 405 L 540 430 Q 460 420 380 430 Z" fill="url(#grad-emerald)"/>
      <path d="M 395 407 Q 460 398 525 407 L 522 426 Q 460 417 388 426 Z" fill="#F8FAFC"/>
      <line x1="460" y1="400" x2="460" y2="425" stroke="#059669" stroke-width="3"/>
      <!-- Text lines -->
      <line x1="408" y1="412" x2="445" y2="412" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
      <line x1="408" y1="418" x2="440" y2="418" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
      <line x1="475" y1="412" x2="512" y2="412" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
      <line x1="475" y1="418" x2="510" y2="418" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>

      <!-- Head / Face (profile / 3/4 tilted down towards book) -->
      <ellipse cx="445" cy="275" rx="38" ry="42" fill="url(#skin-2)"/>
      <!-- Ear -->
      <ellipse cx="418" cy="280" rx="9" ry="12" fill="url(#skin-2)"/>
      <path d="M 418 274 Q 422 280 417 286" stroke="#422212" stroke-width="2" fill="none"/>

      <!-- Hair: Sharp fade haircut with wave texture -->
      <path d="M 420 255 C 420 225 478 225 482 250 C 482 265 470 270 460 270 C 445 270 420 268 420 255 Z" fill="url(#hair-dark)"/>
      <path d="M 430 240 Q 455 232 475 242" stroke="#3D2114" stroke-width="3" fill="none"/>

      <!-- Facial features looking down -->
      <!-- Eyebrow -->
      <path d="M 452 262 Q 464 258 474 264" stroke="#170F0B" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- Eye -->
      <ellipse cx="463" cy="272" rx="5.5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="464" cy="273" r="3" fill="#170F0B"/>
      <circle cx="463" cy="271.5" r="1" fill="#FFFFFF"/>
      <!-- Nose profile -->
      <path d="M 478 274 Q 486 284 478 288" stroke="#381D14" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Mouth smiling into hand -->
      <path d="M 466 300 Q 476 305 484 298" stroke="#2B140A" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>
  </svg>`;
}

// ---------------------------------------------------------------------------
// 3. STUDENT 3: Nigerian girl sitting on a tall stack of books, writing
// ---------------------------------------------------------------------------
function getStudent3Svg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 620" width="520" height="620">
    ${getDefs()}
    <g id="student-3-figure">
      <!-- Shadow on floor -->
      <ellipse cx="260" cy="600" rx="160" ry="14" fill="#1E293B" opacity="0.08"/>

      <!-- TALL STACK OF 5 VIBRANT COLORFUL TEXTBOOKS -->
      <!-- Book 1 (bottom, Emerald) -->
      <path d="M 140 560 L 380 560 L 375 595 L 135 595 Z" fill="url(#grad-emerald)"/>
      <rect x="150" y="565" width="215" height="25" rx="3" fill="#FEF3C7"/>
      <line x1="145" y1="560" x2="145" y2="595" stroke="#059669" stroke-width="4"/>

      <!-- Book 2 (Indigo) -->
      <path d="M 150 520 L 370 520 L 365 558 L 145 558 Z" fill="url(#grad-indigo)"/>
      <rect x="160" y="525" width="195" height="26" rx="3" fill="#F8FAFC"/>
      <line x1="155" y1="520" x2="155" y2="558" stroke="#4F46E5" stroke-width="4"/>

      <!-- Book 3 (Coral Red) -->
      <path d="M 135 480 L 385 480 L 380 518 L 130 518 Z" fill="url(#grad-coral)"/>
      <rect x="145" y="485" width="225" height="26" rx="3" fill="#FEF3C7"/>
      <line x1="140" y1="480" x2="140" y2="518" stroke="#E11D48" stroke-width="4"/>

      <!-- Book 4 (Amber Gold) -->
      <path d="M 155 440 L 365 440 L 360 478 L 150 478 Z" fill="url(#grad-amber)"/>
      <rect x="165" y="445" width="185" height="26" rx="3" fill="#F8FAFC"/>
      <line x1="160" y1="440" x2="160" y2="478" stroke="#D97706" stroke-width="4"/>

      <!-- Book 5 (Top, Royal Blue) -->
      <path d="M 145 400 L 375 400 L 370 438 L 140 438 Z" fill="url(#grad-blue)"/>
      <rect x="155" y="405" width="205" height="26" rx="3" fill="#FEF3C7"/>
      <line x1="150" y1="400" x2="150" y2="438" stroke="#1D4ED8" stroke-width="4"/>

      <!-- Girl sitting on top of books -->
      <!-- Legs dangling down in front of book stack -->
      <g id="dangling-legs">
        <!-- Left leg in fitted dark navy joggers -->
        <path d="M 200 420 L 195 530 L 225 530 L 230 420 Z" fill="url(#grad-slate)"/>
        <!-- Right leg -->
        <path d="M 270 420 L 265 520 L 295 520 L 300 420 Z" fill="url(#grad-slate)"/>
        <!-- Knee and fold shadows -->
        <ellipse cx="212" cy="460" rx="16" ry="12" fill="#0F172A" opacity="0.3"/>
        <ellipse cx="282" cy="460" rx="16" ry="12" fill="#0F172A" opacity="0.3"/>
        <!-- White sneakers with purple trim -->
        <path d="M 188 530 C 190 550 230 550 235 530 Z" fill="#FFFFFF"/>
        <rect x="190" y="542" width="44" height="6" rx="2" fill="#8B5CF6"/>
        <path d="M 258 520 C 260 540 300 540 305 520 Z" fill="#FFFFFF"/>
        <rect x="260" y="532" width="44" height="6" rx="2" fill="#8B5CF6"/>
      </g>

      <!-- Torso in Lavender Hoodie -->
      <path d="M 190 280 C 180 340 185 410 190 430 L 310 430 C 315 410 320 340 310 280 Z" fill="url(#grad-purple)"/>
      <!-- Hoodie pouch pocket -->
      <path d="M 215 360 L 285 360 L 295 405 L 205 405 Z" fill="#7C3AED"/>
      <!-- Hoodie strings -->
      <path d="M 235 290 Q 230 330 235 340" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 265 290 Q 270 330 265 340" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Spiral Notebook on lap -->
      <rect x="200" y="380" width="100" height="70" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
      <!-- Spiral binding -->
      <line x1="200" y1="385" x2="200" y2="445" stroke="#64748B" stroke-width="4" stroke-dasharray="2 4"/>
      <line x1="215" y1="395" x2="285" y2="395" stroke="#94A3B8" stroke-width="2"/>
      <line x1="215" y1="405" x2="275" y2="405" stroke="#94A3B8" stroke-width="2"/>
      <line x1="215" y1="415" x2="280" y2="415" stroke="#94A3B8" stroke-width="2"/>

      <!-- Arms: Left arm stabilizing notebook, Right arm holding pen -->
      <!-- Left arm -->
      <path d="M 190 290 Q 155 350 205 390" stroke="url(#skin-3)" stroke-width="28" stroke-linecap="round" fill="none"/>
      <!-- Left hand on notebook edge -->
      <ellipse cx="208" cy="390" rx="14" ry="10" fill="url(#skin-3)"/>
      <path d="M 215 385 Q 225 390 228 400" stroke="url(#skin-3)" stroke-width="5" stroke-linecap="round" fill="none"/>

      <!-- Right arm writing -->
      <path d="M 310 290 Q 345 350 285 390" stroke="url(#skin-3)" stroke-width="28" stroke-linecap="round" fill="none"/>
      <!-- Right hand holding pen -->
      <ellipse cx="280" cy="390" rx="14" ry="10" fill="url(#skin-3)"/>
      <!-- Blue sleek pen -->
      <line x1="265" y1="375" x2="285" y2="410" stroke="#2563EB" stroke-width="4" stroke-linecap="round"/>
      <circle cx="285" cy="410" r="2" fill="#D97706"/>

      <!-- Neck -->
      <rect x="238" y="245" width="24" height="40" rx="6" fill="url(#skin-3)"/>

      <!-- Head / Face (Warm caramel chocolate) -->
      <ellipse cx="250" cy="205" rx="38" ry="46" fill="url(#skin-3)"/>

      <!-- Expressive Face looking down at notes -->
      <!-- Eyebrows -->
      <path d="M 224 188 Q 236 182 245 187" stroke="#170F0B" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 255 187 Q 264 182 276 188" stroke="#170F0B" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Eyes focused -->
      <ellipse cx="234" cy="198" rx="5.5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="235" cy="199" r="3" fill="#170F0B"/>
      <ellipse cx="266" cy="198" rx="5.5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="265" cy="199" r="3" fill="#170F0B"/>
      <!-- Nose -->
      <path d="M 248 206 Q 254 216 248 218" stroke="#422212" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Soft focused smile -->
      <path d="M 240 230 Q 250 238 260 230" stroke="#361B0E" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Hair: Large Curly Afro Puff with purple ribbon -->
      <ellipse cx="250" cy="135" rx="56" ry="48" fill="url(#hair-dark)"/>
      <!-- Afro curl textures -->
      <circle cx="210" cy="130" r="14" fill="url(#hair-dark)"/>
      <circle cx="290" cy="130" r="14" fill="url(#hair-dark)"/>
      <circle cx="230" cy="100" r="16" fill="url(#hair-dark)"/>
      <circle cx="270" cy="100" r="16" fill="url(#hair-dark)"/>
      <circle cx="250" cy="95" r="16" fill="url(#hair-dark)"/>
      <!-- Lavender ribbon band holding the puff -->
      <ellipse cx="250" cy="165" rx="36" ry="12" fill="#8B5CF6"/>
      <circle cx="282" cy="165" r="6" fill="#F59E0B"/>
    </g>
  </svg>`;
}

// ---------------------------------------------------------------------------
// 4. STUDENT 4: Nigerian boy sitting against shade tree reading digital tablet
// ---------------------------------------------------------------------------
function getStudent4Svg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 600" width="540" height="600">
    ${getDefs()}
    <g id="student-4-figure">
      <!-- Ground shadow -->
      <ellipse cx="270" cy="580" rx="220" ry="16" fill="#1E293B" opacity="0.08"/>

      <!-- Organic Shade Tree (Left & Background) -->
      <!-- Smooth, tapered tree canopy (lush cloud circles, completely organic, no flat cuts) -->
      <g id="tree-canopy">
        <circle cx="120" cy="140" r="70" fill="#059669"/>
        <circle cx="180" cy="110" r="85" fill="#10B981"/>
        <circle cx="110" cy="210" r="65" fill="#047857"/>
        <circle cx="180" cy="200" r="80" fill="#059669"/>
        <circle cx="250" cy="150" r="65" fill="#10B981"/>
        <!-- Soft highlight canopy layers -->
        <circle cx="170" cy="100" r="55" fill="#34D399" opacity="0.3"/>
        <circle cx="130" cy="150" r="45" fill="#34D399" opacity="0.2"/>
      </g>

      <!-- Tree Trunk: gracefully curving down and tapering -->
      <path d="M 120 220 Q 150 350 135 580 L 80 580 Q 70 360 85 240 Z" fill="#78350F"/>
      <!-- Bark texture lines and shadow -->
      <path d="M 105 250 Q 130 380 120 575" stroke="#451A03" stroke-width="4" fill="none"/>
      <path d="M 90 280 Q 110 400 98 575" stroke="#451A03" stroke-width="3" fill="none"/>
      <!-- Curved roots tapering into ground -->
      <path d="M 80 560 Q 60 575 40 580 L 140 580 Q 160 575 145 560 Z" fill="#451A03"/>

      <!-- Boy leaning back against the trunk -->
      <!-- Legs sitting on ground, one knee propped up -->
      <!-- Khaki pants / chinos -->
      <path d="M 170 510 C 170 450 250 440 320 480 L 330 550 C 280 580 180 580 170 510 Z" fill="url(#grad-amber)"/>
      <path d="M 230 460 Q 280 430 350 510 L 340 560 Q 270 500 230 460 Z" fill="#D97706"/>
      <!-- Shoes / Boots touching baseline -->
      <ellipse cx="340" cy="565" rx="26" ry="14" fill="#3B1E12"/>
      <ellipse cx="280" cy="572" rx="26" ry="12" fill="#3B1E12"/>

      <!-- Torso: Forest green jacket over light shirt -->
      <path d="M 160 350 C 145 420 160 480 190 520 L 290 520 C 310 470 300 410 270 350 Z" fill="url(#grad-emerald)"/>
      <!-- Inner shirt stripe and zip -->
      <line x1="215" y1="360" x2="235" y2="515" stroke="#F8FAFC" stroke-width="8"/>
      <line x1="225" y1="360" x2="225" y2="515" stroke="#D97706" stroke-width="2.5"/>

      <!-- Arms holding digital tablet -->
      <!-- Left arm -->
      <path d="M 170 360 Q 170 440 230 460" stroke="url(#skin-4)" stroke-width="30" stroke-linecap="round" fill="none"/>
      <!-- Right arm -->
      <path d="M 270 360 Q 300 430 270 460" stroke="url(#skin-4)" stroke-width="30" stroke-linecap="round" fill="none"/>

      <!-- Modern Slim Digital Tablet -->
      <rect x="220" y="420" width="90" height="65" rx="6" fill="#0284C7" transform="rotate(-10 265 452)"/>
      <rect x="225" y="424" width="80" height="57" rx="4" fill="#E0F2FE" transform="rotate(-10 265 452)"/>
      <!-- Glowing graph / quiz UI on tablet -->
      <rect x="235" y="435" width="30" height="8" rx="2" fill="#0284C7" transform="rotate(-10 265 452)"/>
      <circle cx="280" cy="450" r="10" fill="#38BDF8" transform="rotate(-10 265 452)"/>

      <!-- Hands holding tablet -->
      <circle cx="225" cy="460" r="12" fill="url(#skin-4)"/>
      <circle cx="295" cy="450" r="12" fill="url(#skin-4)"/>
      <!-- Tapping index finger -->
      <path d="M 285 445 L 275 440" stroke="url(#skin-4)" stroke-width="6" stroke-linecap="round"/>

      <!-- Neck & Head tilted comfortably -->
      <rect x="195" y="310" width="22" height="35" rx="5" fill="url(#skin-4)"/>
      <ellipse cx="205" cy="270" rx="36" ry="44" fill="url(#skin-4)"/>

      <!-- Facial features -->
      <!-- Eyebrows -->
      <path d="M 190 250 Q 200 245 210 250" stroke="#170F0B" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 218 250 Q 228 245 238 250" stroke="#170F0B" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Eyes looking down at tablet screen -->
      <ellipse cx="198" cy="260" rx="5.5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="199" cy="261" r="3" fill="#170F0B"/>
      <ellipse cx="228" cy="260" rx="5.5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="227" cy="261" r="3" fill="#170F0B"/>
      <!-- Nose -->
      <path d="M 214 266 Q 220 276 215 278" stroke="#2C1409" stroke-width="2.5" fill="none"/>
      <!-- Delighted smile -->
      <path d="M 205 292 Q 215 300 225 292" stroke="#241007" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Hair: Textured short twists / locks -->
      <path d="M 172 255 C 172 210 240 210 242 255 C 235 230 180 230 172 255 Z" fill="url(#hair-dark)"/>
      <circle cx="185" cy="225" r="8" fill="url(#hair-dark)"/>
      <circle cx="200" cy="218" r="9" fill="url(#hair-dark)"/>
      <circle cx="218" cy="220" r="9" fill="url(#hair-dark)"/>
      <circle cx="232" cy="228" r="8" fill="url(#hair-dark)"/>
    </g>
  </svg>`;
}

// ---------------------------------------------------------------------------
// 5. STUDENT 5: Nigerian girl standing holding book close to face reading intently
// ---------------------------------------------------------------------------
function getStudent5Svg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 640" width="440" height="640">
    ${getDefs()}
    <g id="student-5-figure">
      <!-- Ground shadow under feet -->
      <ellipse cx="220" cy="620" rx="110" ry="12" fill="#1E293B" opacity="0.08"/>

      <!-- Legs in cream socks & stylish black loafers -->
      <g id="standing-legs">
        <!-- Pleated school skirt (Navy) -->
        <path d="M 160 360 L 280 360 L 295 440 L 145 440 Z" fill="url(#grad-indigo)"/>
        <!-- Pleats -->
        <line x1="175" y1="365" x2="170" y2="440" stroke="#3730A3" stroke-width="3"/>
        <line x1="205" y1="365" x2="205" y2="440" stroke="#3730A3" stroke-width="3"/>
        <line x1="235" y1="365" x2="240" y2="440" stroke="#3730A3" stroke-width="3"/>
        <line x1="265" y1="365" x2="275" y2="440" stroke="#3730A3" stroke-width="3"/>

        <!-- Legs (tapered calves, deep chocolate skin) -->
        <path d="M 180 440 L 185 550 L 205 550 L 205 440 Z" fill="url(#skin-5)"/>
        <path d="M 235 440 L 235 550 L 255 550 L 260 440 Z" fill="url(#skin-5)"/>
        <!-- Cream knee socks -->
        <rect x="180" y="510" width="27" height="70" rx="3" fill="#FEF3C7"/>
        <line x1="180" y1="520" x2="207" y2="520" stroke="#D97706" stroke-width="2"/>
        <rect x="233" y="510" width="27" height="70" rx="3" fill="#FEF3C7"/>
        <line x1="233" y1="520" x2="260" y2="520" stroke="#D97706" stroke-width="2"/>

        <!-- Loafers touching baseline -->
        <path d="M 175 580 C 175 600 215 600 215 580 Z" fill="#1E293B"/>
        <rect x="175" y="595" width="40" height="8" rx="2" fill="#0F172A"/>
        <path d="M 228 580 C 228 600 268 600 268 580 Z" fill="#1E293B"/>
        <rect x="228" y="595" width="40" height="8" rx="2" fill="#0F172A"/>
      </g>

      <!-- Torso: Burnt Orange Collared Blouse with Backpack Strap -->
      <path d="M 170 230 C 160 270 160 320 165 365 L 275 365 C 280 320 280 270 270 230 Z" fill="url(#grad-orange)"/>
      <!-- Backpack strap over right shoulder -->
      <path d="M 180 235 Q 175 300 170 365" stroke="#1E293B" stroke-width="12" fill="none" stroke-linecap="round"/>
      <rect x="168" y="290" width="14" height="8" rx="2" fill="#D97706"/>

      <!-- Arms raised high holding open book up to face -->
      <!-- Left arm -->
      <path d="M 175 240 Q 140 290 195 240" stroke="url(#skin-5)" stroke-width="24" stroke-linecap="round" fill="none"/>
      <!-- Right arm -->
      <path d="M 265 240 Q 300 290 245 240" stroke="url(#skin-5)" stroke-width="24" stroke-linecap="round" fill="none"/>

      <!-- Open Book held up high -->
      <g transform="translate(160, 160)">
        <path d="M 0 35 Q 60 50 120 35 L 125 75 Q 60 90 -5 75 Z" fill="#B91C1C"/>
        <path d="M 3 38 Q 60 52 117 38 L 115 71 Q 60 85 5 71 Z" fill="#FFFBEB"/>
        <line x1="60" y1="44" x2="60" y2="80" stroke="#B91C1C" stroke-width="2.5"/>
        <!-- Text -->
        <line x1="15" y1="50" x2="50" y2="52" stroke="#94A3B8" stroke-width="2"/>
        <line x1="15" y1="58" x2="48" y2="60" stroke="#94A3B8" stroke-width="2"/>
        <line x1="70" y1="52" x2="105" y2="50" stroke="#94A3B8" stroke-width="2"/>
        <line x1="72" y1="60" x2="105" y2="58" stroke="#94A3B8" stroke-width="2"/>
        <!-- Curled fingers clasping covers -->
        <circle cx="10" cy="55" r="5" fill="url(#skin-5)"/>
        <circle cx="12" cy="65" r="5" fill="url(#skin-5)"/>
        <circle cx="110" cy="55" r="5" fill="url(#skin-5)"/>
        <circle cx="108" cy="65" r="5" fill="url(#skin-5)"/>
      </g>

      <!-- Head visible behind book, eyes peeking intently over top edge -->
      <ellipse cx="220" cy="145" rx="34" ry="40" fill="url(#skin-5)"/>
      <!-- Stylish round spectacles -->
      <circle cx="206" cy="142" r="10" fill="none" stroke="#CBD5E1" stroke-width="2.5"/>
      <circle cx="234" cy="142" r="10" fill="none" stroke="#CBD5E1" stroke-width="2.5"/>
      <line x1="216" y1="142" x2="224" y2="142" stroke="#CBD5E1" stroke-width="2.5"/>

      <!-- Focused eyes behind glasses -->
      <ellipse cx="206" cy="142" rx="4" ry="3" fill="#FFFFFF"/>
      <circle cx="206" cy="143" r="2.5" fill="#170F0B"/>
      <ellipse cx="234" cy="142" rx="4" ry="3" fill="#FFFFFF"/>
      <circle cx="234" cy="143" r="2.5" fill="#170F0B"/>
      <path d="M 198 132 Q 206 128 214 132" stroke="#170F0B" stroke-width="3" fill="none"/>
      <path d="M 226 132 Q 234 128 242 132" stroke="#170F0B" stroke-width="3" fill="none"/>

      <!-- Hair: Long elegant cornrows pulled back into high ponytail -->
      <path d="M 185 140 C 185 95 255 95 255 140 Z" fill="url(#hair-dark)"/>
      <path d="M 195 130 Q 220 110 245 130" stroke="#3D2114" stroke-width="3" fill="none"/>
      <!-- Ponytail cascading back -->
      <path d="M 245 110 Q 280 130 285 200" stroke="url(#hair-dark)" stroke-width="14" stroke-linecap="round" fill="none"/>
      <circle cx="250" cy="112" r="6" fill="#F59E0B"/>
    </g>
  </svg>`;
}

// ---------------------------------------------------------------------------
// 6. STUDENT 6: Nigerian boy sitting painting on an easel
// ---------------------------------------------------------------------------
function getStudent6Svg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 600" width="540" height="600">
    ${getDefs()}
    <g id="student-6-figure">
      <!-- Ground shadow under stool and easel legs -->
      <ellipse cx="270" cy="580" rx="230" ry="16" fill="#1E293B" opacity="0.08"/>

      <!-- ART EASEL (Right side) -->
      <!-- Wooden legs of easel touching baseline -->
      <line x1="390" y1="200" x2="330" y2="580" stroke="#B45309" stroke-width="9" stroke-linecap="round"/>
      <line x1="390" y1="200" x2="450" y2="580" stroke="#B45309" stroke-width="9" stroke-linecap="round"/>
      <line x1="390" y1="180" x2="390" y2="575" stroke="#92400E" stroke-width="8" stroke-linecap="round"/>
      <!-- Shelf support -->
      <rect x="320" y="380" width="140" height="12" rx="3" fill="#78350F"/>

      <!-- Canvas Board on Easel -->
      <rect x="330" y="220" width="120" height="160" rx="6" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="3"/>
      <!-- Educational artwork / Nigeria sun chart on canvas -->
      <circle cx="390" cy="280" r="28" fill="#F59E0B"/>
      <path d="M 345 350 Q 390 320 435 350 L 435 370 L 345 370 Z" fill="#0D9488"/>
      <path d="M 360 360 Q 390 340 420 360" stroke="#047857" stroke-width="2" fill="none"/>

      <!-- Boy sitting on a low wooden stool (Left side) -->
      <!-- Stool legs touching baseline -->
      <rect x="170" y="470" width="70" height="14" rx="4" fill="#B45309"/>
      <line x1="180" y1="484" x2="175" y2="580" stroke="#78350F" stroke-width="7"/>
      <line x1="230" y1="484" x2="235" y2="580" stroke="#78350F" stroke-width="7"/>

      <!-- Legs in denim jeans -->
      <path d="M 180 470 C 180 520 220 540 230 580" stroke="url(#grad-blue)" stroke-width="30" stroke-linecap="round" fill="none"/>
      <!-- Brown shoes touching baseline -->
      <ellipse cx="235" cy="580" rx="20" ry="10" fill="#3B1E12"/>

      <!-- Torso in Teal Artist Apron over White Shirt -->
      <path d="M 160 320 C 150 370 155 430 170 480 L 250 480 C 260 430 255 370 240 320 Z" fill="url(#grad-teal)"/>
      <path d="M 175 320 L 225 320 L 220 480 L 180 480 Z" fill="#0F766E"/>
      <!-- Apron pocket with brushes -->
      <rect x="185" y="400" width="45" height="35" rx="4" fill="#0B5751"/>
      <line x1="195" y1="380" x2="195" y2="405" stroke="#D97706" stroke-width="4"/>
      <line x1="210" y1="375" x2="210" y2="405" stroke="#EF4444" stroke-width="4"/>

      <!-- Left Hand holding Artist's wooden Palette -->
      <ellipse cx="200" cy="380" rx="28" ry="18" fill="#FDE68A" stroke="#D97706" stroke-width="2"/>
      <!-- Paint dollops on palette -->
      <circle cx="185" cy="375" r="4" fill="#EF4444"/>
      <circle cx="195" cy="370" r="4" fill="#3B82F6"/>
      <circle cx="210" cy="372" r="4" fill="#10B981"/>
      <circle cx="218" cy="380" r="4" fill="#F59E0B"/>
      <!-- Left thumb through hole -->
      <ellipse cx="190" cy="385" rx="6" ry="5" fill="url(#skin-6)"/>

      <!-- Right Arm reaching forward with paintbrush towards canvas -->
      <path d="M 235 330 Q 280 340 330 310" stroke="url(#skin-6)" stroke-width="26" stroke-linecap="round" fill="none"/>
      <!-- Right hand gripping brush -->
      <ellipse cx="330" cy="310" rx="12" ry="10" fill="url(#skin-6)"/>
      <!-- Paintbrush -->
      <line x1="315" y1="320" x2="355" y2="295" stroke="#78350F" stroke-width="5" stroke-linecap="round"/>
      <polygon points="353,296 360,290 357,298" fill="#EF4444"/>

      <!-- Head & Face (Deep bronze brown) -->
      <rect x="188" y="270" width="22" height="35" rx="5" fill="url(#skin-6)"/>
      <ellipse cx="200" cy="235" rx="36" ry="42" fill="url(#skin-6)"/>

      <!-- Facial features focused on artwork -->
      <path d="M 188 220 Q 198 215 208 220" stroke="#170F0B" stroke-width="3" fill="none"/>
      <path d="M 216 220 Q 226 215 234 220" stroke="#170F0B" stroke-width="3" fill="none"/>
      <ellipse cx="200" cy="228" rx="5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="202" cy="228" r="2.8" fill="#170F0B"/>
      <ellipse cx="226" cy="228" rx="5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="228" cy="228" r="2.8" fill="#170F0B"/>
      <path d="M 216 235 Q 222 245 218 248" stroke="#361B0E" stroke-width="2" fill="none"/>
      <path d="M 205 260 Q 216 268 226 260" stroke="#241007" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Hair: Textured natural fade with curved hair parting -->
      <path d="M 170 225 C 170 185 235 185 235 225 C 225 200 180 200 170 225 Z" fill="url(#hair-dark)"/>
      <path d="M 180 208 Q 200 200 220 208" stroke="#3D2114" stroke-width="3" fill="none"/>
    </g>
  </svg>`;
}

// ---------------------------------------------------------------------------
// 7. STUDENT 7: Nigerian girl lying on back reading book held in air
// ---------------------------------------------------------------------------
function getStudent7Svg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="600" height="420">
    ${getDefs()}
    <g id="student-7-figure">
      <!-- Ground shadow under full lying silhouette -->
      <ellipse cx="300" cy="395" rx="270" ry="16" fill="#1E293B" opacity="0.08"/>

      <!-- Head on left side, feet on right side -->
      <!-- Pillow under head -->
      <ellipse cx="140" cy="355" rx="45" ry="24" fill="#E2E8F0"/>

      <!-- Head / Face looking up into air -->
      <ellipse cx="150" cy="335" rx="36" ry="34" fill="url(#skin-7)"/>
      <!-- Twin high afro puffs on floor -->
      <circle cx="110" cy="320" r="24" fill="url(#hair-dark)"/>
      <circle cx="110" cy="320" r="8" fill="#F59E0B" opacity="0.5"/>
      <circle cx="130" cy="370" r="22" fill="url(#hair-dark)"/>

      <!-- Facial features (side profile tilted upward) -->
      <path d="M 155 320 Q 165 315 174 322" stroke="#170F0B" stroke-width="3" fill="none"/>
      <ellipse cx="165" cy="328" rx="5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="166" cy="327" r="2.8" fill="#170F0B"/>
      <path d="M 178 335 Q 186 342 178 346" stroke="#422212" stroke-width="2.5" fill="none"/>
      <path d="M 165 355 Q 175 360 182 354" stroke="#361B0E" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Torso in Striped Mustard & Cream Sweater -->
      <path d="M 175 340 C 220 340 280 340 330 350 L 330 395 L 175 395 Z" fill="url(#grad-amber)"/>
      <!-- Striped sweater pattern -->
      <line x1="200" y1="340" x2="200" y2="395" stroke="#FEF3C7" stroke-width="8"/>
      <line x1="235" y1="340" x2="235" y2="395" stroke="#FEF3C7" stroke-width="8"/>
      <line x1="270" y1="340" x2="270" y2="395" stroke="#FEF3C7" stroke-width="8"/>
      <line x1="305" y1="340" x2="305" y2="395" stroke="#FEF3C7" stroke-width="8"/>

      <!-- Legs in cyan lounge pants, knees bent upward in inverted V -->
      <path d="M 330 350 Q 390 280 430 330 L 460 395 L 330 395 Z" fill="#06B6D4"/>
      <!-- Fold shadows -->
      <path d="M 370 330 Q 400 300 430 340" stroke="#0891B2" stroke-width="4" fill="none"/>
      <!-- Feet in cozy socks resting on baseline -->
      <ellipse cx="465" cy="390" rx="18" ry="12" fill="#FEF3C7"/>
      <line x1="455" y1="390" x2="475" y2="390" stroke="#F59E0B" stroke-width="3"/>

      <!-- Both arms raised vertically up into the air holding the novel -->
      <!-- Left arm -->
      <path d="M 210 345 L 235 220" stroke="url(#skin-7)" stroke-width="26" stroke-linecap="round"/>
      <!-- Right arm -->
      <path d="M 265 345 L 285 220" stroke="url(#skin-7)" stroke-width="26" stroke-linecap="round"/>

      <!-- Open Book floating in the air above her eyes -->
      <g transform="translate(200, 110)">
        <path d="M 10 70 Q 60 55 110 70 L 115 25 Q 60 10 5 25 Z" fill="url(#grad-purple)"/>
        <path d="M 12 67 Q 60 53 108 67 L 105 28 Q 60 14 15 28 Z" fill="#F8FAFC"/>
        <line x1="60" y1="20" x2="60" y2="60" stroke="#7C3AED" stroke-width="2.5"/>
        <line x1="25" y1="35" x2="50" y2="33" stroke="#94A3B8" stroke-width="2"/>
        <line x1="25" y1="45" x2="48" y2="43" stroke="#94A3B8" stroke-width="2"/>
        <line x1="70" y1="33" x2="95" y2="35" stroke="#94A3B8" stroke-width="2"/>
        <line x1="72" y1="43" x2="95" y2="45" stroke="#94A3B8" stroke-width="2"/>

        <!-- Hands gripping bottom corners of book in air -->
        <g transform="translate(15, 65)">
          <ellipse cx="6" cy="6" rx="10" ry="8" fill="url(#skin-7)"/>
          <path d="M 2 0 Q 6 8 12 10" stroke="url(#skin-7)" stroke-width="5" stroke-linecap="round" fill="none"/>
        </g>
        <g transform="translate(85, 65)">
          <ellipse cx="6" cy="6" rx="10" ry="8" fill="url(#skin-7)"/>
          <path d="M 10 0 Q 6 8 0 10" stroke="url(#skin-7)" stroke-width="5" stroke-linecap="round" fill="none"/>
        </g>
      </g>
    </g>
  </svg>`;
}

// ---------------------------------------------------------------------------
// 8. STUDENT 8: Nigerian boy sitting on beanbag with laptop
// ---------------------------------------------------------------------------
function getStudent8Svg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 580" width="540" height="580">
    ${getDefs()}
    <g id="student-8-figure">
      <!-- Ground shadow under beanbag -->
      <ellipse cx="270" cy="560" rx="200" ry="16" fill="#1E293B" opacity="0.08"/>

      <!-- PLUSH BEANBAG CHAIR (Saffron Orange) -->
      <path d="M 120 440 C 90 320 200 240 330 260 C 440 280 460 400 440 480 C 420 560 160 565 120 440 Z" fill="url(#grad-orange)"/>
      <!-- Beanbag contour seam stitching -->
      <path d="M 230 260 Q 300 370 270 550" stroke="#C2410C" stroke-width="4" fill="none" stroke-dasharray="6 4"/>
      <path d="M 160 420 Q 280 470 420 440" stroke="#C2410C" stroke-width="3" fill="none"/>

      <!-- Boy settled comfortably in beanbag -->
      <!-- Legs in olive cargo pants -->
      <path d="M 200 420 L 260 520 L 320 520 L 290 420 Z" fill="#4D7C0F"/>
      <path d="M 280 420 L 340 510 L 380 500 L 340 420 Z" fill="#3F6212"/>
      <!-- Cargo pockets -->
      <rect x="235" y="450" width="25" height="20" rx="3" fill="#365314"/>
      <!-- Modern sneakers touching baseline -->
      <ellipse cx="290" cy="545" rx="24" ry="12" fill="#FFFFFF"/>
      <rect x="280" y="550" width="30" height="5" fill="#EF4444"/>
      <ellipse cx="365" cy="525" rx="22" ry="12" fill="#FFFFFF"/>
      <rect x="355" y="530" width="28" height="5" fill="#EF4444"/>

      <!-- Torso: Slate Navy Zip Fleece -->
      <path d="M 210 280 C 190 340 210 400 230 430 L 340 420 C 350 370 340 320 320 270 Z" fill="url(#grad-slate)"/>
      <line x1="265" y1="280" x2="280" y2="420" stroke="#94A3B8" stroke-width="4"/>

      <!-- Metallic Ultra-Thin Laptop on lap -->
      <!-- Laptop base -->
      <path d="M 240 390 L 340 380 L 350 400 L 235 410 Z" fill="#94A3B8"/>
      <!-- Screen open tilted up -->
      <path d="M 255 320 L 335 315 L 340 385 L 250 390 Z" fill="#0F172A"/>
      <path d="M 260 325 L 330 320 L 335 380 L 255 385 Z" fill="#38BDF8"/>
      <!-- Code / formulas on screen -->
      <line x1="268" y1="335" x2="310" y2="333" stroke="#FFFFFF" stroke-width="2"/>
      <line x1="268" y1="343" x2="300" y2="341" stroke="#FFFFFF" stroke-width="2"/>
      <line x1="268" y1="351" x2="320" y2="349" stroke="#FFFFFF" stroke-width="2"/>

      <!-- Arms and hands typing on keyboard -->
      <path d="M 220 300 Q 230 370 270 395" stroke="url(#skin-6)" stroke-width="24" stroke-linecap="round" fill="none"/>
      <path d="M 315 295 Q 315 365 300 395" stroke="url(#skin-6)" stroke-width="24" stroke-linecap="round" fill="none"/>
      <!-- Articulated fingers hovering over keys -->
      <circle cx="275" cy="395" r="7" fill="url(#skin-6)"/>
      <circle cx="295" cy="395" r="7" fill="url(#skin-6)"/>

      <!-- Neck & Head tilted down -->
      <rect x="250" y="225" width="20" height="35" rx="5" fill="url(#skin-6)"/>
      <ellipse cx="260" cy="190" rx="36" ry="42" fill="url(#skin-6)"/>

      <!-- Facial features -->
      <path d="M 244 175 Q 254 170 264 175" stroke="#170F0B" stroke-width="3" fill="none"/>
      <path d="M 272 175 Q 282 170 292 175" stroke="#170F0B" stroke-width="3" fill="none"/>
      <ellipse cx="254" cy="184" rx="5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="255" cy="185" r="2.8" fill="#170F0B"/>
      <ellipse cx="282" cy="184" rx="5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="281" cy="185" r="2.8" fill="#170F0B"/>
      <path d="M 268 190 Q 274 200 270 203" stroke="#361B0E" stroke-width="2" fill="none"/>
      <path d="M 258 215 Q 268 222 278 215" stroke="#241007" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Hair: Modern curly high-top fade -->
      <path d="M 230 180 C 230 135 290 135 290 180 Z" fill="url(#hair-dark)"/>
      <circle cx="245" cy="148" r="9" fill="url(#hair-dark)"/>
      <circle cx="260" cy="142" r="9" fill="url(#hair-dark)"/>
      <circle cx="275" cy="146" r="9" fill="url(#hair-dark)"/>
      <path d="M 235 185 Q 260 178 285 185" stroke="#3D2114" stroke-width="3" fill="none"/>
    </g>
  </svg>`;
}

// ---------------------------------------------------------------------------
// 9. STUDENT 9: Nigerian girl sketching on a low garden wall
// ---------------------------------------------------------------------------
function getStudent9Svg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 580" width="520" height="580">
    ${getDefs()}
    <g id="student-9-figure">
      <!-- Ground shadow under wall and student -->
      <ellipse cx="260" cy="565" rx="220" ry="16" fill="#1E293B" opacity="0.08"/>

      <!-- LOW STONE WALL / LEDGE (Touching baseline) -->
      <rect x="120" y="440" width="280" height="120" rx="8" fill="#CBD5E1"/>
      <rect x="110" y="430" width="300" height="24" rx="6" fill="#94A3B8"/>
      <!-- Stone texture lines -->
      <line x1="200" y1="454" x2="200" y2="500" stroke="#64748B" stroke-width="2"/>
      <line x1="320" y1="454" x2="320" y2="500" stroke="#64748B" stroke-width="2"/>
      <line x1="160" y1="500" x2="160" y2="550" stroke="#64748B" stroke-width="2"/>
      <line x1="260" y1="500" x2="260" y2="550" stroke="#64748B" stroke-width="2"/>
      <line x1="360" y1="500" x2="360" y2="550" stroke="#64748B" stroke-width="2"/>
      <line x1="120" y1="500" x2="400" y2="500" stroke="#64748B" stroke-width="2"/>

      <!-- Girl seated on wall with legs dangling slightly -->
      <g id="girl-legs">
        <!-- High-waisted Indigo trousers -->
        <path d="M 210 420 L 205 520 L 235 520 L 245 420 Z" fill="url(#grad-indigo)"/>
        <path d="M 265 420 L 260 510 L 290 510 L 300 420 Z" fill="url(#grad-indigo)"/>
        <!-- Slip-on flats -->
        <ellipse cx="220" cy="528" rx="18" ry="9" fill="#1E293B"/>
        <ellipse cx="275" cy="518" rx="18" ry="9" fill="#1E293B"/>
      </g>

      <!-- Torso: Rose Coral Blouse -->
      <path d="M 195 280 C 185 330 185 380 200 430 L 310 430 C 320 380 320 330 305 280 Z" fill="url(#grad-coral)"/>
      <path d="M 220 320 Q 250 350 280 320" stroke="#E11D48" stroke-width="3" fill="none"/>

      <!-- Large Open Sketchbook across knees -->
      <rect x="200" y="380" width="120" height="70" rx="4" fill="#059669" transform="rotate(-6 260 415)"/>
      <rect x="205" y="384" width="110" height="62" rx="3" fill="#FFFFFF" transform="rotate(-6 260 415)"/>
      <!-- Geometric sketch on page -->
      <circle cx="240" cy="415" r="14" fill="none" stroke="#2563EB" stroke-width="2"/>
      <polygon points="260,405 285,405 272,425" fill="none" stroke="#EA580C" stroke-width="2"/>

      <!-- Arms: Left hand stabilizing sketchbook, Right hand drawing with pencil -->
      <path d="M 195 290 Q 170 360 215 395" stroke="url(#skin-1)" stroke-width="24" stroke-linecap="round" fill="none"/>
      <circle cx="215" cy="395" r="9" fill="url(#skin-1)"/>

      <path d="M 305 290 Q 330 360 280 405" stroke="url(#skin-1)" stroke-width="24" stroke-linecap="round" fill="none"/>
      <circle cx="280" cy="405" r="9" fill="url(#skin-1)"/>
      <!-- Drafting pencil -->
      <line x1="270" y1="390" x2="285" y2="415" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>

      <!-- Head & Face (Rich dark mocha) -->
      <rect x="238" y="240" width="22" height="35" rx="5" fill="url(#skin-1)"/>
      <ellipse cx="250" cy="200" rx="36" ry="44" fill="url(#skin-1)"/>

      <!-- Facial features -->
      <path d="M 224 185 Q 235 180 245 185" stroke="#170F0B" stroke-width="3" fill="none"/>
      <path d="M 255 185 Q 265 180 276 185" stroke="#170F0B" stroke-width="3" fill="none"/>
      <ellipse cx="234" cy="194" rx="5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="235" cy="195" r="2.8" fill="#170F0B"/>
      <ellipse cx="266" cy="194" rx="5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="265" cy="195" r="2.8" fill="#170F0B"/>
      <path d="M 250 202 Q 256 212 250 215" stroke="#361B0E" stroke-width="2" fill="none"/>
      <path d="M 240 228 Q 250 236 260 228" stroke="#241007" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Hair: Braided bob with cowrie shell accents -->
      <path d="M 210 215 C 210 150 290 150 290 215 C 280 165 220 165 210 215 Z" fill="url(#hair-dark)"/>
      <path d="M 215 190 Q 200 240 205 270" stroke="url(#hair-dark)" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M 285 190 Q 300 240 295 270" stroke="url(#hair-dark)" stroke-width="8" stroke-linecap="round" fill="none"/>
      <!-- Cowrie shells / gold cuffs -->
      <ellipse cx="205" cy="250" rx="5" ry="4" fill="#FEF3C7"/>
      <ellipse cx="295" cy="250" rx="5" ry="4" fill="#FEF3C7"/>
    </g>
  </svg>`;
}

// ---------------------------------------------------------------------------
// 10. STUDENT 10: Fallback boy reading walking (kept for complete compatibility)
// ---------------------------------------------------------------------------
function getStudent10Svg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 600" width="440" height="600">
    ${getDefs()}
    <g id="student-10-figure">
      <!-- Ground shadow -->
      <ellipse cx="220" cy="580" rx="140" ry="14" fill="#1E293B" opacity="0.08"/>
      <!-- Walking legs -->
      <path d="M 180 400 L 150 560 L 180 560 L 205 400 Z" fill="url(#grad-blue)"/>
      <path d="M 225 400 L 260 550 L 285 550 L 250 400 Z" fill="url(#grad-blue)"/>
      <!-- Shoes -->
      <ellipse cx="165" cy="570" rx="22" ry="10" fill="#EF4444"/>
      <ellipse cx="275" cy="560" rx="22" ry="10" fill="#EF4444"/>
      <!-- Torso in Orange Polo -->
      <path d="M 175 250 C 165 300 170 360 175 410 L 265 410 C 270 360 275 300 265 250 Z" fill="url(#grad-orange)"/>
      <!-- Arms holding open book -->
      <path d="M 180 260 Q 150 320 205 340" stroke="url(#skin-2)" stroke-width="26" stroke-linecap="round" fill="none"/>
      <path d="M 260 260 Q 290 320 235 340" stroke="url(#skin-2)" stroke-width="26" stroke-linecap="round" fill="none"/>
      <!-- Open Book (Clean without any text artifacts!) -->
      <path d="M 180 320 Q 220 330 260 320 L 265 355 Q 220 365 175 355 Z" fill="#0284C7"/>
      <path d="M 183 322 Q 220 332 257 322 L 255 350 Q 220 360 180 350 Z" fill="#F8FAFC"/>
      <!-- Head & Face -->
      <rect x="208" y="210" width="22" height="35" rx="5" fill="url(#skin-2)"/>
      <ellipse cx="220" cy="170" rx="34" ry="40" fill="url(#skin-2)"/>
      <path d="M 195 165 C 195 125 245 125 245 165 Z" fill="url(#hair-dark)"/>
      <ellipse cx="210" cy="168" rx="4" ry="3" fill="#FFFFFF"/>
      <circle cx="211" cy="169" r="2.2" fill="#170F0B"/>
      <ellipse cx="230" cy="168" rx="4" ry="3" fill="#FFFFFF"/>
      <circle cx="229" cy="169" r="2.2" fill="#170F0B"/>
      <path d="M 215 190 Q 220 196 225 190" stroke="#241007" stroke-width="2.5" fill="none"/>
    </g>
  </svg>`;
}

// ---------------------------------------------------------------------------
// 11. STUDENT 11: Nigerian girl sitting on floor surrounded by books, highlighting
// ---------------------------------------------------------------------------
function getStudent11Svg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 560" width="540" height="560">
    ${getDefs()}
    <g id="student-11-figure">
      <!-- Ground shadow under student and scattered books -->
      <ellipse cx="270" cy="545" rx="240" ry="16" fill="#1E293B" opacity="0.08"/>

      <!-- SCATTERED REFERENCE BOOKS ON FLOOR (Organic tapered floor layout) -->
      <!-- Book 1 (Left, Indigo) -->
      <path d="M 70 480 L 160 460 L 175 510 L 85 530 Z" fill="url(#grad-indigo)"/>
      <path d="M 78 482 L 155 465 L 168 505 L 90 522 Z" fill="#F8FAFC"/>
      <!-- Book 2 (Right, Amber) -->
      <path d="M 380 460 L 470 480 L 455 530 L 365 510 Z" fill="url(#grad-amber)"/>
      <path d="M 385 465 L 462 482 L 450 522 L 372 505 Z" fill="#FEF3C7"/>
      <!-- Open notebook in front -->
      <rect x="210" y="475" width="120" height="60" rx="4" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      <line x1="270" y1="475" x2="270" y2="535" stroke="#CBD5E1" stroke-width="2"/>
      <!-- Bright yellow highlight streak on page! -->
      <rect x="220" y="495" width="40" height="8" rx="2" fill="#FDE047" opacity="0.8"/>
      <rect x="220" y="510" width="35" height="8" rx="2" fill="#FDE047" opacity="0.8"/>
      <!-- Index cards and mug -->
      <rect x="175" y="490" width="30" height="20" rx="2" fill="#F1F5F9" stroke="#CBD5E1"/>
      <ellipse cx="360" cy="490" rx="10" ry="8" fill="#F43F5E"/>
      <ellipse cx="360" cy="488" rx="8" ry="6" fill="#451A03"/>

      <!-- Girl sitting cross-legged in Mint Green knit & Navy leggings -->
      <path d="M 170 450 C 150 490 200 520 270 520 C 340 520 390 490 370 450 Z" fill="url(#grad-slate)"/>
      <ellipse cx="190" cy="495" rx="20" ry="12" fill="#FFFFFF"/>
      <ellipse cx="350" cy="495" rx="20" ry="12" fill="#FFFFFF"/>

      <!-- Torso: Mint Green Long-Sleeve Knit -->
      <path d="M 210 300 C 195 360 200 420 220 460 L 320 460 C 340 420 345 360 330 300 Z" fill="url(#grad-emerald)"/>
      <path d="M 235 340 Q 270 370 305 340" stroke="#059669" stroke-width="3" fill="none"/>

      <!-- Left arm leaning forward holding book corner -->
      <path d="M 210 310 Q 180 390 235 440" stroke="url(#skin-3)" stroke-width="26" stroke-linecap="round" fill="none"/>
      <circle cx="235" cy="440" r="10" fill="url(#skin-3)"/>

      <!-- Right arm holding Fluorescent Highlighter Pen -->
      <path d="M 330 310 Q 350 400 285 450" stroke="url(#skin-3)" stroke-width="26" stroke-linecap="round" fill="none"/>
      <!-- Right hand gripping highlighter -->
      <ellipse cx="280" cy="455" rx="12" ry="10" fill="url(#skin-3)"/>
      <!-- Neon yellow highlighter marker -->
      <rect x="270" y="460" width="12" height="24" rx="3" fill="#FACC15" transform="rotate(-30 276 472)"/>
      <polygon points="266,478 274,475 272,485" fill="#EAB308"/>

      <!-- Head & Face (Golden chocolate skin) -->
      <rect x="258" y="255" width="24" height="40" rx="5" fill="url(#skin-3)"/>
      <ellipse cx="270" cy="215" rx="38" ry="46" fill="url(#skin-3)"/>

      <!-- Facial features -->
      <path d="M 244 200 Q 255 194 265 199" stroke="#170F0B" stroke-width="3" fill="none"/>
      <path d="M 275 199 Q 285 194 296 200" stroke="#170F0B" stroke-width="3" fill="none"/>
      <ellipse cx="254" cy="208" rx="5.5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="255" cy="209" r="3" fill="#170F0B"/>
      <ellipse cx="286" cy="208" rx="5.5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="285" cy="209" r="3" fill="#170F0B"/>
      <path d="M 270 216 Q 276 226 270 228" stroke="#422212" stroke-width="2" fill="none"/>
      <path d="M 260 242 Q 270 250 280 242" stroke="#2B140A" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Hair: Shoulder-length twists with teal beads -->
      <path d="M 230 220 C 230 145 310 145 310 220 Z" fill="url(#hair-dark)"/>
      <path d="M 235 200 Q 215 250 220 300" stroke="url(#hair-dark)" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M 305 200 Q 325 250 320 300" stroke="url(#hair-dark)" stroke-width="8" stroke-linecap="round" fill="none"/>
      <circle cx="220" cy="295" r="5" fill="#14B8A6"/>
      <circle cx="320" cy="295" r="5" fill="#14B8A6"/>
    </g>
  </svg>`;
}

// ---------------------------------------------------------------------------
// 12. STUDENT 12: Nigerian boy kneeling, solving math on mobile whiteboard
// ---------------------------------------------------------------------------
function getStudent12Svg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 600" width="540" height="600">
    ${getDefs()}
    <g id="student-12-figure">
      <!-- Ground shadow under whiteboard casters and kneeling boy -->
      <ellipse cx="270" cy="580" rx="230" ry="16" fill="#1E293B" opacity="0.08"/>

      <!-- MOBILE MAGNETIC WHITEBOARD (Right side) -->
      <!-- Whiteboard aluminum stand with caster wheels touching baseline -->
      <line x1="380" y1="180" x2="380" y2="570" stroke="#64748B" stroke-width="10"/>
      <!-- Bottom base feet -->
      <line x1="330" y1="570" x2="430" y2="570" stroke="#475569" stroke-width="8" stroke-linecap="round"/>
      <circle cx="335" cy="578" r="6" fill="#1E293B"/>
      <circle cx="425" cy="578" r="6" fill="#1E293B"/>
      <!-- Marker tray -->
      <rect x="330" y="440" width="100" height="10" rx="3" fill="#94A3B8"/>
      <rect x="345" y="436" width="16" height="5" rx="1" fill="#EF4444"/>
      <rect x="370" y="436" width="16" height="5" rx="1" fill="#3B82F6"/>

      <!-- Whiteboard Board Surface -->
      <rect x="310" y="140" width="150" height="290" rx="8" fill="#FFFFFF" stroke="#94A3B8" stroke-width="5"/>
      <!-- Math formulas and parabola diagram -->
      <text x="325" y="180" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#2563EB">x = -b ± √(b²-4ac)</text>
      <line x1="345" y1="188" x2="435" y2="188" stroke="#2563EB" stroke-width="2"/>
      <text x="380" y="206" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#2563EB">2a</text>
      <!-- Parabola graph -->
      <path d="M 330 270 Q 380 320 430 270" stroke="#D97706" stroke-width="3" fill="none"/>
      <line x1="330" y1="290" x2="430" y2="290" stroke="#CBD5E1" stroke-width="2"/>
      <line x1="380" y1="250" x2="380" y2="330" stroke="#CBD5E1" stroke-width="2"/>

      <!-- Boy Kneeling on one knee solving formula (Left side) -->
      <!-- Legs in Charcoal Chinos: one knee on ground, other bent up -->
      <g id="kneeling-legs">
        <!-- Kneeling leg (knee touches baseline) -->
        <path d="M 180 430 Q 140 510 180 575 L 210 575 Q 180 500 215 430 Z" fill="#374151"/>
        <ellipse cx="180" cy="575" rx="16" ry="10" fill="#1E293B"/>
        <!-- Bent upright leg -->
        <path d="M 220 430 Q 260 480 250 540 L 280 540 Q 295 470 255 430 Z" fill="#4B5563"/>
        <ellipse cx="270" cy="555" rx="22" ry="12" fill="#1E293B"/>
      </g>

      <!-- Torso: Cobalt Blue Varsity Cardigan over white shirt -->
      <path d="M 170 300 C 150 360 160 410 180 450 L 260 450 C 275 410 275 360 255 300 Z" fill="url(#grad-blue)"/>
      <line x1="210" y1="300" x2="210" y2="450" stroke="#FFFFFF" stroke-width="6"/>
      <line x1="210" y1="300" x2="210" y2="450" stroke="#D97706" stroke-width="2"/>

      <!-- Left arm at hip holding felt eraser block -->
      <path d="M 180 310 Q 150 370 190 395" stroke="url(#skin-4)" stroke-width="26" stroke-linecap="round" fill="none"/>
      <rect x="180" y="390" width="22" height="14" rx="3" fill="#1E293B"/>

      <!-- Right arm reaching up to whiteboard writing with dry-erase marker -->
      <path d="M 250 310 Q 280 260 330 250" stroke="url(#skin-4)" stroke-width="26" stroke-linecap="round" fill="none"/>
      <!-- Right hand holding black marker -->
      <ellipse cx="330" cy="250" rx="11" ry="9" fill="url(#skin-4)"/>
      <rect x="330" y="242" width="18" height="7" rx="2" fill="#0F172A" transform="rotate(-15 339 245)"/>

      <!-- Head & Face (Deep espresso brown) -->
      <rect x="198" y="250" width="22" height="35" rx="5" fill="url(#skin-4)"/>
      <ellipse cx="210" cy="210" rx="36" ry="42" fill="url(#skin-4)"/>

      <!-- Facial features focused upward at the equation -->
      <path d="M 200 195 Q 210 190 220 195" stroke="#170F0B" stroke-width="3" fill="none"/>
      <path d="M 226 195 Q 236 190 245 195" stroke="#170F0B" stroke-width="3" fill="none"/>
      <ellipse cx="210" cy="204" rx="5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="212" cy="203" r="2.8" fill="#170F0B"/>
      <ellipse cx="236" cy="204" rx="5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="238" cy="203" r="2.8" fill="#170F0B"/>
      <path d="M 225 210 Q 232 220 226 223" stroke="#2C1409" stroke-width="2" fill="none"/>
      <path d="M 215 235 Q 225 242 235 235" stroke="#241007" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Hair: Textured waves with clean hairline -->
      <path d="M 180 200 C 180 155 245 155 245 200 Z" fill="url(#hair-dark)"/>
      <path d="M 190 180 Q 215 170 238 180" stroke="#3D2114" stroke-width="3" fill="none"/>
    </g>
  </svg>`;
}

// ---------------------------------------------------------------------------
// BLOG 1: Nigerian student studying at desk with textbooks & tablet
// ---------------------------------------------------------------------------
function getBlog1Svg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    ${getDefs()}
    <rect width="600" height="400" fill="#F8FAFC"/>
    <!-- Decorative background geometric shapes (Rafiki style) -->
    <circle cx="500" cy="100" r="120" fill="#EEF2FF"/>
    <circle cx="80" cy="320" r="90" fill="#F0FDF4"/>
    <rect x="420" y="240" width="140" height="120" rx="16" fill="#FEF3C7" opacity="0.5"/>

    <!-- Modern Study Desk (Wooden surface) -->
    <rect x="60" y="260" width="480" height="16" rx="4" fill="#B45309"/>
    <line x1="100" y1="276" x2="90" y2="390" stroke="#78350F" stroke-width="10" stroke-linecap="round"/>
    <line x1="500" y1="276" x2="510" y2="390" stroke="#78350F" stroke-width="10" stroke-linecap="round"/>

    <!-- Desk Accessories: Potted plant, mug, desk lamp -->
    <!-- Plant -->
    <path d="M 90 260 L 110 260 L 105 235 L 95 235 Z" fill="#EA580C"/>
    <circle cx="95" cy="225" r="12" fill="#10B981"/>
    <circle cx="108" cy="220" r="10" fill="#059669"/>
    <!-- Desk Lamp -->
    <path d="M 480 260 L 490 260 L 485 160 L 440 180" stroke="#64748B" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M 430 170 L 450 190 L 420 200 Z" fill="#F59E0B"/>
    <polygon points="420,200 450,190 520,260 380,260" fill="#FEF08A" opacity="0.25"/>

    <!-- Open Textbook & Digital Tablet on desk -->
    <path d="M 140 250 L 240 240 L 245 260 L 145 260 Z" fill="#1E3A8A"/>
    <path d="M 145 248 L 235 242 L 238 258 L 148 258 Z" fill="#FFFBEB"/>
    <!-- Tablet displaying quiz score -->
    <rect x="360" y="220" width="80" height="55" rx="6" fill="#0284C7" transform="rotate(-6 400 247)"/>
    <rect x="365" y="224" width="70" height="47" rx="4" fill="#FFFFFF" transform="rotate(-6 400 247)"/>
    <circle cx="395" cy="245" r="12" fill="#10B981" transform="rotate(-6 400 247)"/>
    <text x="390" y="250" font-family="sans-serif" font-size="10" font-weight="bold" fill="#FFFFFF" transform="rotate(-6 400 247)">A+</text>

    <!-- Student Character seated behind desk studying -->
    <g id="blog-student-1">
      <!-- Torso in Amber hoodie -->
      <path d="M 230 180 C 210 230 220 270 230 300 L 370 300 C 380 270 390 230 370 180 Z" fill="url(#grad-amber)"/>
      <!-- Arms resting comfortably on desk -->
      <path d="M 230 200 Q 200 260 270 260" stroke="url(#skin-1)" stroke-width="24" stroke-linecap="round" fill="none"/>
      <path d="M 370 200 Q 400 260 330 260" stroke="url(#skin-1)" stroke-width="24" stroke-linecap="round" fill="none"/>
      <circle cx="270" cy="258" r="10" fill="url(#skin-1)"/>
      <circle cx="330" cy="258" r="10" fill="url(#skin-1)"/>
      <!-- Pen in hand -->
      <line x1="260" y1="245" x2="275" y2="265" stroke="#2563EB" stroke-width="4" stroke-linecap="round"/>

      <!-- Head & Face (Chocolate complexion) -->
      <rect x="288" y="145" width="24" height="35" rx="5" fill="url(#skin-1)"/>
      <ellipse cx="300" cy="110" rx="36" ry="42" fill="url(#skin-1)"/>

      <!-- Expressive Face -->
      <path d="M 276 96 Q 286 90 296 95" stroke="#170F0B" stroke-width="3" fill="none"/>
      <path d="M 304 95 Q 314 90 324 96" stroke="#170F0B" stroke-width="3" fill="none"/>
      <ellipse cx="286" cy="104" rx="5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="287" cy="105" r="2.8" fill="#170F0B"/>
      <ellipse cx="314" cy="104" rx="5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="313" cy="105" r="2.8" fill="#170F0B"/>
      <path d="M 300 110 Q 306 120 300 122" stroke="#361B0E" stroke-width="2" fill="none"/>
      <path d="M 290 132 Q 300 140 310 132" stroke="#241007" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Hair: High Braided Crown with beads -->
      <ellipse cx="300" cy="65" rx="36" ry="24" fill="url(#hair-dark)"/>
      <path d="M 265 100 C 265 65 335 65 335 100 Z" fill="url(#hair-dark)"/>
      <circle cx="295" cy="55" r="5" fill="#F59E0B"/>
    </g>
  </svg>`;
}

// ---------------------------------------------------------------------------
// BLOG 2: Nigerian student organizing exam timetable & checklist
// ---------------------------------------------------------------------------
function getBlog2Svg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    ${getDefs()}
    <rect width="600" height="400" fill="#F8FAFC"/>
    <!-- Decorative background circles -->
    <circle cx="120" cy="100" r="100" fill="#FEF3C7"/>
    <circle cx="520" cy="300" r="110" fill="#EFF6FF"/>

    <!-- LARGE EXAM REVISION TIMETABLE BOARD (Right Side) -->
    <rect x="290" y="60" width="270" height="280" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="3"/>
    <!-- Header -->
    <rect x="290" y="60" width="270" height="44" rx="12" fill="#0D9488"/>
    <rect x="290" y="80" width="270" height="24" fill="#0D9488"/>
    <text x="320" y="88" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF">WAEC 30-DAY TIMETABLE</text>
    <!-- Calendar grid boxes with colorful subject chips -->
    <g transform="translate(310, 120)">
      <rect x="0" y="0" width="50" height="45" rx="6" fill="#F0FDF4" stroke="#86EFAC"/>
      <text x="6" y="16" font-family="sans-serif" font-size="10" font-weight="bold" fill="#15803D">MATH</text>
      <circle cx="36" cy="32" r="7" fill="#22C55E"/>
      <text x="33" y="35" font-family="sans-serif" font-size="9" fill="#FFFFFF">✓</text>

      <rect x="60" y="0" width="50" height="45" rx="6" fill="#EFF6FF" stroke="#93C5FD"/>
      <text x="66" y="16" font-family="sans-serif" font-size="10" font-weight="bold" fill="#1D4ED8">ENG</text>
      <circle cx="96" cy="32" r="7" fill="#22C55E"/>
      <text x="93" y="35" font-family="sans-serif" font-size="9" fill="#FFFFFF">✓</text>

      <rect x="120" y="0" width="50" height="45" rx="6" fill="#FEF3C7" stroke="#FDE047"/>
      <text x="126" y="16" font-family="sans-serif" font-size="10" font-weight="bold" fill="#B45309">PHYS</text>
      <circle cx="156" cy="32" r="7" fill="#EAB308"/>
      <text x="153" y="35" font-family="sans-serif" font-size="9" fill="#FFFFFF">⏱</text>

      <rect x="180" y="0" width="50" height="45" rx="6" fill="#FDF2F8" stroke="#F472B6"/>
      <text x="186" y="16" font-family="sans-serif" font-size="10" font-weight="bold" fill="#BE185D">CHEM</text>

      <!-- Row 2 -->
      <rect x="0" y="55" width="50" height="45" rx="6" fill="#F5F3FF" stroke="#C4B5FD"/>
      <text x="6" y="71" font-family="sans-serif" font-size="10" font-weight="bold" fill="#6D28D9">BIO</text>

      <rect x="60" y="55" width="50" height="45" rx="6" fill="#F0FDF4" stroke="#86EFAC"/>
      <text x="66" y="71" font-family="sans-serif" font-size="10" font-weight="bold" fill="#15803D">ECON</text>

      <rect x="120" y="55" width="50" height="45" rx="6" fill="#EFF6FF" stroke="#93C5FD"/>
      <text x="126" y="71" font-family="sans-serif" font-size="10" font-weight="bold" fill="#1D4ED8">GOVT</text>

      <rect x="180" y="55" width="50" height="45" rx="6" fill="#FEF3C7" stroke="#FDE047"/>
      <text x="186" y="71" font-family="sans-serif" font-size="10" font-weight="bold" fill="#B45309">LIT</text>
    </g>

    <!-- Student Character (Left) pointing enthusiastically at timetable -->
    <g id="blog-student-2">
      <!-- Legs in khaki chinos -->
      <path d="M 120 280 L 110 390 L 140 390 L 155 280 Z" fill="url(#grad-amber)"/>
      <path d="M 165 280 L 175 390 L 205 390 L 195 280 Z" fill="url(#grad-amber)"/>
      <ellipse cx="120" cy="390" rx="18" ry="8" fill="#1E293B"/>
      <ellipse cx="195" cy="390" rx="18" ry="8" fill="#1E293B"/>

      <!-- Torso in Teal polo shirt -->
      <path d="M 110 160 C 100 210 105 250 115 285 L 205 285 C 215 250 220 210 210 160 Z" fill="url(#grad-teal)"/>

      <!-- Left arm holding clipboard with checklist -->
      <path d="M 115 170 Q 75 220 110 250" stroke="url(#skin-2)" stroke-width="22" stroke-linecap="round" fill="none"/>
      <rect x="85" y="225" width="45" height="55" rx="4" fill="#92400E"/>
      <rect x="90" y="230" width="35" height="45" rx="2" fill="#FFFFFF"/>
      <circle cx="107" cy="223" r="4" fill="#64748B"/>
      <!-- Checkmarks on sheet -->
      <text x="94" y="244" font-family="sans-serif" font-size="9" fill="#15803D">✓ Task 1</text>
      <text x="94" y="256" font-family="sans-serif" font-size="9" fill="#15803D">✓ Task 2</text>
      <text x="94" y="268" font-family="sans-serif" font-size="9" fill="#15803D">✓ Task 3</text>

      <!-- Right arm extended pointing finger at calendar -->
      <path d="M 205 170 Q 250 160 295 145" stroke="url(#skin-2)" stroke-width="22" stroke-linecap="round" fill="none"/>
      <!-- Hand with index finger pointing -->
      <ellipse cx="295" cy="145" rx="9" ry="8" fill="url(#skin-2)"/>
      <line x1="295" y1="145" x2="310" y2="140" stroke="url(#skin-2)" stroke-width="5" stroke-linecap="round"/>

      <!-- Head & Face (Deep mahogany skin) -->
      <rect x="148" y="115" width="22" height="35" rx="5" fill="url(#skin-2)"/>
      <ellipse cx="160" cy="80" rx="34" ry="40" fill="url(#skin-2)"/>

      <!-- Facial features -->
      <path d="M 148 68 Q 158 62 168 68" stroke="#170F0B" stroke-width="3" fill="none"/>
      <path d="M 176 68 Q 186 62 194 68" stroke="#170F0B" stroke-width="3" fill="none"/>
      <ellipse cx="158" cy="76" rx="5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="160" cy="76" r="2.8" fill="#170F0B"/>
      <ellipse cx="184" cy="76" rx="5" ry="3.5" fill="#FFFFFF"/>
      <circle cx="186" cy="76" r="2.8" fill="#170F0B"/>
      <path d="M 172 82 Q 178 92 174 94" stroke="#422212" stroke-width="2" fill="none"/>
      <path d="M 162 102 Q 172 110 182 102" stroke="#241007" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Hair: Sharp fade cut -->
      <path d="M 135 75 C 135 40 195 40 195 75 Z" fill="url(#hair-dark)"/>
    </g>
  </svg>`;
}

// ---------------------------------------------------------------------------
// BLOG 3: Two Nigerian students collaborating around interactive screen
// ---------------------------------------------------------------------------
function getBlog3Svg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    ${getDefs()}
    <rect width="600" height="400" fill="#F8FAFC"/>
    <!-- Background creative vibes: Idea lightbulb, floating spark stars -->
    <circle cx="300" cy="70" r="28" fill="#FEF08A"/>
    <path d="M 292 70 Q 300 55 308 70 L 305 78 L 295 78 Z" fill="#F59E0B"/>
    <rect x="295" y="78" width="10" height="6" rx="2" fill="#94A3B8"/>
    <!-- Spark stars -->
    <path d="M 230 60 L 234 70 L 244 74 L 234 78 L 230 88 L 226 78 L 216 74 L 226 70 Z" fill="#F59E0B"/>
    <path d="M 370 60 L 374 70 L 384 74 L 374 78 L 370 88 L 366 78 L 356 74 L 366 70 Z" fill="#0D9488"/>

    <!-- Collaborative study table -->
    <rect x="100" y="270" width="400" height="16" rx="4" fill="#1E293B"/>
    <line x1="140" y1="286" x2="130" y2="390" stroke="#0F172A" stroke-width="10" stroke-linecap="round"/>
    <line x1="460" y1="286" x2="470" y2="390" stroke="#0F172A" stroke-width="10" stroke-linecap="round"/>

    <!-- Central Interactive Laptop Screen -->
    <rect x="230" y="170" width="140" height="95" rx="8" fill="#3B82F6"/>
    <rect x="235" y="175" width="130" height="85" rx="5" fill="#FFFFFF"/>
    <!-- Interactive chemistry formula / data chart on screen -->
    <circle cx="270" cy="210" r="14" fill="#FEE2E2"/>
    <circle cx="270" cy="210" r="8" fill="#EF4444"/>
    <circle cx="320" cy="210" r="14" fill="#DBEAFE"/>
    <circle cx="320" cy="210" r="8" fill="#3B82F6"/>
    <line x1="278" y1="210" x2="312" y2="210" stroke="#64748B" stroke-width="4"/>
    <text x="255" y="245" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0F172A">H₂O + Energy</text>
    <!-- Laptop base -->
    <path d="M 210 265 L 390 265 L 400 273 L 200 273 Z" fill="#94A3B8"/>

    <!-- STUDENT 1 (Boy on Left) in Coral polo, gesturing excitedly -->
    <g id="collab-student-1">
      <path d="M 120 200 C 100 240 110 270 120 310 L 220 310 C 230 270 230 240 215 200 Z" fill="url(#grad-coral)"/>
      <path d="M 120 210 Q 170 250 220 230" stroke="url(#skin-1)" stroke-width="22" stroke-linecap="round" fill="none"/>
      <circle cx="220" cy="230" r="9" fill="url(#skin-1)"/>
      <!-- Head -->
      <rect x="155" y="150" width="20" height="35" rx="5" fill="url(#skin-1)"/>
      <ellipse cx="165" cy="115" rx="34" ry="40" fill="url(#skin-1)"/>
      <path d="M 140 105 C 140 70 195 70 195 105 Z" fill="url(#hair-dark)"/>
      <ellipse cx="172" cy="112" rx="4.5" ry="3" fill="#FFFFFF"/>
      <circle cx="174" cy="113" r="2.5" fill="#170F0B"/>
      <path d="M 165 130 Q 175 138 185 130" stroke="#241007" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </g>

    <!-- STUDENT 2 (Girl on Right) in Teal sweater, pointing at formula -->
    <g id="collab-student-2">
      <path d="M 380 200 C 370 240 370 270 380 310 L 480 310 C 490 270 500 240 480 200 Z" fill="url(#grad-teal)"/>
      <path d="M 470 210 Q 420 240 375 220" stroke="url(#skin-3)" stroke-width="22" stroke-linecap="round" fill="none"/>
      <circle cx="375" cy="220" r="9" fill="url(#skin-3)"/>
      <!-- Head -->
      <rect x="425" y="150" width="20" height="35" rx="5" fill="url(#skin-3)"/>
      <ellipse cx="435" cy="115" rx="34" ry="40" fill="url(#skin-3)"/>
      <ellipse cx="435" cy="75" rx="36" ry="24" fill="url(#hair-dark)"/>
      <ellipse cx="425" cy="112" rx="4.5" ry="3" fill="#FFFFFF"/>
      <circle cx="423" cy="113" r="2.5" fill="#170F0B"/>
      <path d="M 415 130 Q 425 138 435 130" stroke="#241007" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </g>
  </svg>`;
}

// ---------------------------------------------------------------------------
// Processing & Saving with Sharp
// ---------------------------------------------------------------------------
async function processAndSaveSvg(svgContent, baseName, isHeroStudent = true) {
  // Render SVG to raw buffer at 1000px height for ultra crisp detail
  const img = sharp(Buffer.from(svgContent));
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = channels === 4 ? data[(y * width + x) * channels + 3] : 255;
      if (alpha > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Padding
  const pad = 16;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(width - cropX, (maxX - minX) + pad * 2);
  // For hero students, cropH touches maxY + 1 so feet touch the absolute baseline!
  const cropH = isHeroStudent ? (maxY - cropY) + 1 : Math.min(height - cropY, (maxY - minY) + pad * 2);

  const finalPng = await sharp(Buffer.from(svgContent))
    .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
    .png({ compressionLevel: 9 })
    .toBuffer();

  for (const dir of outputDirs) {
    fs.writeFileSync(path.join(dir, `${baseName}.png`), finalPng);
    fs.writeFileSync(path.join(dir, `${baseName}.svg`), svgContent.trim());
  }
  console.log(`Saved ${baseName}.png (${cropW}x${cropH}) and ${baseName}.svg`);
}

async function run() {
  console.log('Generating Authentic Rafiki Flat Vector Illustrations...\n');

  // Hero students 1 through 12
  const heroSvgs = {
    'student-1': getStudent1Svg(),
    'student-2': getStudent2Svg(),
    'student-3': getStudent3Svg(),
    'student-4': getStudent4Svg(),
    'student-5': getStudent5Svg(),
    'student-6': getStudent6Svg(),
    'student-7': getStudent7Svg(),
    'student-8': getStudent8Svg(),
    'student-9': getStudent9Svg(),
    'student-10': getStudent10Svg(),
    'student-11': getStudent11Svg(),
    'student-12': getStudent12Svg(),
  };

  for (const [name, svg] of Object.entries(heroSvgs)) {
    await processAndSaveSvg(svg, name, true);
  }

  // Blog cards 1 through 3
  console.log('\nGenerating Blog Rafiki Illustrations...');
  const blogSvgs = {
    'blog-1': getBlog1Svg(),
    'blog-2': getBlog2Svg(),
    'blog-3': getBlog3Svg(),
  };

  for (const [name, svg] of Object.entries(blogSvgs)) {
    await processAndSaveSvg(svg, name, false);
  }

  console.log('\nAll illustrations generated successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
