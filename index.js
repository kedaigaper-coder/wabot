const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const ADMIN = '6283856559210@s.whatsapp.net';
const BOT_NUMBER = '628131825436';
async function start() {
const { state, saveCreds } = await useMultiFileAuthState('session');
const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }), browser: ["Ubuntu", "Chrome", "20.0.04"] });
sock.ev.on('creds.update', saveCreds);
if (!state.creds.registered) {
setTimeout(async () => {
try {
const code = await sock.requestPairingCode(BOT_NUMBER);
console.log('PAIRING CODE KAMU: ' + code);
} catch(e){ console.log('Gagal pairing, restart: ' + e.message) }
}, 3000);
}
sock.ev.on('connection.update', (u) => {
if (u.connection === 'open') console.log('✅ BROVER ONLINE!');
if (u.connection === 'close') start();
});
sock.ev.on('messages.upsert', async ({ messages }) => {
const m = messages[0];
if (!m.message || m.key.fromMe) return;
const from = m.key.remoteJid;
const nomorPengirim = (m.key.senderPn || m.key.remoteJidAlt || m.key.senderAlt || feom).split('@')[0];
const msg = m.message;
const text = (msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage?.caption || msg.videoMessage?.caption || '').trim();
const lower = text.toLowerCase();
const isMedia = !!(msg.imageMessage || msg.videoMessage || msg.audioMessage || msg.voiceMessage || msg.documentMessage || msg.stickerMessage);
let mediaType = 'MEDIA';
if (msg.imageMessage) mediaType = 'FOTO';
if (msg.videoMessage) mediaType = 'VIDEO';
if (msg.audioMessage || msg.voiceMessage) mediaType = 'VOICE NOTE';
if (msg.documentMessage) mediaType = 'DOKUMEN';
if (isMedia && !msg.stickerMessage) {
await sock.sendMessage(from, { text: mediaType + ' diterima kak, terima kasih! Sudah diteruskan ke admin Adebro. Mohon tunggu ya, admin akan segera hubungi kakak. Boleh kirim alamat lengkapnya juga ya kak.' });
try {
await sock.sendMessage(ADMIN, { text: '🔥 LEAD BARU ADEBRO! Dari: ' + nomorPengirim + ' Jenis: ' + mediaType + ' Pesan: ' + (text || '(tanpa keterangan)') });
await sock.sendMessage(ADMIN, { forward: m, forwardingScore: 1, isForwarded: true });
} catch(e){}
return;
}
if (msg.stickerMessage) {
await sock.sendMessage(from, { text: 'Hallo, saya BROVER asisten tim Adebro. Ketik: 1-Layanan & Harga, 2-Cara Order, 3-Alamat, 4-Chat Admin' });
return;
}
if (lower === '1' || lower.includes('harga') || lower.includes('layanan')) {
await sock.sendMessage(from, { text: 'ADEBRO - LAYANAN & HARGA:\n\n1. Pembangunan Dari Nol - Rumah, Kantor, Ruko, dll\n2. Renovasi - Rumah, Kantor, Ruko, Gudang\n3. Servis & Perbaikan Bangunan\n\nHarga tergantung luas & spek bangunan kak. Boleh kirim foto / video lokasi + ukurannya? Nanti admin kasih estimasi & survei gratis.\n\nKetik 2 untuk Cara Order, 4 untuk Chat Admin' });
return;
}
if (lower === '2' || lower.includes('order') || lower.includes('cara')) {
await sock.sendMessage(from, { text: 'CARA ORDER ADEBRO:\n\n1. Kirim Foto / Video lokasi\n2. Kirim Alamat Lengkap + No HP\n3. Admin konfirmasi jadwal & teknisi datang\n\nGampang kan kak? Kirim foto lokasinya sekarang aja!' });
return;
}
if (lower === '3' || lower.includes('alamat')) {
await sock.sendMessage(from, { text: 'ALAMAT ADEBRO:\nJl. Porek Pasir Putih, Sawangan, Depok.\n\nJANGKAUAN LAYANAN:\nJabodetabek. Di luar itu chat Admin ya kak!\n\nKetik 4 untuk langsung chat Admin ya kak!' });
return;
}
if (lower === '4' || lower.includes('admin') || lower.includes('orang')) {
await sock.sendMessage(from, { text: 'Siap kak, admin Adebro sudah saya hubungi. Mohon tunggu sebentar ya, admin akan segera chat kakak. Terima kasih!' });
try { await sock.sendMessage(ADMIN, { text: '⚠️ MINTA ADMIN! Dari: ' + nomorPengirim + ' Pesan: ' + text }); } catch(e){}
return;
}
await sock.sendMessage(from, { text: 'Hallo kak, saya BROVER asisten tim Adebro. Ada yang bisa dibantu?\n\nKetik:\n1 - Layanan & Harga\n2 - Cara Order\n3 - Alamat\n4 - Chat Admin\n\nAtau langsung kirim Foto / Video lokasi / bangunannya ya kak!' });
});
}
start();
