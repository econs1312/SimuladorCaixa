// =============================================================================
// Simulador de Salário Líquido CAIXA - Proposta 16/09/2026
// Engine de Cálculos Financeiros, Tributários e Previdenciários
// =============================================================================

// INSS Progressivo Oficial (Tabela Vigente)
function calcularInss(salario) {
  let imposto = 0;
  const f1 = 1412.00;
  const f2 = 2666.68;
  const f3 = 4000.03;
  const tetoRgps = 7786.02;

  if (salario <= f1) {
    imposto = salario * 0.075;
  } else if (salario <= f2) {
    imposto = (f1 * 0.075) + ((salario - f1) * 0.09);
  } else if (salario <= f3) {
    imposto = (f1 * 0.075) + ((f2 - f1) * 0.09) + ((salario - f2) * 0.12);
  } else if (salario <= tetoRgps) {
    imposto = (f1 * 0.075) + ((f2 - f1) * 0.09) + ((f3 - f2) * 0.12) + ((salario - f3) * 0.14);
  } else {
    imposto = (f1 * 0.075) + ((f2 - f1) * 0.09) + ((f3 - f2) * 0.12) + ((tetoRgps - f3) * 0.14);
  }
  return Math.round(imposto * 100) / 100;
}

// Faixas da Tabela Progressiva Mensal de IRRF
function calcularFaixasIrrf(base) {
  if (base <= 2259.20) return 0;
  if (base <= 2826.65) return (base * 0.075) - 169.44;
  if (base <= 3751.05) return (base * 0.15) - 381.44;
  if (base <= 4664.68) return (base * 0.225) - 662.77;
  return (base * 0.275) - 896.00;
}

// Cálculo Oficial de IRRF na Fonte com comparativo Legal vs. Desconto Simplificado (R$ 564,80)
// Conforme Lei 9.532/97 art. 11 (Teto 12% FUNCEF) e Lei 14.848/2024
function calcularIrrfOficial(salario, inss, funcef, numDepsIrrf) {
  const tetoFuncef12 = salario * 0.12;
  const funcefDedutivel = Math.min(funcef, tetoFuncef12);
  const deducaoDeps = numDepsIrrf * 189.59;

  // 1. Deduções Legais
  const baseLegal = Math.max(0, salario - inss - funcefDedutivel - deducaoDeps);
  const irrfLegal = Math.max(0, calcularFaixasIrrf(baseLegal));

  // 2. Desconto Simplificado Mensal (R$ 564,80)
  const baseSimplificada = Math.max(0, salario - 564.80);
  const irrfSimplificado = Math.max(0, calcularFaixasIrrf(baseSimplificada));

  if (irrfSimplificado < irrfLegal) {
    return {
      valor: Math.round(irrfSimplificado * 100) / 100,
      regime: 'simplificado',
      base: baseSimplificada,
      funcefDedutivel: funcefDedutivel,
      bateuTetoFuncef: funcef > tetoFuncef12
    };
  } else {
    return {
      valor: Math.round(irrfLegal * 100) / 100,
      regime: 'legal',
      base: baseLegal,
      funcefDedutivel: funcefDedutivel,
      bateuTetoFuncef: funcef > tetoFuncef12
    };
  }
}

function setSalario(val) {
  document.getElementById('salarioBase').value = val;
  recalcular();
}

function fmtMoeda(val) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function recalcular() {
  const salarioBase = parseFloat(document.getElementById('salarioBase').value) || 0;
  const inpc = (parseFloat(document.getElementById('taxaInpc').value) || 0) / 100;
  const taxaReal = (parseFloat(document.getElementById('taxaReal').value) || 0) / 100;
  const reajusteTotal = inpc + taxaReal;
  const salarioNovo = salarioBase * (1 + reajusteTotal);

  const aliquotaFuncef = (parseFloat(document.getElementById('aliquotaFuncef').value) || 0) / 100;
  const funcefPctTexto = (aliquotaFuncef * 100).toFixed(1);
  document.getElementById('funcefLabel').innerText = `${funcefPctTexto}%`;
  const outrosDesc = parseFloat(document.getElementById('outrosDescontos').value) || 0;

  const depDiretos = parseInt(document.getElementById('depDiretos').value) || 0;
  const depIndiretos = parseInt(document.getElementById('depIndiretos').value) || 0;
  const depEspeciais = parseInt(document.getElementById('depEspeciais').value) || 0;
  const depIndiretosUniv = document.getElementById('depIndiretosUniv') ? document.getElementById('depIndiretosUniv').checked : true;

  // Dependentes legais com dedução no IRRF (R$ 189,59/mês)
  // Diretos + Indiretos Universitários (Lei 9.250/95 art. 35)
  const depsParaIrrf = depDiretos + (depIndiretosUniv ? depIndiretos : 0);

  // ============================================
  // 1. CÁLCULO CENÁRIO HOJE
  // ============================================
  const inssHoje = calcularInss(salarioBase);
  const funcefHoje = salarioBase * aliquotaFuncef;

  // Saúde CAIXA Hoje: Titular 3,5% + R$ 480 por dependente direto (teto familiar de 7%)
  const titularHoje = salarioBase * 0.035;
  const depDiretoHoje = depDiretos * 480;
  const custoBaseDiretosHoje = titularHoje + depDiretoHoje;
  const tetoHoje = salarioBase * 0.07;

  let subtotalDiretosHoje = custoBaseDiretosHoje;
  let reducaoTetoHoje = 0;
  let bateuTetoHoje = false;

  if (depDiretos > 0 && custoBaseDiretosHoje > tetoHoje) {
    bateuTetoHoje = true;
    subtotalDiretosHoje = tetoHoje;
    reducaoTetoHoje = custoBaseDiretosHoje - tetoHoje;
  }

  const depForaHoje = (depIndiretos + depEspeciais) * 480;
  const totalSaudeHoje = subtotalDiretosHoje + depForaHoje;

  // IRRF Hoje oficial
  const irrfInfoHoje = calcularIrrfOficial(salarioBase, inssHoje, funcefHoje, depsParaIrrf);
  const irrfHoje = irrfInfoHoje.valor;

  const totalDescontosHoje = inssHoje + funcefHoje + subtotalDiretosHoje + depForaHoje + irrfHoje + outrosDesc;
  const liquidoHoje = salarioBase - totalDescontosHoje;

  // ============================================
  // 2. CÁLCULO CENÁRIO PROPOSTA NOVA COM REGRA DO TETO 9% E EXCEDENTES
  // ============================================
  const inssNovo = calcularInss(salarioNovo);
  const funcefNovo = salarioNovo * aliquotaFuncef;

  const titularNovo = salarioNovo * 0.037;
  const tetoNovo = salarioNovo * 0.09;
  const depDiretoNovo = depDiretos * 560;
  const custoBaseDiretosNovo = titularNovo + depDiretoNovo;

  let subtotalDiretosNovo = custoBaseDiretosNovo;
  let reducaoTetoNovo = 0;
  let bateuTetoNovo = false;
  let depsExcedentesNovo = 0;

  if (depDiretos === 0) {
    subtotalDiretosNovo = titularNovo;
  } else if (custoBaseDiretosNovo <= tetoNovo) {
    // Abaixo do teto, com garantia de piso de R$ 50 por vida
    subtotalDiretosNovo = Math.max(custoBaseDiretosNovo, (1 + depDiretos) * 50);
  } else {
    bateuTetoNovo = true;
    const margemDep = Math.max(0, tetoNovo - titularNovo);
    // Quantos dependentes diretos cabem inteiramente na margem até o teto de 9%
    const depsAteTeto = Math.min(depDiretos, Math.floor(margemDep / 560));
    // Dependentes que não couberam inteiramente pagam o piso de R$ 50
    depsExcedentesNovo = Math.max(0, depDiretos - depsAteTeto);
    
    // Custo no teto de 9% + R$ 50 por dependente excedente
    const custoComTeto = tetoNovo + (depsExcedentesNovo * 50);
    // A trava nunca pode cobrar mais do que o custo original sem teto
    subtotalDiretosNovo = Math.min(custoBaseDiretosNovo, custoComTeto);
    reducaoTetoNovo = Math.max(0, custoBaseDiretosNovo - subtotalDiretosNovo);
  }

  const depForaNovo = (depIndiretos * 660) + (depEspeciais * 900);
  const totalSaudeNovo = subtotalDiretosNovo + depForaNovo;

  // IRRF Novo oficial
  const irrfInfoNovo = calcularIrrfOficial(salarioNovo, inssNovo, funcefNovo, depsParaIrrf);
  const irrfNovo = irrfInfoNovo.valor;

  const totalDescontosNovo = inssNovo + funcefNovo + subtotalDiretosNovo + depForaNovo + irrfNovo + outrosDesc;
  const liquidoNovo = salarioNovo - totalDescontosNovo;

  // ============================================
  // 3. DIFERENÇAS E VARIAÇÕES
  // ============================================
  const difBruto = salarioNovo - salarioBase;
  const difLiquido = liquidoNovo - liquidoHoje;
  const difPlano = totalSaudeNovo - totalSaudeHoje;

  // Atualização dos Cards Rápidos
  document.getElementById('cardLiqHoje').innerText = fmtMoeda(liquidoHoje);
  document.getElementById('cardDescontosHojePct').innerText = `${((totalDescontosHoje / salarioBase) * 100).toFixed(1)}% descontado em folha`;

  document.getElementById('cardLiqNovo').innerText = fmtMoeda(liquidoNovo);
  document.getElementById('cardDescontosNovoPct').innerText = `${((totalDescontosNovo / salarioNovo) * 100).toFixed(1)}% descontado em folha`;

  // Atualização da Tabela de Folha
  document.getElementById('tbSalHoje').innerText = fmtMoeda(salarioBase);
  document.getElementById('tbSalNovo').innerText = fmtMoeda(salarioNovo);
  document.getElementById('tbSalDif').innerText = `+${fmtMoeda(difBruto)}`;

  document.getElementById('tbInssHoje').innerText = fmtMoeda(inssHoje);
  document.getElementById('tbInssNovo').innerText = fmtMoeda(inssNovo);
  document.getElementById('tbInssDif').innerText = (inssNovo - inssHoje >= 0 ? '+' : '') + fmtMoeda(inssNovo - inssHoje);

  document.getElementById('tbFuncefHoje').innerText = fmtMoeda(funcefHoje);
  document.getElementById('tbFuncefNovo').innerText = fmtMoeda(funcefNovo);
  document.getElementById('tbFuncefDif').innerText = `+${fmtMoeda(funcefNovo - funcefHoje)}`;
  
  let funcefSubMsg = `${funcefPctTexto}% sobre remuneração`;
  if (aliquotaFuncef > 0.12) {
    funcefSubMsg += ' • Dedução IRRF limitada a 12% (Lei 9.532/97)';
  }
  document.getElementById('tbFuncefPctInfo').innerText = funcefSubMsg;

  // Saúde CAIXA Diretos (Titular + Dependentes Diretos)
  const difDiretos = subtotalDiretosNovo - subtotalDiretosHoje;
  document.getElementById('tbSaudeDiretosHoje').innerText = fmtMoeda(subtotalDiretosHoje);
  document.getElementById('tbSaudeDiretosNovo').innerText = fmtMoeda(subtotalDiretosNovo);
  const elSaudeDiretosDif = document.getElementById('tbSaudeDiretosDif');
  elSaudeDiretosDif.innerText = (difDiretos >= 0 ? '+' : '') + fmtMoeda(difDiretos);
  elSaudeDiretosDif.className = `p-3 text-right font-bold ${difDiretos > 0 ? 'text-rose-600' : (difDiretos < 0 ? 'text-emerald-600' : 'text-slate-500')}`;

  let travaMsg = '';
  if (depDiretos === 0) {
    travaMsg = 'Titular (Hoje: 3,5% • Novo: 3,7%) sem dependentes diretos';
  } else if (bateuTetoNovo) {
    if (depsExcedentesNovo > 0) {
      travaMsg = `Limitado ao teto de 9,0% (${fmtMoeda(tetoNovo)}) + ${depsExcedentesNovo} excedente(s) a R$ 50 cada (Sem teto seria ${fmtMoeda(custoBaseDiretosNovo)} • Economia do teto: ${fmtMoeda(reducaoTetoNovo)})`;
    } else {
      travaMsg = `Limitado à trava do teto de 9,0% (Sem teto seria ${fmtMoeda(custoBaseDiretosNovo)} • Economia do teto: ${fmtMoeda(reducaoTetoNovo)})`;
    }
  } else {
    if (reducaoTetoHoje > 0) {
      travaMsg = `Hoje limitado a 7% (${fmtMoeda(tetoHoje)}). No novo modelo, dentro do teto de 9% (${fmtMoeda(tetoNovo)}).`;
    } else {
      travaMsg = `Titular (3,7%) + ${depDiretos} dep. direto(s) (R$ 560 cada), dentro da trava do teto de 9,0%.`;
    }
  }
  document.getElementById('tbTravaTetoMsg').innerText = travaMsg;

  document.getElementById('tbSaudeForaHoje').innerText = fmtMoeda(depForaHoje);
  document.getElementById('tbSaudeForaNovo').innerText = fmtMoeda(depForaNovo);
  document.getElementById('tbSaudeForaDif').innerText = (depForaNovo - depForaHoje >= 0 ? '+' : '') + fmtMoeda(depForaNovo - depForaHoje);

  document.getElementById('tbIrrfHoje').innerText = fmtMoeda(irrfHoje);
  document.getElementById('tbIrrfNovo').innerText = fmtMoeda(irrfNovo);
  document.getElementById('tbIrrfDif').innerText = (irrfNovo - irrfHoje >= 0 ? '+' : '') + fmtMoeda(irrfNovo - irrfHoje);

  let irrfDescMsg = '';
  if (irrfInfoNovo.regime === 'simplificado') {
    irrfDescMsg = 'Desconto Simplificado de R$ 564,80 aplicado (mais vantajoso)';
  } else {
    irrfDescMsg = `Deduções Legais (INSS, FUNCEF e ${fmtMoeda(depsParaIrrf * 189.59)} de ${depsParaIrrf} dependente(s))`;
  }
  document.getElementById('tbIrrfDeducaoMsg').innerText = irrfDescMsg;

  document.getElementById('tbOutrosHoje').innerText = fmtMoeda(outrosDesc);
  document.getElementById('tbOutrosNovo').innerText = fmtMoeda(outrosDesc);

  const elLiqDif = document.getElementById('tbTotalLiqDif');
  document.getElementById('tbTotalLiqHoje').innerText = fmtMoeda(liquidoHoje);
  document.getElementById('tbTotalLiqNovo').innerText = fmtMoeda(liquidoNovo);
  elLiqDif.innerText = (difLiquido >= 0 ? '+' : '') + fmtMoeda(difLiquido);
  elLiqDif.className = `p-3 text-right font-extrabold ${difLiquido >= 0 ? 'text-emerald-700' : 'text-rose-700'}`;

  // Diagnóstico com Regra Estrita de Ganho Real
  aplicarDiagnosticoEstrito(salarioBase, difLiquido, difPlano, inpc, taxaReal, salarioNovo, liquidoHoje, liquidoNovo);
}

function aplicarDiagnosticoEstrito(salarioBase, difLiquido, difPlano, inpc, taxaReal, salarioNovo, liquidoHoje, liquidoNovo) {
  const card = document.getElementById('verdictCard');
  const badge = document.getElementById('verdictBadge');
  const title = document.getElementById('verdictTitle');
  const desc = document.getElementById('verdictDesc');
  const icon = document.getElementById('verdictIcon');
  const cardDif = document.getElementById('cardDiferencaLiq');
  const cardDifPct = document.getElementById('cardDiferencaPct');

  const impactoPlanoPp = (difPlano / salarioBase) * 100;
  const taxaRealPp = taxaReal * 100;
  const inpcPp = inpc * 100;
  const reajusteBrutoPp = taxaRealPp + inpcPp;

  const difLiquidoPct = liquidoHoje > 0 ? ((difLiquido / liquidoHoje) * 100) : 0;

  // Atualiza o Card 3 (Variação Líquida Mensal)
  cardDif.innerText = (difLiquido >= 0 ? '+' : '') + fmtMoeda(difLiquido);
  cardDif.className = `text-lg font-extrabold mt-1 ${difLiquido >= 0 ? 'text-emerald-700' : 'text-rose-700'}`;
  cardDifPct.innerText = `${difLiquido >= 0 ? '+' : ''}${difLiquidoPct.toFixed(2)}% no líquido`;
  cardDifPct.className = `text-xs font-bold ${difLiquido >= 0 ? 'text-emerald-700' : 'text-rose-700'}`;

  if (impactoPlanoPp < taxaRealPp) {
    const ganhoRealRemanescentePp = taxaRealPp - impactoPlanoPp;
    const valorGanhoReal = salarioBase * (ganhoRealRemanescentePp / 100);

    card.className = "rounded-2xl p-6 border shadow-sm bg-emerald-50/70 border-emerald-300";
    badge.className = "text-xs font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-200 text-emerald-900";
    badge.innerText = "Ganho Real Preservado";
    title.className = "text-2xl font-black mt-2 text-emerald-950";
    title.innerText = `Ganho Real Efetivo: +${ganhoRealRemanescentePp.toFixed(2)} p.p.`;
    icon.className = "text-3xl text-emerald-600";
    icon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
    desc.innerText = `O reajuste cobriu com folga o aumento do Saúde CAIXA (+${impactoPlanoPp.toFixed(2)} p.p. da remuneração). A reposição integral da inflação (${inpcPp.toFixed(2)}% do INPC) foi mantida e ainda resta um ganho real líquido positivo estimado em ${fmtMoeda(valorGanhoReal)}/mês no seu poder de compra.`;

  } else if (difLiquido > 0) {
    const corrosaoInpcPp = Math.min(inpcPp, impactoPlanoPp - taxaRealPp);
    const perdaInflacionariaMensal = salarioBase * (corrosaoInpcPp / 100);

    card.className = "rounded-2xl p-6 border shadow-sm bg-amber-50/80 border-amber-300";
    badge.className = "text-xs font-extrabold uppercase px-2.5 py-1 rounded-md bg-amber-200 text-amber-900";
    badge.innerText = "Ganho Real Anulado (0,00%)";
    title.className = "text-2xl font-black mt-2 text-amber-950";
    title.innerText = "Sem Aumento Real • Corrosão do INPC";
    icon.className = "text-3xl text-amber-600";
    icon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
    desc.innerText = `O aumento do Saúde CAIXA (+${impactoPlanoPp.toFixed(2)} p.p.) superou totalmente os ${taxaRealPp.toFixed(2)}% de aumento real, zerando o ganho no poder de compra. Embora seu contracheque nominal receba ${fmtMoeda(difLiquido)} a mais, o plano confiscou ${corrosaoInpcPp.toFixed(2)} p.p. da reposição da inflação (${fmtMoeda(perdaInflacionariaMensal)}/mês que deveriam repor o custo de vida).`;

  } else {
    const perdaLiquida = Math.abs(difLiquido);

    card.className = "rounded-2xl p-6 border shadow-sm bg-rose-50/80 border-rose-300";
    badge.className = "text-xs font-extrabold uppercase px-2.5 py-1 rounded-md bg-rose-200 text-rose-900";
    badge.innerText = "Prejuízo Líquido";
    title.className = "text-2xl font-black mt-2 text-rose-950";
    title.innerText = "Perda Nominal no Bolso";
    icon.className = "text-3xl text-rose-600";
    icon.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
    desc.innerText = `Todo o reajuste salarial concedido (${reajusteBrutoPp.toFixed(2)}%) foi insuficiente para pagar a nova tabela do plano de saúde. O seu salário líquido no bolso encolhe ${fmtMoeda(perdaLiquida)} por mês a partir de 2027.`;
  }
}

function copiarResumo() {
  const sal = document.getElementById('salarioBase').value;
  const liqH = document.getElementById('cardLiqHoje').innerText;
  const liqN = document.getElementById('cardLiqNovo').innerText;
  const dif = document.getElementById('cardDiferencaLiq').innerText;
  const difPct = document.getElementById('cardDiferencaPct').innerText;
  const verdict = document.getElementById('verdictTitle').innerText;
  const funcef = document.getElementById('funcefLabel').innerText;

  const msg = `*Simulação de Contracheque CAIXA (Líquido)*\n` +
              `• Salário Base: R$ ${sal}\n` +
              `• Contribuição FUNCEF: ${funcef}\n` +
              `• Líquido Atual: ${liqH}\n` +
              `• Líquido com Novo Custeio: ${liqN}\n` +
              `• Variação no Bolso: ${dif}/mês (${difPct})\n` +
              `• Parecer Econômico: ${verdict}\n\n` +
              `ℹ️ _Simulação independente para fins exclusivamente elucidativos baseada na proposta CAIXA de 16/09/2026._`;

  navigator.clipboard.writeText(msg).then(() => {
    alert('Resumo copiado com sucesso com a nota elucidativa de 16/09/2026 inclusa!');
  });
}

window.onload = function() {
  recalcular();
};
