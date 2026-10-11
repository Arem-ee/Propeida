import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dirs = ['assets', 'public/assets'];
dirs.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

async function saveBoth(filename, buffer) {
  for (const d of dirs) {
    fs.writeFileSync(path.join(d, filename), buffer);
  }
}

async function run() {
  console.log('1. Fetching geoBoundaries real Nigeria GeoJSON...');
  const res = await fetch('https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/NGA/ADM1/geoBoundaries-NGA-ADM1_simplified.geojson');
  if (!res.ok) throw new Error('Failed to fetch geoBoundaries: ' + res.statusText);
  const geojson = await res.json();

  console.log(`Loaded ${geojson.features.length} features.`);

  // Deliberate palette matching reference image:
  // Greens, Blues, Yellows, Reds, Oranges, Purples/Magentas
  const stateColors = {
    'Abia': '#F59E0B',
    'Abuja Federal Capital Territory': '#EF4444',
    'Adamawa': '#EA580C',
    'Akwa Ibom': '#DC2626',
    'Anambra': '#9333EA',
    'Bauchi': '#2563EB',
    'Bayelsa': '#0D9488',
    'Benue': '#DC2626',
    'Borno': '#FACC15',
    'Cross River': '#F97316',
    'Delta': '#FBBF24',
    'Ebonyi': '#C026D3',
    'Edo': '#DC2626',
    'Ekiti': '#FBBF24',
    'Enugu': '#3B82F6',
    'Gombe': '#22C55E',
    'Imo': '#C026D3',
    'Jigawa': '#3B82F6',
    'Kaduna': '#FACC15',
    'Kano': '#DC2626',
    'Katsina': '#D946EF',
    'Kebbi': '#16A34A',
    'Kogi': '#16A34A',
    'Kwara': '#DC2626',
    'Lagos': '#EF4444',
    'Nasarawa': '#FB923C',
    'Niger': '#F97316',
    'Ogun': '#FDE047',
    'Ondo': '#FB923C',
    'Osun': '#3B82F6',
    'Oyo': '#22C55E',
    'Plateau': '#D946EF',
    'Rivers': '#2563EB',
    'Sokoto': '#D946EF',
    'Taraba': '#FACC15',
    'Yobe': '#DC2626',
    'Zamfara': '#2563EB'
  };

  const width = 800;
  const minLon = 2.65, maxLon = 14.72;
  const minLat = 4.20, maxLat = 13.95;
  const meanLat = (minLat + maxLat) / 2 * Math.PI / 180;
  const lonSpan = maxLon - minLon;
  const latSpan = maxLat - minLat;
  const scaleX = width / lonSpan;
  const scaleY = scaleX / Math.cos(meanLat);
  const height = Math.round(latSpan * scaleY);

  function project(lon, lat) {
    const x = ((lon - minLon) * scaleX).toFixed(1);
    const y = ((maxLat - lat) * scaleY).toFixed(1);
    return [x, y];
  }

  function polygonToPath(rings) {
    return rings.map(ring => {
      return ring.map((pt, i) => {
        const [x, y] = project(pt[0], pt[1]);
        return (i === 0 ? 'M' : 'L') + x + ' ' + y;
      }).join(' ') + ' Z';
    }).join(' ');
  }

  let pathsSvg = '';
  // Sort states alphabetically for clean DOM
  const sortedFeatures = [...geojson.features].sort((a, b) => 
    a.properties.shapeName.localeCompare(b.properties.shapeName)
  );

  sortedFeatures.forEach(f => {
    const name = f.properties.shapeName;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const color = stateColors[name] || '#3B82F6';
    let d = '';
    if (f.geometry.type === 'Polygon') {
      d = polygonToPath(f.geometry.coordinates);
    } else if (f.geometry.type === 'MultiPolygon') {
      d = f.geometry.coordinates.map(polygonToPath).join(' ');
    }
    pathsSvg += `  <path id="state-${slug}" class="nigeria-state" d="${d}" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">\n    <title>${name}</title>\n  </path>\n`;
  });

  const fullMapSvg = `<svg id="nigeria-map-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Interactive Map of Nigeria with 36 states and the Federal Capital Territory">\n${pathsSvg}</svg>`;

  fs.writeFileSync('assets/nigeria-map.svg', fullMapSvg);
  fs.writeFileSync('public/assets/nigeria-map.svg', fullMapSvg);
  console.log(`Saved Nigeria SVG (${(fullMapSvg.length / 1024).toFixed(1)} KB)`);

  // 2. Generate Students Supporting Map Illustration (PNG with REAL alpha channel)
  // Low-angle perspective looking up, arms raised, hands pressed up against map underside
  const studentsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 480" width="1000" height="480">
    <g class="students-support">
      <!-- Student 1 (Far Left, Female) -->
      <g id="student-s1">
        <!-- Body / Plum T-shirt -->
        <path d="M40 380 L130 360 L140 480 L30 480 Z" fill="#9333EA"/>
        <path d="M75 375 L85 410 L95 375" fill="#7E22CE"/>
        <!-- Head / Braids in high bun -->
        <ellipse cx="85" cy="330" rx="30" ry="34" fill="#3E2016"/>
        <circle cx="85" cy="285" r="26" fill="#18110B"/>
        <!-- Arms raised high overhead -->
        <path d="M50 370 Q45 270 70 210" stroke="#3E2016" stroke-width="26" stroke-linecap="round"/>
        <path d="M120 365 Q115 265 105 210" stroke="#3E2016" stroke-width="24" stroke-linecap="round"/>
        <!-- Hands pressing against map underside -->
        <ellipse cx="70" cy="200" rx="16" ry="12" fill="#3E2016" transform="rotate(-15 70 200)"/>
        <ellipse cx="105" cy="200" rx="16" ry="12" fill="#3E2016" transform="rotate(15 105 200)"/>
      </g>

      <!-- Student 2 (Mid-Left, Male) -->
      <g id="student-s2">
        <!-- Body / Teal Hoodie -->
        <path d="M170 340 L280 340 L290 480 L160 480 Z" fill="#0D9488"/>
        <!-- Head / Low fade, rich chocolate tone -->
        <ellipse cx="225" cy="310" rx="34" ry="38" fill="#341A0F"/>
        <path d="M195 295 C195 265 255 265 255 295 Z" fill="#120D08"/>
        <!-- Arms raised high -->
        <path d="M185 340 Q175 220 205 150" stroke="#341A0F" stroke-width="28" stroke-linecap="round"/>
        <path d="M265 340 Q275 220 245 150" stroke="#341A0F" stroke-width="28" stroke-linecap="round"/>
        <!-- Hands / Palms up -->
        <ellipse cx="205" cy="140" rx="18" ry="14" fill="#341A0F" transform="rotate(-10 205 140)"/>
        <ellipse cx="245" cy="140" rx="18" ry="14" fill="#341A0F" transform="rotate(10 245 140)"/>
      </g>

      <!-- Student 3 (Center-Left, Female) -->
      <g id="student-s3">
        <!-- Body / Mustard Sweater -->
        <path d="M310 330 L420 330 L430 480 L300 480 Z" fill="#EAB308"/>
        <!-- Head / Afro puffs on sides -->
        <ellipse cx="365" cy="295" rx="32" ry="36" fill="#422216"/>
        <circle cx="328" cy="268" r="22" fill="#18110B"/>
        <circle cx="402" cy="268" r="22" fill="#18110B"/>
        <!-- Arms stretched up -->
        <path d="M325 330 Q320 200 350 130" stroke="#422216" stroke-width="26" stroke-linecap="round"/>
        <path d="M405 330 Q410 200 380 130" stroke="#422216" stroke-width="26" stroke-linecap="round"/>
        <!-- Hands -->
        <ellipse cx="350" cy="120" rx="17" ry="13" fill="#422216" transform="rotate(-5 350 120)"/>
        <ellipse cx="380" cy="120" rx="17" ry="13" fill="#422216" transform="rotate(5 380 120)"/>
      </g>

      <!-- Student 4 (Center, Male) -->
      <g id="student-s4">
        <!-- Body / Coral Red Tee -->
        <path d="M450 310 L560 310 L570 480 L440 480 Z" fill="#EF4444"/>
        <!-- Head / Short natural curls -->
        <ellipse cx="505" cy="270" rx="34" ry="38" fill="#30170D"/>
        <circle cx="505" cy="238" r="24" fill="#110C07"/>
        <!-- Arms reaching highest in center -->
        <path d="M465 310 Q450 180 485 100" stroke="#30170D" stroke-width="28" stroke-linecap="round"/>
        <path d="M545 310 Q560 180 525 100" stroke="#30170D" stroke-width="28" stroke-linecap="round"/>
        <!-- Hands pressed up flat -->
        <ellipse cx="485" cy="90" rx="18" ry="14" fill="#30170D"/>
        <ellipse cx="525" cy="90" rx="18" ry="14" fill="#30170D"/>
      </g>

      <!-- Student 5 (Center-Right, Female) -->
      <g id="student-s5">
        <!-- Body / Cobalt Royal Blue Top -->
        <path d="M590 330 L700 330 L710 480 L580 480 Z" fill="#2563EB"/>
        <!-- Head / Braided crown -->
        <ellipse cx="645" cy="295" rx="32" ry="36" fill="#3D2015"/>
        <path d="M615 285 C615 255 675 255 675 285 Z" fill="#16100A"/>
        <!-- Arms raised -->
        <path d="M605 330 Q600 200 630 130" stroke="#3D2015" stroke-width="26" stroke-linecap="round"/>
        <path d="M685 330 Q690 200 660 130" stroke="#3D2015" stroke-width="26" stroke-linecap="round"/>
        <!-- Hands -->
        <ellipse cx="630" cy="120" rx="17" ry="13" fill="#3D2015" transform="rotate(-5 630 120)"/>
        <ellipse cx="660" cy="120" rx="17" ry="13" fill="#3D2015" transform="rotate(5 660 120)"/>
      </g>

      <!-- Student 6 (Mid-Right, Male) -->
      <g id="student-s6">
        <!-- Body / Forest Green Polo -->
        <path d="M730 340 L840 340 L850 480 L720 480 Z" fill="#16A34A"/>
        <!-- Head / Clean buzz cut -->
        <ellipse cx="785" cy="310" rx="34" ry="38" fill="#361B10"/>
        <path d="M755 295 C755 265 815 265 815 295 Z" fill="#140E09"/>
        <!-- Arms raised -->
        <path d="M745 340 Q735 220 765 150" stroke="#361B10" stroke-width="28" stroke-linecap="round"/>
        <path d="M825 340 Q835 220 805 150" stroke="#361B10" stroke-width="28" stroke-linecap="round"/>
        <!-- Hands -->
        <ellipse cx="765" cy="140" rx="18" ry="14" fill="#361B10" transform="rotate(-10 765 140)"/>
        <ellipse cx="805" cy="140" rx="18" ry="14" fill="#361B10" transform="rotate(10 805 140)"/>
      </g>

      <!-- Student 7 (Far Right, Female) -->
      <g id="student-s7">
        <!-- Body / Orange Blouse -->
        <path d="M870 380 L960 360 L970 480 L860 480 Z" fill="#EA580C"/>
        <!-- Head / High braided ponytail -->
        <ellipse cx="915" cy="330" rx="30" ry="34" fill="#442316"/>
        <circle cx="915" cy="285" r="26" fill="#18110B"/>
        <!-- Arms raised -->
        <path d="M880 365 Q875 265 895 210" stroke="#442316" stroke-width="24" stroke-linecap="round"/>
        <path d="M950 370 Q955 270 930 210" stroke="#442316" stroke-width="26" stroke-linecap="round"/>
        <!-- Hands -->
        <ellipse cx="895" cy="200" rx="16" ry="12" fill="#442316" transform="rotate(-15 895 200)"/>
        <ellipse cx="930" cy="200" rx="16" ry="12" fill="#442316" transform="rotate(15 930 200)"/>
      </g>
    </g>
  </svg>`;

  const studentsPngBuffer = await sharp(Buffer.from(studentsSvg))
    .png({ compressionLevel: 9 })
    .toBuffer();
  await saveBoth('students-supporting-map.png', studentsPngBuffer);
  console.log('Saved students-supporting-map.png');

  // 3. Generate 3 Blog Card Illustrations (PNG with true alpha channel)
  const blog1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
    <rect width="640" height="360" fill="#FFFFFF"/>
    <!-- Soft background decorative circles -->
    <circle cx="120" cy="80" r="60" fill="#EFF6FF" opacity="0.8"/>
    <circle cx="540" cy="280" r="80" fill="#F0FDF4" opacity="0.8"/>
    <!-- Desk surface -->
    <rect x="80" y="270" width="480" height="12" rx="6" fill="#CBD5E1"/>
    <!-- Laptop -->
    <rect x="360" y="200" width="90" height="65" rx="5" fill="#1E293B"/>
    <rect x="365" y="205" width="80" height="55" rx="3" fill="#38BDF8"/>
    <rect x="345" y="265" width="120" height="8" rx="2" fill="#94A3B8"/>
    <!-- Stack of Books -->
    <rect x="120" y="240" width="90" height="14" rx="3" fill="#2563EB"/>
    <rect x="125" y="224" width="80" height="14" rx="3" fill="#EAB308"/>
    <rect x="130" y="208" width="70" height="14" rx="3" fill="#10B981"/>
    <!-- Student Studying (Female, chocolate skin, box braids) -->
    <ellipse cx="270" cy="150" rx="28" ry="32" fill="#3F2015"/>
    <circle cx="270" cy="115" r="24" fill="#161009"/>
    <path d="M245 135 Q225 180 230 220" stroke="#161009" stroke-width="6" stroke-linecap="round"/>
    <path d="M295 135 Q315 180 310 220" stroke="#161009" stroke-width="6" stroke-linecap="round"/>
    <!-- Torso -->
    <path d="M230 190 L310 190 L300 270 L240 270 Z" fill="#F43F5E"/>
    <!-- Arms writing on notebook -->
    <path d="M240 200 Q220 240 250 255" stroke="#3F2015" stroke-width="16" stroke-linecap="round"/>
    <path d="M300 200 Q320 240 290 255" stroke="#3F2015" stroke-width="16" stroke-linecap="round"/>
    <!-- Notebook & Pen -->
    <rect x="245" y="248" width="50" height="22" rx="3" fill="#F8FAFC" stroke="#64748B"/>
    <line x1="285" y1="245" x2="295" y2="235" stroke="#2563EB" stroke-width="3" stroke-linecap="round"/>
  </svg>`;

  const blog2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
    <rect width="640" height="360" fill="#FFFFFF"/>
    <!-- Decorative background elements -->
    <circle cx="500" cy="90" r="70" fill="#FEF3C7" opacity="0.7"/>
    <circle cx="100" cy="270" r="60" fill="#EFF6FF" opacity="0.8"/>
    <!-- Exam Timetable Board -->
    <rect x="290" y="70" width="220" height="210" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
    <rect x="310" y="90" width="120" height="14" rx="3" fill="#2563EB"/>
    <rect x="310" y="120" width="180" height="10" rx="2" fill="#E2E8F0"/>
    <rect x="310" y="145" width="180" height="10" rx="2" fill="#E2E8F0"/>
    <rect x="310" y="170" width="180" height="10" rx="2" fill="#E2E8F0"/>
    <rect x="310" y="195" width="180" height="10" rx="2" fill="#E2E8F0"/>
    <circle cx="475" cy="125" r="5" fill="#10B981"/>
    <circle cx="475" cy="150" r="5" fill="#10B981"/>
    <circle cx="475" cy="175" r="5" fill="#2563EB"/>
    <!-- Checklist card -->
    <rect x="250" y="170" width="110" height="110" rx="8" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.5"/>
    <circle cx="270" cy="195" r="6" fill="#10B981"/>
    <circle cx="270" cy="225" r="6" fill="#10B981"/>
    <circle cx="270" cy="255" r="6" fill="#CBD5E1"/>
    <line x1="285" y1="195" x2="340" y2="195" stroke="#334155" stroke-width="2"/>
    <line x1="285" y1="225" x2="340" y2="225" stroke="#334155" stroke-width="2"/>
    <line x1="285" y1="255" x2="330" y2="255" stroke="#94A3B8" stroke-width="2"/>
    <!-- Student (Male, fade haircut, deep brown skin) -->
    <ellipse cx="180" cy="140" rx="28" ry="32" fill="#351B0F"/>
    <path d="M155 125 C155 100 205 100 205 125 Z" fill="#130E08"/>
    <!-- Torso / Blue Button-down -->
    <path d="M140 180 L220 180 L225 290 L135 290 Z" fill="#2563EB"/>
    <!-- Arm holding pen marking board -->
    <path d="M190 195 Q230 180 260 170" stroke="#351B0F" stroke-width="16" stroke-linecap="round"/>
    <line x1="260" y1="170" x2="280" y2="160" stroke="#0D9488" stroke-width="4" stroke-linecap="round"/>
  </svg>`;

  const blog3Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
    <rect width="640" height="360" fill="#FFFFFF"/>
    <!-- Background glow -->
    <circle cx="320" cy="180" r="120" fill="#EFF6FF" opacity="0.6"/>
    <!-- Interactive Digital Display -->
    <rect x="220" y="80" width="200" height="150" rx="10" fill="#0F172A"/>
    <rect x="230" y="90" width="180" height="130" rx="6" fill="#1E293B"/>
    <!-- Charts on screen -->
    <polyline points="245,180 270,160 300,170 330,130 360,140 390,110" fill="none" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>
    <circle cx="390" cy="110" r="4" fill="#FACC15"/>
    <rect x="245" y="195" width="25" height="12" rx="2" fill="#10B981"/>
    <rect x="275" y="195" width="25" height="12" rx="2" fill="#F59E0B"/>
    <rect x="305" y="195" width="25" height="12" rx="2" fill="#6366F1"/>
    <!-- Stand -->
    <rect x="312" y="230" width="16" height="60" fill="#64748B"/>
    <ellipse cx="320" cy="290" rx="50" ry="10" fill="#475569"/>
    <!-- Two Students Collaborating -->
    <!-- Student Left (Male with locs, orange top) -->
    <ellipse cx="160" cy="160" rx="26" ry="30" fill="#361B10"/>
    <circle cx="160" cy="130" r="22" fill="#150E09"/>
    <path d="M125 200 L195 200 L190 290 L130 290 Z" fill="#EA580C"/>
    <path d="M170 210 Q210 190 235 170" stroke="#361B10" stroke-width="14" stroke-linecap="round"/>
    <!-- Student Right (Female with bun, yellow skirt) -->
    <ellipse cx="480" cy="160" rx="26" ry="30" fill="#422216"/>
    <circle cx="480" cy="125" r="22" fill="#18110B"/>
    <path d="M445 200 L515 200 L520 290 L440 290 Z" fill="#0D9488"/>
    <path d="M470 210 Q430 190 405 170" stroke="#422216" stroke-width="14" stroke-linecap="round"/>
  </svg>`;

  const b1 = await sharp(Buffer.from(blog1Svg)).png().toBuffer();
  const b2 = await sharp(Buffer.from(blog2Svg)).png().toBuffer();
  const b3 = await sharp(Buffer.from(blog3Svg)).png().toBuffer();

  await saveBoth('blog-1.png', b1);
  await saveBoth('blog-2.png', b2);
  await saveBoth('blog-3.png', b3);
  console.log('Saved blog-1.png, blog-2.png, blog-3.png');

  // 4. Generate screenshot-1.png through screenshot-8.png as REAL binary PNGs
  const screenshotConfigs = [
    { id: 1, title: 'Diagnostic Exam Simulator', color: '#2563EB', accent: '#3B82F6' },
    { id: 2, title: 'Adaptive Practice Quizzes', color: '#0D9488', accent: '#14B8A6' },
    { id: 3, title: 'Performance Analytics Dashboard', color: '#7C3AED', accent: '#8B5CF6' },
    { id: 4, title: 'Topic Mastery Matrix', color: '#EA580C', accent: '#F97316' },
    { id: 5, title: 'Smart Revision Timetable', color: '#059669', accent: '#10B981' },
    { id: 6, title: 'Step-by-Step Video Solutions', color: '#D97706', accent: '#F59E0B' },
    { id: 7, title: 'WAEC Past Questions Explorer', color: '#DC2626', accent: '#EF4444' },
    { id: 8, title: 'Real-Time Weakness Analyzer', color: '#2563EB', accent: '#60A5FA' },
  ];

  for (const s of screenshotConfigs) {
    const sSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
      <rect width="640" height="400" rx="20" fill="#F8FAFC"/>
      <!-- Header bar -->
      <rect width="640" height="52" fill="#FFFFFF"/>
      <line x1="0" y1="52" x2="640" y2="52" stroke="#E2E8F0" stroke-width="1.5"/>
      <circle cx="28" cy="26" r="6" fill="${s.color}"/>
      <rect x="44" y="20" width="90" height="12" rx="3" fill="#0F172A"/>
      <rect x="150" y="22" width="60" height="8" rx="2" fill="#94A3B8"/>
      <rect x="220" y="22" width="60" height="8" rx="2" fill="#CBD5E1"/>
      <rect x="290" y="22" width="60" height="8" rx="2" fill="#CBD5E1"/>
      <rect x="520" y="16" width="92" height="20" rx="4" fill="#F1F5F9"/>
      <circle cx="598" cy="26" r="9" fill="${s.accent}"/>
      <!-- Left sidebar -->
      <rect x="0" y="52" width="130" height="348" fill="#FFFFFF"/>
      <line x1="130" y1="52" x2="130" y2="400" stroke="#E2E8F0" stroke-width="1.5"/>
      <rect x="14" y="75" width="102" height="26" rx="6" fill="${s.color}" fill-opacity="0.12"/>
      <rect x="24" y="82" width="70" height="10" rx="3" fill="${s.color}"/>
      <rect x="24" y="118" width="75" height="9" rx="3" fill="#64748B"/>
      <rect x="24" y="148" width="80" height="9" rx="3" fill="#94A3B8"/>
      <rect x="24" y="178" width="65" height="9" rx="3" fill="#94A3B8"/>
      <rect x="24" y="208" width="70" height="9" rx="3" fill="#94A3B8"/>
      <!-- Content -->
      <rect x="155" y="75" width="180" height="18" rx="4" fill="#0F172A"/>
      <rect x="155" y="100" width="260" height="10" rx="3" fill="#64748B"/>
      <!-- 3 summary cards -->
      <rect x="155" y="125" width="140" height="60" rx="8" fill="#FFFFFF" stroke="#E2E8F0"/>
      <rect x="170" y="140" width="50" height="8" rx="2" fill="#94A3B8"/>
      <rect x="170" y="156" width="80" height="16" rx="3" fill="${s.color}"/>
      <rect x="310" y="125" width="140" height="60" rx="8" fill="#FFFFFF" stroke="#E2E8F0"/>
      <rect x="325" y="140" width="55" height="8" rx="2" fill="#94A3B8"/>
      <rect x="325" y="156" width="70" height="16" rx="3" fill="#059669"/>
      <rect x="465" y="125" width="145" height="60" rx="8" fill="#FFFFFF" stroke="#E2E8F0"/>
      <rect x="480" y="140" width="60" height="8" rx="2" fill="#94A3B8"/>
      <rect x="480" y="156" width="75" height="16" rx="3" fill="${s.accent}"/>
      <!-- Table panel -->
      <rect x="155" y="200" width="455" height="175" rx="10" fill="#FFFFFF" stroke="#E2E8F0"/>
      <rect x="175" y="220" width="140" height="14" rx="3" fill="#1E293B"/>
      <rect x="175" y="250" width="415" height="32" rx="6" fill="#F8FAFC"/>
      <circle cx="195" cy="266" r="6" fill="${s.color}"/>
      <rect x="215" y="261" width="180" height="10" rx="2" fill="#334155"/>
      <rect x="520" y="258" width="55" height="16" rx="4" fill="${s.color}" fill-opacity="0.15"/>
      <rect x="175" y="290" width="415" height="32" rx="6" fill="#F8FAFC"/>
      <circle cx="195" cy="306" r="6" fill="#10B981"/>
      <rect x="215" y="301" width="220" height="10" rx="2" fill="#334155"/>
      <rect x="520" y="298" width="55" height="16" rx="4" fill="#10B981" fill-opacity="0.15"/>
      <rect x="175" y="330" width="415" height="30" rx="6" fill="#F8FAFC"/>
      <circle cx="195" cy="345" r="6" fill="${s.accent}"/>
      <rect x="215" y="340" width="160" height="10" rx="2" fill="#334155"/>
      <rect x="520" y="337" width="55" height="16" rx="4" fill="${s.accent}" fill-opacity="0.15"/>
    </svg>`;

    const sPngBuffer = await sharp(Buffer.from(sSvg)).png().toBuffer();
    await saveBoth(`screenshot-${s.id}.png`, sPngBuffer);
  }
  console.log('Saved screenshot-1.png to screenshot-8.png');

  // 5. Programmatic Verification: Check Alpha Channels
  console.log('Verifying alpha channels...');
  const filesToCheck = [
    'assets/students-supporting-map.png',
    'assets/blog-1.png',
    'assets/blog-2.png',
    'assets/blog-3.png',
    'assets/screenshot-1.png'
  ];

  for (const f of filesToCheck) {
    const meta = await sharp(f).metadata();
    console.log(`File: ${f} -> Channels: ${meta.channels}, Has Alpha: ${meta.hasAlpha}, Format: ${meta.format}`);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
