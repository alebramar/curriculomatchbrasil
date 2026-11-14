# CurrículoMatch

Aplicação web que utiliza inteligência artificial para analisar a compatibilidade entre currículos e vagas de emprego, ajudando candidatos a melhorar seus currículos para sistemas de triagem automatizada (ATS).

## 1. Funcionalidades

- Análise de compatibilidade entre currículo e vaga.
- Identificação de palavras-chave encontradas e ausentes.
- Sugestões de melhoria.
- Geração de currículo otimizado para a vaga.
- Edição e exportação do currículo em PDF.

## 2. Como funciona

O usuário cola a descrição da vaga e o conteúdo do currículo. A inteligência artificial compara os requisitos da oportunidade com as qualificações apresentadas.

A aplicação apresenta um índice estimado de compatibilidade, palavras-chave, sugestões e uma versão otimizada do currículo.

O índice considera os requisitos essenciais com peso dobrado em relação aos desejáveis.

**Regra fundamental:** a aplicação não deve inventar experiências, habilidades, formação ou qualificações. Requisitos não comprovados são apresentados como lacunas, sem serem acrescentados ao currículo.

## 3. Mega prompt utilizado

O desenvolvimento foi orientado por um mega prompt que definiu:

- Público-alvo geral, abrangendo candidatos de diferentes profissões.
- Interface simples, responsiva e em português brasileiro.
- Uma única página, sem cadastro ou login.
- Análise de compatibilidade utilizando inteligência artificial.
- Apresentação dos quatro resultados principais.
- Edição e exportação do currículo em PDF.
- Identidade visual em azul-marinho, verde, cinza-claro e branco.
- Ausência de armazenamento persistente dos dados dos usuários.
- Preservação da veracidade das informações profissionais.

## 4. Ajustes após a primeira geração

Não foram necessárias solicitações posteriores de alteração do código após a geração inicial. A aplicação foi testada e publicada com as funcionalidades previstas.

## 5. Testes realizados

Foi realizada uma análise completa com uma vaga e um currículo de exemplo.

Os testes confirmaram:

- Análise com IA funcionando.
- Exibição dos quatro resultados, incluindo índice de 54% e seis sugestões no exemplo.
- Identificação de qualificações ausentes sem inventar informações.
- Edição e exportação do currículo em PDF.
- PDF com texto selecionável e layout de uma coluna.
- Adaptação da tela inicial para dispositivos móveis.

A tela de resultados em celular e as mensagens de erro para indisponibilidade do serviço de IA ainda não foram testadas.

## 6. Aplicação publicada

https://curriculomatchbrasil.lovable.app/

## 7. Código-fonte

https://github.com/alebramar/curriculomatchbrasil

---

Projeto acadêmico — MVP CurrículoMatch.
