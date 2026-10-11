import fs from 'fs';
import path from 'path';

// Ensure directories
const dirs = ['assets', 'public/assets'];
dirs.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Helper to save to both assets and public/assets
function saveAsset(filename, content) {
  dirs.forEach(d => {
    fs.writeFileSync(path.join(d, filename), content.trim());
  });
}

// 12 Nigerian student illustrations in Rafiki / Storyset flat vector style
// Characters feature diverse chocolate & deep brown skin tones, distinctive hairstyles, outfits, and productive poses.

// 1. girl sitting cross-legged reading a thick book
const student1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" fill="none">
  <!-- Girl cross-legged reading thick book -->
  <g class="character">
    <!-- Legs cross-legged -->
    <path d="M70 260 C70 230 110 225 160 225 C210 225 250 230 250 260 C240 280 200 285 160 285 C120 285 80 280 70 260 Z" fill="#0D9488"/>
    <!-- Feet with stylish flats -->
    <ellipse cx="85" cy="265" rx="16" ry="10" fill="#3B1E12" transform="rotate(-15 85 265)"/>
    <ellipse cx="235" cy="265" rx="16" ry="10" fill="#3B1E12" transform="rotate(15 235 265)"/>
    <ellipse cx="80" cy="268" rx="14" ry="7" fill="#F59E0B"/>
    <ellipse cx="240" cy="268" rx="14" ry="7" fill="#F59E0B"/>
    <!-- Torso / Yellow Mustard Blouse -->
    <path d="M125 155 L115 235 L205 235 L195 155 Z" fill="#F59E0B"/>
    <path d="M130 155 L160 185 L190 155" fill="#D97706"/>
    <!-- Arms holding book -->
    <path d="M120 160 C100 185 110 215 135 220" stroke="#452317" stroke-width="20" stroke-linecap="round"/>
    <path d="M200 160 C220 185 210 215 185 220" stroke="#452317" stroke-width="20" stroke-linecap="round"/>
    <!-- Hands -->
    <circle cx="138" cy="218" r="11" fill="#452317"/>
    <circle cx="182" cy="218" r="11" fill="#452317"/>
    <!-- Thick Book -->
    <path d="M110 210 Q160 222 210 210 L212 240 Q160 250 108 240 Z" fill="#1E3A8A"/>
    <!-- Book pages -->
    <path d="M112 212 Q160 223 208 212 L206 236 Q160 245 114 236 Z" fill="#FEF3C7"/>
    <line x1="160" y1="219" x2="160" y2="243" stroke="#D97706" stroke-width="2"/>
    <line x1="125" y1="223" x2="150" y2="225" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>
    <line x1="125" y1="229" x2="148" y2="231" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>
    <line x1="170" y1="225" x2="195" y2="223" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>
    <line x1="172" y1="231" x2="195" y2="229" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>
    <!-- Neck -->
    <rect x="150" y="130" width="20" height="30" rx="5" fill="#452317"/>
    <!-- Head / Face (Chocolate complexion) -->
    <ellipse cx="160" cy="115" rx="28" ry="34" fill="#452317"/>
    <!-- Face details (soft profile) -->
    <path d="M152 118 Q160 124 168 118" stroke="#1F100B" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="147" cy="110" rx="3.5" ry="4" fill="#1F100B"/>
    <ellipse cx="173" cy="110" rx="3.5" ry="4" fill="#1F100B"/>
    <path d="M142 102 Q148 100 153 103" stroke="#1F100B" stroke-width="2.5" fill="none"/>
    <path d="M167 103 Q172 100 178 102" stroke="#1F100B" stroke-width="2.5" fill="none"/>
    <!-- Braided crown / box braids hairstyle -->
    <path d="M130 105 C125 70 195 70 190 105 C185 75 135 75 130 105 Z" fill="#1A120B"/>
    <ellipse cx="160" cy="72" rx="26" ry="18" fill="#1A120B"/>
    <!-- Braids hanging down -->
    <path d="M132 95 Q120 130 122 170" stroke="#1A120B" stroke-width="8" stroke-linecap="round"/>
    <path d="M138 92 Q128 135 130 175" stroke="#2C1B10" stroke-width="7" stroke-linecap="round"/>
    <path d="M188 95 Q200 130 198 170" stroke="#1A120B" stroke-width="8" stroke-linecap="round"/>
    <path d="M182 92 Q192 135 190 175" stroke="#2C1B10" stroke-width="7" stroke-linecap="round"/>
    <!-- Golden hair cuffs -->
    <rect x="121" y="140" width="7" height="4" rx="2" fill="#F59E0B"/>
    <rect x="192" y="142" width="7" height="4" rx="2" fill="#F59E0B"/>
  </g>
</svg>`;

// 2. boy lying on his stomach reading, feet in the air
const student2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240" fill="none">
  <!-- Boy lying on stomach reading, feet in air -->
  <g class="character">
    <!-- Legs raised in air behind -->
    <path d="M70 150 C50 110 50 60 75 40 C85 55 70 100 100 140" fill="#1E3A8A"/>
    <path d="M95 150 C80 115 85 70 110 50 C120 65 105 105 125 140" fill="#2563EB"/>
    <!-- Sneaker feet kicking up -->
    <path d="M68 38 C75 25 90 28 92 42 C85 48 72 48 68 38 Z" fill="#EF4444"/>
    <ellipse cx="80" cy="35" rx="8" ry="4" fill="#FFFFFF"/>
    <path d="M103 48 C110 35 125 38 127 52 C120 58 107 58 103 48 Z" fill="#EF4444"/>
    <ellipse cx="115" cy="45" rx="8" ry="4" fill="#FFFFFF"/>
    <!-- Body / Orange Polo Shirt -->
    <path d="M90 160 C100 130 160 120 220 130 L230 175 C180 185 110 185 90 160 Z" fill="#EA580C"/>
    <!-- Arm supporting chin -->
    <path d="M200 150 Q230 190 250 165" stroke="#381D14" stroke-width="18" stroke-linecap="round"/>
    <ellipse cx="254" cy="160" rx="9" ry="8" fill="#381D14"/>
    <!-- Other arm turned page -->
    <path d="M175 160 Q205 185 220 180" stroke="#381D14" stroke-width="16" stroke-linecap="round"/>
    <!-- Open book on ground -->
    <path d="M225 185 Q260 180 295 185 L300 205 Q260 200 220 205 Z" fill="#047857"/>
    <path d="M228 187 Q260 182 292 187 L290 202 Q260 197 225 202 Z" fill="#F8FAFC"/>
    <line x1="260" y1="183" x2="260" y2="201" stroke="#047857" stroke-width="1.5"/>
    <!-- Head / Fade Haircut (Deep brown skin) -->
    <ellipse cx="265" cy="130" rx="24" ry="26" fill="#381D14"/>
    <!-- Fade haircut -->
    <path d="M250 120 C250 102 285 102 288 118 C288 126 280 128 275 128 C265 128 250 126 250 120 Z" fill="#17100B"/>
    <!-- Facial profile looking down at book -->
    <ellipse cx="272" cy="133" rx="3" ry="3.5" fill="#17100B"/>
    <path d="M276 138 Q273 143 268 143" stroke="#17100B" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;

// 3. girl sitting on a stack of books, writing in a notebook
const student3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 340" fill="none">
  <!-- Girl sitting on stack of books writing in notebook -->
  <g class="character">
    <!-- Giant Stack of Books -->
    <!-- Book 1 (bottom) -->
    <rect x="80" y="275" width="160" height="30" rx="5" fill="#DC2626"/>
    <rect x="90" y="280" width="145" height="20" rx="2" fill="#FEF3C7"/>
    <!-- Book 2 (middle) -->
    <rect x="95" y="245" width="140" height="28" rx="4" fill="#0284C7"/>
    <rect x="105" y="250" width="125" height="18" rx="2" fill="#F8FAFC"/>
    <!-- Book 3 (top) -->
    <rect x="90" y="215" width="150" height="28" rx="4" fill="#16A34A"/>
    <rect x="100" y="220" width="135" height="18" rx="2" fill="#FEF3C7"/>
    
    <!-- Girl sitting on top book -->
    <!-- Legs dangling -->
    <path d="M125 220 L120 270 L115 295" stroke="#3D2014" stroke-width="16" stroke-linecap="round"/>
    <path d="M150 220 L155 270 L160 295" stroke="#3D2014" stroke-width="16" stroke-linecap="round"/>
    <!-- Coral / Pink Culottes -->
    <path d="M110 210 L165 210 L160 250 L115 250 Z" fill="#F43F5E"/>
    <!-- Shoes -->
    <ellipse cx="112" cy="298" rx="10" ry="6" fill="#1E293B"/>
    <ellipse cx="163" cy="298" rx="10" ry="6" fill="#1E293B"/>
    <!-- Torso / Cream Sweater -->
    <path d="M115 130 L160 130 L155 210 L120 210 Z" fill="#FDE047"/>
    <!-- Arms holding notebook & writing -->
    <path d="M120 140 Q105 170 130 180" stroke="#3D2014" stroke-width="14" stroke-linecap="round"/>
    <path d="M155 140 Q170 170 145 180" stroke="#3D2014" stroke-width="14" stroke-linecap="round"/>
    <!-- Notebook on lap -->
    <rect x="120" y="168" width="36" height="24" rx="3" fill="#FFFFFF" stroke="#0284C7" stroke-width="2" transform="rotate(-8 138 180)"/>
    <line x1="125" y1="175" x2="148" y2="173" stroke="#94A3B8" stroke-width="1.5"/>
    <line x1="125" y1="180" x2="145" y2="178" stroke="#94A3B8" stroke-width="1.5"/>
    <!-- Pen in hand -->
    <line x1="148" y1="172" x2="158" y2="162" stroke="#2563EB" stroke-width="3" stroke-linecap="round"/>
    <!-- Head / High Afro Puff Hair -->
    <ellipse cx="138" cy="95" rx="22" ry="26" fill="#3D2014"/>
    <!-- Eyeglasses (stylish round specs) -->
    <circle cx="132" cy="95" r="7" stroke="#D97706" stroke-width="2" fill="none"/>
    <circle cx="147" cy="95" r="7" stroke="#D97706" stroke-width="2" fill="none"/>
    <line x1="139" y1="95" x2="140" y2="95" stroke="#D97706" stroke-width="2"/>
    <!-- Smile -->
    <path d="M136 108 Q140 112 145 108" stroke="#1F100B" stroke-width="2" fill="none"/>
    <!-- Afro puff hair on top -->
    <circle cx="138" cy="60" r="28" fill="#18110B"/>
    <!-- Hair tie -->
    <ellipse cx="138" cy="74" rx="14" ry="5" fill="#F43F5E"/>
  </g>
</svg>`;

// 4. boy sitting against a tree trunk reading a tablet
const student4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 340" fill="none">
  <!-- Boy sitting against tree trunk reading tablet -->
  <g class="character">
    <!-- Tree Trunk background element -->
    <path d="M40 0 C60 120 70 240 50 340 L110 340 C120 220 110 100 90 0 Z" fill="#78350F"/>
    <path d="M95 140 C115 150 130 180 120 220" stroke="#92400E" stroke-width="8" stroke-linecap="round"/>
    <!-- Tree foliage hint -->
    <circle cx="70" cy="40" r="45" fill="#15803D" opacity="0.8"/>
    <circle cx="110" cy="25" r="40" fill="#16A34A" opacity="0.85"/>
    
    <!-- Boy leaning back against tree -->
    <!-- Legs stretched out -->
    <path d="M130 250 L230 290 L270 290" stroke="#047857" stroke-width="24" stroke-linecap="round"/>
    <path d="M120 260 L200 295 L250 295" stroke="#065F46" stroke-width="20" stroke-linecap="round"/>
    <!-- Sneakers -->
    <ellipse cx="275" cy="288" rx="14" ry="8" fill="#F8FAFC"/>
    <ellipse cx="255" cy="294" rx="14" ry="8" fill="#EA580C"/>
    <!-- Torso / Mustard Hoodie -->
    <path d="M95 190 C105 180 145 190 145 260 L105 260 Z" fill="#D97706"/>
    <!-- Arms holding tablet up -->
    <path d="M120 205 Q150 240 180 215" stroke="#361C12" stroke-width="16" stroke-linecap="round"/>
    <!-- Tablet in hands -->
    <rect x="175" y="190" width="34" height="48" rx="4" fill="#0F172A" transform="rotate(-15 192 214)"/>
    <rect x="178" y="193" width="28" height="42" rx="2" fill="#38BDF8" transform="rotate(-15 192 214)"/>
    <!-- Glow from screen on face -->
    <ellipse cx="140" cy="160" rx="10" ry="15" fill="#BAE6FD" opacity="0.25"/>
    <!-- Head / Dreadlocks tied back -->
    <ellipse cx="132" cy="155" rx="22" ry="25" fill="#361C12"/>
    <!-- Dreads -->
    <path d="M120 140 C110 130 135 125 145 135" fill="#19110B"/>
    <path d="M110 145 Q85 160 85 190" stroke="#19110B" stroke-width="7" stroke-linecap="round"/>
    <path d="M115 140 Q90 155 92 185" stroke="#19110B" stroke-width="6" stroke-linecap="round"/>
    <path d="M120 135 Q95 145 98 175" stroke="#19110B" stroke-width="6" stroke-linecap="round"/>
    <!-- Profile looking at tablet -->
    <ellipse cx="143" cy="155" rx="3" ry="3.5" fill="#19110B"/>
    <path d="M142 165 Q147 167 150 163" stroke="#19110B" stroke-width="2" fill="none"/>
  </g>
</svg>`;

// 5. girl standing, holding an open book close to her face
const student5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 360" fill="none">
  <!-- Girl standing, holding open book close to face -->
  <g class="character">
    <!-- Legs / Plaid or Navy Pleated Skirt & legs -->
    <line x1="115" y1="240" x2="112" y2="330" stroke="#482519" stroke-width="14" stroke-linecap="round"/>
    <line x1="145" y1="240" x2="148" y2="330" stroke="#482519" stroke-width="14" stroke-linecap="round"/>
    <!-- Ankle socks & Mary Jane shoes -->
    <rect x="105" y="315" width="14" height="15" rx="2" fill="#FFFFFF"/>
    <rect x="141" y="315" width="14" height="15" rx="2" fill="#FFFFFF"/>
    <ellipse cx="112" cy="336" rx="14" ry="7" fill="#1E293B"/>
    <ellipse cx="148" cy="336" rx="14" ry="7" fill="#1E293B"/>
    <!-- Skirt -->
    <path d="M98 190 L162 190 L175 245 L85 245 Z" fill="#4338CA"/>
    <line x1="110" y1="190" x2="105" y2="245" stroke="#312E81" stroke-width="2"/>
    <line x1="130" y1="190" x2="130" y2="245" stroke="#312E81" stroke-width="2"/>
    <line x1="150" y1="190" x2="155" y2="245" stroke="#312E81" stroke-width="2"/>
    <!-- Torso / Crisp Coral Blouse -->
    <path d="M105 110 L155 110 L160 190 L100 190 Z" fill="#FB7185"/>
    <path d="M120 110 L130 130 L140 110" fill="#E11D48"/>
    <!-- Arms raised holding book close to face -->
    <path d="M102 120 Q85 140 110 120" stroke="#482519" stroke-width="12" stroke-linecap="round"/>
    <path d="M158 120 Q175 140 150 120" stroke="#482519" stroke-width="12" stroke-linecap="round"/>
    <!-- Open book held high -->
    <path d="M95 100 Q130 112 165 100 L168 135 Q130 145 92 135 Z" fill="#0D9488"/>
    <path d="M98 103 Q130 114 162 103 L160 132 Q130 142 95 132 Z" fill="#FEF3C7"/>
    <line x1="130" y1="112" x2="130" y2="142" stroke="#0D9488" stroke-width="2"/>
    <!-- Eyes peering over top of book -->
    <!-- Head / Short tapered natural afro -->
    <ellipse cx="130" cy="72" rx="22" ry="24" fill="#482519"/>
    <!-- Hair -->
    <path d="M108 70 C108 48 152 48 152 70 C152 78 148 85 148 85 C148 85 112 85 112 85 Z" fill="#1C130D"/>
    <!-- Wide expressive eyes looking over book -->
    <ellipse cx="120" cy="76" rx="4.5" ry="5" fill="#FFFFFF"/>
    <ellipse cx="120" cy="76" rx="2.5" ry="3" fill="#1C130D"/>
    <ellipse cx="140" cy="76" rx="4.5" ry="5" fill="#FFFFFF"/>
    <ellipse cx="140" cy="76" rx="2.5" ry="3" fill="#1C130D"/>
    <path d="M115 68 Q120 65 125 67" stroke="#1C130D" stroke-width="2" fill="none"/>
    <path d="M135 67 Q140 65 145 68" stroke="#1C130D" stroke-width="2" fill="none"/>
  </g>
</svg>`;

// 6. boy sitting on the ground painting on a small canvas easel
const student6 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 320" fill="none">
  <!-- Boy sitting painting on small canvas easel -->
  <g class="character">
    <!-- Easel Tripod legs -->
    <line x1="90" y1="130" x2="60" y2="300" stroke="#78350F" stroke-width="6" stroke-linecap="round"/>
    <line x1="110" y1="130" x2="130" y2="300" stroke="#78350F" stroke-width="6" stroke-linecap="round"/>
    <line x1="100" y1="110" x2="95" y2="280" stroke="#92400E" stroke-width="5"/>
    <!-- Small Canvas with colorful painting (geometry/art) -->
    <rect x="65" y="140" width="70" height="90" rx="3" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
    <circle cx="100" cy="175" r="18" fill="#F59E0B"/>
    <path d="M75 210 L95 185 L115 210 Z" fill="#2563EB"/>
    <path d="M100 215 L115 195 L130 215 Z" fill="#10B981"/>
    
    <!-- Boy sitting on ground facing easel -->
    <!-- Legs folded -->
    <path d="M170 240 C170 270 220 290 270 270 C270 240 240 230 200 230 Z" fill="#1E293B"/>
    <!-- Torso / Mint Green Artist Smock / T-shirt -->
    <path d="M185 150 L235 150 L230 240 L180 240 Z" fill="#10B981"/>
    <!-- Left Hand holding artist palette -->
    <path d="M190 170 Q165 200 160 215" stroke="#3A1E14" stroke-width="14" stroke-linecap="round"/>
    <!-- Wooden Palette with colorful paint spots -->
    <ellipse cx="155" cy="220" rx="18" ry="12" fill="#D97706"/>
    <circle cx="148" cy="217" r="3" fill="#EF4444"/>
    <circle cx="156" cy="215" r="3" fill="#3B82F6"/>
    <circle cx="163" cy="218" r="3" fill="#FBBF24"/>
    <circle cx="154" cy="223" r="3" fill="#FFFFFF"/>
    <!-- Right Hand with brush painting on canvas -->
    <path d="M210 165 Q170 175 140 175" stroke="#3A1E14" stroke-width="14" stroke-linecap="round"/>
    <line x1="140" y1="175" x2="115" y2="178" stroke="#78350F" stroke-width="4" stroke-linecap="round"/>
    <circle cx="114" cy="178" r="3" fill="#EF4444"/>
    <!-- Head / TWA Curls (Deep chocolate complexion) -->
    <ellipse cx="215" cy="110" rx="22" ry="24" fill="#3A1E14"/>
    <!-- Textured curls -->
    <circle cx="210" cy="90" r="18" fill="#18110B"/>
    <circle cx="225" cy="92" r="14" fill="#18110B"/>
    <circle cx="202" cy="98" r="12" fill="#18110B"/>
    <!-- Profile focused on art -->
    <ellipse cx="204" cy="112" rx="3" ry="3.5" fill="#18110B"/>
    <path d="M202 122 Q208 126 214 122" stroke="#18110B" stroke-width="2" fill="none"/>
  </g>
</svg>`;

// 7. girl lying on her back, book held above her
const student7 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" fill="none">
  <!-- Girl lying on back, book held above her -->
  <g class="character">
    <!-- Legs relaxed on ground -->
    <path d="M60 170 C90 160 140 160 180 170 L175 190 C130 185 80 190 60 170 Z" fill="#8B5CF6"/>
    <path d="M80 165 Q110 135 150 170" stroke="#7C3AED" stroke-width="18" stroke-linecap="round"/>
    <!-- Bare feet or sandals -->
    <ellipse cx="55" cy="172" rx="12" ry="7" fill="#422216"/>
    <!-- Torso lying flat / Lavender Top -->
    <path d="M165 170 L255 170 L255 195 L165 195 Z" fill="#A78BFA"/>
    <!-- Head resting on ground with twist braids fanned out -->
    <ellipse cx="270" cy="175" rx="22" ry="20" fill="#422216"/>
    <!-- Twist braids fanning on ground -->
    <path d="M275 180 Q315 175 330 190" stroke="#1B120C" stroke-width="6" stroke-linecap="round"/>
    <path d="M280 185 Q320 190 325 210" stroke="#1B120C" stroke-width="6" stroke-linecap="round"/>
    <path d="M270 188 Q295 205 310 215" stroke="#1B120C" stroke-width="6" stroke-linecap="round"/>
    <!-- Arms raised straight up holding book in air -->
    <path d="M225 170 L220 90" stroke="#422216" stroke-width="14" stroke-linecap="round"/>
    <path d="M245 170 L240 90" stroke="#422216" stroke-width="14" stroke-linecap="round"/>
    <!-- Book held overhead -->
    <path d="M195 70 Q230 82 265 70 L268 45 Q230 55 192 45 Z" fill="#F59E0B"/>
    <path d="M198 68 Q230 79 262 68 L260 48 Q230 57 195 48 Z" fill="#FEF3C7"/>
    <line x1="230" y1="56" x2="230" y2="80" stroke="#D97706" stroke-width="2"/>
    <!-- Face looking up at book -->
    <ellipse cx="258" cy="170" rx="3.5" ry="3" fill="#1B120C"/>
    <path d="M255 178 Q260 182 265 178" stroke="#1B120C" stroke-width="2" fill="none"/>
  </g>
</svg>`;

// 8. boy sitting on a bean bag with a laptop
const student8 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" fill="none">
  <!-- Boy on comfy bean bag with laptop -->
  <g class="character">
    <!-- Big Cozy Bean Bag Chair -->
    <ellipse cx="145" cy="235" rx="85" ry="55" fill="#F43F5E"/>
    <ellipse cx="140" cy="230" rx="75" ry="45" fill="#E11D48"/>
    <!-- Indentation where he sits -->
    <ellipse cx="145" cy="210" rx="50" ry="25" fill="#BE123C"/>
    
    <!-- Boy seated sunk in bag -->
    <!-- Legs draped forward -->
    <path d="M150 220 L200 260 L240 265" stroke="#0F172A" stroke-width="20" stroke-linecap="round"/>
    <ellipse cx="248" cy="265" rx="14" ry="8" fill="#F8FAFC"/>
    <!-- Torso / Teal Green Hoodie -->
    <path d="M120 145 C120 145 160 145 165 215 L115 215 Z" fill="#0D9488"/>
    <!-- Laptop on lap -->
    <path d="M155 195 L195 195 L200 202 L150 202 Z" fill="#64748B"/>
    <path d="M155 195 L175 165 L215 165 L195 195 Z" fill="#94A3B8"/>
    <rect x="178" y="168" width="30" height="22" fill="#38BDF8" transform="skewX(-20)"/>
    <!-- Hands typing -->
    <path d="M135 170 Q160 190 170 195" stroke="#381D14" stroke-width="12" stroke-linecap="round"/>
    <circle cx="172" cy="195" r="7" fill="#381D14"/>
    <!-- Head / Clean low fade haircut (chocolate tone) -->
    <ellipse cx="138" cy="105" rx="22" ry="24" fill="#381D14"/>
    <!-- Hair -->
    <path d="M122 95 C122 80 155 80 156 95 C156 102 150 106 145 106 C135 106 122 102 122 95 Z" fill="#150E09"/>
    <!-- Face turned towards laptop -->
    <ellipse cx="148" cy="108" rx="3" ry="3.5" fill="#150E09"/>
    <path d="M144 116 Q148 120 153 116" stroke="#150E09" stroke-width="2" fill="none"/>
  </g>
</svg>`;

// 9. girl sketching in a sketchbook while sitting on a low wall
const student9 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 340" fill="none">
  <!-- Girl sketching in sketchbook on low brick wall -->
  <g class="character">
    <!-- Low stone / brick wall -->
    <rect x="40" y="235" width="240" height="75" rx="4" fill="#E2E8F0"/>
    <line x1="40" y1="260" x2="280" y2="260" stroke="#CBD5E1" stroke-width="2"/>
    <line x1="40" y1="285" x2="280" y2="285" stroke="#CBD5E1" stroke-width="2"/>
    <line x1="100" y1="235" x2="100" y2="260" stroke="#CBD5E1" stroke-width="2"/>
    <line x1="180" y1="235" x2="180" y2="260" stroke="#CBD5E1" stroke-width="2"/>
    <line x1="140" y1="260" x2="140" y2="285" stroke="#CBD5E1" stroke-width="2"/>
    <line x1="220" y1="260" x2="220" y2="285" stroke="#CBD5E1" stroke-width="2"/>
    
    <!-- Girl sitting on the wall -->
    <!-- Dangling legs -->
    <path d="M140 230 L135 295" stroke="#46251A" stroke-width="16" stroke-linecap="round"/>
    <path d="M165 230 L170 295" stroke="#46251A" stroke-width="16" stroke-linecap="round"/>
    <ellipse cx="132" cy="302" rx="12" ry="7" fill="#EA580C"/>
    <ellipse cx="173" cy="302" rx="12" ry="7" fill="#EA580C"/>
    <!-- Denim Dungarees / Terracotta jacket -->
    <path d="M130 150 L175 150 L170 235 L135 235 Z" fill="#2563EB"/>
    <path d="M120 155 L135 155 L130 220 L120 220 Z" fill="#C2410C"/>
    <!-- Arms holding sketchbook and pencil -->
    <path d="M130 165 Q115 195 135 205" stroke="#46251A" stroke-width="12" stroke-linecap="round"/>
    <path d="M170 165 Q185 195 160 205" stroke="#46251A" stroke-width="12" stroke-linecap="round"/>
    <!-- Open sketchbook -->
    <rect x="130" y="190" width="38" height="26" rx="2" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.5"/>
    <line x1="149" y1="190" x2="149" y2="216" stroke="#CBD5E1" stroke-width="1.5"/>
    <!-- Pencil -->
    <line x1="162" y1="198" x2="170" y2="188" stroke="#D97706" stroke-width="3" stroke-linecap="round"/>
    <!-- Head / Side-part braids with beads -->
    <ellipse cx="152" cy="110" rx="22" ry="24" fill="#46251A"/>
    <!-- Long braids falling to one side -->
    <path d="M136 100 C136 78 174 78 174 100 C174 108 170 115 165 115 Z" fill="#1A120B"/>
    <path d="M134 105 Q120 135 125 170" stroke="#1A120B" stroke-width="6" stroke-linecap="round"/>
    <path d="M138 108 Q125 140 128 175" stroke="#2C1B10" stroke-width="5" stroke-linecap="round"/>
    <circle cx="125" cy="170" r="3" fill="#F59E0B"/>
    <circle cx="128" cy="175" r="3" fill="#10B981"/>
    <!-- Face looking down intently -->
    <ellipse cx="150" cy="115" rx="3" ry="3.5" fill="#1A120B"/>
    <path d="M148 123 Q152 126 156 123" stroke="#1A120B" stroke-width="2" fill="none"/>
  </g>
</svg>`;

// 10. boy standing, reading a book while walking
const student10 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 360" fill="none">
  <!-- Boy standing, walking while reading a book -->
  <g class="character">
    <!-- Legs in walking stride -->
    <path d="M140 220 L115 310 L100 325" stroke="#334155" stroke-width="18" stroke-linecap="round"/>
    <path d="M150 220 L175 305 L195 320" stroke="#1E293B" stroke-width="18" stroke-linecap="round"/>
    <!-- Sneakers -->
    <ellipse cx="95" cy="328" rx="14" ry="7" fill="#DC2626"/>
    <ellipse cx="200" cy="322" rx="14" ry="7" fill="#DC2626"/>
    <!-- Torso / Maroon Varsity Jacket with gold trim -->
    <path d="M120 120 L170 120 L165 225 L125 225 Z" fill="#991B1B"/>
    <path d="M140 120 L145 225" stroke="#F59E0B" stroke-width="3"/>
    <circle cx="132" cy="140" r="4" fill="#F59E0B"/>
    <!-- Arms holding book outward while walking -->
    <path d="M125 135 Q105 165 135 170" stroke="#3B1E12" stroke-width="14" stroke-linecap="round"/>
    <path d="M165 135 Q185 165 155 170" stroke="#3B1E12" stroke-width="14" stroke-linecap="round"/>
    <!-- Book open at waist level -->
    <path d="M120 160 Q145 170 170 160 L172 185 Q145 195 118 185 Z" fill="#0284C7"/>
    <path d="M122 162 Q145 172 168 162 L166 182 Q145 192 120 182 Z" fill="#FFFFFF"/>
    <line x1="145" y1="168" x2="145" y2="190" stroke="#0284C7" stroke-width="2"/>
    <!-- Head / Dreadlocks pulled up in bun (Deep rich brown) -->
    <ellipse cx="145" cy="80" rx="22" ry="24" fill="#3B1E12"/>
    <circle cx="145" cy="52" r="16" fill="#160E08"/>
    <path d="M126 72 C126 56 164 56 164 72 Z" fill="#160E08"/>
    <!-- Focused eyes on book below -->
    <ellipse cx="140" cy="84" rx="3.5" ry="4" fill="#160E08"/>
    <path d="M136 94 Q142 97 148 94" stroke="#160E08" stroke-width="2" fill="none"/>
  </g>
</svg>`;

// 11. girl sitting on the floor, surrounded by open books, highlighting a page
const student11 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 320" fill="none">
  <!-- Girl sitting on floor surrounded by books, highlighting -->
  <g class="character">
    <!-- Open books spread in arc on floor -->
    <!-- Left book -->
    <path d="M40 240 Q70 230 100 240 L98 265 Q70 255 38 265 Z" fill="#059669"/>
    <path d="M42 242 Q70 232 96 242 L94 262 Q70 252 40 262 Z" fill="#FEF3C7"/>
    <!-- Right book -->
    <path d="M230 240 Q260 230 290 240 L288 265 Q260 255 228 265 Z" fill="#EA580C"/>
    <path d="M232 242 Q260 232 286 242 L284 262 Q260 252 230 262 Z" fill="#F8FAFC"/>
    <!-- Stack on side -->
    <rect x="250" y="268" width="50" height="12" rx="2" fill="#7C3AED"/>
    <rect x="255" y="280" width="45" height="12" rx="2" fill="#2563EB"/>
    
    <!-- Girl sitting centered -->
    <path d="M110 240 C110 215 160 210 210 210 C230 210 240 240 230 265 C200 280 130 280 110 240 Z" fill="#F472B6"/>
    <!-- Torso / Forest Green Sweatshirt -->
    <path d="M135 140 L185 140 L180 225 L140 225 Z" fill="#15803D"/>
    <!-- Book in front of her on ground -->
    <path d="M130 245 Q160 255 190 245 L192 270 Q160 280 128 270 Z" fill="#1E3A8A"/>
    <path d="M132 247 Q160 257 188 247 L186 267 Q160 277 130 267 Z" fill="#FFFFFF"/>
    <!-- Yellow highlight line on book! -->
    <line x1="140" y1="256" x2="155" y2="258" stroke="#FDE047" stroke-width="4" stroke-linecap="round"/>
    <!-- Arms reaching down to highlight -->
    <path d="M140 155 Q130 195 150 245" stroke="#422115" stroke-width="12" stroke-linecap="round"/>
    <path d="M175 155 Q180 195 160 245" stroke="#422115" stroke-width="12" stroke-linecap="round"/>
    <!-- Fluorescent highlighter in hand -->
    <rect x="156" y="240" width="8" height="16" rx="2" fill="#FACC15" transform="rotate(-25 160 248)"/>
    <!-- Head / Two Afro Buns (Space buns) hairstyle -->
    <ellipse cx="160" cy="100" rx="22" ry="24" fill="#422115"/>
    <!-- Buns on sides -->
    <circle cx="132" cy="78" r="16" fill="#17100B"/>
    <circle cx="188" cy="78" r="16" fill="#17100B"/>
    <path d="M140 92 C140 75 180 75 180 92 Z" fill="#17100B"/>
    <!-- Face looking down happily -->
    <ellipse cx="158" cy="106" rx="3.5" ry="3" fill="#17100B"/>
    <path d="M154 115 Q159 119 164 115" stroke="#17100B" stroke-width="2" fill="none"/>
  </g>
</svg>`;

// 12. boy kneeling, solving a math problem on a small whiteboard
const student12 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" fill="none">
  <!-- Boy kneeling, solving math on small whiteboard -->
  <g class="character">
    <!-- Mini Whiteboard propped up -->
    <rect x="60" y="160" width="85" height="110" rx="6" fill="#FFFFFF" stroke="#0284C7" stroke-width="4"/>
    <!-- Math formula on board -->
    <text x="75" y="195" font-family="monospace" font-size="14" font-weight="bold" fill="#1E293B">2x + 5 = 19</text>
    <text x="75" y="220" font-family="monospace" font-size="14" font-weight="bold" fill="#2563EB">2x = 14</text>
    <text x="75" y="245" font-family="monospace" font-size="16" font-weight="bold" fill="#16A34A">x = 7 ✓</text>
    <!-- Whiteboard eraser at base -->
    <rect x="110" y="265" width="22" height="7" rx="2" fill="#1E293B"/>
    
    <!-- Boy kneeling on one knee -->
    <!-- Legs / Kneeling pose -->
    <path d="M185 230 L220 280 L250 280" stroke="#D97706" stroke-width="18" stroke-linecap="round"/>
    <path d="M165 240 L160 280 L180 285" stroke="#B45309" stroke-width="18" stroke-linecap="round"/>
    <ellipse cx="255" cy="282" rx="12" ry="7" fill="#1E293B"/>
    <ellipse cx="185" cy="287" rx="12" ry="7" fill="#1E293B"/>
    <!-- Torso / Cobalt Blue T-shirt -->
    <path d="M170 145 L220 145 L210 240 L165 240 Z" fill="#2563EB"/>
    <!-- Right Arm writing on whiteboard -->
    <path d="M180 160 Q145 180 120 200" stroke="#3D2014" stroke-width="14" stroke-linecap="round"/>
    <!-- Black dry-erase marker -->
    <rect x="115" y="196" width="14" height="5" rx="1" fill="#0F172A" transform="rotate(-30 122 198)"/>
    <!-- Left arm resting on knee -->
    <path d="M205 160 Q195 200 175 235" stroke="#3D2014" stroke-width="12" stroke-linecap="round"/>
    <!-- Head / Buzz cut fade (chocolate skin) -->
    <ellipse cx="205" cy="105" rx="22" ry="24" fill="#3D2014"/>
    <path d="M188 95 C188 80 222 80 222 95 C222 102 215 105 210 105 C200 105 188 100 188 95 Z" fill="#140E0A"/>
    <!-- Profile facing whiteboard -->
    <ellipse cx="196" cy="108" rx="3.5" ry="3.5" fill="#140E0A"/>
    <path d="M192 118 Q198 122 204 118" stroke="#140E0A" stroke-width="2" fill="none"/>
  </g>
</svg>`;

saveAsset('student-1.svg', student1);
saveAsset('student-2.svg', student2);
saveAsset('student-3.svg', student3);
saveAsset('student-4.svg', student4);
saveAsset('student-5.svg', student5);
saveAsset('student-6.svg', student6);
saveAsset('student-7.svg', student7);
saveAsset('student-8.svg', student8);
saveAsset('student-9.svg', student9);
saveAsset('student-10.svg', student10);
saveAsset('student-11.svg', student11);
saveAsset('student-12.svg', student12);

console.log('Saved 12 student illustrations');

// 8 Screenshots: screenshot-1.png to screenshot-8.png
// Clean, high quality flat UI mockups (16:10 ratio, 640x400)
const screenshotThemes = [
  { id: 1, title: 'Interactive Question Bank', color: '#2563EB', accent: '#3B82F6', type: 'quiz' },
  { id: 2, title: 'Diagnostic Exam Simulator', color: '#0D9488', accent: '#14B8A6', type: 'exam' },
  { id: 3, title: 'Performance Analytics Dashboard', color: '#7C3AED', accent: '#8B5CF6', type: 'analytics' },
  { id: 4, title: 'Topic Mastery Tracker', color: '#EA580C', accent: '#F97316', type: 'mastery' },
  { id: 5, title: 'Smart Revision Timetable', color: '#059669', accent: '#10B981', type: 'schedule' },
  { id: 6, title: 'Formula & Concept Flashcards', color: '#D97706', accent: '#F59E0B', type: 'flashcards' },
  { id: 7, title: 'Past Question Video Explanations', color: '#DC2626', accent: '#EF4444', type: 'video' },
  { id: 8, title: 'Real-Time Weakness Detector', color: '#2563EB', accent: '#60A5FA', type: 'detector' },
];

screenshotThemes.forEach(s => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
    <!-- Background Frame -->
    <rect width="640" height="400" rx="20" fill="#F8FAFC"/>
    <!-- App Header Bar -->
    <rect width="640" height="52" rx="0" fill="#FFFFFF"/>
    <line x1="0" y1="52" x2="640" y2="52" stroke="#E2E8F0" stroke-width="1.5"/>
    <circle cx="28" cy="26" r="6" fill="${s.color}"/>
    <rect x="44" y="20" width="90" height="12" rx="3" fill="#0F172A"/>
    <rect x="150" y="22" width="60" height="8" rx="2" fill="#94A3B8"/>
    <rect x="220" y="22" width="60" height="8" rx="2" fill="#CBD5E1"/>
    <rect x="290" y="22" width="60" height="8" rx="2" fill="#CBD5E1"/>
    <!-- User Avatar & Badge -->
    <rect x="520" y="16" width="92" height="20" rx="4" fill="#F1F5F9"/>
    <circle cx="598" cy="26" r="9" fill="${s.accent}"/>
    
    <!-- Left Sidebar -->
    <rect x="0" y="52" width="130" height="348" fill="#FFFFFF"/>
    <line x1="130" y1="52" x2="130" y2="400" stroke="#E2E8F0" stroke-width="1.5"/>
    <!-- Nav Items -->
    <rect x="14" y="75" width="102" height="26" rx="6" fill="${s.color}" fill-opacity="0.12"/>
    <rect x="24" y="82" width="70" height="10" rx="3" fill="${s.color}"/>
    <rect x="24" y="118" width="75" height="9" rx="3" fill="#64748B"/>
    <rect x="24" y="148" width="80" height="9" rx="3" fill="#94A3B8"/>
    <rect x="24" y="178" width="65" height="9" rx="3" fill="#94A3B8"/>
    <rect x="24" y="208" width="70" height="9" rx="3" fill="#94A3B8"/>
    <rect x="24" y="340" width="82" height="22" rx="4" fill="#F8FAFC"/>
    
    <!-- Main Content Area -->
    <!-- Top banner / Page Title -->
    <rect x="155" y="75" width="180" height="18" rx="4" fill="#0F172A"/>
    <rect x="155" y="100" width="260" height="10" rx="3" fill="#64748B"/>
    
    <!-- 3 Stat summary boxes -->
    <rect x="155" y="125" width="140" height="60" rx="8" fill="#FFFFFF" stroke="#E2E8F0"/>
    <rect x="170" y="140" width="50" height="8" rx="2" fill="#94A3B8"/>
    <rect x="170" y="156" width="80" height="16" rx="3" fill="${s.color}"/>
    
    <rect x="310" y="125" width="140" height="60" rx="8" fill="#FFFFFF" stroke="#E2E8F0"/>
    <rect x="325" y="140" width="55" height="8" rx="2" fill="#94A3B8"/>
    <rect x="325" y="156" width="70" height="16" rx="3" fill="#059669"/>
    
    <rect x="465" y="125" width="145" height="60" rx="8" fill="#FFFFFF" stroke="#E2E8F0"/>
    <rect x="480" y="140" width="60" height="8" rx="2" fill="#94A3B8"/>
    <rect x="480" y="156" width="75" height="16" rx="3" fill="${s.accent}"/>
    
    <!-- Large Content Card -->
    <rect x="155" y="200" width="455" height="175" rx="10" fill="#FFFFFF" stroke="#E2E8F0"/>
    <rect x="175" y="220" width="140" height="14" rx="3" fill="#1E293B"/>
    
    <!-- Row items / Quiz or Table or Chart representation -->
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
  // Save both svg and png naming
  saveAsset(`screenshot-${s.id}.svg`, svg);
  saveAsset(`screenshot-${s.id}.png`, svg); // Can be served as image
});

console.log('Saved 8 screenshots');

