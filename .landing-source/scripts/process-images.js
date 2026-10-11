import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const generatedFiles = {
  'map-students': 'src/assets/images/map_students_support_1791565867502.jpg',
  'student-1': 'src/assets/images/student_1_girl_reading_1791565876895.jpg',
  'student-2': 'src/assets/images/student_2_boy_reading_1791565886529.jpg',
  'student-3': 'src/assets/images/student_3_girl_stack_1791565896655.jpg',
  'student-4': 'src/assets/images/student_4_boy_tablet_1791565906326.jpg',
  'student-5': 'src/assets/images/student_5_girl_standing_1791565915409.jpg',
  'student-6': 'src/assets/images/student_6_boy_easel_1791565926318.jpg',
  'student-7': 'src/assets/images/student_7_girl_lying_1791565936192.jpg',
  'student-8': 'src/assets/images/student_8_boy_beanbag_1791565946490.jpg',
  'student-9': 'src/assets/images/student_9_girl_sketching_1791565955577.jpg',
  'student-10': 'src/assets/images/student_10_boy_walking_1791565964857.jpg',
  'student-11': 'src/assets/images/student_11_girl_highlighter_1791565975983.jpg',
  'student-12': 'src/assets/images/student_12_boy_whiteboard_1791565986689.jpg',
  'blog-1': 'src/assets/images/blog_1_study_desk_1791565995570.jpg',
  'blog-2': 'src/assets/images/blog_2_exam_prep_1791566007148.jpg',
  'blog-3': 'src/assets/images/blog_3_collaborate_1791566017352.jpg'
};

const outputDirs = ['assets', 'public/assets'];
outputDirs.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Function to convert pure white / near-white background to transparent alpha
async function removeWhiteBg(inputPath, outputPathName, isHeroOrMap = true) {
  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Create RGBA buffer
  const rgbaBuffer = Buffer.alloc(width * height * 4);

  // Flood fill / color distance from pure white (255, 255, 255)
  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    rgbaBuffer[i * 4] = r;
    rgbaBuffer[i * 4 + 1] = g;
    rgbaBuffer[i * 4 + 2] = b;

    // Calculate whiteness
    // If it's very close to pure white (> 245 in all channels)
    const minVal = Math.min(r, g, b);
    const maxVal = Math.max(r, g, b);
    const diff = maxVal - minVal;

    // Neutral white threshold
    if (minVal > 248 && diff < 12) {
      rgbaBuffer[i * 4 + 3] = 0; // 100% transparent
    } else if (minVal > 238 && diff < 15) {
      // Smooth anti-aliased edge
      const alphaFactor = (248 - minVal) / 10;
      rgbaBuffer[i * 4 + 3] = Math.round(alphaFactor * 255);
    } else {
      rgbaBuffer[i * 4 + 3] = 255; // 100% opaque figure
    }
  }

  // Save as PNG
  const finalPng = await sharp(rgbaBuffer, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  for (const d of outputDirs) {
    fs.writeFileSync(path.join(d, `${outputPathName}.png`), finalPng);
  }
  console.log(`Saved ${outputPathName}.png with real alpha channel.`);
}

async function processAll() {
  for (const [name, filePath] of Object.entries(generatedFiles)) {
    if (fs.existsSync(filePath)) {
      await removeWhiteBg(filePath, name);
    } else {
      console.error(`File not found: ${filePath}`);
    }
  }

  // Verify programmatically that each output file has real alpha
  console.log('\n--- Programmatic Verification of Alpha Channel ---');
  for (const name of Object.keys(generatedFiles)) {
    const testPath = path.join('assets', `${name}.png`);
    const meta = await sharp(testPath).metadata();
    console.log(`Verified ${name}.png: Channels=${meta.channels}, HasAlpha=${meta.hasAlpha}, Width=${meta.width}, Height=${meta.height}`);
  }
}

processAll().catch(err => {
  console.error(err);
  process.exit(1);
});
