import React from "react";

const beneficios = [
	{
		nivel: "Apoiador Bronze",
		vantagens: ["Acesso a lives exclusivas", "Emblema especial no chat"],
	},
	{
		nivel: "Apoiador Prata",
		vantagens: [
			"Todos os benefícios Bronze",
			"Sorteios mensais",
			"Prioridade em perguntas",
		],
	},
	{
		nivel: "Apoiador Ouro",
		vantagens: [
			"Todos os benefícios Prata",
			"Meet & Greet virtual",
			"Conteúdo antecipado",
		],
	},
];

const perguntas = [
	{
		pergunta: "Como me tornar um apoiador?",
		resposta: "Basta se cadastrar na página de apoiador e escolher seu plano.",
	},
	{
		pergunta: "Quais são os benefícios de cada nível?",
		resposta: "Veja a tabela de benefícios abaixo para detalhes de cada nível.",
	},
	{
		pergunta: "Posso mudar de nível depois?",
		resposta: "Sim, você pode alterar seu plano a qualquer momento nas configurações.",
	},
];

export default function FAQ() {
	return (
		<main className="min-h-screen bg-gray-50 py-8 px-4">
			<h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
				Perguntas Frequentes (FAQ)
			</h1>
			<section className="max-w-2xl mx-auto mb-10">
				<ul className="space-y-6">
					{perguntas.map((p, idx) => (
						<li key={idx} className="bg-white rounded-lg shadow p-6">
							<h2 className="text-lg font-semibold text-indigo-600 mb-2">
								{p.pergunta}
							</h2>
							<p className="text-gray-700">{p.resposta}</p>
						</li>
					))}
				</ul>
			</section>
			<section className="max-w-2xl mx-auto">
				<h2 className="text-xl font-semibold text-indigo-600 mb-4">
					Tabela de Benefícios
				</h2>
				<table className="w-full bg-white rounded-lg shadow-md overflow-hidden mb-10">
					<thead className="bg-indigo-100">
						<tr>
							<th className="py-3 px-4 text-left">Nível</th>
							<th className="py-3 px-4 text-left">Benefícios</th>
						</tr>
					</thead>
					<tbody>
						{beneficios.map((b, idx) => (
							<tr key={idx} className="border-b last:border-none">
								<td className="py-3 px-4 font-bold text-indigo-700">
									{b.nivel}
								</td>
								<td className="py-3 px-4">
									<ul className="list-disc ml-4">
										{b.vantagens.map((v, i) => (
											<li key={i}>{v}</li>
										))}
									</ul>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</section>
			<div className="mt-10 text-center text-gray-500">
				<p>Se ainda tiver dúvidas, entre em contato com nosso suporte!</p>
			</div>
		</main>
	);
}
