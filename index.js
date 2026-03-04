const fs = require('fs');
const readline = require('readline');

class Rastreador {
	constructor() {
	this.arquivo = __dirname + '/historico.json';
	}


	salvarSessao(materia, duracao) {
		let historico = [];

		if (fs.existsSync(this.arquivo)) {
		const dados = fs.readFileSync(this.arquivo, 'utf-8');
		historico = JSON.parse(dados);
		}

	const novaSessao = {
		materia: materia,
		duracaoMinutos: duracao,
		data: new Date().toLocaleString('pt-BR')
		};

	historico.push(novaSessao);

	fs.writeFileSync(this.arquivo, JSON.stringify(historico, null, 2));
	console.log(`\n Histórico atualizado. Sessão salva em ${this.arquivo}.`);
	}

	mostrarEstatisticas() {
	if(!fs.existsSync(this.arquivo)) {
		console.log("\n Ainda não há histórico a ser exibido!");
		return;
		}
	const dados = fs.readFileSync(this.arquivo, 'utf-8');
	const historico = JSON.parse(dados);
	
	let totalMinutos = 0;
	let hojeMinutos = 0;
	let semanaMinutos = 0;

	const hoje = new Date();
	const hojeStr = hoje.toLocaleDateString('pt-BR');

	historico.forEach(sessao => {
		totalMinutos += sessao.duracaoMinutos;
		const dataSessaoStr = sessao.data.split(',')[0].trim();
		
		if (dataSessaoStr === hojeStr) {
		hojeMinutos += sessao.duracaoMinutos;
		}

		const partesData = dataSessaoStr.split('/');
		if (partesData.length === 3) {
		const dataObj = new Date(partesData[2], partesData[1] - 1, partesData[0]);
		const diffTempo = Math.abs(hoje - dataObj);
		const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

		if (diffDias <= 7) {
			semanaMinutos += sessao.duracaoMinutos;
			}
		}
		
	});

	console.log(`\n ⋆｡‧˚ʚ ୨ৎ SEU HISTÓRICO DE FOCO ୨ৎ ɞ˚‧｡⋆`);
	console.log(`Hoje: ${hojeMinutos} minutos.`);
	console.log(`Últimos 7 dias: ${semanaMinutos} minutos`);
	console.log(`Total geral: ${totalMinutos} minutos`);
	console.log('﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌\n');
	}
}

class SessaoDeEstudo {
	constructor(materia, duracaoMinutos, rastreador) {
		this.materia = materia;
		this.duracaoMinutos = duracaoMinutos;
		this.tempoRestante = duracaoMinutos * 60;
		this.intervalo = null;
		this.rastreador = rastreador;
		}

	iniciar() {
		console.log(`\n Iniciando: ${this.materia} (${this.duracaoMinutos} min). Foco total!`);
		this.iniciarContagem();
		}

	iniciarContagem() {
		this.intervalo = setInterval(() => {
			const horas = Math.floor(this.tempoRestante / 3600);
			const minutos = Math.floor((this.tempoRestante % 3600) / 60);
			const segundos = this.tempoRestante % 60;

			const formatoTempo = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

			process.stdout.write(`\r Tempo restante: ${formatoTempo}`);

			if (this.tempoRestante <= 0){
				clearInterval(this.intervalo);
				console.log(`\n\n Sessão de ${this.materia} concluida! Faça uma pausa.`);
				
				this.rastreador.salvarSessao(this.materia, this.duracaoMinutos);

				}
			this.tempoRestante--; }, 1000);
			}
		}

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const meuRastreador = new Rastreador();

console.log("⊹₊˚‧︵‿₊୨ MEU RASTREADOR DE ESTUDOS ୧₊‿︵‧˚₊⊹\n");
console.log("1. Iniciar sessão de foco");
console.log("2. Ver estatísticas de estudo.");

rl.question('Escolha uma opção (1 ou 2). \n', (opcao) => {

	if (opcao === '2') {
	meuRastreador.mostrarEstatisticas();
	rl.close();
	} else if (opcao === '1') {
	rl.question('Qual matéria você vai estudar agora?', (respostaMateria) => {
		rl.question('Quantos minutos de foco?', (respostaTempo) => {
			const minutos = parseFloat(respostaTempo);
			const sessao = new SessaoDeEstudo(respostaMateria, minutos, meuRastreador);
			sessao.iniciar();
			rl.close();
			});
		});
	} else {
	console.log("Opção Inválida! Rode o comando novamente.");
	rl.close();
	}
});

