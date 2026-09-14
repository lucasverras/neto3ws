/**
 * Gera a imagem Open Graph padrão (1200×630) usada nos cartões sociais das
 * páginas institucionais. Compõe a foto real do galpão + gradiente de leitura +
 * logo + chamada curta. Rode manualmente após trocar a foto ou a marca:
 *
 *   node scripts/build-og.mjs
 *
 * A saída (public/images/og-default.jpg) é versionada — não roda no build.
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const W = 1200;
const H = 630;

const gradient = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0a0b1a" stop-opacity="0.35"/>
        <stop offset="55%" stop-color="#0a0b1a" stop-opacity="0.72"/>
        <stop offset="100%" stop-color="#0a0b1a" stop-opacity="0.94"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect x="72" y="470" width="44" height="4" rx="2" fill="#2c8dff"/>
    <text x="72" y="520" font-family="Helvetica, Arial, sans-serif" font-size="46" font-weight="700" fill="#ffffff">Moldes industriais usados e porta-moldes</text>
    <text x="72" y="566" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="400" fill="#e5e4e2">Compra, venda e estoque em São Paulo — venda por kg</text>
  </svg>`
);

const base = await sharp(path.join(root, "public/images/hero-industrial-hall.webp"))
  .resize(W, H, { fit: "cover", position: "attention" })
  .toBuffer();

const logo = await sharp(path.join(root, "public/images/logo.webp"))
  .resize({ height: 76 })
  .toBuffer();

await sharp(base)
  .composite([
    { input: gradient, top: 0, left: 0 },
    { input: logo, top: 64, left: 72 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(path.join(root, "public/images/og-default.jpg"));

console.log("✓ public/images/og-default.jpg (1200×630)");
