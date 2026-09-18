# Contexto do Projeto para Agentes de IA

## Visão Geral
- **Nome:** Simulador de Salário Líquido CAIXA
- **Finalidade:** Simular o impacto financeiro líquido da proposta de negociação coletiva da CAIXA (16/09/2026), calculando reajuste salarial, INPC, ganho real, descontos de INSS e IRRF progressivos, previdência complementar FUNCEF e o novo modelo de custeio do Saúde CAIXA.

## Infraestrutura & Hospedagem
- **Hospedagem:** O projeto está implantado e hospedado na **Vercel** (`econs1312-2959's projects`).
- **CI/CD Automático:** O repositório GitHub (`econs1312/SimuladorCaixa`) está conectado à Vercel. Qualquer commit ou push para a branch `main` dispara um deploy automático de produção na Vercel.
- **Ambiente:** Aplicação web estática (Single Page Application) servida diretamente via Edge Network da Vercel sem necessidade de servidor de backend ou etapa complexa de build (`index.html` servido na raiz).

## Arquitetura & Diretrizes de Código
- **Arquivo Principal:** `index.html` contém toda a estrutura semântica HTML, estilização via classes Tailwind CSS (carregado via CDN), ícones Font Awesome e os scripts JavaScript com a lógica de cálculo.
- **Responsividade:** O layout deve se manter perfeitamente adaptado para telas mobile e desktop.
- **Commits:** Mensagens de commit devem seguir o padrão Conventional Commits (ex.: `feat:`, `fix:`, `docs:`). Lembre-se de que pushes para a branch `main` refletem imediatamente em produção na Vercel.
