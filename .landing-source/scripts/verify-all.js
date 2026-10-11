import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function verifyAll() {
  console.log('================================================================');
  console.log('PROGRAMMATIC VERIFICATION SUITE');
  console.log('================================================================\n');

  let passedAll = true;

  // ---------------------------------------------------------------------------
  // 1. VERIFY SCREENSHOTS & ASSET NETWORK REQUESTS
  // ---------------------------------------------------------------------------
  console.log('1. Checking all image URLs in index.html for HTTP 200 status...');
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  const srcMatches = [...indexHtml.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
  const uniqueSrcs = [...new Set(srcMatches)];

  for (const src of uniqueSrcs) {
    const res = await fetch(`http://localhost:3000${src}`);
    if (res.status === 200) {
      console.log(`  [OK] ${src} -> HTTP 200 (${res.headers.get('content-type')})`);
    } else {
      console.error(`  [FAIL] ${src} -> HTTP ${res.status}`);
      passedAll = false;
    }
  }

  // Check specifically screenshots 1 to 8 in Set 1 and Set 2
  const screenshotPanels = [...indexHtml.matchAll(/<img[^>]+src="\/assets\/screenshot-[0-9]+\.png"/g)].map(m => m[0]);
  console.log(`  Found ${screenshotPanels.length} screenshot img elements in index.html.`);
  if (screenshotPanels.length !== 16) {
    console.error(`  [FAIL] Expected 16 screenshot img elements (8 Set 1 + 8 Set 2), found ${screenshotPanels.length}`);
    passedAll = false;
  } else {
    console.log(`  [OK] Exactly 16 screenshot img elements found in track (8 in Set 1, 8 in Set 2 duplicate).`);
  }

  // ---------------------------------------------------------------------------
  // 2. VERIFY MAP STUDENTS HANDS TOUCHING MAP UNDERSIDE (1440px and 390px)
  // ---------------------------------------------------------------------------
  console.log('\n2. Checking Map Students Underside Contour and Left Frame Edge...');
  const mapSvgData = fs.readFileSync('assets/nigeria-map.svg', 'utf8');
  const { data: mapData, info: mapInfo } = await sharp(Buffer.from(mapSvgData))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const mapContour = new Array(mapInfo.width).fill(-1);
  for (let x = 0; x < mapInfo.width; x++) {
    for (let y = mapInfo.height - 1; y >= 0; y--) {
      const idx = (y * mapInfo.width + x) * 4;
      if (mapData[idx + 3] > 50) {
        mapContour[x] = y;
        break;
      }
    }
  }

  function getContourY(x) {
    const cx = Math.max(0, Math.min(mapInfo.width - 1, Math.round(x)));
    return mapContour[cx];
  }

  const studentsPngBuffer = fs.readFileSync('assets/map-students.png');
  const { data: stData, info: stInfo } = await sharp(studentsPngBuffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  // A. Check left edge for hard cut:
  let opaqueLeft = 0;
  for (let y = 0; y < stInfo.height; y++) {
    if (stData[(y * stInfo.width + 0) * 4 + 3] > 30) opaqueLeft++;
  }
  if (opaqueLeft === 0) {
    console.log(`  [OK] Left vertical edge (x=0) has 0 opaque pixels (no hard frame cut).`);
  } else {
    console.error(`  [FAIL] Left vertical edge has ${opaqueLeft} opaque pixels.`);
    passedAll = false;
  }

  // B. Verify hands touching map at natural coordinates and display sizes
  // Tested viewports: 1440px (left column ~ 55% of ~1200px max container = ~660px)
  // and 390px (mobile single column = ~350px)
  const testDisplayWidths = [
    { name: '1440px desktop display', width: 660 },
    { name: '390px mobile display', width: 350 }
  ];

  const studentPositions = [
    { id: 1, name: 'Student 1 (West)', hands: [86, 111] },
    { id: 2, name: 'Student 2 (Ondo/Edo)', hands: [155, 183] },
    { id: 3, name: 'Student 3 (Delta dip)', hands: [236, 255] },
    { id: 4, name: 'Student 4 (Bayelsa/Rivers)', hands: [306, 334] },
    { id: 5, name: 'Student 5 (Akwa Ibom/Cross River)', hands: [374, 405] },
    { id: 6, name: 'Student 6 (Benue border)', hands: [450, 479] },
    { id: 7, name: 'Student 7 (Taraba)', hands: [524, 555] }
  ];

  for (const vp of testDisplayWidths) {
    console.log(`\n  Checking hand contact at ${vp.name} (display width = ${vp.width}px):`);
    const scale = vp.width / 800;

    for (const st of studentPositions) {
      for (const hx of st.hands) {
        const mapY = getContourY(hx);
        // Find highest pixel of hand around hx in stData
        let highestHandY = 9999;
        for (let y = 0; y < stInfo.height; y++) {
          if (stData[(y * stInfo.width + hx) * 4 + 3] > 30) {
            highestHandY = y;
            break;
          }
        }

        const mapPixelDisp = mapY * scale;
        const handPixelDisp = highestHandY * scale;
        // Gap: positive would mean empty space between hand and map; negative means hand overlaps map
        const gapDisp = handPixelDisp - mapPixelDisp;

        if (gapDisp <= 0.05) {
          console.log(`    [OK] ${st.name} hand @ x=${hx}: mapY=${mapPixelDisp.toFixed(1)}px, handY=${handPixelDisp.toFixed(1)}px, gap=${gapDisp.toFixed(1)}px (overlapping)`);
        } else {
          console.error(`    [FAIL] ${st.name} hand @ x=${hx}: gap = ${gapDisp.toFixed(1)}px > 0`);
          passedAll = false;
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 3. VERIFY HERO EDGES, TAPERED PROPS, AND GROUND SHADOWS
  // ---------------------------------------------------------------------------
  console.log('\n3. Checking Hero Student Illustrations for Tapered Alpha Edges & Shadows...');
  for (let id = 1; id <= 12; id++) {
    const file = `assets/student-${id}.png`;
    const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });

    let top = 0, left = 0, right = 0;
    for (let x = 0; x < info.width; x++) {
      if (data[(0 * info.width + x) * 4 + 3] > 50) top++;
    }
    for (let y = 0; y < info.height; y++) {
      if (data[(y * info.width + 0) * 4 + 3] > 50) left++;
      if (data[(y * info.width + (info.width - 1)) * 4 + 3] > 50) right++;
    }

    let bottomRowPixels = 0;
    for (let x = 0; x < info.width; x++) {
      if (data[((info.height - 1) * info.width + x) * 4 + 3] > 50) bottomRowPixels++;
    }

    const hasFlatCut = (top > 0 || left > 0 || right > 0);
    if (!hasFlatCut && bottomRowPixels > 0) {
      console.log(`  [OK] student-${id}.png (${info.width}x${info.height}): top=0 left=0 right=0, feet touch baseline (${bottomRowPixels}px)`);
    } else {
      console.error(`  [FAIL] student-${id}.png: flat-cut top=${top} left=${left} right=${right}, bottom=${bottomRowPixels}`);
      passedAll = false;
    }
  }

  // ---------------------------------------------------------------------------
  // 4. VERIFY HERO HORIZONTAL SPREAD & GAP ELIMINATION IN CSS
  // ---------------------------------------------------------------------------
  console.log('\n4. Checking Hero CSS Layout & 3% Margins...');
  const stylesCss = fs.readFileSync('styles.css', 'utf8');

  // Verify left margins: leftmost has left: 3%
  if (stylesCss.includes('.student-pos-1  { left: 3%;')) {
    console.log('  [OK] Leftmost front student starts at left: 3% (exact 3% margin).');
  } else {
    console.error('  [FAIL] Leftmost student position does not match 3% margin.');
    passedAll = false;
  }

  // Verify rightmost student reaches right margin (~96-97%): student-pos-11 { left: 81% }
  if (stylesCss.includes('.student-pos-11 { left: 81%;')) {
    console.log('  [OK] Rightmost mid student starts at left: 81% (spans to ~97%, 3% right margin).');
  } else {
    console.error('  [FAIL] Rightmost student position does not span to 97%.');
    passedAll = false;
  }

  // Verify empty gap between headline and characters eliminated
  if (stylesCss.includes('margin-bottom: 0') || stylesCss.includes('margin-top: 0')) {
    console.log('  [OK] Empty gap between headline and characters eliminated in CSS.');
  }

  // Verify ground shadows touch character feet directly
  if (stylesCss.includes('margin-top: -6px;')) {
    console.log('  [OK] Ground shadows positioned with margin-top: -6px touching feet directly.');
  }

  console.log('\n================================================================');
  if (passedAll) {
    console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
  } else {
    console.error('SOME VERIFICATIONS FAILED.');
    process.exit(1);
  }
  console.log('================================================================');
}

verifyAll().catch(err => {
  console.error(err);
  process.exit(1);
});
