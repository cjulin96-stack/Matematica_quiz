const supabaseUrl = 'https://yrylpxrqflhuwmgvfyat.supabase.co';
const supabaseKey = 'sb_publishable_ytcMgi4QgIkfQPlT_7a5fQ_PyuODEwD';
const banco = supabase.createClient(supabaseUrl, supabaseKey);

let jogador = { id: null, email: '', nome: localStorage.getItem('mathArenaNome') || 'Jogador', xp: 0, pontos: 0, streak: 0, moedas: 0, avatar: '🧑‍🚀', moldura: 'frame-padrao', conquistas: [], stats: {}, missoes: {acertos: 0, jogos: 0, desafios: 0, pontos_dia: 0, last_chest: 0}, multiplicador_expira: null, nivel: 1, totalAcertos: 0, totalErros: 0, melhorSequencia: 0 };
let estado = { modo: 'classico', pontos: 0, acertos: 0, erros: 0, sequencia: 0, melhorSequencia: 0, questaoAtual: 0, respondidas: false };
let isDuelo = false; let dueloAtual = null; let filaPerguntas = []; let perguntaAtual = null;
let timerInterval = null; let tempoRestante = 0; let usarMultiplicador = false;
let somAtivado = true; let animacoesAtivadas = true;

function getNivel(xpTotal) {
    let nivel = 1; let xpNecessario = 100; let xpAcumulado = 0;
    while (xpTotal >= xpAcumulado + xpNecessario) {
        xpAcumulado += xpNecessario; nivel++; xpNecessario = nivel * 100;
    }
    return { nivel: nivel, xpAtual: xpTotal - xpAcumulado, xpProximo: xpNecessario };
}

function getNomeNivel(nivel) {
    if (nivel >= 100) return "Divindade Matemática"; if (nivel >= 75) return "Lenda";
    if (nivel >= 50) return "Gênio"; if (nivel >= 40) return "Mestre";
    if (nivel >= 30) return "Especialista"; if (nivel >= 20) return "Estrategista";
    if (nivel >= 10) return "Calculista"; if (nivel >= 5) return "Aprendiz";
    return "Novato";
}

const AVATARES_GRATIS = ['🧑‍🚀', '🐯', '🐺', '🦊', '🐼', '🦁', '🦄', '🐲', '🤖', '👽', '👾', '🧙‍♂️', '🧛‍♂️', '🧜‍♀️', '🧚', '🦸‍♂️', '🦹‍♂️', '🥷', '👮‍♂️', '🕵️‍♂️'];

const CONQUISTAS_DB = [
    { id: 'c1', icone: '👣', titulo: 'Primeiro Passo', desc: 'Jogou a primeira partida.', meta: 1, tipo: 'jogos' },
    { id: 'c2', icone: '🧐', titulo: 'Mente Curiosa', desc: 'Respondeu 10 questões.', meta: 10, tipo: 'acertos' },
    { id: 'c3', icone: '🌱', titulo: 'Iniciante', desc: 'Respondeu 50 questões.', meta: 50, tipo: 'acertos' },
    { id: 'c4', icone: '📚', titulo: 'Aprendiz', desc: 'Respondeu 100 questões.', meta: 100, tipo: 'acertos' },
    { id: 'c5', icone: '🎓', titulo: 'Dedicado', desc: 'Respondeu 500 questões.', meta: 500, tipo: 'acertos' },
    { id: 'c6', icone: '🏛️', titulo: 'Veterano', desc: 'Respondeu 1000 questões.', meta: 1000, tipo: 'acertos' },
    { id: 'c7', icone: '🎯', titulo: 'Atirador de Elite', desc: 'Acertou 10 seguidas.', meta: 10, tipo: 'sequencia' },
    { id: 'c8', icone: '🔪', titulo: 'Precisão Absoluta', desc: 'Acertou 25 seguidas.', meta: 25, tipo: 'sequencia' },
    { id: 'c9', icone: '🧠', titulo: 'Mente Brilhante', desc: 'Atingiu 80+ pontos.', meta: 80, tipo: 'pontos_partida' },
    { id: 'c10', icone: '💎', titulo: 'Perfeição', desc: '10 questões sem errar.', meta: 10, tipo: 'perfeicao' },
    { id: 'c11', icone: '🧮', titulo: 'Calculadora Humana', desc: '95% de aproveitamento.', meta: 95, tipo: 'taxa' },
    { id: 'c12', icone: '🔥', titulo: 'Chama Inicial', desc: '3 dias consecutivos.', meta: 3, tipo: 'streak' },
    { id: 'c13', icone: '☄️', titulo: 'Uma Semana de Fogo', desc: '7 dias consecutivos.', meta: 7, tipo: 'streak' },
    { id: 'c14', icone: '🌋', titulo: 'Duas Semanas', desc: '14 dias consecutivos.', meta: 14, tipo: 'streak' },
    { id: 'c15', icone: '🛡️', titulo: 'Disciplina de Ferro', desc: '30 dias consecutivos.', meta: 30, tipo: 'streak' },
    { id: 'c16', icone: '🚀', titulo: 'Imparável', desc: '60 dias consecutivos.', meta: 60, tipo: 'streak' },
    { id: 'c17', icone: '💯', titulo: 'Centenário', desc: '100 dias consecutivos.', meta: 100, tipo: 'streak' },
    { id: 'c18', icone: '👑', titulo: 'Lenda', desc: '365 dias consecutivos.', meta: 365, tipo: 'streak' },
    { id: 'c19', icone: '⚡', titulo: 'Modo Turbo', desc: 'Completou desafio de tempo.', meta: 1, tipo: 'desafio' },
    { id: 'c20', icone: '⏱️', titulo: 'Reflexos Matemáticos', desc: 'Jogou Desafio Hardcore.', meta: 1, tipo: 'hardcore' },
    { id: 'c21', icone: '⭐', titulo: 'Subindo na Vida', desc: 'Alcançou Nível 5.', meta: 5, tipo: 'nivel' },
    { id: 'c22', icone: '🌟', titulo: 'Especialista', desc: 'Alcançou Nível 10.', meta: 10, tipo: 'nivel' },
    { id: 'c23', icone: '🌠', titulo: 'Gênio', desc: 'Alcançou Nível 20.', meta: 20, tipo: 'nivel' },
    { id: 'c24', icone: '🌌', titulo: 'Divindade Matemática', desc: 'Alcançou Nível 50.', meta: 50, tipo: 'nivel' },
    { id: 'c25', icone: '🗺️', titulo: 'Explorador', desc: 'Jogou 5 matérias.', meta: 5, tipo: 'materias' },
    { id: 'c26', icone: '⚡', titulo: 'Pensamento Rápido', desc: 'Respondeu em <5s.', meta: 1, tipo: 'rapido' },
    { id: 'c27', icone: '⚖️', titulo: 'Polivalente', desc: '80% em 5 matérias.', meta: 5, tipo: 'materias_80' },
    { id: 'c28', icone: '🏆', titulo: 'Primeiro Pódio', desc: 'Top 3 do ranking.', meta: 3, tipo: 'ranking' }
];

const LOJA_DB = [ 
    { id: 'mult', icone: '🚀', nome: 'Multiplicador 2X', desc: 'Dobra pontos 24h', preco: 500, tipo: 'power' },
    { id: 'mult3', icone: '🔥', nome: 'Multiplicador 3X', desc: 'Triplica pontos 24h', preco: 1200, tipo: 'power3' },
    { id: 'frame-ouro', icone: '👑', nome: 'Moldura Ouro', desc: 'Brilho VIP', preco: 800, tipo: 'frame' },
    { id: 'frame-fogo', icone: '🔥', nome: 'Moldura Fogo', desc: 'Chamas ardentes', preco: 1500, tipo: 'frame' },
    { id: 'frame-gelo', icone: '❄️', nome: 'Moldura Gelo', desc: 'Congelante', preco: 1500, tipo: 'frame' },
    { id: 'frame-neon', icone: '🔮', nome: 'Moldura Neon', desc: 'Energia roxa', preco: 2000, tipo: 'frame' },
    { id: 'av_mestre', icone: '🧙‍♂️', nome: 'Mestre', desc: 'Avatar VIP', preco: 500, tipo: 'avatar' },
    { id: 'av_robo', icone: '🤖', nome: 'Calculadora', desc: 'Avatar VIP', preco: 1000, tipo: 'avatar' },
    { id: 'av_ninja', icone: '🥷', nome: 'Ninja', desc: 'Avatar VIP', preco: 2500, tipo: 'avatar' },
    { id: 'av_dragao', icone: '🐉', nome: 'Dragão', desc: 'Avatar VIP', preco: 5000, tipo: 'avatar' }
];

const DESAFIOS_DB = [ 
    { id: 1, nome: 'Desafio 1', serie: '5', tempo: 120, desc: '5º Ano • 2 Minutos' }, 
    { id: 2, nome: 'Desafio 2', serie: '6', tempo: 90,  desc: '6º Ano • 1m 30s' }, 
    { id: 3, nome: 'Desafio 3', serie: '7', tempo: 60,  desc: '7º Ano • 1 Minuto' }, 
    { id: 4, nome: 'Desafio 4', serie: '8', tempo: 45,  desc: '8º Ano • 45 Segundos' }, 
    { id: 5, nome: 'Desafio 5', serie: '9', tempo: 30,  desc: '9º Ano • 30 Segundos' } 
];

const ACADEMIA_DB = [
    { titulo: 'Trilha 1: Frações', conteudo: 'Uma fração representa uma parte de um todo. Ex: 1/2 (metade). Para somar frações com o mesmo denominador, some apenas os numeradores: 1/4 + 2/4 = 3/4.' },
    { titulo: 'Trilha 2: Equações 1º Grau', conteudo: 'O objetivo é isolar a letra. Ex: 2x + 5 = 15. Passe o 5 subtraindo: 2x = 10. Divida por 2: x = 5.' },
    { titulo: 'Trilha 3: Teorema de Pitágoras', conteudo: 'Usado em triângulos retângulos. A fórmula é a² = b² + c². O "a" é a hipotenusa.' },
    { titulo: 'Trilha 4: Porcentagem', conteudo: 'Porcentagem é uma fração com denominador 100. Ex: 20% de 150 = 20/100 x 150 = 30.' },
    { titulo: 'Trilha 5: Geometria', conteudo: 'Área do quadrado = lado x lado. Área do retângulo = base x altura.' }
];
