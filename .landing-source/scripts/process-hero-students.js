import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// The source files for all 12 students
const studentSources = {
  1: 'src/assets/images/student_1_girl_reading_1791565876895.jpg',
  2: 'src/assets/images/student_2_boy_reading_1791565886529.jpg',
  3: 'src/assets/images/student_3_girl_stack_1791565896655.jpg',
  4: 'src/assets/images/student_4_tree_tapered_1791567992773.jpg', // newly generated tapered tree!
  5: 'src/assets/images/student_5_girl_standing_1791565915409.jpg',
  6: 'src/assets/images/student_6_boy_easel_1791565926318.jpg',
  7: 'src/assets/images/student_7_girl_lying_1791565936192.jpg',
  8: 'src/assets/images/student_8_boy_beanbag_1791565946490.jpg',
  9: 'src/assets/images/student_9_girl_sketching_1791565955577.jpg',
  10: 'src/assets/images/student_10_boy_walking_1791565964857.jpg',
  11: 'src/assets/images/student_11_floor_tapered_1791568014814.jpg', // newly generated tapered floor!
  12: 'src/assets/images/student_12_whiteboard_tapered_1791568031318.jpg' // newly generated tapered whiteboard!
};

const outputDirs = ['assets', 'public/assets'];

async function processHeroStudents() {
  console.log('Processing all 12 hero student illustrations...');

  for (let id = 1; id <= 12; id++) {
    const srcPath = studentSources[id];
    if (!fs.existsSync(srcPath)) {
      throw new Error(`Missing source image: ${srcPath}`);
    }

    const image = sharp(srcPath);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;

    // Convert pure white to transparent alpha with smooth anti-aliased edge
    const rgbaBuffer = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      const r = data[i * channels];
      const g = data[i * channels + 1];
      const b = data[i * channels + 2];

      rgbaBuffer[i * 4] = r;
      rgbaBuffer[i * 4 + 1] = g;
      rgbaBuffer[i * 4 + 2] = b;

      const minVal = Math.min(r, g, b);
      const maxVal = Math.max(r, g, b);
      const diff = maxVal - minVal;

      if (minVal > 248 && diff < 12) {
        rgbaBuffer[i * 4 + 3] = 0; // 100% transparent
      } else if (minVal > 236 && diff < 16) {
        const factor = (248 - minVal) / 12;
        rgbaBuffer[i * 4 + 3] = Math.round(factor * 255);
      } else {
        rgbaBuffer[i * 4 + 3] = 255;
      }
    }

    // Now find bounding box of non-transparent pixels
    let minX = width, maxX = 0, minY = height, maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (rgbaBuffer[(y * width + x) * 4 + 3] > 30) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Crop vertically so the bottom edge touches the lowest pixel (maxY) exactly!
    // And keep a modest 20px padding on left, right, and top so the full silhouette is unclipped
    const pad = 12;
    const cropX = Math.max(0, minX - pad);
    const cropY = Math.max(0, minY - pad);
    const cropW = Math.min(width - cropX, (maxX - minX) + pad * 2);
    // cropH goes from cropY down to maxY + 1, so the feet are at the very bottom!
    const cropH = (maxY - cropY) + 1;

    console.log(`Student ${id}: bbox=[${minX}, ${minY}, ${maxX}, ${maxY}], crop=[${cropX}, ${cropY}, ${cropW}, ${cropH}]`);

    const finalPng = await sharp(rgbaBuffer, { raw: { width, height, channels: 4 } })
      .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
      .png({ compressionLevel: 9 })
      .toBuffer();

    for (const dir of outputDirs) {
      fs.writeFileSync(path.join(dir, `student-${id}.png`), finalPng);
    }
  }

  console.log('\n--- Programmatic Verification of Hero Edges and Shadows ---');
  for (let id = 1; id <= 12; id++) {
    const file = path.join('assets', `student-${id}.png`);
    const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
    
    // Check perimeter for any flat cuts (top, left, right)
    let top = 0, left = 0, right = 0;
    for (let x = 0; x < info.width; x++) {
      if (data[(0 * info.width + x) * 4 + 3] > 50) top++;
    }
    for (let y = 0; y < info.height; y++) {
      if (data[(y * info.width + 0) * 4 + 3] > 50) left++;
      if (data[(y * info.width + (info.width - 1)) * 4 + 3] > 50) right++;
    }
    
    // Check bottom row: the feet must touch the bottom row (alpha > 50)
    let bottomFeetPixels = 0;
    for (let x = 0; x < info.width; x++) {
      if (data[((info.height - 1) * info.width + x) * 4 + 3] > 50) bottomFeetPixels++;
    }

    console.log(`Student ${id} (${info.width}x${info.height}): flat-cuts: top=${top}, left=${left}, right=${right} | bottom feet pixels touching shadow baseline=${bottomFeetPixels}`);
  }
}

processHeroStudents().catch(err => {
  console.error(err);
  process.exit(1);
});
