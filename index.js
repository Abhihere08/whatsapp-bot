const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const Jimp = require('jimp');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

let slowmode = { active: false, seconds: 0, lastMessages: {} };

const roasts = [
    "You're the reason God created the middle finger.",
    "You bring everyone so much joy... when you leave the room.",
    "I'd agree with you but then we'd both be wrong.",
    "You're proof that evolution can go in reverse.",
    "You're not exactly a waste of space, but you're close.",
    "If you were a spice, you'd be flour.",
    "You're like a cloud. When you disappear, it's a beautiful day.",
    "I'm jealous of people who don't know you.",
    "You're the human equivalent of a participation trophy.",
    "You have something on your chin... no, the third one down."
];

const truths = [
    "What's the most embarrassing thing you've ever done in public?",
    "Who was your first celebrity crush?",
    "What's a secret you've never told anyone in this group?",
    "Have you ever snooped through someone's phone? What did you find?",
    "What's the weirdest thing you've ever eaten?",
    "Have you ever peed in a pool?",
    "What's the most childish thing you still do?",
    "Have you ever pretend to be sick to get out of something?",
    "What's a song you secretly love but pretend to hate?",
    "Have you ever Google-stalked someone in this group?"
];

const dares = [
    "Send a voice note singing your favorite song.",
    "Text your mom 'I love you' and screenshot the response.",
    "Change your profile picture to the group's chat wallpaper for 1 hour.",
    "Send a selfie making the ugliest face you can.",
    "Text your crush/partner saying 'I have something to tell you' and wait 5 minutes before saying it was a dare.",
    "Speak only in emojis for the next 10 messages.",
    "Post the oldest photo on your camera roll.",
    "Call the 5th person in your contacts and sing them happy birthday.",
    "Send a screenshot of your last text conversation.",
    "Do 10 pushups and send a photo proof."
];

function isGroup(msg) {
    return msg.chat && msg.chat.isGroup;
}

function getArgs(msg) {
    return msg.body.slice(1).trim().split(/ +/);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const reverseMap = {
    'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ',
    'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd',
    'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x',
    'y': 'ʎ', 'z': 'z',
    'A': '∀', 'B': 'ᙠ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': '⅁', 'H': 'H',
    'I': 'I', 'J': 'ſ', 'K': 'ꓘ', 'L': '˥', 'M': 'W', 'N': 'ᴎ', 'O': 'O', 'P': 'Ԁ',
    'Q': 'Ό', 'R': 'ᴚ', 'S': 'S', 'T': '┴', 'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X',
    'Y': '⅄', 'Z': 'Z',
    '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ᔭ', '5': 'ϛ', '6': '9', '7': 'ㄥ',
    '8': '8', '9': '6',
    '.': '˙', ',': "'", "'": ',', '"': '„', '?': '¿', '!': '¡', '(': ')', ')': '(',
    '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '&': '⅋', '_': '‾',
    ' ': ' '
};

function reverseText(text) {
    return text.split('').map(c => reverseMap[c] || c).reverse().join('');
}

client.on('qr', (qr) => {
    console.log('Scan the QR code with WhatsApp:');
    qrcode.generate(qr, { small: true, type: 'terminal' });
});

client.on('ready', () => {
    console.log('WhatsApp Bot is ready!');
});

client.on('message', async (msg) => {
    console.log('Received message:', msg.body, 'from:', msg.from, 'chat:', msg.chat && msg.chat.id);
    if (!msg.body.startsWith('!')) return;
    
    const args = getArgs(msg);
    const command = args.shift().toLowerCase();
    console.log('Processing command:', command);

    if (command === 'ship') {
        if (args.length < 2) return msg.reply('Usage: !ship @user1 @user2');
        const pct = randomInt(0, 100);
        const analyses = [
            "It's complicated... like a tangled headphone cable.",
            "Match made in heaven! Or maybe just match made in hell.",
            "You two are like pizza and pineapple. Controversial but somehow works.",
            "The stars align... or maybe it's just your phones aligning in the same room.",
            "Chemistry level: Strong enough to blow up the lab.",
            "A beautiful mess waiting to happen."
        ];
        await msg.reply(`💘 *Ship Result* 💘\n\n@${args[0]} x @${args[1]}\nLove Compatibility: ${pct}%\n\n${randomChoice(analyses)}`, null, { 
            mentions: [args[0], args[1]].map(a => a.includes('@') ? a : a + '@s.whatsapp.net')
        });
    }

    if (command === 'roast') {
        const target = args[0] || (msg.mentionedIds[0] ? msg.mentionedIds[0].split('@')[0] : null);
        if (!target) return msg.reply('Usage: !roast @user');
        await msg.reply(`🔥 *Roast for @${target}* 🔥\n\n${randomChoice(roasts)}`, null, {
            mentions: [target.includes('@') ? target : target + '@s.whatsapp.net']
        });
    }

    if (command === 'truth') {
        await msg.reply(`🧠 *Truth* 🧠\n\n${randomChoice(truths)}`);
    }

    if (command === 'dare') {
        await msg.reply(`🎯 *Dare* 🎯\n\n${randomChoice(dares)}`);
    }

    if (command === 'simprate') {
        const target = args[0] || (msg.mentionedIds[0] ? msg.mentionedIds[0].split('@')[0] : null);
        if (!target) return msg.reply('Usage: !simprate @user');
        const pct = randomInt(0, 100);
        const levels = pct > 80 ? "Maximum simp detected. Please seek help." : pct > 50 ? "Certified simp. We see you." : "Low simping levels. You're safe... for now.";
        await msg.reply(`📊 *Simp Rate for @${target}* 📊\n\n${pct}% Simp\n\n${levels}`, null, {
            mentions: [target.includes('@') ? target : target + '@s.whatsapp.net']
        });
    }

    if (command === 'ghostping') {
        if (!isGroup(msg)) return msg.reply('Use this in a group!');
        const target = args[0] || msg.mentionedIds[0];
        if (!target) return msg.reply('Usage: !ghostping @user');
        const jid = target.includes('@') ? target : target + '@s.whatsapp.net';
        try {
            const chat = await msg.getChat();
            const sent = await chat.sendMessage('@' + jid.split('@')[0], { mentions: [jid] });
            setTimeout(async () => {
                try { await sent.delete(true); } catch(e) { console.error('Delete error:', e); }
            }, 300);
        } catch (e) {
            console.error('Ghostping error:', e);
        }
    }

    if (command === 'tagall' || command === 'everyone') {
        if (!isGroup(msg)) return msg.reply('Use this in a group!');
        try {
            const chat = await msg.getChat();
            const participants = chat.participants || [];
            let text = '🔔 *Tagging Everyone* 🔔\n\n';
            const mentions = [];
            for (const p of participants) {
                const id = p.id._serialized || (typeof p === 'string' ? p : null);
                if (!id) continue;
                text += `@${id.split('@')[0]} `;
                mentions.push(id);
            }
            await chat.sendMessage(text, { mentions });
        } catch (e) {
            console.error('Tagall error:', e);
        }
    }

    if (command === 'reverse') {
        const text = args.join(' ') || msg.body.replace(/^!reverse\s*/, '');
        await msg.reply(reverseText(text));
    }

    if (command === 'slowmode') {
        if (!isGroup(msg)) return msg.reply('Use this in a group!');
        if (!args[0]) return msg.reply('Usage: !slowmode [seconds] or !slowmode off');
        
        if (args[0].toLowerCase() === 'off') {
            slowmode = { active: false, seconds: 0, lastMessages: {} };
            return msg.reply('Slow mode has been disabled.');
        }
        
        const seconds = parseInt(args[0]);
        if (isNaN(seconds) || seconds < 1) return msg.reply('Please provide a valid number of seconds.');
        
        slowmode = { active: true, seconds: seconds, lastMessages: {} };
        await msg.reply(`Slow mode activated! Members must wait ${seconds} seconds between messages.`);
    }

    if (command === 'sticker') {
        if (!msg.hasQuotedMsg) return msg.reply('Reply to an image or GIF with !sticker');
        const quoted = await msg.getQuotedMessage();
        if (!quoted.hasMedia) return msg.reply('Please reply to an image or GIF');
        try {
            const media = await quoted.downloadMedia();
            const sticker = new Sticker(media.data, {
                pack: 'WhatsApp Bot',
                author: 'Bot',
                type: StickerTypes.FULL
            });
            const buffer = await sticker.toBuffer();
            const stickerMedia = new MessageMedia('image/webp', buffer.toString('base64'));
            await msg.reply(stickerMedia);
        } catch (e) {
            console.error('Sticker error:', e);
            await msg.reply('Failed to create sticker. Make sure the file is an image or GIF.');
        }
    }

    if (command === 'deepfry') {
        if (!msg.hasQuotedMsg) return msg.reply('Reply to an image with !deepfry');
        const quoted = await msg.getQuotedMessage();
        if (!quoted.hasMedia) return msg.reply('Please reply to an image');
        try {
            const media = await quoted.downloadMedia();
            const image = await Jimp.read(Buffer.from(media.data, 'base64'));
            const fried = await image
                .contrast(0.8)
                .brightness(0.15)
                .color([
                    { apply: 'red', params: [1.6] },
                    { apply: 'green', params: [1.3] },
                    { apply: 'blue', params: [0.7] }
                ])
                .getBufferAsync(Jimp.MIME_PNG);
            const friedMedia = new MessageMedia('image/png', fried.toString('base64'));
            await msg.reply(friedMedia);
        } catch (e) {
            console.error('Deepfry error:', e);
            await msg.reply('Failed to deep fry image.');
        }
    }

    if (command === 'bassboost') {
        if (!msg.hasQuotedMsg) return msg.reply('Reply to an audio/voice note with !bassboost');
        const quoted = await msg.getQuotedMessage();
        if (!quoted.hasMedia) return msg.reply('Please reply to an audio message');
        try {
            const media = await quoted.downloadMedia();
            const ext = media.mimetype.split('/')[1] || 'ogg';
            const inputPath = path.join(__dirname, `bass_input_${Date.now()}.${ext}`);
            const outputPath = path.join(__dirname, `bass_output_${Date.now()}.ogg`);
            fs.writeFileSync(inputPath, Buffer.from(media.data, 'base64'));
            
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .audioFilters('bass=g=20:d=0.5')
                    .save(outputPath)
                    .on('end', resolve)
                    .on('error', reject);
            });
            
            const audio = MessageMedia.fromFilePath(outputPath);
            await msg.reply(audio, null, { sendAudioAsVoice: true });
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        } catch (e) {
            console.error('Bassboost error:', e);
            await msg.reply('Failed to bass boost. Make sure ffmpeg is installed on your system.');
        }
    }

    if (command === 'tts') {
        if (!args.length) return msg.reply('Usage: !tts [accent] [text] or !tts [text]');
        const accent = args[0].length <= 3 ? args.shift() : 'en';
        const text = args.join(' ');
        if (!text) return msg.reply('Please provide text to convert.');
        try {
            const encoded = encodeURIComponent(text);
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${accent}&client=tw-ob`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('TTS request failed');
            const buffer = Buffer.from(await res.arrayBuffer());
            const filePath = path.join(__dirname, `tts_${Date.now()}.mp3`);
            fs.writeFileSync(filePath, buffer);
            const audio = MessageMedia.fromFilePath(filePath);
            await msg.reply(audio, null, { sendAudioAsVoice: true });
            fs.unlinkSync(filePath);
        } catch (e) {
            console.error('TTS error:', e);
            await msg.reply('Failed to generate TTS. Try again or use a different accent.');
        }
    }

    if (command === 'fakechat') {
        if (args.length < 2) return msg.reply('Usage: !fakechat [Name] [Message]');
        const name = args[0];
        const message = args.slice(1).join(' ');
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        await msg.reply(
`📱 *Fake Chat*
*${name}* • online • ${time}

┌──────────────────────────────┐
│ ${message}
└──────────────────────────────┘
✓✓`
        );
    }
});

client.on('message_create', async (msg) => {
    if (msg.fromMe) return;
    if (!isGroup(msg)) return;
    if (!slowmode.active) return;

    const sender = msg.author || msg.from;
    if (!sender) return;

    const now = Date.now();
    const last = slowmode.lastMessages[sender];
    const elapsed = (now - last) / 1000;

    if (last && elapsed < slowmode.seconds) {
        try {
            await msg.reply(`🐢 Slow mode! Wait ${Math.ceil(slowmode.seconds - elapsed)}s before sending another message.`);
        } catch (e) {
            console.error('Slowmode reply error:', e);
        }
    }

    slowmode.lastMessages[sender] = now;
});

client.initialize();

console.log('Starting WhatsApp Bot...');
console.log('Make sure you have Node.js installed.');
console.log('If dependencies fail, run: npm install');
