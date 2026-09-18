# Contexto do Projeto para Agentes de IA

## Visão Geral
- **Nome:** Simulador de Salário Líquido CAIXA
- **Finalidade:** Simular o impacto financeiro líquido da proposta de negociação coletiva da CAIXA (16/09/2026), calculando reajuste salarial, INPC, ganho real, descontos de INSS e IRRF progressivos, previdência complementar FUNCEF e o novo modelo de custeio do Saúde CAIXA.

## Infraestrutura & Hospedagem
- **Hospedagem:** O projeto está implantado e hospedado na **Vercel** (`econs1312-2959's projects`).
- **CI/CD Automático:** O repositório GitHub (`econs1312/SimuladorCaixa`) está conectado à Vercel. Qualquer commit ou push para a branch `main` dispara um deploy automático de produção na Vercel.
- **Ambiente:** Aplicação web estática (Single Page Application) servida diretamente via Edge Network da Vercel sem necessidade de servidor de backend ou etapa complexa de build (`index.html` servido na raiz).

## Arquitetura & Diretrizes de Código
- **Estrutura HTML:** `index.html` contém a estrutura semântica HTML, marcação com classes Tailwind CSS (carregado via CDN) e ícones Font Awesome.
- **Estilos:** `style.css` contém os ajustes e estilos CSS customizados.
- **Lógica e Cálculos:** `app.js` contém a engine completa de cálculos salariais, tributários (INSS, IRRF) e previdenciários (FUNCEF, Saúde CAIXA), além da manipulação reativa do DOM.
- **Responsividade:** O layout deve se manter perfeitamente adaptado para telas mobile e desktop.
- **Commits:** Mensagens de commit devem seguir o padrão Conventional Commits (ex.: `feat:`, `fix:`, `docs:`). Lembre-se de que pushes para a branch `main` refletem imediatamente em produção na Vercel.

---

## 📚 Fontes Oficiais & Referências para Novas Rodadas de Negociação

Sempre que houver uma **nova rodada de negociação**, alteração de proposta, assembleia ou atualização de tabelas federais, os agentes de IA **DEVEM** consultar as seguintes fontes para atualizar coeficientes, alíquotas e diretrizes:

### 1. Comunicação Institucional da CAIXA (Fonte Patronal Oficial)
- **Portal CAIXA Notícias - Negociação Coletiva:**  
  `https://caixanoticias.caixa.gov.br/negociacaocoletiva`
- **CAIXA Notícias - Notícia do Saúde CAIXA (Avanços da Proposta):**  
  `https://caixanoticias.caixa.gov.br/Paginas/Not%C3%ADcias/2026/09-SETEMBRO/Saude-CAIXA-confira-os-avancos-da-nova-proposta.aspx`
- **Portal Institucional CAIXA:**  
  `https://www.caixa.gov.br`
- **O que verificar:** Notas oficiais da direção, comunicados da mesa de negociação, alíquotas de mensalidade para ativos e aposentados, valores de dependentes diretos e indiretos, teto estatutário do banco (ex.: 9%), regras de coparticipação (teto anual e pronto-socorro), telemedicina, 13 mensalidades e regras de adesão/cancelamento.

### 2. Entidades Representativas dos Trabalhadores (Comando Sindical)
- **CONTRAF-CUT (Confederação Nacional dos Trabalhadores do Ramo Financeiro):**  
  `https://contrafcut.com.br`  
  *Foco:* Relatórios da CEE/Caixa (Comissão Executiva dos Empregados da CAIXA), minutas do Acordo Coletivo de Trabalho (ACT), cláusulas econômicas (reposição do INPC, ganho real e reajuste de benefícios como VA/VR).
- **FENAE (Federação Nacional das Associações do Pessoal da CAIXA) & APCEFs:**  
  `https://fenae.org.br`  
  *Foco:* Análises atuariais e modelos de sustentabilidade do Saúde CAIXA, pacto intergeracional (sem cobrança por faixa etária), cobertura do déficit financeiro de 2026 e defesa das condições dos aposentados.
- **SPBancários (Sindicato dos Bancários de São Paulo, Osasco e Região):**  
  `https://spbancarios.com.br`  
  *Foco:* Tabelas detalhadas de cada proposta, valores absolutos por dependente (R$ 560 diretos, R$ 660 filhos 21-24 anos, R$ 900 dependentes especiais), regras do teto de 9% e taxa mínima de R$ 50 para dependentes excedentes.
- **Federações e Sindicatos Regionais Complementares:**  
  - SINTRAFPCR (Curitiba e Região): `https://www.bancariosdecuritiba.org.br`
  - Federação dos Bancários da Bahia e Sergipe: `https://feebbase.org.br`
  - Sindicato dos Bancários do Rio de Janeiro: `https://bancariosrio.org.br`
  *Foco:* Deliberações de assembleias regionais e eventuais peculiaridades locais.

### 3. Legislação e Tabelas Oficiais Federais
- **Receita Federal do Brasil (IRRF):**  
  `https://www.gov.br/receitafederal`  
  *Foco:* Tabela progressiva mensal oficial do IRRF, valor do Desconto Simplificado Mensal (atualmente R$ 564,80 conforme Lei nº 14.848/2024), dedução por dependente legal (R$ 189,59) e regras para dependentes universitários até 24 anos (Lei nº 9.250/1995).
- **Ministério da Previdência Social / INSS:**  
  `https://www.gov.br/previdencia` / `https://www.gov.br/inss`  
  *Foco:* Portarias interministeriais anuais com as faixas progressivas do INSS e teto máximo do RGPS (ex.: Portaria MPS/MF nº 2/2024).
- **FUNCEF (Fundação dos Economiários Federais):**  
  `https://www.funcef.com.br`  
  *Foco:* Planos de benefícios (Novo Plano, REG/Replan Saldado e Não Saldado, REB), taxas contributivas e limite legal de 12% para dedução tributária no IRRF (Lei nº 9.532/1997, art. 11).

---

## 🛠️ Guia para o Agente em Eventuais Atualizações

1. **Checagem Cruzada:** Nunca adote uma informação sem antes cruzar a fonte patronal (CAIXA Notícias) com as fontes dos trabalhadores (CONTRAF-CUT / FENAE / SPBancários).
2. **Atualização do Código:**
   - Coeficientes salariais e parâmetros do plano: alterar em `app.js`.
   - Textos, legendas e tabelas informativas: atualizar em `index.html`.
3. **Auditoria Matemática:**
   - Execute sempre o teste de balanço com Node.js para garantir que `Remuneração Bruta - Soma dos Descontos === Salário Líquido no Bolso` com diferença de **R$ 0,00**.
4. **Deploy Automático:**
   - Faça o commit seguindo o padrão Conventional Commits (`feat: ...`, `fix: ...`) e dê push para a branch `main` no GitHub. O deploy na Vercel é instantâneo.
