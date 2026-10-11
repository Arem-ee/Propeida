import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateMapAndStudents() {
  console.log('1. Measuring map contour...');
  const mapSvgPath = 'assets/nigeria-map.svg';
  const mapSvgData = fs.readFileSync(mapSvgPath, 'utf8');

  // Render map SVG at 800x654 to measure exact underside silhouette
  const { data: mapData, info: mapInfo } = await sharp(Buffer.from(mapSvgData))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = mapInfo.width;
  const height = mapInfo.height;

  // Build contour array: for every X, find lowest Y with opacity > 50
  const contour = new Array(width).fill(-1);
  for (let x = 0; x < width; x++) {
    for (let y = height - 1; y >= 0; y--) {
      const idx = (y * width + x) * 4;
      if (mapData[idx + 3] > 50) {
        contour[x] = y;
        break;
      }
    }
  }

  // Helper to get smooth contour Y with 4px overlap into map
  function getContourY(x) {
    const clampedX = Math.max(0, Math.min(width - 1, Math.round(x)));
    let val = contour[clampedX];
    if (val === -1) {
      // Find nearest valid
      for (let d = 1; d < 100; d++) {
        if (clampedX - d >= 0 && contour[clampedX - d] !== -1) { val = contour[clampedX - d]; break; }
        if (clampedX + d < width && contour[clampedX + d] !== -1) { val = contour[clampedX + d]; break; }
      }
    }
    return val;
  }

  console.log('Sample contour values:');
  [100, 180, 250, 320, 390, 465, 540].forEach(x => {
    console.log(`x=${x} -> map underside Y=${getContourY(x)}`);
  });

  // 7 Students configuration with exact coordinates
  // Each student has distinct chocolate / deep brown skin tones, hairstyles, facial features, outfits
  const students = [
    {
      id: 1,
      gender: 'f',
      x: 105,
      skin: '#422417',
      skinShadow: '#331B11',
      hair: '#140E0A',
      hairStyle: 'braids-bun',
      outfit: '#9333EA', // purple
      outfitShadow: '#7E22CE',
      pant: '#374151',
      handDx: 22,
      tilt: -8
    },
    {
      id: 2,
      gender: 'm',
      x: 180,
      skin: '#3A1E13',
      skinShadow: '#2B160E',
      hair: '#110C08',
      hairStyle: 'fade',
      outfit: '#0D9488', // teal hoodie
      outfitShadow: '#0F766E',
      pant: '#1F2937',
      handDx: 24,
      tilt: -4
    },
    {
      id: 3,
      gender: 'f',
      x: 250,
      skin: '#4A281A',
      skinShadow: '#381E13',
      hair: '#150F0B',
      hairStyle: 'afro-puff',
      outfit: '#EAB308', // mustard yellow
      outfitShadow: '#CA8A04',
      pant: '#4B5563',
      handDx: 22,
      tilt: 0
    },
    {
      id: 4,
      gender: 'm',
      x: 320,
      skin: '#351B10',
      skinShadow: '#26130B',
      hair: '#0F0B08',
      hairStyle: 'locs',
      outfit: '#2563EB', // brand blue
      outfitShadow: '#1D4ED8',
      pant: '#1E293B',
      handDx: 24,
      tilt: 2
    },
    {
      id: 5,
      gender: 'f',
      x: 390,
      skin: '#442315',
      skinShadow: '#341A0F',
      hair: '#120D09',
      hairStyle: 'cornrows',
      outfit: '#F43F5E', // coral rose
      outfitShadow: '#E11D48',
      pant: '#334155',
      handDx: 22,
      tilt: 6
    },
    {
      id: 6,
      gender: 'm',
      x: 465,
      skin: '#3E2114',
      skinShadow: '#2D170D',
      hair: '#100B07',
      hairStyle: 'buzz',
      outfit: '#16A34A', // leaf green
      outfitShadow: '#15803D',
      pant: '#1E293B',
      handDx: 24,
      tilt: 10
    },
    {
      id: 7,
      gender: 'f',
      x: 540,
      skin: '#482718',
      skinShadow: '#371D12',
      hair: '#140E0A',
      hairStyle: 'ponytail',
      outfit: '#EA580C', // warm orange
      outfitShadow: '#C2410C',
      pant: '#374151',
      handDx: 22,
      tilt: 12
    }
  ];

  // Total canvas height 800 to allow bodies to comfortably ground at the bottom
  const totalHeight = 800;

  let svgElements = '';

  for (const st of students) {
    const lx = st.x - st.handDx;
    const rx = st.x + st.handDx;
    // Map contour at exact left and right hand X, minus 4px overlap (palms overlap map underside)
    const mapY_l = getContourY(lx);
    const mapY_r = getContourY(rx);
    const ly = mapY_l - 4;
    const ry = mapY_r - 4;

    const headY = Math.min(ly, ry) + 85;
    const shoulderY = headY + 55;
    const bottomY = totalHeight;

    // Build head, face looking up, eyes, nose, smile
    let hairSvg = '';
    if (st.hairStyle === 'braids-bun') {
      hairSvg = `
        <circle cx="${st.x}" cy="${headY - 26}" r="20" fill="${st.hair}" />
        <path d="M${st.x - 22} ${headY - 10} C${st.x - 22} ${headY - 32} ${st.x + 22} ${headY - 32} ${st.x + 22} ${headY - 10} Z" fill="${st.hair}" />
        <path d="M${st.x - 18} ${headY - 16} Q${st.x} ${headY - 26} ${st.x + 18} ${headY - 16}" stroke="#2A1B14" stroke-width="2" fill="none" />
      `;
    } else if (st.hairStyle === 'fade') {
      hairSvg = `
        <path d="M${st.x - 22} ${headY - 6} C${st.x - 22} ${headY - 30} ${st.x + 22} ${headY - 30} ${st.x + 22} ${headY - 6} Z" fill="${st.hair}" />
        <rect x="${st.x - 24}" y="${headY - 16}" width="4" height="18" rx="2" fill="#20150E" opacity="0.6"/>
        <rect x="${st.x + 20}" y="${headY - 16}" width="4" height="18" rx="2" fill="#20150E" opacity="0.6"/>
      `;
    } else if (st.hairStyle === 'afro-puff') {
      hairSvg = `
        <circle cx="${st.x}" cy="${headY - 28}" r="22" fill="${st.hair}" />
        <circle cx="${st.x - 14}" cy="${headY - 22}" r="14" fill="${st.hair}" />
        <circle cx="${st.x + 14}" cy="${headY - 22}" r="14" fill="${st.hair}" />
        <path d="M${st.x - 22} ${headY - 10} C${st.x - 22} ${headY - 28} ${st.x + 22} ${headY - 28} ${st.x + 22} ${headY - 10} Z" fill="${st.hair}" />
      `;
    } else if (st.hairStyle === 'locs') {
      hairSvg = `
        <path d="M${st.x - 24} ${headY - 6} C${st.x - 24} ${headY - 32} ${st.x + 24} ${headY - 32} ${st.x + 24} ${headY - 6} Z" fill="${st.hair}" />
        <path d="M${st.x - 20} ${headY - 24} Q${st.x - 30} ${headY - 5} ${st.x - 26} ${headY + 18}" stroke="${st.hair}" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M${st.x + 20} ${headY - 24} Q${st.x + 30} ${headY - 5} ${st.x + 26} ${headY + 18}" stroke="${st.hair}" stroke-width="5" stroke-linecap="round" fill="none"/>
      `;
    } else if (st.hairStyle === 'cornrows') {
      hairSvg = `
        <path d="M${st.x - 22} ${headY - 8} C${st.x - 22} ${headY - 30} ${st.x + 22} ${headY - 30} ${st.x + 22} ${headY - 8} Z" fill="${st.hair}" />
        <path d="M${st.x - 15} ${headY - 26} L${st.x - 15} ${headY - 8}" stroke="#2A1B14" stroke-width="2.5" />
        <path d="M${st.x - 5} ${headY - 29} L${st.x - 5} ${headY - 8}" stroke="#2A1B14" stroke-width="2.5" />
        <path d="M${st.x + 5} ${headY - 29} L${st.x + 5} ${headY - 8}" stroke="#2A1B14" stroke-width="2.5" />
        <path d="M${st.x + 15} ${headY - 26} L${st.x + 15} ${headY - 8}" stroke="#2A1B14" stroke-width="2.5" />
      `;
    } else if (st.hairStyle === 'buzz') {
      hairSvg = `
        <path d="M${st.x - 22} ${headY - 8} C${st.x - 22} ${headY - 28} ${st.x + 22} ${headY - 28} ${st.x + 22} ${headY - 8} Z" fill="${st.hair}" />
      `;
    } else if (st.hairStyle === 'ponytail') {
      hairSvg = `
        <circle cx="${st.x + 18}" cy="${headY - 24}" r="16" fill="${st.hair}" />
        <path d="M${st.x - 22} ${headY - 8} C${st.x - 22} ${headY - 30} ${st.x + 22} ${headY - 30} ${st.x + 22} ${headY - 8} Z" fill="${st.hair}" />
      `;
    }

    svgElements += `
      <!-- Student ${st.id} -->
      <g id="student-support-${st.id}">
        <!-- Body / Torso -->
        <path d="M${st.x - 38} ${shoulderY} 
                 C${st.x - 42} ${shoulderY + 60} ${st.x - 45} ${bottomY - 40} ${st.x - 45} ${bottomY} 
                 L${st.x + 45} ${bottomY} 
                 C${st.x + 45} ${bottomY - 40} ${st.x + 42} ${shoulderY + 60} ${st.x + 38} ${shoulderY} Z" 
              fill="${st.outfit}" />
        <!-- Soft shadow / folds on torso -->
        <path d="M${st.x - 15} ${shoulderY + 20} Q${st.x} ${shoulderY + 70} ${st.x - 8} ${bottomY}" stroke="${st.outfitShadow}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.6"/>
        <path d="M${st.x + 15} ${shoulderY + 20} Q${st.x + 5} ${shoulderY + 70} ${st.x + 12} ${bottomY}" stroke="${st.outfitShadow}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.6"/>
        
        <!-- Collar -->
        <path d="M${st.x - 14} ${shoulderY - 2} Q${st.x} ${shoulderY + 14} ${st.x + 14} ${shoulderY - 2}" fill="${st.skinShadow}" />

        <!-- Neck -->
        <rect x="${st.x - 10}" y="${headY + 12}" width="20" height="24" rx="6" fill="${st.skinShadow}" />

        <!-- Left Arm reaching high up to (lx, ly) -->
        <path d="M${st.x - 34} ${shoulderY + 10} 
                 Q${st.x - 38} ${(shoulderY + ly) / 2 + 15} ${lx} ${ly + 14}" 
              stroke="${st.skin}" stroke-width="20" stroke-linecap="round" fill="none" />
        <path d="M${st.x - 34} ${shoulderY + 10} 
                 Q${st.x - 38} ${(shoulderY + ly) / 2 + 15} ${lx} ${ly + 14}" 
              stroke="${st.skinShadow}" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.3" />

        <!-- Right Arm reaching high up to (rx, ry) -->
        <path d="M${st.x + 34} ${shoulderY + 10} 
                 Q${st.x + 38} ${(shoulderY + ry) / 2 + 15} ${rx} ${ry + 14}" 
              stroke="${st.skin}" stroke-width="20" stroke-linecap="round" fill="none" />
        <path d="M${st.x + 34} ${shoulderY + 10} 
                 Q${st.x + 38} ${(shoulderY + ry) / 2 + 15} ${rx} ${ry + 14}" 
              stroke="${st.skinShadow}" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.3" />

        <!-- Left Palm pressed flat against underside, fingertips touching/overlapping map -->
        <g transform="translate(${lx}, ${ly}) rotate(${st.tilt - 6})">
          <!-- Palm base -->
          <ellipse cx="0" cy="8" rx="14" ry="9" fill="${st.skin}" />
          <!-- 4 fingers pressed flat upward -->
          <rect x="-11" y="-2" width="5" height="12" rx="2.5" fill="${st.skin}" />
          <rect x="-5" y="-4" width="5" height="14" rx="2.5" fill="${st.skin}" />
          <rect x="1" y="-3" width="5" height="13" rx="2.5" fill="${st.skin}" />
          <rect x="7" y="-1" width="4.5" height="11" rx="2.2" fill="${st.skin}" />
          <!-- Thumb spread -->
          <rect x="10" y="4" width="4.5" height="9" rx="2.2" transform="rotate(35 12 8)" fill="${st.skin}" />
        </g>

        <!-- Right Palm pressed flat against underside, fingertips touching/overlapping map -->
        <g transform="translate(${rx}, ${ry}) rotate(${st.tilt + 6})">
          <!-- Palm base -->
          <ellipse cx="0" cy="8" rx="14" ry="9" fill="${st.skin}" />
          <!-- 4 fingers pressed flat upward -->
          <rect x="-11.5" y="-1" width="4.5" height="11" rx="2.2" fill="${st.skin}" />
          <rect x="-6" y="-3" width="5" height="13" rx="2.5" fill="${st.skin}" />
          <rect x="0" y="-4" width="5" height="14" rx="2.5" fill="${st.skin}" />
          <rect x="6" y="-2" width="5" height="12" rx="2.5" fill="${st.skin}" />
          <!-- Thumb spread -->
          <rect x="-14" y="4" width="4.5" height="9" rx="2.2" transform="rotate(-35 -12 8)" fill="${st.skin}" />
        </g>

        <!-- Head / Jaw / Face seen looking up from low angle -->
        <ellipse cx="${st.x}" cy="${headY}" rx="22" ry="24" fill="${st.skin}" />
        ${hairSvg}
        <!-- Eyes looking up -->
        <ellipse cx="${st.x - 8}" cy="${headY - 4}" rx="3.5" ry="2.5" fill="#FFFFFF" />
        <circle cx="${st.x - 8}" cy="${headY - 5}" r="1.8" fill="#140E0A" />
        <path d="M${st.x - 12} ${headY - 8} Q${st.x - 8} ${headY - 11} ${st.x - 4} ${headY - 9}" stroke="${st.hair}" stroke-width="1.8" stroke-linecap="round" fill="none"/>

        <ellipse cx="${st.x + 8}" cy="${headY - 4}" rx="3.5" ry="2.5" fill="#FFFFFF" />
        <circle cx="${st.x + 8}" cy="${headY - 5}" r="1.8" fill="#140E0A" />
        <path d="M${st.x + 4} ${headY - 9} Q${st.x + 8} ${headY - 11} ${st.x + 12} ${headY - 8}" stroke="${st.hair}" stroke-width="1.8" stroke-linecap="round" fill="none"/>

        <!-- Nose from below -->
        <path d="M${st.x - 3} ${headY + 3} Q${st.x} ${headY + 6} ${st.x + 3} ${headY + 3}" stroke="${st.skinShadow}" stroke-width="2" stroke-linecap="round" fill="none"/>

        <!-- Confident, smiling mouth looking up -->
        <path d="M${st.x - 8} ${headY + 11} Q${st.x} ${headY + 18} ${st.x + 8} ${headY + 11}" stroke="${st.skinShadow}" stroke-width="2.5" stroke-linecap="round" fill="#FFFFFF"/>
      </g>
    `;
  }

  const studentsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${totalHeight}" width="800" height="${totalHeight}">
    ${svgElements}
  </svg>`;

  // Render to PNG with REAL alpha channel
  const studentsPng = await sharp(Buffer.from(studentsSvg))
    .png({ compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync('assets/map-students.png', studentsPng);
  fs.writeFileSync('public/assets/map-students.png', studentsPng);
  console.log('Saved map-students.png with exact underside contour palms!');

  // Verify programmatically:
  console.log('\n--- Programmatic Verification ---');
  const pngMeta = await sharp(studentsPng).metadata();
  console.log(`Dimensions: ${pngMeta.width}x${pngMeta.height}, Channels: ${pngMeta.channels}, HasAlpha: ${pngMeta.hasAlpha}`);

  // Check left edge for hard cut:
  const rawData = await sharp(studentsPng).raw().toBuffer();
  let opaqueLeft = 0;
  for (let y = 0; y < pngMeta.height; y++) {
    if (rawData[(y * pngMeta.width + 0) * 4 + 3] > 30) opaqueLeft++;
  }
  console.log(`Opaque pixels on x=0 edge: ${opaqueLeft} (must be 0)`);

  // Verify for each hand that distance to map contour is <= 0px (overlap)
  for (const st of students) {
    const lx = st.x - st.handDx;
    const rx = st.x + st.handDx;
    const mapY_l = getContourY(lx);
    const mapY_r = getContourY(rx);
    // Find highest non-transparent pixel in student image around (lx, mapY_l)
    let highestStudentY_l = 9999;
    let highestStudentY_r = 9999;
    for (let dy = -20; dy <= 20; dy++) {
      const checkY_l = mapY_l + dy;
      if (checkY_l >= 0 && checkY_l < pngMeta.height) {
        if (rawData[(checkY_l * pngMeta.width + lx) * 4 + 3] > 30) {
          if (checkY_l < highestStudentY_l) highestStudentY_l = checkY_l;
        }
      }
      const checkY_r = mapY_r + dy;
      if (checkY_r >= 0 && checkY_r < pngMeta.height) {
        if (rawData[(checkY_r * pngMeta.width + rx) * 4 + 3] > 30) {
          if (checkY_r < highestStudentY_r) highestStudentY_r = checkY_r;
        }
      }
    }
    const gap_l = highestStudentY_l - mapY_l;
    const gap_r = highestStudentY_r - mapY_r;
    console.log(`Student ${st.id}: Left Hand gap = ${gap_l}px (target <= 0), Right Hand gap = ${gap_r}px (target <= 0)`);
  }
}

generateMapAndStudents().catch(err => {
  console.error(err);
  process.exit(1);
});
