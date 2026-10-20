/**
 * Regenerates the optimized image assets.
 *
 * Run with `npm run assets:optimize`. SVGs are optimized in place. Source
 * rasters come from `_source/images/` and are capped at 1600px wide, with
 * 400/800px responsive variants and 200px thumbnails written to
 * `assets/images/`. The OG image stays JPEG for social crawlers.
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { optimize } from 'svgo';

const IMAGE_DIR = path.resolve('assets/images');
const SOURCE_DIR = path.resolve('_source/images');
const MAX_WIDTH = 1600;
const RESPONSIVE_WIDTHS = [400, 800];
const THUMB_WIDTH = 200;

const rasters = [
  'buoyancy_preview.jpg',
  'posture_pet_demo.jpg',
  'posture_pet_preview.jpg',
  'posture_pet_real.jpg',
  'rov_buoyancy_cad.png',
  'rov_buoyancy_dashboard.png',
  'rov_buoyancy_pcb.jpg',
  'rov_hil_render_bottom.png',
  'rov_hil_render_iso.png',
  'rov_hil_render_top.png',
  'wand_pcb_1.jpg',
  'wand_pcb_2.jpg'
];

for (const file of rasters) {
  const input = path.join(SOURCE_DIR, file);
  const output = path.join(IMAGE_DIR, file.replace(/\.(png|jpe?g)$/i, '.webp'));
  const before = fs.statSync(input).size;
  const metadata = await sharp(input).metadata();
  const info = await sharp(input)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6, alphaQuality: 90 })
    .toFile(output);
  console.log(`${file} -> ${path.basename(output)} ${before} -> ${info.size} bytes`);

  for (const width of RESPONSIVE_WIDTHS) {
    if (width >= metadata.width) continue;
    const variant = output.replace('.webp', `-${width}.webp`);
    const variantInfo = await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80, effort: 6, alphaQuality: 90 })
      .toFile(variant);
    console.log(`  ${path.basename(variant)} ${variantInfo.size} bytes`);
  }

  const thumb = output.replace('.webp', '-thumb.webp');
  const thumbInfo = await sharp(input)
    .rotate()
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: 72, effort: 6, alphaQuality: 90 })
    .toFile(thumb);
  console.log(`  ${path.basename(thumb)} ${thumbInfo.size} bytes`);
}

const svgs = [
  ...fs
    .readdirSync(IMAGE_DIR)
    .filter((file) => file.endsWith('.svg'))
    .map((file) => path.join(IMAGE_DIR, file)),
  path.resolve('assets/favicon.svg')
];

for (const file of svgs) {
  const before = fs.statSync(file).size;
  const result = optimize(fs.readFileSync(file, 'utf8'), { path: file, multipass: true });
  fs.writeFileSync(file, result.data);
  console.log(`${path.basename(file)} ${before} -> ${Buffer.byteLength(result.data)} bytes`);

  if (file.startsWith(IMAGE_DIR)) {
    const thumb = file.replace(/\.svg$/i, '-thumb.webp');
    const thumbInfo = await sharp(file)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 72, effort: 6, alphaQuality: 90 })
      .toFile(thumb);
    console.log(`  ${path.basename(thumb)} ${thumbInfo.size} bytes`);
  }
}
