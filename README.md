# Simulador de Salário Líquido - CAIXA

Ferramenta interativa e independente para simulação e demonstração dos impactos financeiros da proposta apresentada na mesa de negociação da CAIXA (16/09/2026), abrangendo Remuneração, FUNCEF e novo custeio do Saúde CAIXA.

---

## 🌐 Deploy e Hospedagem (Vercel)

Este projeto está hospedado e integrado à **[Vercel](https://vercel.com)**:
- **Deploy Automático (CI/CD):** Cada commit enviado para a branch `main` no GitHub dispara automaticamente uma nova compilação e deploy em produção na Vercel.
- **Preview Deployments:** Pull requests e novas branches geram URLs de visualização prévia instantânea (*Instant Previews*).
- **Ambiente:** Aplicação Web estática de alto desempenho servida na infraestrutura de borda (Edge Network) da Vercel.

---

## 📊 Funcionalidades

- **Subsídio à Tomada de Decisão Coletiva (Aprovar vs. Rejeitar):**
  - **Matriz de Decisão Lado a Lado:** Apresentação clara e imparcial de ganhos, contrapartidas e riscos nos cenários de Aprovação e Rejeição do ACT.
  - **Balanço Anual Consolidado (12 Meses):** Equação completa somando 12 salários, 13º salário, 1/3 constitucional de férias, 13 parcelas de VA/VR reajustadas (livres de imposto) e as 13 mensalidades oficiais do Saúde CAIXA.
  - **Termômetro da Decisão no Bolso:** Indicador visual inteligente (Saldo Positivo, Zona de Alerta/Empate, Saldo Negativo) demonstrando se a proposta gera ganho ou perda patrimonial no ano.
  - **Simulação Rápida por Perfis (Personas):** 1 clique para carregar cenários típicos (*Novo/Solteiro*, *Família Direta*, *Filhos Universitários*, *Aposentado/Pensionista*).
- **Cálculo de Remuneração e Reajuste:**
  - Aplicação de INPC (4,00%) e Ganho Real (0,60%) sobre o Salário Base e Funções Gratificadas.
  - Seleção rápida de faixas salariais (5k a 30k).
- **Deduções Obrigatórias e Oficiais:**
  - **INSS:** Tabela progressiva oficial com aplicação de teto.
  - **IRRF:** Tabela progressiva com dedução por dependentes e previdência, aplicando a opção mais vantajosa (Dedução Legal vs. Desconto Simplificado).
- **FUNCEF Customizável:**
  - Ajuste dinâmico de alíquota contributiva (0% a 16%), com alerta de trava legal de 12% para dedução tributária.
- **Saúde CAIXA (Novo Custeio):**
  - Mensalidade titular de 3,7%, dependentes diretos a R$ 560 com trava de 9% da remuneração e piso de R$ 50 para excedentes.
  - Dependentes indiretos 21-24 anos (R$ 660) e especiais (R$ 900) fora do teto familiar.
  - 13 mensalidades anuais (12 regulares + 13º salário).
- **Design Responsivo & Compartilhamento:**
  - Interface moderna adaptada para celulares e computadores com botão de "Copiar Demonstrativo" pronto para grupos de WhatsApp.

---

## 🛠️ Tecnologias & Estrutura
 
- **Estrutura Modular e Limpa:**
  - `index.html`: Marcação semântica e interface responsiva.
  - `style.css`: Estilização e regras de input personalizadas.
  - `app.js`: Engine reativa de cálculos e simulações financeiras.
- **Tailwind CSS (CDN):** Estilização utilitária de alta performance.
- **Font Awesome:** Iconografia profissional.
- **Vercel:** Hospedagem na borda (Edge Network) e CI/CD contínuo a cada commit na branch `main`.

---

## 🚀 Como Executar Localmente

Como o projeto é uma SPA (Single Page Application) estática, basta abrir o arquivo diretamente no navegador:

```bash
# Clone o repositório
git clone https://github.com/econs1312/SimuladorCaixa.git

# Acesse a pasta
cd SimuladorCaixa

# Abra o arquivo index.html no seu navegador preferido
# No Windows (PowerShell):
Start-Process index.html
```

---

## 📚 Fontes Oficiais e Bases Informativas Consultadas

Os dados e coeficientes aplicados nesta ferramenta foram auditados e cruzados entre os canais oficiais da CAIXA, das entidades sindicais e das tabelas públicas federais, garantindo total convergência:

1. **[CAIXA Notícias](https://caixanoticias.caixa.gov.br/Paginas/Not%C3%ADcias/2026/09-SETEMBRO/Saude-CAIXA-confira-os-avancos-da-nova-proposta.aspx)** (Portal Oficial de Comunicação da CAIXA):
   - Comunicado oficial *"Saúde CAIXA: confira os avanços da nova proposta"* e portal da [Negociação Coletiva 2026](https://caixanoticias.caixa.gov.br/negociacaocoletiva).
   - Confirmação dos parâmetros institucionais:
     - **Mensalidade única do Titular:** 3,7% da remuneração base tanto para empregados da ativa quanto para aposentados (pacto intergeracional).
     - **Dependentes diretos:** R$ 560,00 fixo por dependente (independente da idade).
     - **Teto do grupo familiar:** 9% da remuneração base.
     - **Dependentes indiretos e especiais fora do teto:** Filhos de 21 a 24 anos (R$ 660,00) e pais/judiciais/24-27 anos (R$ 900,00).
     - **13 Mensalidades ao ano:** Cobrança mantida de 13 mensalidades anuais (12 regulares + 13º salário).
     - **Coparticipação anual:** Teto máximo reduzido de R$ 4.800 para R$ 4.700/ano.
     - **Pronto-socorro:** Redução da coparticipação em atendimentos de emergência de R$ 150 para R$ 120.
     - **Telemedicina:** 100% isenta de coparticipação.
     - **Custeio CAIXA:** Limite de participação do banco elevado para até 9% da folha de pagamento.
     - **Investimento em prevenção:** R$ 236 milhões em 2027.
     - **Adesão e permanência:** Regra mantida com vedação de reingresso ao plano após cancelamento.

2. **[CONTRAF-CUT](https://contrafcut.com.br)** (Confederação Nacional dos Trabalhadores do Ramo Financeiro):
   - Relatórios da CEE/Caixa (Comissão Executiva dos Empregados da CAIXA).
   - Cláusulas econômicas do ACT (reajuste salarial com reposição de 100% do INPC + 0,60% de aumento real).
3. **[FENAE](https://fenae.org.br)** (Federação Nacional das Associações do Pessoal da CAIXA) & **APCEFs**:
   - Parâmetros do Saúde CAIXA e modelo de sustentabilidade solidária sem discriminação por idade.
   - Elevação do teto de custeio patronal da CAIXA de 6,5% para 9% da folha a partir de 2027.
   - Assunção integral do déficit financeiro de 2026 pela CAIXA.
3. **[SPBancários](https://spbancarios.com.br)** (Sindicato dos Bancários de São Paulo, Osasco e Região):
   - Detalhamento de valores da proposta de 17/09/2026:
     - Titular: **3,7%** da remuneração base.
     - Dependentes diretos (cônjuge e filhos < 21 anos): **R$ 560,00** (sujeitos ao teto familiar de 9%).
     - Dependentes indiretos (filhos 21 a 24 anos): **R$ 660,00** (fora do teto familiar).
     - Filhos de 24 a 27 anos, pais e dependentes judiciais: **R$ 900,00** (fora do teto).
     - Regra da trava de **9% da remuneração base** para o grupo familiar com taxa mínima de **R$ 50,00 por dependente excedente**.
     - Redução do pronto atendimento de R$ 150 para R$ 120.
4. **Federações e Sindicatos Regionais** (SintrafPCR, Bahia/Feira, Paraná, Rio de Janeiro):
   - Boletins deliberativos de assembleias e análises atuariais convergentes.
5. **Legislação Tributária e Previdenciária Oficial:**
   - **INSS:** Tabela progressiva do RGPS (Portaria Interministerial MPS/MF nº 2/2024, teto de R$ 7.786,02).
   - **IRRF:** Tabela progressiva com Desconto Simplificado Mensal (R$ 564,80) vs. Deduções Legais (R$ 189,59/dependente) conforme Lei nº 14.848/2024 e Lei nº 9.250/1995.
   - **Previdência Complementar (FUNCEF):** Limite legal de dedutibilidade de 12% da remuneração bruta na fonte (Lei nº 9.532/1997, art. 11).

---

## ⚖️ Isenção de Responsabilidade

Esta ferramenta é uma simulação independente de caráter estritamente elucidativo. Os valores exatos podem sofrer variações conforme rubricas particulares, histórico funcional e enquadramentos regulamentares específicos de cada empregado.
