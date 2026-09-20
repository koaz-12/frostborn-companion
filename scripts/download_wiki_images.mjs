import fs from 'fs';
import path from 'path';

const MAPPING = {
  pine_log: 'Pine_Log.png',
  planks: 'Pine_Plank.png',
  strong_wood: 'Sturdy_pine_wood.webp',
  yew_planks: 'Ancient_Tree_Plank.png',
  maple_log: 'Maple_Log.png',
  maple_plank: 'Maple_Plank.png',
  limestone: 'Limestone.png',
  stone_blocks: 'Stone_Block.png',
  copper_ore: 'Copper_Ore.png',
  copper_ingot: 'Copper_Ingot.png',
  iron_ore: 'Iron_Ore.png',
  iron_ingot: 'Iron_Ingot.png',
  iron_plate: 'Iron_Plate.png',
  steel_ingot: 'Steel_Ingot.png',
  steel_plate: 'Steel_Plate.png',
  silver: 'Coins.png',
  gold_ore: 'Gold_Ore.png',
  gold_ingot: 'Gold_Ingot.png',
  nails: 'Nails.png',
  metal_parts: 'Metal_Parts.png',
  forged_fasteners: 'Forged_Fasteners.png',
  chain: 'Chain.jpg',
  pliers: 'Pliers.png',
  tin_ingot: 'Tin_Ingot.png',
  tin_rod: 'Tin_Rod.png',
  ebonite_ingot: 'Ebonite_Ingot.png',
  bone_fastener: 'Bone_Fastener.png',
  leather: 'Leather.png',
  leather_strips: 'Leather_Strips.jpg',
  rope: 'Rope.png',
  linen_cloth: 'Fabric.png',
  thick_fabric: 'Thick_Fabric.png',
  resin: 'Resin.png',
  varnish: 'Varnish.png',
  sealing_wax: 'Sealing_Wax.png',
  charcoal: 'Charcoal.png',
  soul_stone: 'Soul_Stone.png',
  dragon_scale: 'Dragon_Scales.png',
  dragon_tears: 'Dragon_Tear.png',
  eternal_ice: 'Eternal_Ice.png',
  ghost_flower: 'Ghost_Flower.png',
  fish_glue: 'Fish_Glue.png',
  alchemical_powder: 'Alchemical_Powder.png',
  sulphur: 'Sulphur.png',
  rune_of_power: 'Rune_of_Power.png',
  helm: 'Helm.png',
  lockpick: 'Basic_Lockpick.png',
  master_lockpick: "Master_Thief's_Lockpick.png"
};

const TARGET_DIR = path.resolve('public/items');
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

async function getImageUrl(wikiFilename) {
  const apiUrl = `https://frostborn-by-kefir.fandom.com/api.php?action=query&titles=File:${encodeURIComponent(wikiFilename)}&prop=imageinfo&iiprop=url&format=json`;
  const res = await fetch(apiUrl);
  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return null;
  const firstKey = Object.keys(pages)[0];
  if (firstKey === '-1' || !pages[firstKey]?.imageinfo) return null;
  return pages[firstKey].imageinfo[0].url;
}

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
}

async function run() {
  console.log(`Iniciando descarga de ${Object.keys(MAPPING).length} sprites oficiales de Frostborn...`);
  let successCount = 0;
  let failCount = 0;

  for (const [id, wikiFile] of Object.entries(MAPPING)) {
    const dest = path.join(TARGET_DIR, `${id}.png`);
    try {
      const url = await getImageUrl(wikiFile);
      if (!url) {
        console.warn(`[!] No se encontró URL para File:${wikiFile} (id: ${id})`);
        failCount++;
        continue;
      }
      await downloadFile(url, dest);
      console.log(`[OK] Descargado: ${id}.png <- ${wikiFile}`);
      successCount++;
    } catch (err) {
      console.error(`[ERROR] Falló ${id} (${wikiFile}):`, err.message);
      failCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Descarga completa: ${successCount} exitosos, ${failCount} fallidos.`);
  console.log(`Las imágenes se guardaron en: ${TARGET_DIR}`);
  console.log(`========================================\n`);
}

run().catch(console.error);
