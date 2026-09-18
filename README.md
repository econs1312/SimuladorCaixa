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

- **Cálculo de Remuneração e Reajuste:**
  - Aplicação de INPC e Ganho Real sobre o Salário Base e Função/Cargo em Comissão.
  - Seleção rápida de faixas salariais comuns.
- **Deduções Obrigatórias e Oficiais:**
  - **INSS:** Tabela progressiva oficial com aplicação de teto.
  - **IRRF:** Tabela progressiva com dedução por dependentes e previdência, aplicando a opção mais vantajosa (Dedução Legal vs. Desconto Simplificado).
- **FUNCEF Customizável:**
  - Ajuste dinâmico de alíquota contributiva (0% a 12%+).
- **Saúde CAIXA (Novo Custeio):**
  - Simulação da mensalidade titular e dependentes conforme as diretrizes negociadas.
- **Análise de Ganho Real Efetivo:**
  - Comparativo detalhado entre o cenário atual e o novo custeio proposto ("Hoje" vs. "Novo Custeio"), demonstrando se há ganho real líquido ou corrosão da recomposição inflacionária.
- **Design Responsivo:**
  - Interface moderna otimizada para desktops, tablets e smartphones.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 & Vanilla JavaScript:** Lógica de cálculo reativa sem necessidade de build complexo.
- **Tailwind CSS (CDN):** Estilização moderna e layout responsivo.
- **Font Awesome:** Ícones visuais para melhor usabilidade.
- **Vercel:** Hospedagem e automação de deploy contínuo.

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

## ⚖️ Isenção de Responsabilidade

Esta ferramenta é uma simulação independente de caráter estritamente elucidativo. Os valores exatos podem sofrer variações conforme rubricas particulares, histórico funcional e enquadramentos regulamentares específicos de cada empregado.
