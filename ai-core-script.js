(function() {
    "use strict"; // Enable strict mode for cleaner code and error checking

    // --- Global Variables & Constants ---
    const HIGHLIGHT_COLORS = {
        blue: 'var(--highlight-blue)',
        green: 'var(--highlight-green)',
        purple: 'var(--highlight-purple)',
        main: 'var(--text-main)',
        secondary: 'var(--text-secondary)'
    };
    const GLITCH_RED = 'var(--glitch-red)';

    // --- Preloader Logic ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        const preloaderBar = preloader.querySelector('.preloader-bar');
        const preloaderTextSpans = preloader.querySelectorAll('.preloader-text span');

        const fadeOutPreloader = () => {
            // Pastikan semua span memiliki kelas 'typed-done' agar caret hilang
            preloaderTextSpans.forEach(span => {
                span.classList.add('typed-done');
            });

            preloader.classList.add('hidden');
            preloader.addEventListener('transitionend', () => {
                preloader.remove();
                initCoreFeatures();
            }, { once: true });
        };

        if (preloaderBar) {
            preloaderBar.addEventListener('animationend', fadeOutPreloader, { once: true });
            // Add typed-done class to each span after its specific animation delay
            // This is a workaround as native typed.js is not used here for preloader
            preloaderTextSpans.forEach((span, index) => {
                let delay = 0;
                if (index === 0) delay = 1500; // Delay for first span's typing
                if (index === 1) delay = 1500 + 500; // Delay for second span's typing + previous
                if (index === 2) delay = 1500 + 500 + 500; // Delay for third span's typing + previous
                setTimeout(() => {
                    span.classList.add('typed-done');
                }, delay + 100); // Add a small buffer after typing animation ends
            });

        } else {
            // If no preloader bar (e.g., HTML structure changed), just fade out directly
            fadeOutPreloader();
        }
    } else {
        // If no preloader element at all, initialize immediately
        initCoreFeatures();
    }

    // Function to initialize all main features
    function initCoreFeatures() {
        console.log('Core features initialized.');
        // AOS.init() will be called in index.html, so ensure elements are ready for it.
        initContentAnimations(); // This will primarily handle skill bar animation now.
        initQuantumCanvas();
        initUptimeCounter();
        initAIStatus();
        initDecryptTextOnScroll();
        initNavAndScrollHighlight();
        initCtaButtons();
        initMobileMenuToggle();
        initProjectFiltering();
        initSkillInfoOverlay();
        initImageModal();
        initCurrentYear();
        initBackToTopButton();
        initKonamiCode();
        initAIVoiceToggle();
        initTypedJS();
        // Staggered animations for grid items are handled by AOS data attributes now.
    }


    // --- System Status Dashboard ---
    let uptimeSeconds = 0;
    let uptimeInterval;
    const uptimeDisplay = document.getElementById('uptime-display');
    const aiStatus = document.getElementById('ai-status');

    function initUptimeCounter() {
        if (!uptimeDisplay) {
            console.warn("Uptime display element not found.");
            return;
        }
        // Clear any existing interval to prevent duplicates if init is called multiple times
        if (uptimeInterval) clearInterval(uptimeInterval);

        uptimeInterval = setInterval(() => {
            uptimeSeconds++;
            const hours = String(Math.floor(uptimeSeconds / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((uptimeSeconds % 3600) / 60)).padStart(2, '0');
            const seconds = String(uptimeSeconds % 60).padStart(2, '0');
            uptimeDisplay.innerHTML = `${hours}:${minutes}:${seconds}`;
        }, 1000);
    }

    function initAIStatus(statusText = 'ONLINE', color = HIGHLIGHT_COLORS.green) {
        if (!aiStatus) {
            console.warn("AI status element not found.");
            return;
        }
        aiStatus.textContent = statusText;
        aiStatus.style.color = color;
        aiStatus.style.textShadow = `0 0 5px ${color}`;

        // Hentikan dan mulai kembali efek flicker jika status berubah
        if (aiStatus._flickerInterval) clearInterval(aiStatus._flickerInterval);
        aiStatus.classList.remove('online-flicker'); // Hapus kelas flicker default

        if (statusText === 'ONLINE') {
            aiStatus.classList.add('online-flicker'); // Tambahkan kelas untuk CSS animation
        } else {
            aiStatus.style.opacity = '1'; // Pastikan opacity penuh jika tidak online
        }
    }

    // --- AI Voice Toggle (Diperbarui untuk fungsionalitas suara lebih canggih) ---
    let recognition; // Web Speech Recognition API
    let synth; // Web Speech Synthesis API
    let speaking = false; // Status apakah AI sedang berbicara
    let listening = false; // Status apakah AI sedang mendengarkan
    let aiContext = {}; // Untuk menyimpan konteks percakapan sederhana
    const aiVoiceToggle = document.querySelector('.ai-voice-toggle');
    let selectedVoiceForAI = null; // Suara yang dipilih untuk AI
    let audioContext;
    // let microphoneSource; // Tidak digunakan saat ini
    // let analyser; // Tidak digunakan saat ini

    // Helper untuk simulasi jeda berpikir AI
    const simulateThinking = (callback) => {
        initAIStatus('THINKING...', HIGHLIGHT_COLORS.purple);
        setTimeout(() => {
            callback();
        }, 800); // Jeda 0.8 detik untuk "berpikir"
    };

    // Audio feedback helper
    const playSound = (type) => {
        try {
            if (audioContext && audioContext.state === 'running') {
                audioContext.close();
            }
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            if (type === 'start_listening') {
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
            } else if (type === 'stop_listening') {
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
            } else if (type === 'unrecognized') {
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
            }
        } catch (e) {
            console.warn("AudioContext not supported or error playing sound:", e);
        }
    };


    function initAIVoiceToggle() {
        if (!aiVoiceToggle) {
            console.warn("AI Voice Toggle element not found.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const SpeechSynthesis = window.speechSynthesis;
        const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance;

        if (!SpeechRecognition || !SpeechSynthesis || !SpeechSynthesisUtterance) {
            console.warn("Web Speech API not fully supported in this browser. Hiding AI Voice Toggle.");
            aiVoiceToggle.style.display = 'none';
            alert("Maaf, fitur asisten suara tidak didukung penuh di browser Anda. Coba gunakan Google Chrome atau browser yang mendukung Web Speech API.");
            return;
        }

        synth = SpeechSynthesis;

        // --- Voice Selection Logic (diperbarui untuk realisme) ---
        const findAndSetAIvoice = () => {
            const voices = synth.getVoices();
            let voiceFound = null;

            voiceFound = voices.find(
                voice => voice.lang === 'id-ID' &&
                         (voice.name.includes('Google') && voice.name.includes('Bahasa Indonesia') ||
                          voice.name.includes('id-ID') && voice.name.includes('Wavenet'))
            );

            if (!voiceFound) {
                voiceFound = voices.find(
                    voice => voice.lang === 'id-ID' && voice.name.includes('Google')
                );
            }

            if (!voiceFound) {
                voiceFound = voices.find(voice => voice.lang.startsWith('id'));
            }

            selectedVoiceForAI = voiceFound;

            if (selectedVoiceForAI) {
                console.log(`AI will use voice: ${selectedVoiceForAI.name} (${selectedVoiceForAI.lang})`);
            } else {
                console.warn("No high-quality Indonesian voice found. AI will use default voice, which may sound robotic.");
                if (aiVoiceToggle.dataset.active === 'true') {
                    speakText("Perhatian, saya tidak dapat menemukan suara Bahasa Indonesia berkualitas tinggi di sistem Anda. Saya akan menggunakan suara default.", null, null, false);
                }
            }
        };

        synth.onvoiceschanged = findAndSetAIvoice;
        if (synth.getVoices().length > 0) {
            findAndSetAIvoice();
        }


        aiVoiceToggle.addEventListener('click', () => {
            const isActive = aiVoiceToggle.dataset.active === 'true';

            if (!isActive) {
                // Aktifkan Voice Assistant
                aiVoiceToggle.dataset.active = 'true';
                aiVoiceToggle.setAttribute('title', 'Voice Assistant: ON (Click to Stop)');
                initAIStatus('INITIALIZING...', HIGHLIGHT_COLORS.purple);
                playSound('start_listening');

                recognition = new SpeechRecognition();
                recognition.lang = 'id-ID';
                recognition.interimResults = false;
                recognition.continuous = false;
                recognition.maxAlternatives = 1;

                recognition.onstart = () => {
                    listening = true;
                    console.log('Voice recognition started. Listening...');
                    initAIStatus('LISTENING...', HIGHLIGHT_COLORS.blue);
                    aiVoiceToggle.querySelector('i').classList.add('fa-beat-fade');
                };

                recognition.onresult = (event) => {
                    const speechResult = event.results[0][0].transcript.toLowerCase().trim();
                    console.log('Final Speech result:', speechResult);

                    if (speechResult) {
                        initAIStatus('PROCESSING...', HIGHLIGHT_COLORS.purple);
                        aiVoiceToggle.querySelector('i').classList.remove('fa-beat-fade');

                        if (recognition && listening) {
                            recognition.stop();
                            listening = false;
                        }

                        simulateThinking(() => {
                            let aiResponse = processVoiceCommand(speechResult);
                            speakText(aiResponse, () => {
                                // Hanya reset konteks dan matikan jika bukan perintah stop atau error
                                if (!aiContext.lastIntent || aiContext.lastIntent !== 'stop_command') {
                                    aiVoiceToggle.dataset.active = 'false';
                                    aiVoiceToggle.setAttribute('title', 'Voice Assistant: OFF (Click to Start)');
                                    initAIStatus('ONLINE', HIGHLIGHT_COLORS.green);
                                    aiContext = {}; // Reset konteks setelah satu interaksi selesai
                                    playSound('stop_listening');
                                }
                            });
                        });
                    } else {
                        // Jika tidak ada suara terdeteksi setelah klik dan onresult dipicu kosong
                        speakText("Tidak ada suara terdeteksi. Silakan coba lagi.", () => {
                            aiVoiceToggle.dataset.active = 'false';
                            aiVoiceToggle.setAttribute('title', 'Voice Assistant: OFF (Click to Start)');
                            initAIStatus('ONLINE', HIGHLIGHT_COLORS.green);
                            aiContext = {};
                            playSound('stop_listening');
                        });
                    }
                };

                recognition.onerror = (event) => {
                    console.error('Voice recognition error:', event.error);
                    listening = false;
                    aiVoiceToggle.querySelector('i').classList.remove('fa-beat-fade');
                    initAIStatus('ERROR', GLITCH_RED);
                    aiVoiceToggle.dataset.active = 'false';
                    aiVoiceToggle.setAttribute('title', 'Voice Assistant: OFF (Error)');
                    playSound('unrecognized');

                    let errorMessage = "Terjadi kesalahan pada pengenalan suara.";
                    if (event.error === 'not-allowed') {
                        errorMessage = "Akses mikrofon ditolak. Mohon izinkan penggunaan mikrofon.";
                    } else if (event.error === 'no-speech') {
                         errorMessage = "Tidak ada suara terdeteksi. Silakan coba lagi.";
                    } else if (event.error === 'network') {
                        errorMessage = "Tidak ada koneksi internet untuk pengenalan suara. Mohon periksa koneksi Anda.";
                    } else if (event.error === 'aborted') {
                        console.log("Recognition aborted, likely intentional stop or browser timeout.");
                        if (aiVoiceToggle.dataset.active === 'true') {
                             // Jika tombol masih aktif dan AI tidak berbicara, nonaktifkan otomatis
                             aiVoiceToggle.dataset.active = 'false';
                             aiVoiceToggle.setAttribute('title', 'Voice Assistant: OFF (Click to Start)');
                             initAIStatus('ONLINE', HIGHLIGHT_COLORS.green);
                             aiContext = {};
                        }
                        return; // Jangan tampilkan error jika aborted
                    }
                    speakText(errorMessage, () => {
                        initAIStatus('OFFLINE', HIGHLIGHT_COLORS.secondary);
                    });
                };

                recognition.onend = () => {
                    if (listening) {
                        console.log('Voice recognition ended naturally (timeout or no final speech).');
                        listening = false;
                        if (!speaking && aiVoiceToggle.dataset.active === 'true') {
                             aiVoiceToggle.dataset.active = 'false';
                             aiVoiceToggle.setAttribute('title', 'Voice Assistant: OFF (Click to Start)');
                             initAIStatus('ONLINE', HIGHLIGHT_COLORS.green);
                             aiContext = {};
                        }
                    }
                    aiVoiceToggle.querySelector('i').classList.remove('fa-beat-fade');
                };

                try {
                    recognition.start();
                } catch (e) {
                    console.error("Error starting recognition:", e);
                    initAIStatus('ERROR', GLITCH_RED);
                    aiVoiceToggle.dataset.active = 'false';
                    aiVoiceToggle.setAttribute('title', 'Voice Assistant: OFF (Error)');
                    speakText("Maaf, tidak dapat memulai pengenalan suara. Pastikan mikrofon berfungsi dan izinkan akses.");
                    playSound('unrecognized');
                }

            } else {
                // Nonaktifkan Voice Assistant secara manual
                aiVoiceToggle.dataset.active = 'false';
                aiVoiceToggle.setAttribute('title', 'Voice Assistant: OFF (Click to Start)');
                if (recognition && listening) {
                    recognition.stop();
                    listening = false;
                }
                if (synth && synth.speaking) {
                    synth.cancel();
                    speaking = false;
                }
                aiVoiceToggle.querySelector('i').classList.remove('fa-beat-fade');
                initAIStatus('OFFLINE', HIGHLIGHT_COLORS.secondary);
                console.log('AI Voice Assistant OFF');
                aiContext = {};
                playSound('stop_listening');
            }
        });

        synth.addEventListener('end', (event) => {
            speaking = false;
            console.log('Speech Synthesis: AI finished speaking.');
            // Jika AI bicara karena perintah stop, pastikan tombol benar-benar off
            if (aiContext.lastIntent === 'stop_command') {
                aiVoiceToggle.dataset.active = 'false';
                aiVoiceToggle.setAttribute('title', 'Voice Assistant: OFF (Click to Start)');
                initAIStatus('OFFLINE', HIGHLIGHT_COLORS.secondary);
                aiContext = {};
                playSound('stop_listening');
            } else if (aiVoiceToggle.dataset.active === 'true') {
                // Jika AI selesai bicara dan tombol masih ON, mulai mendengarkan lagi secara otomatis
                // Ini untuk percakapan multi-turn
                console.log('AI finished speaking, restarting recognition for next command.');
                recognition.start();
            }
        });
        synth.addEventListener('start', (event) => {
            speaking = true;
            console.log('Speech Synthesis: AI started speaking.');
            initAIStatus('SPEAKING...', HIGHLIGHT_COLORS.purple);
            // Ketika AI mulai bicara, hentikan mendengarkan untuk menghindari self-loop
            if (recognition && listening) {
                recognition.stop(); // Ini akan memicu onend recognition
                listening = false;
            }
        });
    }

    // Helper untuk pencocokan perintah yang lebih "fuzzy"
    function matchCommand(command, keywords) {
        command = command.toLowerCase().trim();

        // 1. Pencocokan Penuh Kata
        for (const keyword of keywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            if (regex.test(command)) {
                return true;
            }
        }

        // 2. Pencocokan Parsial/Fuzzy (jika tidak ada pencocokan penuh)
        const commandWords = command.split(/\s+/).filter(word => word.length > 0);
        for (const keyword of keywords) {
            const keywordWords = keyword.split(/\s+/).filter(word => word.length > 0);
            if (keywordWords.length === 0) continue;

            let matchesInOrder = 0;
            let currentCommandIndex = 0;
            for (let i = 0; i < keywordWords.length; i++) {
                const kw = keywordWords[i];
                let found = false;
                for (let j = currentCommandIndex; j < commandWords.length; j++) {
                    if (commandWords[j].includes(kw)) { // Menggunakan includes untuk fuzzy matching
                        matchesInOrder++;
                        currentCommandIndex = j + 1;
                        found = true;
                        break;
                    }
                }
                if (!found) break;
            }
            if (matchesInOrder === keywordWords.length) {
                return true;
            }
        }

        return false;
    }


    // Fungsi untuk memproses perintah suara yang lebih canggih
    function processVoiceCommand(command) {
        command = command.trim().toLowerCase();
        let response = '';

        // --- Definisi Niat & Respons ---
        const intents = {
            greet: ['halo', 'hai', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam'],
            identity: ['siapa kamu', 'kamu siapa', 'tentang kamu', 'nama kamu siapa'],
            time: ['jam berapa', 'sekarang jam berapa', 'pukul berapa'],
            describeDeden: ['ceritakan tentang deden', 'deden itu siapa', 'profil deden', 'siapa deden hadiguna', 'jelaskan tentang deden'],
            thanks: ['terima kasih', 'makasih', 'thank you'],
            downloadCV: ['download cv', 'unduh cv', 'ambil cv', 'dapatkan cv', 'download resume'],
            openLink: {
                linkedin: ['buka linkedin', 'pergi ke linkedin', 'linkedin deden', 'lihat linkedin'],
                github: ['buka github', 'pergi ke github', 'github deden', 'lihat github'],
                email: ['kirim email', 'email deden', 'alamat email', 'kirimi saya email'],
                whatsapp: ['whatsapp deden', 'nomor whatsapp', 'kirim pesan whatsapp', 'kontak whatsapp']
            },
            navigate: {
                home: ['home', 'beranda', 'kembali ke home', 'halaman utama', 'pulang'],
                about: ['tentang', 'profil', 'pergi ke tentang', 'tampilkan tentang'],
                skills: ['keahlian', 'skill', 'kemampuan', 'daftar keahlian', 'lihat skill'],
                projects: ['proyek', 'portofolio', 'pekerjaan', 'lihat proyek', 'tampilkan proyek'],
                photos: ['foto', 'galeri', 'gambar', 'lihat foto', 'tampilkan foto'],
                certificates: ['sertifikat', 'prestasi', 'lihat sertifikat', 'sertifikatnya', 'tampilkan sertifikat'],
                education: ['pendidikan', 'riwayat', 'riwayat pendidikan', 'latar belakang pendidikan', 'sekolah deden', 'lihat pendidikan'],
                contact: ['kontak', 'hubungi', 'informasi kontak', 'cara menghubungi']
            },
            help: ['bantu saya', 'butuh bantuan', 'apa yang bisa saya lakukan', 'perintah apa saja', 'daftar perintah', 'apa saja yang bisa kamu lakukan'],
            stop: ['mati', 'berhenti', 'nonaktifkan', 'tutup', 'sudah', 'cukup', 'selesai'],
            affirmation: ['ya', 'benar', 'betul', 'oke', 'setuju'],
            negation: ['tidak', 'bukan', 'salah']
        };

        // --- Variasi Respons ---
        const responseVariations = {
            greet: [
                'Halo kembali. Ada yang bisa saya bantu?',
                'Hai! Apa yang bisa saya lakukan untuk Anda?',
                'Selamat datang kembali. Ada pertanyaan?'
            ],
            identity: [
                'Saya adalah asisten AI di portofolio Deden Hadiguna. Saya di sini untuk membantu Anda menjelajahi informasi.',
                'Saya adalah antarmuka AI Deden. Saya dapat membantu Anda menemukan apa yang Anda cari di situs ini.',
                'Anda berbicara dengan asisten virtual Deden Hadiguna. Senang bertemu dengan Anda.'
            ],
            time: (hours, minutes) => [
                `Sekarang pukul ${hours} lewat ${minutes} menit.`,
                `Waktu saat ini adalah ${hours} ${minutes}.`,
                `Pukul ${hours} ${minutes} sekarang.`
            ],
            aboutDedenFull: () => {
                const aboutTextElement1 = document.querySelector('#about .section-content .about-text p.decrypt-text:nth-of-type(1)');
                const aboutTextElement2 = document.querySelector('#about .section-content .about-text p.decrypt-text:nth-of-type(2)');
                let text = '';
                if (aboutTextElement1) {
                    text += (aboutTextElement1.dataset.text || aboutTextElement1.textContent).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                }
                if (aboutTextElement2) {
                    if (text) text += ' ';
                    text += (aboutTextElement2.dataset.text || aboutTextElement2.textContent).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                }
                return text || 'Maaf, saya tidak dapat menemukan informasi lengkap tentang Deden saat ini.';
            },
            thanks: [
                'Sama-sama. Senang bisa membantu.',
                'Dengan senang hati.',
                'Tidak masalah.'
            ],
            unrecognized: [
                'Maaf, saya tidak mengerti perintah itu. Bisakah Anda mengulanginya?',
                'Saya kurang memahami. Bisakah Anda mencoba perintah lain?',
                'Perintah tersebut tidak dikenali. Mohon berikan instruksi yang lebih jelas.',
                'Saya tidak dapat memproses permintaan Anda. Perintah apa yang ingin Anda berikan?'
            ],
            confirmNavigation: (section) => [
                `Baik, saya akan membawa Anda ke bagian ${section}.`,
                `Mengganti tampilan ke ${section}.`,
                `Menuju ke ${section}.`
            ],
            errorNotFound: (item) => [
                `Maaf, saya tidak dapat menemukan ${item} yang Anda maksud.`,
                `Tidak dapat menemukan ${item}. Mungkin ada kesalahan penulisan?`,
                `Saya tidak bisa menemukan ${item}.`
            ],
            help: [
                'Anda bisa meminta saya untuk "Tampilkan proyek", "Buka LinkedIn", "Ceritakan tentang Deden", atau bertanya "Jam berapa".',
                'Saya dapat membantu Anda menavigasi situs ini. Coba katakan "Tampilkan keahlian" atau "Hubungi Deden".',
                'Perintah yang saya pahami antara lain: navigasi halaman, buka tautan sosial, informasi tentang Deden, dan waktu saat ini.'
            ],
            fullHelp: () => {
                const capabilities = [
                    'Saya bisa menyapa Anda.',
                    'Saya bisa memberi tahu siapa saya.',
                    'Saya bisa memberi tahu waktu saat ini.',
                    'Saya bisa menceritakan tentang Deden Hadiguna, termasuk keahlian, proyek, dan pendidikannya.',
                    'Saya bisa membantu Anda mengunduh CV Deden.',
                    'Saya bisa membuka tautan sosial seperti LinkedIn, GitHub, email, atau WhatsApp Deden.',
                    'Saya bisa menavigasi Anda ke berbagai bagian portofolio ini, seperti Home, About, Skills, Projects, Photos, Certificates, Education, dan Contact.',
                    'Dan tentu saja, saya bisa memberikan bantuan seperti saat ini.'
                ];
                return 'Saya bisa melakukan beberapa hal. Contohnya, ' + capabilities.join(', ') + '. Apa yang ingin Anda lakukan?';
            },
            thinking: [
                'Memproses...',
                'Sebentar...',
                'Menganalisis...'
            ],
            clarification: (question) => [
                `Bisakah Anda lebih spesifik tentang ${question}?`,
                `Anda ingin ${question} yang mana?`
            ],
            goodbye: [
                'Baik, saya akan nonaktifkan. Sampai jumpa lagi!',
                'Asisten dinonaktifkan. Silakan aktifkan kembali kapan saja Anda butuhkan.',
                'Saya off. Hubungi saya jika Anda butuh bantuan.'
            ],
            proactiveHelp: [
                "Apakah ada hal lain yang ingin Anda ketahui atau bagian yang ingin Anda kunjungi?",
                "Ada lagi yang bisa saya bantu?",
                "Jika Anda butuh bantuan, katakan 'bantu saya'."
            ]
        };

        // --- Fungsi Helper Navigasi ---
        const navigateToSection = (sectionId) => {
            const link = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (link) {
                link.click();
                return true;
            }
            return false;
        };

        // --- Implementasi Logika Perintah ---

        // 1. Perintah Stop (prioritas tertinggi)
        if (matchCommand(command, intents.stop)) {
            const responseText = responseVariations.goodbye[Math.floor(Math.random() * responseVariations.goodbye.length)];
            aiContext = { lastIntent: 'stop_command' }; // Set konteks khusus untuk stop
            return responseText;
        }

        // 2. Perintah Bantuan (Help)
        if (matchCommand(command, intents.help)) {
            aiContext = { lastIntent: 'help' };
            return responseVariations.fullHelp();
        }

        // 3. Perintah untuk Menceritakan (About Deden)
        if (matchCommand(command, intents.describeDeden)) {
            aiContext = { lastIntent: 'describe_deden' };
            return responseVariations.aboutDedenFull();
        }

        // 4. Perintah Navigasi
        for (const section in intents.navigate) {
            if (matchCommand(command, intents.navigate[section])) {
                if (navigateToSection(section)) {
                    aiContext = { lastIntent: 'navigate', lastSection: section };
                    return responseVariations.confirmNavigation(section)[Math.floor(Math.random() * responseVariations.confirmNavigation(section).length)];
                } else {
                    return responseVariations.errorNotFound(`bagian ${section}`);
                }
            }
        }

        // 5. Perintah Buka Link
        for (const linkType in intents.openLink) {
            if (matchCommand(command, intents.openLink[linkType])) {
                let targetHref = '';
                let linkTitle = '';

                if (linkType === 'linkedin') {
                    targetHref = document.querySelector('a[href*="linkedin.com/in/dedenhadiguna"]')?.href;
                    linkTitle = 'LinkedIn';
                } else if (linkType === 'github') {
                    targetHref = document.querySelector('a[href*="github.com/DedenHadiguna"]')?.href;
                    linkTitle = 'GitHub';
                } else if (linkType === 'email') {
                    targetHref = document.querySelector('a[href^="mailto:"]')?.href;
                    linkTitle = 'aplikasi email';
                } else if (linkType === 'whatsapp') {
                    // Ambil nomor telepon dari elemen kontak atau hardcode jika diperlukan
                    const contactPhoneElement = document.querySelector('.contact-card .contact-info');
                    if (contactPhoneElement) {
                        // Regex untuk mengambil hanya digit dan tanda +
                        const phoneNumberMatch = contactPhoneElement.textContent.match(/[\d+]+/g);
                        const phoneNumber = phoneNumberMatch ? phoneNumberMatch.join('').replace(/\s/g, '') : '';
                        if (phoneNumber) {
                            targetHref = `https://wa.me/${phoneNumber.replace('+', '')}`; // Hapus '+' jika ada
                            linkTitle = 'WhatsApp';
                        }
                    }
                }

                if (targetHref) {
                    window.open(targetHref, '_blank');
                    aiContext = { lastIntent: 'open_link', lastLink: linkType };
                    return `Baik, saya akan membuka ${linkTitle} Deden.`;
                } else {
                    return responseVariations.errorNotFound(`tautan ${linkTitle}`);
                }
            }
        }

        // 6. Perintah Download CV
        if (matchCommand(command, intents.downloadCV)) {
            const cvLink = document.querySelector('.cta-button.secondary[href*="CV-DedenHadiguna.pdf"]');
            if (cvLink) {
                cvLink.click();
                aiContext = { lastIntent: 'download_cv' };
                return 'Baik, CV Deden Hadiguna akan diunduh.';
            } else {
                return responseVariations.errorNotFound('tautan CV');
            }
        }

        // 7. Perintah Umum Lainnya
        if (matchCommand(command, intents.greet)) {
            aiContext = { lastIntent: 'greet' };
            return responseVariations.greet[Math.floor(Math.random() * responseVariations.greet.length)];
        } else if (matchCommand(command, intents.identity)) {
            aiContext = { lastIntent: 'identity' };
            return responseVariasi.identity[Math.floor(Math.random() * responseVariasi.identity.length)];
        } else if (matchCommand(command, intents.time)) {
            aiContext = { lastIntent: 'time' };
            const date = new Date();
            const hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return responseVariations.time(hours, minutes)[Math.floor(Math.random() * responseVariations.time(hours, minutes).length)];
        } else if (matchCommand(command, intents.thanks)) {
            aiContext = { lastIntent: 'thanks' };
            return responseVariations.thanks[Math.floor(Math.random() * responseVariations.thanks.length)];
        }

        // 8. Respons Kontekstual Sederhana (Jika tidak ada perintah yang jelas, periksa konteks)
        // Jika ada konteks sebelumnya, coba manfaatkan
        if (aiContext.lastIntent === 'describe_deden' || aiContext.lastIntent === 'help') {
            if (matchCommand(command, ['keahlian', 'skill', 'kemampuan'])) {
                navigateToSection('skills');
                aiContext = { lastIntent: 'navigate', lastSection: 'skills' };
                return 'Tentu, ini adalah keahlian Deden. Apakah ada keahlian tertentu yang ingin Anda ketahui lebih lanjut?';
            } else if (matchCommand(command, ['proyek', 'portfolio', 'pekerjaan'])) {
                navigateToSection('projects');
                aiContext = { lastIntent: 'navigate', lastSection: 'projects' };
                return 'Ini adalah daftar proyek Deden. Apakah ada proyek spesifik yang menarik perhatian Anda?';
            } else if (matchCommand(command, ['pendidikan', 'riwayat'])) {
                navigateToSection('education');
                aiContext = { lastIntent: 'navigate', lastSection: 'education' };
                return 'Berikut riwayat pendidikan Deden. Ada pertanyaan lain?';
            } else if (matchCommand(command, intents.contact)) {
                navigateToSection('contact');
                aiContext = { lastIntent: 'navigate', lastSection: 'contact' };
                return 'Tentu, ini adalah informasi kontak Deden.';
            } else if (matchCommand(command, intents.downloadCV)) {
                 const cvLink = document.querySelector('.cta-button.secondary[href*="CV-DedenHadiguna.pdf"]');
                 if (cvLink) {
                     cvLink.click();
                     aiContext = { lastIntent: 'download_cv' };
                     return 'Baik, CV Deden Hadiguna akan diunduh.';
                 } else {
                     return responseVariations.errorNotFound('tautan CV');
                 }
            }
        }

        // 9. Jika tidak ada yang cocok, berikan respons tidak dikenal + proactive help
        aiContext = { lastIntent: 'unrecognized' };
        playSound('unrecognized');
        const unrecognizedResponse = responseVariations.unrecognized[Math.floor(Math.random() * responseVariations.unrecognized.length)];
        const proactiveTip = responseVariations.proactiveHelp[Math.floor(Math.random() * responseVariations.proactiveHelp.length)];
        return `${unrecognizedResponse} ${proactiveTip}`;
    }

    // Fungsi untuk membuat AI berbicara
    function speakText(text, callback = null, voiceName = null, logWarning = true) {
        // Hentikan speech yang sedang berjalan sebelum memulai yang baru
        if (synth && synth.speaking) {
            synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        if (selectedVoiceForAI) {
            utterance.voice = selectedVoiceForAI;
        } else {
            const voices = synth.getVoices();
            // Prioritaskan suara Google Bahasa Indonesia jika ada
            let voiceToUse = voices.find(voice => voice.lang === 'id-ID' && voice.name.includes('Google')) ||
                             voices.find(voice => voice.lang.startsWith('id'));
            if (voiceToUse) {
                utterance.voice = voiceToUse;
                if (logWarning) {
                    console.log(`AI using fallback voice: ${voiceToUse.name} (${voiceToUse.lang})`);
                }
            } else {
                if (logWarning) {
                    console.warn("No suitable Indonesian voice found. AI will use default browser voice, which may sound robotic.");
                }
            }
        }


        utterance.onend = () => {
            speaking = false;
            if (callback) callback();
            console.log('Speech Synthesis: AI finished speaking (Utterance ended).');
        };
        utterance.onstart = () => {
            speaking = true;
            console.log('Speech Synthesis: AI started speaking (Utterance started).');
            initAIStatus('SPEAKING...', HIGHLIGHT_COLORS.purple);
        };
        utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance error:', event);
            speaking = false;
            if (callback) callback();
        };

        synth.speak(utterance);
    }


    // --- Smooth Scrolling & Nav Highlight ---
    function initNavAndScrollHighlight() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links .nav-link');
        const navbar = document.querySelector('.navbar');
        let navbarHeight = navbar ? navbar.offsetHeight : 80;

        const updateNavbarHeight = () => {
            if (navbar) navbarHeight = navbar.offsetHeight;
        };
        window.addEventListener('resize', updateNavbarHeight);
        updateNavbarHeight();

        const highlightNavLink = () => {
            let currentSectionId = '';
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                // Penyesuaian offset scrollspy
                const sectionTop = section.offsetTop - navbarHeight - 70; // Lebih besar offset agar active lebih awal
                if (window.scrollY >= sectionTop) {
                    currentSectionId = section.id;
                    break;
                }
            }

            navLinks.forEach(link => {
                link.classList.remove('active');
                link.style.color = HIGHLIGHT_COLORS.secondary; // Pastikan warna default
                link.style.textShadow = 'none'; // Pastikan text-shadow default
                if (link.getAttribute('href').substring(1) === currentSectionId) {
                    link.classList.add('active');
                    // Warna dan shadow diatur via CSS .nav-link.active
                }
            });
        };

        window.addEventListener('scroll', highlightNavLink);
        highlightNavLink();

        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - navbarHeight + 1,
                        behavior: 'smooth'
                    });
                    if (window.innerWidth <= 768) {
                        const navbarNav = document.getElementById('navbarNav');
                        const menuToggle = document.querySelector('.menu-toggle');
                        if (navbarNav && menuToggle && navbarNav.classList.contains('active')) {
                            navbarNav.classList.remove('active');
                            menuToggle.setAttribute('aria-expanded', 'false');
                        }
                    }
                }
            });
        });
    }

    // --- CTA Button Smooth Scroll ---
    function initCtaButtons() {
        const ctaButtons = document.querySelectorAll('.cta-button[data-scroll-to]');
        const navbar = document.querySelector('.navbar');
        let navbarHeight = navbar ? navbar.offsetHeight : 80;

        ctaButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.dataset.scrollTo;
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - navbarHeight + 1,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // --- Mobile Menu Toggle ---
    function initMobileMenuToggle() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navbarNav = document.getElementById('navbarNav');
        if (!menuToggle || !navbarNav) {
            console.warn("Mobile menu toggle or navbar nav element not found.");
            return;
        }
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            navbarNav.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', !isExpanded);
        });
    }


    // --- Content Animations (Intersection Observer) ---
    function initContentAnimations() {
        const skillCards = document.querySelectorAll('.skill-card');
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const skillBarDiv = entry.target.querySelector('.skill-level-bar div');
                    if (skillBarDiv) {
                        skillBarDiv.style.width = entry.target.dataset.hoverValue || '0%'; // Mengambil dari data-hover-value card itu sendiri
                        obs.unobserve(entry.target);
                    }
                }
            });
        }, options);

        skillCards.forEach(element => {
            observer.observe(element);
        });
    }

    // --- Decrypt Text Effect on Scroll ---
    function initDecryptTextOnScroll() {
        const decryptTexts = document.querySelectorAll('.decrypt-text:not(#typed-hero-title)');
        if (decryptTexts.length === 0) return;

        const decryptObserverOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px', // Trigger sedikit lebih awal
            threshold: 0.5
        };

        const decryptObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('decrypted')) {
                    const element = entry.target;

                    const originalText = element.dataset.text;
                    if (!originalText) {
                        console.warn("Decrypt text element missing data-text attribute:", element);
                        return;
                    }

                    // Hanya inisialisasi jika belum memiliki pseudo content
                    let pseudoContentSpan = element.querySelector('.decrypt-pseudo-content');
                    if (!pseudoContentSpan) {
                        pseudoContentSpan = document.createElement('span');
                        pseudoContentSpan.classList.add('decrypt-pseudo-content');
                        // Set initial text content for pseudo span for better visual during scrambling
                        pseudoContentSpan.textContent = getRandomScrambledText(originalText);
                        element.appendChild(pseudoContentSpan);
                    }

                    let charIndex = 0;
                    let scrambleIteration = 0;
                    const maxScrambleIterations = 3;
                    const decryptionSpeed = parseInt(element.dataset.decryptSpeed) || 35; // default 35ms

                    element.classList.add('scrambling');
                    element.textContent = ''; // Sembunyikan teks asli saat scrambling dimulai

                    const decryptInterval = setInterval(() => {
                        if (charIndex < originalText.length) {
                            if (scrambleIteration < maxScrambleIterations) {
                                const scrambledPart = getRandomScrambledText(originalText.substring(charIndex));
                                pseudoContentSpan.textContent = originalText.substring(0, charIndex) + scrambledPart;
                                scrambleIteration++;
                            } else {
                                charIndex++;
                                scrambleIteration = 0;
                                pseudoContentSpan.textContent = originalText.substring(0, charIndex) + getRandomScrambledText(originalText.substring(charIndex));
                            }
                        } else {
                            clearInterval(decryptInterval);
                            element.textContent = originalText; // Set teks asli setelah selesai
                            element.classList.remove('scrambling');
                            element.classList.add('decrypted');
                            // Opsional: Hapus pseudoContentSpan setelah decrypted jika tidak diperlukan lagi
                            if (pseudoContentSpan) {
                                pseudoContentSpan.remove();
                            }
                            observer.unobserve(element);
                        }
                    }, decryptionSpeed);
                }
            });
        }, decryptObserverOptions);

        decryptTexts.forEach(element => {
            if (!element.dataset.text) {
                element.dataset.text = element.textContent; // Simpan teks asli ke data-text
            }
            element.textContent = ''; // Kosongkan teks asli sebelum di-observe
            decryptObserver.observe(element);
        });
    }

    function getRandomChar(originalChar) {
        const chars = "!@#$%^&*()_+{}[]|:;<>?,./`~";
        if (/[a-zA-Z0-9]/.test(originalChar)) {
            return chars[Math.floor(Math.random() * chars.length)];
        }
        return originalChar; // Keep non-alphanumeric chars as is
    }

    function getRandomScrambledText(text) {
        let scrambled = '';
        for (let i = 0; i < text.length; i++) {
            scrambled += getRandomChar(text[i]);
        }
        return scrambled;
    }


    // --- Quantum Canvas Animation (Particles) ---
    let quantumCanvas = null;
    let quantumCtx = null;
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };
    let particlesAnimationFrameId;

    const PARTICLE_COUNT = 100;
    const PARTICLE_SIZE = 1.5;
    const PARTICLE_SPEED_MULTIPLIER = 0.05;

    function initQuantumCanvas() {
        quantumCanvas = document.getElementById('quantumCanvas');
        if (!quantumCanvas) {
            console.warn("Quantum canvas element not found.");
            return;
        }

        quantumCtx = quantumCanvas.getContext('2d');
        resizeQuantumCanvas();
        window.addEventListener('resize', resizeQuantumCanvas);

        quantumCanvas.addEventListener('mousemove', function(e) {
            const rect = quantumCanvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        quantumCanvas.addEventListener('mouseout', function() {
            mouse.x = null;
            mouse.y = null;
        });

        // Pastikan tidak ada duplikasi requestAnimationFrame
        if (particlesAnimationFrameId) {
            cancelAnimationFrame(particlesAnimationFrameId);
        }
        animateParticles();
    }

    function resizeQuantumCanvas() {
        if (quantumCanvas) {
            quantumCanvas.width = quantumCanvas.offsetWidth;
            quantumCanvas.height = quantumCanvas.offsetHeight;

            // Re-initialize particles to fit new canvas size
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle(
                    Math.random() * quantumCanvas.width,
                    Math.random() * quantumCanvas.height,
                    (Math.random() - 0.5) * PARTICLE_SPEED_MULTIPLIER,
                    (Math.random() - 0.5) * PARTICLE_SPEED_MULTIPLIER
                ));
            }
        }
    }

    class Particle {
        constructor(x, y, vx, vy) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.size = PARTICLE_SIZE;
            this.opacity = 0.7;
        }

        draw() {
            if (!quantumCtx) return;
            quantumCtx.fillStyle = `rgba(178, 0, 255, ${this.opacity})`;
            quantumCtx.beginPath();
            quantumCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            quantumCtx.closePath();
            quantumCtx.fill();
        }

        update() {
            // Boundary check and bounce
            if (this.x + this.size > quantumCanvas.width || this.x - this.size < 0) {
                this.vx *= -1;
            }
            if (this.y + this.size > quantumCanvas.height || this.y - this.size < 0) {
                this.vy *= -1;
            }

            this.x += this.vx;
            this.y += this.vy;

            // Mouse interaction
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let maxDistance = mouse.radius;
                    let force = (maxDistance - distance) / maxDistance;
                    let repulsionStrength = 0.5; // Kekuatan repulsi
                    let directionX = forceDirectionX * force * repulsionStrength;
                    let directionY = forceDirectionY * force * repulsionStrength;

                    this.x -= directionX;
                    this.y -= directionY;
                }
            }

            // Connect particles with lines
            for (let i = 0; i < particles.length; i++) {
                let otherParticle = particles[i];
                if (this !== otherParticle) {
                    let dx = this.x - otherParticle.x;
                    let dy = this.y - otherParticle.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) { // Jarak untuk menggambar garis
                        if (!quantumCtx) return;
                        quantumCtx.strokeStyle = `rgba(0, 223, 255, ${0.3 - (distance / 100) * 0.3})`;
                        quantumCtx.lineWidth = 0.5;
                        quantumCtx.beginPath();
                        quantumCtx.moveTo(this.x, this.y);
                        quantumCtx.lineTo(otherParticle.x, otherParticle.y);
                        quantumCtx.stroke();
                    }
                }
            }
        }
    }

    function animateParticles() {
        if (!quantumCtx || !quantumCanvas) return;
        quantumCtx.clearRect(0, 0, quantumCanvas.width, quantumCanvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        particlesAnimationFrameId = requestAnimationFrame(animateParticles);
    }


    // --- Project Filtering ---
    function initProjectFiltering() {
        const filterButtonsContainer = document.querySelector('.filter-buttons-container');
        const projectItems = document.querySelectorAll('.project-item');

        if (!filterButtonsContainer || projectItems.length === 0) {
            console.warn("Project filtering elements not found.");
            return;
        }

        filterButtonsContainer.addEventListener('click', function(event) {
            const clickedButton = event.target.closest('.filter-btn');
            if (!clickedButton || clickedButton.classList.contains('active')) return;

            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            clickedButton.classList.add('active');

            const filter = clickedButton.dataset.filter;

            projectItems.forEach(item => {
                const category = item.dataset.category;
                const isVisible = (filter === 'all' || category.includes(filter));

                if (isVisible) {
                    item.style.display = 'block';
                    // Re-trigger AOS animation for visible items
                    item.classList.remove('aos-animate');
                    void item.offsetWidth; // Trigger reflow
                    item.classList.add('aos-animate');
                } else {
                    item.style.display = 'none';
                    item.classList.remove('aos-animate'); // Hapus animasi saat disembunyikan
                }
            });
        });

        // Trigger initial filter on 'all'
        const initialFilterButton = document.querySelector('.filter-btn[data-filter="all"]');
        if (initialFilterButton) {
            initialFilterButton.click();
        }
    }

    // --- Skill Info Overlay ---
    function initSkillInfoOverlay() {
        const skillCardsContainer = document.querySelector('.skills-grid-wrapper');
        const skillCards = document.querySelectorAll('.skill-card');
        const skillOverlayValue = document.getElementById('skill-overlay-value');
        const skillOverlayDesc = document.getElementById('skill-overlay-desc');

        if (!skillCardsContainer || skillCards.length === 0 || !skillOverlayValue || !skillOverlayDesc) {
            console.warn("Skill info overlay elements not fully found.");
            return;
        }

        const defaultOverlayValue = '--';
        const defaultOverlayDesc = 'Hover over a skill module for detailed analysis.';

        const resetSkillOverlay = () => {
            skillOverlayValue.textContent = defaultOverlayValue;
            skillOverlayDesc.textContent = defaultOverlayDesc;
            skillOverlayValue.style.color = HIGHLIGHT_COLORS.green;
            skillOverlayDesc.style.color = HIGHLIGHT_COLORS.purple;
        };

        skillCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const value = card.dataset.hoverValue || 'N/A';
                const desc = card.dataset.hoverDesc || 'No description available.';
                skillOverlayValue.textContent = value;
                skillOverlayDesc.textContent = desc;
                skillOverlayValue.style.color = HIGHLIGHT_COLORS.blue;
                skillOverlayDesc.style.color = HIGHLIGHT_COLORS.main;
            });
            card.addEventListener('focusin', () => {
                const value = card.dataset.hoverValue || 'N/A';
                const desc = card.dataset.hoverDesc || 'No description available.';
                skillOverlayValue.textContent = value;
                skillOverlayDesc.textContent = desc;
                skillOverlayValue.style.color = HIGHLIGHT_COLORS.blue;
                skillOverlayDesc.style.color = HIGHLIGHT_COLORS.main;
            });
        });

        skillCardsContainer.addEventListener('mouseleave', resetSkillOverlay);

        document.addEventListener('focusout', (event) => {
            if (!skillCardsContainer.contains(event.relatedTarget)) {
                resetSkillOverlay();
            }
        });

        resetSkillOverlay();
    }

    // --- Generic Image Modal (for Projects, Photos, Certificates) ---
    function initImageModal() {
        const modal = document.getElementById("image-modal");
        const modalContent = modal ? modal.querySelector(".modal-content") : null;
        const modalImg = modal ? document.getElementById("modal-image-display") : null;
        const captionText = modal ? document.getElementById("modal-caption") : null;
        const closeBtn = modal ? modal.querySelector(".close-button") : null;

        // Gunakan event delegation untuk modal triggers
        document.body.addEventListener('click', function(event) {
            const trigger = event.target.closest('.modal-trigger');
            if (!trigger) return;

            const parentCard = trigger.closest('.project-card, .photo-item, .certificate-item');
            if (!parentCard) {
                console.error("Modal trigger clicked but no parent card found. Ensure modal-trigger is inside a card.");
                return;
            }

            const imgSrc = parentCard.dataset.modalImage || trigger.src; // Ambil dari data-modal-image atau langsung dari src img
            let title = '';

            if (parentCard.classList.contains('project-card')) {
                title = parentCard.querySelector('.project-title')?.textContent || 'Project Image';
            } else if (parentCard.classList.contains('photo-item')) {
                title = parentCard.querySelector('.photo-overlay')?.textContent || 'Personal Photo';
            } else if (parentCard.classList.contains('certificate-item')) {
                title = parentCard.querySelector('.cert-title')?.textContent || 'Certificate';
            }

            if (!imgSrc) {
                console.error("No image source found for modal:", parentCard);
                return;
            }

            // Reset modal content
            modalImg.src = '';
            modalImg.alt = title;
            modalImg.style.display = 'none';

            const existingLoadError = modalContent.querySelector('.modal-loading-text');
            if (existingLoadError) {
                existingLoadError.remove();
            }

            // Create and append loading text
            const loadingTextDiv = document.createElement('div');
            loadingTextDiv.classList.add('modal-loading-text');
            loadingTextDiv.textContent = 'LOADING IMAGE...';
            modalContent.appendChild(loadingTextDiv);

            modalContent.style.backgroundColor = '#333';
            captionText.innerHTML = `Loading: <span style="color: ${HIGHLIGHT_COLORS.green};">${title}</span>`;
            modal.style.display = "flex";
            modal.focus(); // Set focus to modal for accessibility

            modalImg.src = imgSrc;

            modalImg.onload = () => {
                const currentLoadingText = modalContent.querySelector('.modal-loading-text');
                if (currentLoadingText) {
                    currentLoadingText.remove();
                }
                modalImg.style.display = 'block';
                modalContent.style.backgroundColor = ''; // Reset background
                captionText.innerHTML = title;
                console.log('Image loaded successfully:', imgSrc);
            };

            modalImg.onerror = () => {
                console.error('Failed to load image:', imgSrc);
                const currentLoadingText = modalContent.querySelector('.modal-loading-text');
                if (currentLoadingText) {
                    currentLoadingText.remove();
                }
                const errorTextDiv = document.createElement('div');
                errorTextDiv.classList.add('modal-loading-text');
                errorTextDiv.style.color = GLITCH_RED;
                errorTextDiv.textContent = 'ERROR: IMAGE NOT FOUND. Please check file path.';
                modalContent.appendChild(errorTextDiv);
                modalContent.style.backgroundColor = '#600';
                modalImg.style.display = 'none';
                captionText.innerHTML = `Error loading: <span style="color: ${GLITCH_RED};">${title} (Periksa path file)</span>`;
            };
        });

        // Close modal logic
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.style.display = "none";
                modalImg.src = '';
                modalImg.alt = '';
                const currentLoadingText = modalContent.querySelector('.modal-loading-text');
                if (currentLoadingText) currentLoadingText.remove();
            });
        }

        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
                modalImg.src = '';
                modalImg.alt = '';
                const currentLoadingText = modalContent.querySelector('.modal-loading-text');
                if (currentLoadingText) currentLoadingText.remove();
            }
        });

        window.addEventListener('keydown', function(event) {
            if (event.key === "Escape" && modal.style.display === "flex") {
                modal.style.display = "none";
                modalImg.src = '';
                modalImg.alt = '';
                const currentLoadingText = modalContent.querySelector('.modal-loading-text');
                if (currentLoadingText) currentLoadingText.remove();
            }
        });
    }


    // --- Dynamic "Current Year" in Footer ---
    function initCurrentYear() {
        const currentYearSpan = document.getElementById('current-year-placeholder');
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        } else {
            console.warn("Current year placeholder element not found.");
        }
    }

    // --- Back to Top Button ---
    function initBackToTopButton() {
        const backToTopButton = document.getElementById('back-to-top');
        if (!backToTopButton) {
            console.warn("Back to top button element not found.");
            return;
        }

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Easter Egg / Secret Feature (Konami Code) ---
    function initKonamiCode() {
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiCodePosition = 0;

        document.addEventListener('keydown', function(e) {
            if (e.key.toLowerCase() === konamiCode[konamiCodePosition]) { // Case-insensitive for 'b' and 'a'
                konamiCodePosition++;
                if (konamiCodePosition === konamiCode.length) {
                    activateSecretFeature();
                    konamiCodePosition = 0; // Reset for next activation
                }
            } else {
                konamiCodePosition = 0; // Reset if sequence is broken
            }
        });

        function activateSecretFeature() {
            console.log("Konami Code Activated! Overclock Mode.");
            alert("ACCESS GRANTED: Overclock Mode Activated! Brace for impact.");

            const body = document.body;
            body.classList.add('overclock-mode');

            // Remove overclock mode after a short period
            setTimeout(() => {
                body.classList.remove('overclock-mode');
            }, 4000); // 4 seconds
        }
    }

    // --- Typed.js Integration ---
    function initTypedJS() {
        const typedElement = document.getElementById('typed-hero-title');
        if (!typedElement) {
            console.warn("Typed.js target element #typed-hero-title not found.");
            return;
        }

        const parentH1 = typedElement.closest('h1.decrypt-text');
        const typedText = parentH1 ? parentH1.dataset.text : '';

        if (!typedText) {
            console.warn("Typed.js: No data-text found on parent h1. Decrypt text effect might not work as expected.");
            if (parentH1) parentH1.textContent = "Deden Hadiguna"; // Fallback text
            return;
        }

        new Typed('#typed-hero-title', {
            strings: [typedText],
            typeSpeed: 60,
            backSpeed: 30,
            loop: false,
            showCursor: true,
            onComplete: (self) => {
                if (parentH1) {
                    // Pastikan teks asli ditampilkan dan kelas scrambling dihapus
                    parentH1.classList.remove('scrambling');
                    parentH1.classList.add('decrypted');
                    parentH1.textContent = typedText;
                }
                // Optional: remove cursor after typing complete
                const typedCursor = document.querySelector('.typed-cursor');
                if(typedCursor) typedCursor.style.animation = 'none'; // Stop blinking
            }
        });
    }

})(); // End of IIFE