/**
 * Lógica de Navegação de Telas (Simulação SPA)
 * Este script controla qual seção do site deve ser exibida.
 */

function navigateTo(pageId, updateHash = true) {
    // 1. Seleciona todas as seções com a classe 'page'
    const pages = document.querySelectorAll('.page');

    // 2. Remove a classe 'active' de todas as páginas para escondê-las
    pages.forEach(page => {
        page.classList.remove('active');
    });

    // 3. Adiciona a classe 'active' apenas à página desejada
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Melhora UX: Reseta o scroll para o topo ao mudar de página
        window.scrollTo(0, 0);

        // Atualiza a URL sem recarregar a página para permitir navegação pelo histórico
        if (updateHash) {
            window.location.hash = pageId;
        }
    } else {
        console.error(`Erro: Página com ID ${pageId} não encontrada.`);
    }
}

// Inicialização dos eventos após o carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Gerenciar navegação inicial baseada na URL (Hash)
    const initialPage = window.location.hash.replace('#', '') || 'login-page';
    navigateTo(initialPage, false);

    // 2. Escutar mudanças no histórico do navegador (botão voltar/avançar)
    window.addEventListener('hashchange', () => {
        const pageId = window.location.hash.replace('#', '');
        if (pageId) navigateTo(pageId, false);
    });

    // Navegação Genérica via Atributo data-link
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-link]');
        if (target) {
            e.preventDefault();
            const pageId = target.getAttribute('data-link');
            navigateTo(pageId);
        }
    });

    // Simulação de Login (Entrar na Home)
    const authForms = ['loginForm', 'signupForm'];
    authForms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                navigateTo('home-page');
            });
        }
    });

    // --- LÓGICA DO PLAYER DE MÚSICA ---
    let currentSongPath = ""; // Variável para rastrear o caminho exato da música

    const audio = document.getElementById('main-audio');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const progressBar = document.getElementById('progress-bar');
    const volumeSlider = document.getElementById('volume-slider');
    const currentTimeEl = document.getElementById('current-time');
    const durationTimeEl = document.getElementById('duration-time');
    
    const playerTitle = document.getElementById('player-title');
    const playerArtist = document.getElementById('player-artist');
    const playerCover = document.getElementById('player-cover');

    function togglePlay() {
        if (audio.paused) {
            audio.play();
            playPauseBtn.innerHTML = '<i class="fi fi-rs-pause"></i>';
            playPauseBtn.style.transform = "scale(1.1)";
        } else {
            audio.pause();
            playPauseBtn.innerHTML = '<i class="fi fi-rs-play"></i>';
            playPauseBtn.style.transform = "scale(1)";
        }
    }

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    function loadAndPlay(card) {
        if (!card) return;
        currentSongPath = card.dataset.src;
        audio.src = currentSongPath;
        playerTitle.innerText = card.dataset.title;
        playerArtist.innerText = card.dataset.artist;
        playerCover.src = card.dataset.cover;
        
        audio.play();
        playPauseBtn.innerHTML = '<i class="fi fi-rs-pause"></i>';
        playPauseBtn.style.transform = "scale(1.1)";
    }

    // Carregar música ao clicar nos cards
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.featured-card, .hit-card');
        if (card && card.dataset.src) {
            loadAndPlay(card);
        }
    });

    playPauseBtn.addEventListener('click', togglePlay);

    // Lógica para próxima música
    nextBtn.addEventListener('click', () => {
        const allSongs = Array.from(document.querySelectorAll('.featured-card, .hit-card'));
        if (allSongs.length === 0) return;

        // Encontra o índice da música que está tocando agora
        // Usamos decodeURI para evitar problemas com espaços ou caracteres especiais na URL
        let currentIndex = allSongs.findIndex(card => card.dataset.src === currentSongPath);
        
        // Se nenhuma música estiver tocando, começa da primeira
        if (currentIndex === -1) currentIndex = -1; 
        
        // Vai para a próxima ou volta para a primeira se for a última
        let nextIndex = (currentIndex + 1) % allSongs.length;
        loadAndPlay(allSongs[nextIndex]);
    });

    // Lógica para música anterior
    prevBtn.addEventListener('click', () => {
        const allSongs = Array.from(document.querySelectorAll('.featured-card, .hit-card'));
        if (allSongs.length === 0) return;

        let currentIndex = allSongs.findIndex(card => card.dataset.src === currentSongPath);
        
        // Se nada estiver tocando e clicar em anterior, começa da última
        if (currentIndex === -1) currentIndex = 0;
        
        // Se for a primeira música, volta para a última. Se não, subtrai 1.
        let prevIndex = (currentIndex - 1 + allSongs.length) % allSongs.length;
        loadAndPlay(allSongs[prevIndex]);
    });


    // Atualizar barra de progresso
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressBar.value = progress;
            currentTimeEl.innerText = formatTime(audio.currentTime);
            durationTimeEl.innerText = formatTime(audio.duration);
        }
    });

    // Seek (pular para parte da música)
    progressBar.addEventListener('input', () => {
        const time = (progressBar.value / 100) * audio.duration;
        audio.currentTime = time;
    });

    // Controle de Volume
    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value;
    });

    // Quando a música acabar
    audio.addEventListener('ended', () => {
        playPauseBtn.innerHTML = '<i class="fi fi-rs-play"></i>';
        playPauseBtn.style.transform = "scale(1)";
        progressBar.value = 0;
    });
});
