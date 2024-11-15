const fs = require('fs')
const { tmpdir } = require("os")
const ff = require('fluent-ffmpeg')
const webp = require("node-webpmux")
const path = require("path")

const makeid = (length) => {
let result = '';
let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let charactersLength = characters.length;
for (let i = 0; i < length; i++) {
result += characters.charAt(Math.floor(Math.random() *
charactersLength));
}
return result;
}

async function imageToWebp (media) {

const tmpFileOut = path.join(tmpdir(), `${makeid(10)}.webp`)
const tmpFileIn = path.join(tmpdir(), `${makeid(10)}.jpg`)

fs.writeFileSync(tmpFileIn, media)

await new Promise((resolve, reject) => {
ff(tmpFileIn)
.on("error", reject)
.on("end", () => resolve(true))
.addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale=512:512:force_original_aspect_ratio=increase,fps=15,crop=512:512`]).toFormat('webp').save(tmpFileOut)
//.addOutputOptions([
//"-vcodec",
//"libwebp",
//"-vf",
//"scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
//])
//.toFormat("webp")
//.save(tmpFileOut)
})

const buff = fs.readFileSync(tmpFileOut)
fs.unlinkSync(tmpFileOut)
fs.unlinkSync(tmpFileIn)
return buff
}

async function videoToWebp (media) {

const tmpFileOut = path.join(tmpdir(), `${makeid(10)}.webp`)
const tmpFileIn = path.join(tmpdir(), `${makeid(10)}.mp4`)

fs.writeFileSync(tmpFileIn, media)

await new Promise((resolve, reject) => {
ff(tmpFileIn)
.on("error", reject)
.on("end", () => resolve(true))
.addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale=512:512:force_original_aspect_ratio=increase,fps=15,crop=512:512`]).toFormat('webp').save(tmpFileOut)
//.addOutputOptions([
//"-vcodec",
//"libwebp",
//"-vf",
//"scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
//"-loop",
//"0",
//"-ss",
//"00:00:00",
//"-t",
//"00:00:05",
//"-preset",
//"default",
//"-an",
//"-vsync",
//"0"
//])
//.toFormat("webp")
//.save(tmpFileOut)
})

const buff = fs.readFileSync(tmpFileOut)
fs.unlinkSync(tmpFileOut)
fs.unlinkSync(tmpFileIn)
return buff
}

async function writeExifImg (media, metadata) {
let wMedia = await imageToWebp(media)
const tmpFileIn = path.join(tmpdir(), `${makeid(10)}.webp`)
const tmpFileOut = path.join(tmpdir(), `${makeid(10)}.webp`)
fs.writeFileSync(tmpFileIn, wMedia)

if (metadata.packname || metadata.author) {
const img = new webp.Image()
const json = { "sticker-pack-id": `https://github.com/Jabalsurya2105`, "sticker-pack-name": metadata.packname, "sticker-pack-publisher": metadata.author, "emojis": metadata.categories ? metadata.categories : [""] }
const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
const exif = Buffer.concat([exifAttr, jsonBuff])
exif.writeUIntLE(jsonBuff.length, 14, 4)
await img.load(tmpFileIn)
fs.unlinkSync(tmpFileIn)
img.exif = exif
await img.save(tmpFileOut)
return tmpFileOut
}
}

async function writeExifVid (media, metadata) {
let wMedia = await videoToWebp(media)
const tmpFileIn = path.join(tmpdir(), `${makeid(10)}.webp`)
const tmpFileOut = path.join(tmpdir(), `${makeid(10)}.webp`)
fs.writeFileSync(tmpFileIn, wMedia)

if (metadata.packname || metadata.author) {
const img = new webp.Image()
const json = { "sticker-pack-id": `https://github.com/Jabalsurya2105`, "sticker-pack-name": metadata.packname, "sticker-pack-publisher": metadata.author, "emojis": metadata.categories ? metadata.categories : [""] }
const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
const exif = Buffer.concat([exifAttr, jsonBuff])
exif.writeUIntLE(jsonBuff.length, 14, 4)
await img.load(tmpFileIn)
fs.unlinkSync(tmpFileIn)
img.exif = exif
await img.save(tmpFileOut)
return tmpFileOut
}
}

async function writeExif (media, metadata) {
let wMedia = /webp/.test(media.mimetype) ? media.data : /image/.test(media.mimetype) ? await imageToWebp(media.data) : /video/.test(media.mimetype) ? await videoToWebp(media.data) : ""
const tmpFileIn = path.join(tmpdir(), `${makeid(10)}.webp`)
const tmpFileOut = path.join(tmpdir(), `${makeid(10)}.webp`)
fs.writeFileSync(tmpFileIn, wMedia)

if (metadata.packname || metadata.author) {
const img = new webp.Image()
const json = { "sticker-pack-id": `https://github.com/Jabalsurya2105`, "sticker-pack-name": metadata.packname, "sticker-pack-publisher": metadata.author, "emojis": metadata.categories ? metadata.categories : [""] }
const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
const exif = Buffer.concat([exifAttr, jsonBuff])
exif.writeUIntLE(jsonBuff.length, 14, 4)
await img.load(tmpFileIn)
fs.unlinkSync(tmpFileIn)
img.exif = exif
await img.save(tmpFileOut)
return tmpFileOut
}
}

// avatar sticker
async function addExifAvatar(buffer, packname, author, categories = [''], extra = {}) {
  const {
    default: {
      Image
    }
  } = await import('node-webpmux')
  const img = new Image()
  const json = {
    'sticker-pack-id': 'Natsxe',
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    'emojis': categories,
    'is-avatar-sticker': 1,
    ...extra
  }
  let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
  let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
  let exif = Buffer.concat([exifAttr, jsonBuffer])
  exif.writeUIntLE(jsonBuffer.length, 14, 4)
  await img.load(buffer)
  img.exif = exif
  return await img.save(null)
}
module.exports = { imageToWebp, videoToWebp, writeExifImg, writeExifVid, writeExif, addExifAvatar }