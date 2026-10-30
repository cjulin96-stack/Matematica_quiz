const supabaseUrl = 'https://yrylpxrqflhuwmgvfyat.supabase.co';
const supabaseKey = 'sb_publishable_ytcMgi4QgIkfQPlT_7a5fQ_PyuODEwD';
const banco = supabase.createClient(supabaseUrl, supabaseKey);

let jogador = { id: null, email: '', nome: 'Jogador', xp: 0, pontos: 0, streak: 0, moedas: 0, avatar: '🧑‍🚀', moldura: 'frame-padrao', conquistas: [], stats: {}, missoes: {acertos: 0, jogos: 0, desafios: 0, pontos_dia: 0, last_chest: 0}, multiplicador_expira: null, nivel: 1, totalAcertos: 0, totalErros: 0, melhorSequencia: 0 };
let estado = { modo: 'classico', pontos: 0, acertos: 0, erros: 0, sequencia: 0, melhorSequencia: 0, questaoAtual: 0, respondidas: false };
let isDuelo = false, dueloAtual = null, filaPerguntas = [], perguntaAtual = null, timerInterval = null, tempoRestante = 0, usarMultiplicador = false, somAtivado = true, animacoesAtivadas = true;

function getNivel(xpTotal) {
    let nivel = 1, xpNecessario = 100, xpAcumulado = 0;
    while (xpTotal >= xpAcumulado + xpNecessario) { xpAcumulado += xpNecessario; nivel++; xpNecessario = nivel * 100; }
    return { nivel: nivel, xpAtual: xpTotal - xpAcumulado, xpProximo: xpNecessario };
}
function getNomeNivel(nivel) {
    if (nivel >= 100) return "Divindade Matemática"; if (nivel >= 75) return "Lenda"; if (nivel >= 50) return "Gênio"; if (nivel >= 40) return "Mestre";
    if (nivel >= 30) return "Especialista"; if (nivel >= 20) return "Estrategista"; if (nivel >= 10) return "Calculista"; if (nivel >= 5) return "Aprendiz";
    return "Novato";
}

const AVATARES_GRATIS = ['🧑‍🚀', '🐯', '🐺', '🦊', '🐼', '🦁', '🦄', '🐲', '🤖', '👽', '👾', '🧙‍♂️', '🧛‍♂️', '🧜‍♀️', '🧚', '🦸‍♂️', '🦹‍♂️', '🥷', '👮‍♂️', '🕵️‍♂️'];

const CONQUISTAS_DB = [
    { id: 'c1', icone: '👣', titulo: 'Primeiro Passo', desc: 'Jogou a primeira partida.', meta: 1, tipo: 'jogos' }, { id: 'c2', icone: '🧐', titulo: 'Mente Curiosa', desc: 'Respondeu 10 questões.', meta: 10, tipo: 'acertos' },
    { id: 'c3', icone: '🌱', titulo: 'Iniciante', desc: 'Respondeu 50 questões.', meta: 50, tipo: 'acertos' }, { id: 'c4', icone: '📚', titulo: 'Aprendiz', desc: 'Respondeu 100 questões.', meta: 100, tipo: 'acertos' },
    { id: 'c5', icone: '🎓', titulo: 'Dedicado', desc: 'Respondeu 500 questões.', meta: 500, tipo: 'acertos' }, { id: 'c6', icone: '🏛️', titulo: 'Veterano', desc: 'Respondeu 1000 questões.', meta: 1000, tipo: 'acertos' },
    { id: 'c7', icone: '🎯', titulo: 'Atirador de Elite', desc: 'Acertou 10 seguidas.', meta: 10, tipo: 'sequencia' }, { id: 'c8', icone: '🔪', titulo: 'Precisão Absoluta', desc: 'Acertou 25 seguidas.', meta: 25, tipo: 'sequencia' },
    { id: 'c9', icone: '🧠', titulo: 'Mente Brilhante', desc: 'Atingiu 80+ pontos.', meta: 80, tipo: 'pontos_partida' }, { id: 'c10', icone: '💎', titulo: 'Perfeição', desc: '10 questões sem errar.', meta: 10, tipo: 'perfeicao' },
    { id: 'c11', icone: '🧮', titulo: 'Calculadora Humana', desc: '95% de aproveitamento.', meta: 95, tipo: 'taxa' }, { id: 'c12', icone: '🔥', titulo: 'Chama Inicial', desc: '3 dias consecutivos.', meta: 3, tipo: 'streak' },
    { id: 'c13', icone: '☄️', titulo: 'Uma Semana de Fogo', desc: '7 dias consecutivos.', meta: 7, tipo: 'streak' }, { id: 'c14', icone: '🌋', titulo: 'Duas Semanas', desc: '14 dias consecutivos.', meta: 14, tipo: 'streak' },
    { id: 'c15', icone: '🛡️', titulo: 'Disciplina de Ferro', desc: '30 dias consecutivos.', meta: 30, tipo: 'streak' }, { id: 'c16', icone: '🚀', titulo: 'Imparável', desc: '60 dias consecutivos.', meta: 60, tipo: 'streak' },
    { id: 'c17', icone: '💯', titulo: 'Centenário', desc: '100 dias consecutivos.', meta: 100, tipo: 'streak' }, { id: 'c18', icone: '👑', titulo: 'Lenda', desc: '365 dias consecutivos.', meta: 365, tipo: 'streak' },
    { id: 'c19', icone: '⚡', titulo: 'Modo Turbo', desc: 'Completou desafio de tempo.', meta: 1, tipo: 'desafio' }, { id: 'c20', icone: '⏱️', titulo: 'Reflexos Matemáticos', desc: 'Jogou Desafio Hardcore.', meta: 1, tipo: 'hardcore' },
    { id: 'c21', icone: '⭐', titulo: 'Subindo na Vida', desc: 'Alcançou Nível 5.', meta: 5, tipo: 'nivel' }, { id: 'c22', icone: '🌟', titulo: 'Especialista', desc: 'Alcançou Nível 10.', meta: 10, tipo: 'nivel' },
    { id: 'c23', icone: '🌠', titulo: 'Gênio', desc: 'Alcançou Nível 20.', meta: 20, tipo: 'nivel' }, { id: 'c24', icone: '🌌', titulo: 'Divindade Matemática', desc: 'Alcançou Nível 50.', meta: 50, tipo: 'nivel' },
    { id: 'c25', icone: '🗺️', titulo: 'Explorador', desc: 'Jogou 5 matérias.', meta: 5, tipo: 'materias' }
];

const LOJA_DB = [ 
    { id: 'mult', icone: '🚀', nome: 'Multiplicador 2X', desc: 'Dobra pontos 24h', preco: 500, tipo: 'power' }, { id: 'mult3', icone: '🔥', nome: 'Multiplicador 3X', desc: 'Triplica pontos 24h', preco: 1200, tipo: 'power3' },
    { id: 'frame-ouro', icone: '👑', nome: 'Moldura Ouro', desc: 'Brilho VIP', preco: 800, tipo: 'frame' }, { id: 'frame-fogo', icone: '🔥', nome: 'Moldura Fogo', desc: 'Chamas ardentes', preco: 1500, tipo: 'frame' },
    { id: 'frame-gelo', icone: '❄️', nome: 'Moldura Gelo', desc: 'Congelante', preco: 1500, tipo: 'frame' }, { id: 'frame-neon', icone: '🔮', nome: 'Moldura Neon', desc: 'Energia roxa', preco: 2000, tipo: 'frame' },
    { id: 'av_mestre', icone: '🧙‍♂️', nome: 'Mestre', desc: 'Avatar VIP', preco: 500, tipo: 'avatar' }, { id: 'av_robo', icone: '🤖', nome: 'Calculadora', desc: 'Avatar VIP', preco: 1000, tipo: 'avatar' },
    { id: 'av_ninja', icone: '🥷', nome: 'Ninja', desc: 'Avatar VIP', preco: 2500, tipo: 'avatar' }, { id: 'av_dragao', icone: '🐉', nome: 'Dragão', desc: 'Avatar VIP', preco: 5000, tipo: 'avatar' }
];

const DESAFIOS_DB = [ 
    { id: 1, nome: 'Desafio 1', serie: '5', tempo: 120, desc: '5º Ano • 2 Minutos' }, { id: 2, nome: 'Desafio 2', serie: '6', tempo: 90, desc: '6º Ano • 1m 30s' },
    { id: 3, nome: 'Desafio 3', serie: '7', tempo: 60, desc: '7º Ano • 1 Minuto' }, { id: 4, nome: 'Desafio 4', serie: '8', tempo: 45, desc: '8º Ano • 45 Segundos' },
    { id: 5, nome: 'Desafio 5', serie: '9', tempo: 30, desc: '9º Ano • 30 Segundos' } 
];

const ACADEMIA_DB = [
    { titulo: 'Trilha 1: Frações', conteudo: 'Uma fração representa uma parte de um todo. Ex: 1/2 (metade). Para somar frações com o mesmo denominador, some apenas os numeradores: 1/4 + 2/4 = 3/4.' },
    { titulo: 'Trilha 2: Equações 1º Grau', conteudo: 'O objetivo é isolar a letra. Ex: 2x + 5 = 15. Passe o 5 subtraindo: 2x = 10. Divida por 2: x = 5.' },
    { titulo: 'Trilha 3: Teorema de Pitágoras', conteudo: 'Usado em triângulos retângulos. A fórmula é a² = b² + c². O "a" é a hipotenusa.' },
    { titulo: 'Trilha 4: Porcentagem', conteudo: 'Porcentagem é uma fração com denominador 100. Ex: 20% de 150 = 20/100 x 150 = 30.' },
    { titulo: 'Trilha 5: Geometria', conteudo: 'Área do quadrado = lado x lado. Área do retângulo = base x altura.' }
];

function mostrarToast(mensagem, tipo = 'primary') {
    const container = document.getElementById('toast-container'); const toast = document.createElement('div');
    toast.className = `toast ${tipo}`; let icone = 'ℹ️';
    if(tipo === 'success') icone = '✅'; if(tipo === 'error') icone = '❌'; if(tipo === 'gold') icone = '🪙';
    toast.innerHTML = `<span style="font-size: 20px;">${icone}</span> <span>${mensagem}</span>`;
    container.appendChild(toast); setTimeout(() => { toast.remove(); }, 3300);
}

function mostrarModalConquista(titulo, icone, raridade = "Comum") {
    const modal = document.getElementById('modal-conquista');
    document.getElementById('modal-icone').innerText = icone; document.getElementById('modal-titulo').innerText = titulo;
    const raridadeTxt = document.getElementById('modal-raridade'); raridadeTxt.innerText = raridade;
    if(raridade === "Lendária") { raridadeTxt.style.color = "#ffd700"; } else if(raridade === "Épica") { raridadeTxt.style.color = "#a855f7"; } else { raridadeTxt.style.color = "#ffffff"; }
    modal.classList.add('active'); setTimeout(() => { modal.classList.remove('active'); }, 3000);
}

function toggleSom() { somAtivado = !somAtivado; document.getElementById('toggle-som').classList.toggle('on', somAtivado); mostrarToast(`Som ${somAtivado ? 'Ativado' : 'Desativado'}`, 'primary'); }
function toggleAnimacoes() { animacoesAtivadas = !animacoesAtivadas; document.getElementById('toggle-animacoes').classList.toggle('on', animacoesAtivadas); mostrarToast(`Animações ${animacoesAtivadas ? 'Ativadas' : 'Desativadas'}`, 'primary'); }

async function fazerCadastro() {
    const email = document.getElementById('auth-email').value.trim(); const senha = document.getElementById('auth-password').value;
    if (!email || !senha) { mostrarToast("Preencha e-mail e senha.", "error"); return; }
    const { error } = await banco.auth.signUp({ email, password: senha });
    if (error) { mostrarToast(error.message, "error"); } else { mostrarToast("Conta criada! Faça login.", "success"); }
}

async function fazerLogin() {
    const email = document.getElementById('auth-email').value.trim(); const senha = document.getElementById('auth-password').value;
    if (!email || !senha) { mostrarToast("Preencha e-mail e senha.", "error"); return; }
    const { data, error } = await banco.auth.signInWithPassword({ email, password: senha });
    if (error) { mostrarToast(error.message, "error"); } else { jogador.id = data.user.id; jogador.email = data.user.email; await carregarPerfil(); mostrarApp(); }
}

async function sair() { await banco.auth.signOut(); localStorage.removeItem('mathArenaNome'); location.reload(); }
function mostrarApp() { document.getElementById('bottom-nav').style.display = 'flex'; mudarAba('tela-home'); }

async function carregarPerfil() {
    if (!jogador.id) return;
    const { data, error } = await banco.from('ranking').select('*').eq('user_id', jogador.id).maybeSingle();
    if (error) return;
    if (data) {
        jogador.nome = data.nome || 'Jogador'; jogador.xp = data.xp || 0; jogador.pontos = data.pontuacao || 0; jogador.streak = data.streak || 0; jogador.moedas = data.moedas || 0; 
        jogador.avatar = data.avatar || '🧑‍🚀'; jogador.moldura = data.moldura || 'frame-padrao'; jogador.conquistas = data.conquistas || []; jogador.stats = data.stats_materias || {};
        let missoesDB = data.missoes || { acertos: 0, jogos: 0, desafios: 0, pontos_dia: 0, last_chest: 0 };
        jogador.missoes = missoesDB; jogador.multiplicador_expira = data.multiplicador_expira; jogador.nivel = getNivel(jogador.xp).nivel;
        jogador.totalAcertos = data.acertos || 0; jogador.totalErros = data.erros || 0; jogador.melhorSequencia = data.melhor_sequencia || 0;
    } else {
        await banco.from('ranking').insert([{ user_id: jogador.id, nome: jogador.nome, pontuacao: 0, xp: 0, avatar: '🧑‍🚀', moldura: 'frame-padrao', moedas: 0, streak: 0, conquistas: [], stats_materias: {}, missoes: {acertos: 0, jogos: 0, desafios: 0, pontos_dia: 0, last_chest: 0}, acertos: 0, erros: 0, melhor_sequencia: 0 }]);
    }
}

function aplicarMolduras() {
    document.getElementById('home-frame').className = `frame ${jogador.moldura}`; document.getElementById('home-avatar').innerText = jogador.avatar;
    document.getElementById('perfil-frame').className = `frame ${jogador.moldura}`; document.getElementById('perfil-avatar').innerText = jogador.avatar;
    document.getElementById('profile-xp-display').innerText = jogador.xp || 0; document.getElementById('perfil-nivel-txt').innerText = `NÍVEL ${jogador.nivel} - ${getNomeNivel(jogador.nivel)}`;
    const container = document.getElementById('avatar-selector'); if(!container) return; container.innerHTML = '';
    AVATARES_GRATIS.forEach(av => { const btn = document.createElement('button'); btn.className = `avatar-option ${jogador.avatar === av ? 'selected' : ''}`; btn.innerText = av; btn.onclick = () => selecionarAvatar(av); container.appendChild(btn); });
}

async function selecionarAvatar(emoji) { jogador.avatar = emoji; await banco.from('ranking').update({ avatar: jogador.avatar }).eq('user_id', jogador.id); aplicarMolduras(); }

async function atualizarDashboard() {
    if (!jogador.id) return; await carregarPerfil();
    document.getElementById('home-nome').innerText = jogador.nome; document.getElementById('home-nivel').innerText = `NÍVEL ${jogador.nivel} - ${getNomeNivel(jogador.nivel)}`;
    document.getElementById('home-streak').innerText = jogador.streak || 0; document.getElementById('home-moedas').innerText = jogador.moedas || 0;
    let div = "🥉 BRONZE", cor = "#cd7f32"; if (jogador.nivel >= 10) { div = "🥈 PRATA"; cor = "#c0c0c0"; } if (jogador.nivel >= 20) { div = "🥇 OURO"; cor = "#ffd700"; } if (jogador.nivel >= 30) { div = "💎 PLATINA"; cor = "#00f2fe"; } if (jogador.nivel >= 40) { div = "💠 DIAMANTE"; cor = "#a855f7"; } if (jogador.nivel >= 50) { div = "🔮 MESTRE"; cor = "#ff1744"; } if (jogador.nivel >= 75) { div = "👑 LENDÁRIO"; cor = "#ffd700"; }
    const elDivisao = document.getElementById('home-divisao'); if (elDivisao) { elDivisao.innerText = div; elDivisao.style.color = cor; }
    aplicarMolduras(); const infoNivel = getNivel(jogador.xp);
    document.getElementById('home-xp-txt').innerText = `${infoNivel.xpAtual} / ${infoNivel.xpProximo} XP`; document.getElementById('home-xp-bar').style.width = `${(infoNivel.xpAtual / infoNivel.xpProximo) * 100}%`;
    if (jogador.multiplicador_expira) { let expira = new Date(jogador.multiplicador_expira.split('|').pop()); if (expira > new Date()) { document.getElementById('box-multiplier').classList.remove('hidden'); } else { document.getElementById('box-multiplier').classList.add('hidden'); usarMultiplicador = false; } } else { document.getElementById('box-multiplier').classList.add('hidden'); usarMultiplicador = false; }
    checarBauDiario();
}

function mudarAba(idTela, element) {
    if (idTela === 'tela-jogo') return; document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById(idTela).classList.add('active');
    if (element) { document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); element.classList.add('active'); }
    if (idTela === 'tela-home') atualizarDashboard(); if (idTela === 'tela-academia') renderizarAcademia(); if (idTela === 'tela-ranking') carregarRanking('geral', document.querySelector('.rank-tab'));
    if (idTela === 'tela-conquistas') renderizarConquistas(); if (idTela === 'tela-temporada') renderizarTemporada(); if (idTela === 'tela-estatisticas') renderizarEstatisticas();
    if (idTela === 'tela-perfil') { carregarPerfil().then(() => { document.getElementById('perfil-nome-input').value = jogador.nome; aplicarMolduras(); renderizarCalendario(); renderizarHistorico(); }); }
    if (idTela === 'tela-missoes') renderizarMissoes(); if (idTela === 'tela-loja') renderizarLoja();
  let timerSalvar;
function salvarNomeDelay() { clearTimeout(timerSalvar); timerSalvar = setTimeout(salvarNome, 1000); }
async function salvarNome() { 
    const novoNome = document.getElementById('perfil-nome-input').value.trim();
    if(novoNome === "") return; jogador.nome = novoNome; localStorage.setItem('mathArenaNome', jogador.nome);
    document.getElementById('home-nome').innerText = jogador.nome;
    if (jogador.id) { await banco.from('ranking').update({ nome: jogador.nome }).eq('user_id', jogador.id); }
}

function toggleMultiplicador() { const toggle = document.getElementById('toggle-multiplier'); usarMultiplicador = !usarMultiplicador; if (usarMultiplicador) toggle.classList.add('on'); else toggle.classList.remove('on'); }
function mostrarNotificacoes() {
    let n = []; if(jogador.missoes.jogos === 0) n.push("Bem-vindo ao MATH ARENA!"); if(jogador.missoes.acertos < 10) n.push("Missão: Acerte 10 questões."); if(jogador.moedas >= 500) n.push("Você já pode comprar o Multiplicador!");
    if(n.length === 0) n.push("Você está em dia! Bora jogar?"); mostrarToast(n.join(" | "), "primary");
}

async function renderizarCalendario() {
    const container = document.getElementById('calendario-streak'); if(!container) return; container.innerHTML = '';
    ['D','S','T','Q','Q','S','S'].forEach(d => { container.innerHTML += `<div class="dia-semana">${d}</div>`; });
    const hoje = new Date(), mes = hoje.getMonth(), ano = hoje.getFullYear(), primeiroDia = new Date(ano, mes, 1).getDay(), diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const { data: partidas } = await banco.from('partidas').select('data').eq('user_id', jogador.id);
    const diasJogados = partidas ? partidas.map(p => new Date(p.data).getDate()) : [];
    for (let i = 0; i < primeiroDia; i++) { container.innerHTML += `<div></div>`; }
    for (let dia = 1; dia <= diasNoMes; dia++) {
        let c = 'dia-calendario'; if (diasJogados.includes(dia)) c += ' jogou'; if (dia === hoje.getDate()) c += ' hoje';
        container.innerHTML += `<div class="${c}">${dia}</div>`;
    }
}

async function renderizarHistorico() {
    const container = document.getElementById('lista-historico'); container.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 13px;">Carregando...</p>';
    try {
        const { data: partidas } = await banco.from('partidas').select('pontos, data').eq('user_id', jogador.id).order('data', { ascending: false }).limit(5);
        if (!partidas || partidas.length === 0) { container.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 13px;">Nenhuma partida jogada.</p>'; return; }
        container.innerHTML = '';
        partidas.forEach(p => { const d = new Date(p.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); container.innerHTML += `<div class="historico-item"><span>${d}</span> <span style="color: var(--primary); font-weight: 900;">${p.pontos} pts</span></div>`; });
    } catch(e) { container.innerHTML = '<p style="text-align: center; color: var(--danger);">Erro.</p>'; }
}

async function carregarRanking(tipo, element) {
    document.querySelectorAll('.rank-tab').forEach(t => t.classList.remove('active')); if (element) element.classList.add('active');
    const lista = document.getElementById('rank-list-container'); lista.innerHTML = '<p class="text-center" style="color:var(--text-muted); font-weight:bold;">Buscando...</p>';
    const { data } = await banco.from('ranking').select('*').order('xp', { ascending: false }).limit(10);
    if (!data || data.length === 0) { lista.innerHTML = '<p class="text-center" style="font-weight:bold; color:var(--text-muted);">Nenhum jogador.</p>'; return; }
    lista.innerHTML = '';
    let podium = '<div class="podium-container">';
    if (data.length >= 2) { const j2 = data[1]; podium += `<div class="podium-item podium-2"><div class="podium-avatar-wrapper"><div class="frame ${j2.moldura||'frame-padrao'}"></div><div class="podium-avatar">${j2.avatar||'🧑‍🚀'}</div></div><div class="podium-block"><div class="podium-name">${j2.nome.split(' ')[0]}</div><div class="podium-score">${j2.xp||0}</div></div></div>`; }
    const j1 = data[0]; podium += `<div class="podium-item podium-1"><div class="podium-crown">👑</div><div class="podium-avatar-wrapper"><div class="frame ${j1.moldura||'frame-padrao'}"></div><div class="podium-avatar">${j1.avatar||'🧑‍🚀'}</div></div><div class="podium-block"><div class="podium-name">${j1.nome.split(' ')[0]}</div><div class="podium-score">${j1.xp||0}</div></div></div>`;
    if (data.length >= 3) { const j3 = data[2]; podium += `<div class="podium-item podium-3"><div class="podium-avatar-wrapper"><div class="frame ${j3.moldura||'frame-padrao'}"></div><div class="podium-avatar">${j3.avatar||'🧑‍🚀'}</div></div><div class="podium-block"><div class="podium-name">${j3.nome.split(' ')[0]}</div><div class="podium-score">${j3.xp||0}</div></div></div>`; }
    podium += '</div>'; lista.innerHTML += podium;
    for(let i = 3; i < data.length; i++) {
        const user = data[i]; lista.innerHTML += `<div class="ranking-list-item"><div style="display:flex; gap: 10px; align-items:center;"><span style="font-size:16px; width:25px; color:var(--text-muted); font-weight:900;">${i + 1}º</span><div class="avatar-wrapper" style="width:45px; height:45px;"><div class="frame ${user.moldura||'frame-padrao'}"></div><div class="avatar-img" style="width:35px; height:35px; font-size:20px;">${user.avatar || '🧑‍🚀'}</div></div><div style="font-weight:800; font-size:14px;">${user.nome}</div></div><div style="font-weight:900; color:var(--primary);">${user.xp || 0} XP</div></div>`;
    }
}

function renderizarTemporada() {
    let divName = "BRONZE", divIcon = "🥉", cor = "#cd7f32";
    if (jogador.nivel >= 10) { divName = "PRATA"; divIcon = "🥈"; cor = "#c0c0c0"; } if (jogador.nivel >= 20) { divName = "OURO"; divIcon = "🥇"; cor = "#ffd700"; }
    if (jogador.nivel >= 30) { divName = "PLATINA"; divIcon = "💎"; cor = "#00f2fe"; } if (jogador.nivel >= 40) { divName = "DIAMANTE"; divIcon = "💠"; cor = "#a855f7"; }
    if (jogador.nivel >= 50) { divName = "MESTRE"; divIcon = "🔮"; cor = "#ff1744"; } if (jogador.nivel >= 75) { divName = "LENDÁRIO"; divIcon = "👑"; cor = "#ffd700"; }
    document.getElementById('season-icon').innerText = divIcon; document.getElementById('season-name').innerText = divName;
    document.getElementById('season-name').style.color = cor;
}

function renderizarAcademia() {
    const container = document.getElementById('lista-academia'); container.innerHTML = '';
    ACADEMIA_DB.forEach((aula, index) => {
        container.innerHTML += `<div class="trilha-card" style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 14px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05);"><div onclick="toggleAula(${index})" style="cursor:pointer; display:flex; justify-content:space-between;"><span style="font-weight: 800; font-size: 15px; color:var(--primary);">${aula.titulo}</span><span style="color: var(--primary); font-size: 18px;">▼</span></div><div class="aula-conteudo" id="aula-${index}" style="display:none; margin-top: 10px; font-size: 14px; color: #ddd;">${aula.conteudo}</div></div>`;
    });
}
function toggleAula(index) { const c = document.getElementById(`aula-${index}`); if(c.style.display === 'none') c.style.display = 'block'; else c.style.display = 'none'; }

function renderizarMissoes() {
    const container = document.getElementById('lista-missoes'); container.innerHTML = ''; const ms = jogador.missoes;
    const missoes = [ { nome: 'Jogar 1 Partida', prog: ms.jogos, meta: 1, recompensa: 50 }, { nome: 'Jogar 3 Partidas', prog: ms.jogos, meta: 3, recompensa: 100 }, { nome: 'Acerte 10 Questões', prog: ms.acertos, meta: 10, recompensa: 100 }, { nome: 'Ganhe 100 Pontos', prog: ms.pontos_dia, meta: 100, recompensa: 150 }, { nome: 'Jogue 1 Desafio', prog: ms.desafios, meta: 1, recompensa: 50 } ];
    missoes.forEach(m => { const pct = Math.min(100, (m.prog / m.meta) * 100); const isConcluida = pct >= 100; container.innerHTML += `<div class="mission-card"><div class="mission-header"><span>${m.nome}</span><span class="mission-reward">🪙 ${m.recompensa}</span></div><div class="mission-progress-bar"><div class="mission-progress-fill" style="width: ${pct}%; background: ${isConcluida ? 'var(--gold)' : 'var(--success)'}"></div></div><div style="font-size: 11px; color: var(--text-muted); margin-top: 5px; text-align: right;">${m.prog} / ${m.meta} ${isConcluida ? '✅' : ''}</div></div>`; });
}

function renderizarLoja() {
    document.getElementById('loja-moedas').innerText = jogador.moedas || 0; const container = document.getElementById('lista-loja'); container.innerHTML = '';
    let multAtivo = false; if(jogador.multiplicador_expira) { if(new Date(jogador.multiplicador_expira.split('|').pop()) > new Date()) multAtivo = true; }
    LOJA_DB.forEach(item => {
        let isEquipado = false; if(item.tipo === 'avatar' && jogador.avatar === item.icone) isEquipado = true; if(item.tipo === 'frame' && jogador.moldura === item.id) isEquipado = true; if(item.tipo.includes('power') && multAtivo) isEquipado = true;
        let podeComprar = jogador.moedas >= item.preco && !isEquipado, btnTexto = isEquipado ? 'EQUIPADO' : (!podeComprar ? 'FALTA 🪙' : 'COMPRAR');
        let iconVisual = item.tipo === 'frame' ? `<div class="frame ${item.id}" style="position:relative; width:40px; height:40px; display:flex; justify-content:center; align-items:center;"><span style="font-size:20px; z-index:5;">${item.icone}</span></div>` : item.icone;
        container.innerHTML += `<div class="store-item"><div style="display: flex; align-items: center; gap: 15px;"><div class="store-icon">${iconVisual}</div><div class="store-info"><h4>${item.nome}</h4><div style="font-size: 11px; color: var(--text-muted);">${item.desc}</div><div class="store-price">🪙 ${item.preco}</div></div></div><button class="btn-buy" onclick="comprarItem('${item.id}')" ${!podeComprar ? 'disabled' : ''}>${btnTexto}</button></div>`;
    });
}
async function comprarItem(id) {
    const item = LOJA_DB.find(i => i.id === id);
    if (jogador.moedas >= item.preco) {
        jogador.moedas -= item.preco; if(item.tipo === 'avatar') jogador.avatar = item.icone; else if(item.tipo === 'frame') jogador.moldura = item.id;
        else if (item.tipo.includes('power')) { let d = new Date(); d.setDate(d.getDate() + 1); jogador.multiplicador_expira = d.toISOString(); if(item.tipo === 'power3') jogador.multiplicador_expira = '3x|' + d.toISOString(); }
        await banco.from('ranking').update({ avatar: jogador.avatar, moldura: jogador.moldura, moedas: jogador.moedas, multiplicador_expira: jogador.multiplicador_expira }).eq('user_id', jogador.id);
        mostrarToast(`Comprou: ${item.nome}!`, "success"); renderizarLoja(); atualizarDashboard();
    }
}

function renderizarConquistas() {
    const container = document.getElementById('lista-conquistas'); container.innerHTML = '';
    CONQUISTAS_DB.forEach(c => { const unlocked = jogador.conquistas.includes(c.id); container.innerHTML += `<div class="achievement-card ${unlocked ? 'unlocked' : ''}"><div class="ach-icon">${unlocked ? c.icone : '🔒'}</div><div class="ach-info"><h4>${c.titulo}</h4><p>${c.desc}</p></div></div>`; });
}

function renderizarEstatisticas() {
    const container = document.getElementById('container-stats'); container.innerHTML = ''; const keys = Object.keys(jogador.stats);
    if(keys.length === 0) { container.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-weight:bold;">Jogue para gerar estatísticas.</p>'; return; }
    keys.forEach(mat => { const s = jogador.stats[mat]; const pct = Math.round((s.acertos / s.total) * 100); let cor = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--gold)' : 'var(--danger)'; container.innerHTML += `<div class="stat-row"><div class="stat-label-row"><span>${mat}</span><span>${pct}%</span></div><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${pct}%; background:${cor};"></div></div></div>`; });
}

// MOTOR DO JOGO
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function gerarQuestao(serie) {
    if (serie === 'mix') { const s = ["5","6","7","8","9","1em","2em","3em"]; serie = s[Math.floor(Math.random() * s.length)]; }
    let dif = 2; if (document.getElementById('select-dificuldade')) dif = parseInt(document.getElementById('select-dificuldade').value);
    let mult = dif === 1 ? 10 : (dif === 2 ? 30 : 50); let p = "", r = 0, e = "", m = "";
    if (serie === "5" || serie === "6") {
        const op = rand(1, 5);
        if(op === 1) { let a = rand(1, mult), b = rand(1, mult); p = `Quanto é ${a} + ${b}?`; r = a + b; e = `Somando: ${a} + ${b} = ${r}.`; m = "Soma"; }
        else if(op === 2) { let a = rand(10, mult), b = rand(1, 10); p = `Quanto é ${a} - ${b}?`; r = a - b; e = `Subtraindo: ${a} - ${b} = ${r}.`; m = "Subtração"; }
        else if(op === 3) { let a = rand(2, 10), b = rand(2, 10); p = `Quanto é ${a} x ${b}?`; r = a * b; e = `Multiplicando: ${a} x ${b} = ${r}.`; m = "Multiplicação"; }
        else if(op === 4) { let b = rand(2, 10), rd = rand(2, 10); let a = b * rd; p = `Quanto é ${a} ÷ ${b}?`; r = rd; e = `${b} x ${r} = ${a}.`; m = "Divisão"; }
        else { let den = rand(2, 8), n1 = rand(1, den - 1), n2 = rand(1, den - 1); p = `Quanto é ${n1}/${den} + ${n2}/${den}?`; let rn = n1 + n2; let gcd = (a, b) => b ? gcd(b, a % b) : a; let div = gcd(rn, den); let fn = rn / div, fd = den / div; r = fd === 1 ? String(fn) : `${fn}/${fd}`; e = `Some os numeradores: ${n1} + ${n2} = ${rn}. Simplificando temos ${r}.`; m = "Frações"; }
    } else if (serie === "7" || serie === "8") {
        const op = rand(1, 4);
        if(op === 1) { let x = rand(2, 10), b = rand(1, 10), c = (2*x) + b; p = `Se 2x + ${b} = ${c}, x = ?`; r = x; e = `2x = ${c} - ${b}. x = ${x}.`; m = "Equações"; }
        else if(op === 2) { let a = rand(2, 10); p = `Área de um quadrado de lado ${a}cm?`; r = a*a; e = `${a} x ${a} = ${r} cm².`; m = "Geometria"; }
        else if(op === 3) { let a = rand(2, 5) * 10, total = rand(2,10)*100; p = `Quanto é ${a}% de ${total}?`; r = (a/100) * total; e = `${a}/100 x ${total} = ${r}.`; m = "Porcentagem"; }
        else { let a = rand(2, 5), b = rand(2, 5), c = rand(2, 5); p = `João tem ${a}, ganha ${b}, divide p/ ${c}. Quanto cada um recebe?`; r = Math.floor((a + b) / c); e = `Total = ${a+b}. Dividindo por ${c} = ${r}.`; m = "Raciocínio Lógico"; }
    } else if (serie === "9") {
        const op = rand(1, 3);
        if(op === 1) { const t = [[3,4,5], [6,8,10], [5,12,13]][rand(0,2)]; p = `Catetos ${t[0]} e ${t[1]}. Hipotenusa?`; r = t[2]; e = `a² = ${t[0]}² + ${t[1]}² = ${t[0]*t[0] + t[1]*t[1]}. Raiz = ${r}.`; m = "Geometria"; }
        else if(op === 2) { let x = rand(2, 5); p = `Se x² = ${x*x}, x = ?`; r = x; e = `Raiz de ${x*x} é ${x}.`; m = "Equações"; }
        else { let a = rand(2, 10); p = `Quanto é ${a}²?`; r = a*a; e = `${a} x ${a} = ${r}.`; m = "Potenciação"; }
    } else if (serie === "1em") { let a = rand(2, 5), b = rand(1, 10), x = rand(1, 5); p = `f(x) = ${a}x + ${b}. f(${x})?`; r = a*x + b; e = `f(${x}) = ${a}(${x}) + ${b} = ${r}.`; m = "Funções"; }
    else if (serie === "2em") { const trig = [ {q: "sen(30º)?", o: ["1/2", "√2/2", "√3/2", "1"], c: 0}, {q: "cos(60º)?", o: ["1/2", "√2/2", "√3/2", "1"], c: 0}, {q: "sen(90º)?", o: ["0", "1/2", "√2/2", "1"], c: 3}, {q: "cos(0º)?", o: ["0", "1/2", "1", "√3/2"], c: 2} ]; let es = trig[rand(0,3)]; return { q: es.q, o: es.o, c: es.c, exp: "Trigonometria básica.", serie: serie, mat: "Trigonometria" }; }
    else if (serie === "3em") { let a = rand(2, 5); p = `log₁₀(10^${a})?`; r = a; e = `Log de 10^${a} na base 10 é ${a}.`; m = "Logaritmos"; }
    else return gerarQuestao('mix');
    
    if (typeof r === 'string') {
        let os = new Set([r]); let at = 0;
        while(os.size < 4 && at < 50) { let v = (parseFloat(r.replace(',', '.')) + rand(-30, 30)/10).toFixed(1).replace('.', ','); if(v !== r && parseFloat(v.replace(',', '.')) >= 0) os.add(v); at++; }
        let o = Array.from(os).sort(); return { q: p, o: o, c: o.indexOf(r), exp: e, serie: serie, mat: m };
    } else {
        let os = new Set([r]); let at = 0;
        while(os.size < 4 && at < 50) { let of = rand(1, 10) * (Math.random() > 0.5 ? 1 : -1); let er = r + of; if(er !== r && er >= 0) os.add(er); at++; }
        let fb = 1; while(os.size < 4) { os.add(r + fb); fb++; }
        let o = Array.from(os).sort((a,b) => a-b).map(String); return { q: p, o: o, c: o.indexOf(String(r)), exp: e, serie: serie, mat: m };
    }
}

const AudioContext = window.AudioContext || window.webkitAudioContext; let audioCtx;
function tocarSom(t) { if (!somAtivado) return; if (!audioCtx) audioCtx = new AudioContext(); const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.connect(g); g.connect(audioCtx.destination); if(t==='acerto'){o.frequency.setValueAtTime(400,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(800,audioCtx.currentTime+0.1);}else{o.type='sawtooth';o.frequency.setValueAtTime(200,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(100,audioCtx.currentTime+0.2);} g.gain.setValueAtTime(0.1,audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.3); o.start(); o.stop(audioCtx.currentTime+0.3); }
function soltarConfete() { if (!animacoesAtivadas) return; const c = ['#ffd700', '#00f2fe', '#a855f7', '#00e676', '#ff1744']; for (let i = 0; i < 40; i++) { const p = document.createElement('div'); p.classList.add('confetti-piece'); p.style.left = Math.random() * 100 + 'vw'; p.style.backgroundColor = c[Math.floor(Math.random() * c.length)]; p.style.animationDuration = (Math.random() * 2 + 1.5) + 's'; document.body.appendChild(p); setTimeout(() => p.remove(), 3500); } }

function prepararJogo(modo) {
    const serie = document.getElementById('select-serie').value; filaPerguntas = [];
    for(let i=0; i<20; i++) filaPerguntas.push(gerarQuestao(modo === 'rankeado' ? 'mix' : serie));
    estado = { modo: modo, pontos: 0, acertos: 0, erros: 0, sequencia: 0, melhorSequencia: 0, questaoAtual: 0, respondidas: false };
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById('tela-jogo').classList.add('active');
    document.getElementById('timer-box').classList.add('hidden'); document.getElementById('duel-result-box').classList.add('hidden'); carregarQuestao();
}

function iniciarDesafio(id) {
    const d = DESAFIOS_DB.find(x => x.id === id); if(!d) return; filaPerguntas = []; for(let i=0; i<100; i++) filaPerguntas.push(gerarQuestao(d.serie));
    estado = { modo: 'tempo', pontos: 0, acertos: 0, erros: 0, sequencia: 0, melhorSequencia: 0, questaoAtual: 0, respondidas: false };
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById('tela-jogo').classList.add('active');
    const tb = document.getElementById('timer-box'); tb.classList.remove('hidden'); tempoRestante = d.tempo; tb.innerText = `${tempoRestante}s`; clearInterval(timerInterval);
    timerInterval = setInterval(() => { tempoRestante--; tb.innerText = `${tempoRestante}s`; if (tempoRestante <= 0) { clearInterval(timerInterval); finalizarJogo(); } }, 1000); carregarQuestao();
}

function carregarQuestao() {
    if (!isDuelo && estado.questaoAtual >= filaPerguntas.length) { const s = document.getElementById('select-serie').value; for(let i=0; i<10; i++) filaPerguntas.push(gerarQuestao(estado.modo === 'rankeado' ? 'mix' : s)); }
    estado.respondidas = false; perguntaAtual = filaPerguntas[estado.questaoAtual];
    document.getElementById('hud-pontos').innerText = `🏆 ${estado.pontos} PTS`; document.getElementById('hud-sequencia').innerText = `🔥 ${estado.sequencia}`;
    document.getElementById('hud-questao').innerText = isDuelo ? `${estado.quest
                                                  }
                                                  aoAtual + 1}/15` : `∞`; 
    document.getElementById('progress-fill').style.width = isDuelo ? `${(estado.questaoAtual / 15) * 100}%` : `${((estado.questaoAtual % 10) / 10) * 100}%`;
    document.getElementById('question-text').innerText = perguntaAtual.q; 
    document.getElementById('feedback-box').classList.remove('active'); 
    document.getElementById('btn-next').style.display = 'none';
    
    const container = document.getElementById('options-container'); 
    container.innerHTML = ''; 
    const letras = ['A', 'B', 'C', 'D'];
    
    perguntaAtual.o.forEach((opcao, index) => { 
        const btn = document.createElement('button'); 
        btn.className = 'option-btn'; 
        btn.innerHTML = `<span class="option-letter">${letras[index]}</span> ${opcao}`; 
        btn.onclick = () => responder(index, btn); 
        container.appendChild(btn); 
    });
}

function responder(index, btn) {
    if (estado.respondidas) return; 
    estado.respondidas = true; 
    const botoes = document.querySelectorAll('.option-btn'); 
    botoes.forEach(b => b.style.pointerEvents = 'none');
    
    const mat = perguntaAtual.mat; 
    if(!jogador.stats[mat]) jogador.stats[mat] = { acertos: 0, total: 0 }; 
    jogador.stats[mat].total++;
    
    let ptsGanhos = 15; 
    let ptsPerdidos = -5;
    const msgsAcerto = ["INCRÍVEL! Você é uma máquina! 🔥", "BRILHANTE! Mais 15 pontos!", "É ISSO! Sua mente está afiada!", "PERFEITO! Continue dominando!", "ABSOLUTAMENTE GENIAL!"];
    const msgsErro = ["Calma! Errar faz parte. 💙", "Não desista! A próxima é sua!", "Você está evoluindo a cada tentativa!", "Quase lá! Continue tentando!", "Um erro não define sua capacidade!"];

    if (index === perguntaAtual.c) {
        tocarSom('acerto'); 
        estado.pontos += ptsGanhos; 
        estado.acertos++; 
        estado.sequencia++;
        if(estado.sequencia > estado.melhorSequencia) estado.melhorSequencia = estado.sequencia; 
        jogador.stats[mat].acertos++; 
        btn.classList.add('correct');
        soltarConfete();
        const msg = msgsAcerto[Math.floor(Math.random() * msgsAcerto.length)];
        document.getElementById('feedback-title').innerText = `🎉 ${msg}`;
    } else {
        tocarSom('erro'); 
        estado.pontos = Math.max(0, estado.pontos + ptsPerdidos); 
        estado.erros++; 
        estado.sequencia = 0; 
        btn.classList.add('wrong'); 
        botoes[perguntaAtual.c].classList.add('correct');
        const msg = msgsErro[Math.floor(Math.random() * msgsErro.length)];
        document.getElementById('feedback-title').innerText = `❌ ${msg}`;
    }
    
    const pointFx = document.createElement('div'); 
    pointFx.className = 'floating-points';
    pointFx.style.color = index === perguntaAtual.c ? 'var(--success)' : 'var(--danger)';
    pointFx.innerText = index === perguntaAtual.c ? '+15 PTS' : '-5 PTS';
    pointFx.style.left = btn.offsetLeft + (btn.offsetWidth / 2) - 30 + 'px'; 
    pointFx.style.top = btn.offsetTop + 'px';
    btn.parentElement.appendChild(pointFx); 
    setTimeout(() => pointFx.remove(), 1000);

    document.getElementById('hud-pontos').innerText = `🏆 ${estado.pontos} PTS`; 
    document.getElementById('hud-sequencia').innerText = `🔥 ${estado.sequencia}`;
    
    if (estado.modo === 'tempo') { 
        setTimeout(() => { estado.questaoAtual++; carregarQuestao(); }, 400); 
    } else {
        const fbBox = document.getElementById('feedback-box'); 
        const fbExp = document.getElementById('feedback-explanation');
        fbBox.className = index === perguntaAtual.c ? 'feedback active success' : 'feedback active error';
        fbExp.innerText = perguntaAtual.exp;
        document.getElementById('btn-next').style.display = 'block'; 
        document.getElementById('btn-next').innerText = (isDuelo && estado.questaoAtual >= 14) ? "FINALIZAR 🏁" : "PRÓXIMA ➡";
    }
}

function proximaQuestao() { 
    if (isDuelo && estado.questaoAtual >= 14) return finalizarJogo();
    estado.questaoAtual++; 
    carregarQuestao(); 
}

function pararJogo() { if(confirm("Deseja realmente parar agora e salvar seus pontos?")) finalizarJogo(); }

async function salvarPartida(pontosFinais) {
    if (pontosFinais === 0 && estado.acertos === 0) return;
    await banco.from('partidas').insert([{ user_id: jogador.id, pontos: pontosFinais }]);
    const hoje = new Date().toISOString().split('T')[0];
    
    jogador.missoes.jogos = (jogador.missoes.jogos || 0) + 1; 
    jogador.missoes.acertos = (jogador.missoes.acertos || 0) + estado.acertos; 
    jogador.missoes.pontos_dia = (jogador.missoes.pontos_dia || 0) + pontosFinais;
    if(estado.modo === 'tempo') jogador.missoes.desafios = (jogador.missoes.desafios || 0) + 1;
    
    const { data } = await banco.from('ranking').select('*').eq('user_id', jogador.id).maybeSingle();
    let novoStreak = data ? data.streak || 0 : 0;
    let totalAcertos = (data ? data.acertos || 0 : 0) + estado.acertos;
    let totalErros = (data ? data.erros || 0 : 0) + estado.erros;
    let melhorSeq = Math.max(data ? data.melhor_sequencia || 0 : 0, estado.melhorSequencia);
    let novoXP = (data ? data.xp || 0 : 0) + pontosFinais;
    let novaPontuacao = (data ? data.pontuacao || 0 : 0) + pontosFinais;
    let novasMoedas = (data ? data.moedas || 0 : 0) + (pontosFinais * 2); // Dobro de moedas!

    if (data) {
        if (data.last_played !== hoje) { 
            const ontem = new Date(); ontem.setDate(ontem.getDate() - 1); 
            novoStreak = (data.last_played === ontem.toISOString().split('T')[0]) ? novoStreak + 1 : 1; 
        }
        await banco.from('ranking').update({ 
            pontuacao: novaPontuacao, xp: novoXP, streak: novoStreak, moedas: novasMoedas, missoes: jogador.missoes, last_played: hoje, conquistas: jogador.conquistas, stats_materias: jogador.stats,
            acertos: totalAcertos, erros: totalErros, melhor_sequencia: melhorSeq
        }).eq('user_id', jogador.id);
    } else {
        await banco.from('ranking').insert([{ 
            user_id: jogador.id, nome: jogador.nome || 'Jogador', pontuacao: pontosFinais, xp: pontosFinais, streak: 1, moedas: jogador.moedas, missoes: jogador.missoes, last_played: hoje, conquistas: jogador.conquistas, stats_materias: jogador.stats,
            acertos: totalAcertos, erros: totalErros, melhor_sequencia: melhorSeq
        }]);
    }
    jogador.xp = novoXP; jogador.pontos = novaPontuacao; jogador.moedas = novasMoedas;
    jogador.nivel = getNivel(novoXP).nivel; jogador.streak = novoStreak;
    jogador.totalAcertos = totalAcertos; jogador.totalErros = totalErros; jogador.melhorSequencia = melhorSeq;
}

async function finalizarJogo() {
    clearInterval(timerInterval); 
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); 
    document.getElementById('tela-resultado').classList.add('active');
    
    let multiplicador = 1;
    if (usarMultiplicador && jogador.multiplicador_expira) {
        multiplicador = jogador.multiplicador_expira.includes('3x') ? 3 : 2;
    }
    let pontosFinais = estado.pontos * multiplicador;
    
    const totalRespondidas = estado.acertos + estado.erros;
    const taxaAcerto = totalRespondidas > 0 ? (estado.acertos / totalRespondidas) * 100 : 0;
    
    let titulo = ""; let emoji = "🎉";
    if (taxaAcerto === 100 && totalRespondidas >= 5) { titulo = "MESTRE DA MATEMÁTICA"; emoji = "👑"; }
    else if (taxaAcerto >= 70) { titulo = "EXCELENTE DESEMPENHO"; emoji = "🏆"; }
    else if (taxaAcerto >= 50) { titulo = "BOM TRABALHO"; emoji = "👍"; }
    else { titulo = "CONTINUE EVOLUINDO"; emoji = "💪"; }
    
    document.getElementById('result-title').innerText = titulo;
    document.getElementById('result-emoji').innerText = emoji;
    document.getElementById('result-score').innerText = pontosFinais; 
    document.getElementById('result-acertos').innerText = estado.acertos; 
    document.getElementById('result-erros').innerText = estado.erros;
    
    if (isDuelo && dueloAtual) {
        document.getElementById('duel-result-box').classList.remove('hidden');
        const duelText = document.getElementById('duel-result-text');
        if (dueloAtual.criador_id === jogador.id) {
            await banco.from('duelos').update({ pontos_criador: pontosFinais, status: 'playing' }).eq('id', dueloAtual.id);
            duelText.innerText = "Aguardando o oponente jogar...";
            duelText.style.color = "var(--gold)";
        } else {
            await banco.from('duelos').update({ pontos_oponente: pontosFinais, oponente_id: jogador.id, status: 'finished' }).eq('id', dueloAtual.id);
            const { data } = await banco.from('duelos').select('*').eq('id', dueloAtual.id).single();
            if (data.pontos_criador > pontosFinais) { duelText.innerText = "VOCÊ PERDEU 😢"; duelText.style.color = "var(--danger)"; } 
            else if (data.pontos_criador < pontosFinais) { duelText.innerText = "VOCÊ GANHOU! 🏆"; duelText.style.color = "var(--success)"; } 
            else { duelText.innerText = "EMPATE!"; duelText.style.color = "var(--primary)"; }
        }
    } else { document.getElementById('duel-result-box').classList.add('hidden'); }
    
    const totalAcertosGlobal = (jogador.totalAcertos || 0) + estado.acertos;
    const taxaAcertoGlobal = (totalAcertosGlobal / ((jogador.totalAcertos || 0) + (jogador.totalErros || 0) + totalRespondidas || 1)) * 100;
    const melhorSeq = Math.max(jogador.melhorSequencia || 0, estado.melhorSequencia);
    const novoNivel = getNivel((jogador.xp || 0) + pontosFinais).nivel;
    
    let novasConquistas = [];
    function desbloquear(id) { if(!jogador.conquistas.includes(id) && !novasConquistas.includes(id)) novasConquistas.push(id); }

    if(totalAcertosGlobal >= 1) desbloquear('c1'); 
    if(totalAcertosGlobal >= 10) desbloquear('c2'); 
    if(totalAcertosGlobal >= 50) desbloquear('c3'); 
    if(totalAcertosGlobal >= 100) desbloquear('c4'); 
    if(totalAcertosGlobal >= 500) desbloquear('c5'); 
    if(totalAcertosGlobal >= 1000) desbloquear('c6');
    if(melhorSeq >= 10) desbloquear('c7'); 
    if(melhorSeq >= 25) desbloquear('c8'); 
    if(pontosFinais >= 80) desbloquear('c9'); 
    if(estado.erros === 0 && estado.acertos >= 10) desbloquear('c10');
    if(totalAcertosGlobal >= 50 && taxaAcertoGlobal >= 95) desbloquear('c11');
    if(jogador.streak >= 3) desbloquear('c12'); 
    if(jogador.streak >= 7) desbloquear('c13'); 
    if(jogador.streak >= 14) desbloquear('c14'); 
    if(jogador.streak >= 30) desbloquear('c15'); 
    if(jogador.streak >= 60) desbloquear('c16'); 
    if(jogador.streak >= 100) desbloquear('c17'); 
    if(jogador.streak >= 365) desbloquear('c18');
    if(estado.modo === 'tempo') desbloquear('c19'); 
    if(estado.modo === 'tempo' && tempoRestante <= 30) desbloquear('c20'); 
    if(novoNivel >= 5) desbloquear('c21'); 
    if(novoNivel >= 10) desbloquear('c22'); 
    if(novoNivel >= 20) desbloquear('c23'); 
    if(novoNivel >= 50) desbloquear('c24');
    if(Object.keys(jogador.stats).length >= 5) desbloquear('c25');

    if(novasConquistas.length > 0) { 
        jogador.conquistas = jogador.conquistas.concat(novasConquistas); 
        let primeiraNova = CONQUISTAS_DB.find(c => c.id === novasConquistas[0]);
        if(primeiraNova) setTimeout(() => mostrarModalConquista(primeiraNova.titulo, primeiraNova.icone, "Épica"), 1000);
        setTimeout(() => mostrarToast(`🏅 ${novasConquistas.length} Nova(s) Conquista(s)!`, "gold"), 3000); 
    }
    await salvarPartida(pontosFinais);
    isDuelo = false; dueloAtual = null;
}

function renderizarDesafios() {
    const container = document.getElementById('lista-desafios'); 
    container.innerHTML = '';
    DESAFIOS_DB.forEach(d => { container.innerHTML += `<div class="challenge-card"><div class="challenge-info"><h4>${d.nome}</h4><p>${d.desc}</p></div><button class="btn-play-challenge" onclick="iniciarDesafio(${d.id})">JOGAR</button></div>`; });
}

// INICIALIZAÇÃO
window.onload = async () => {
    const { data: { session } } = await banco.auth.getSession();
    if (session) {
        jogador.id = session.user.id;
        jogador.email = session.user.email;
        await carregarPerfil();
        mostrarApp();
    }
};

banco.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session && !jogador.id) {
        jogador.id = session.user.id;
        jogador.email = session.user.email;
        carregarPerfil().then(() => mostrarApp());
    } else if (event === 'SIGNED_OUT') {
        jogador.id = null;
        document.getElementById('bottom-nav').style.display = 'none';
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('tela-auth').classList.add('active');
    }
});
