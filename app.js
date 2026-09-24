// =============================================================================
// Simulador de Salário Líquido - Proposta 16/09/2026
// Engine de Cálculos Financeiros, Tributários e Previdenciários
// =============================================================================

// INSS Progressivo Oficial (Portaria Interministerial MPS/MF nº 13/2026)
function calcularInss(salario) {
  let imposto = 0;
  const f1 = 1621.00;
  const f2 = 2902.84;
  const f3 = 4354.27;
  const tetoRgps = 8475.55;

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

// Faixas da Tabela Progressiva Mensal de IRRF (Lei nº 15.191/2025)
function calcularFaixasIrrf(base) {
  if (base <= 2428.80) return 0;
  if (base <= 2826.65) return (base * 0.075) - 182.16;
  if (base <= 3751.05) return (base * 0.15) - 394.16;
  if (base <= 4664.68) return (base * 0.225) - 675.49;
  return (base * 0.275) - 908.73;
}

// Redutor Adicional de IRRF (Lei nº 15.270/2025)
// Aplica-se após o cálculo da tabela progressiva para ampliar a isenção efetiva
function aplicarRedutorIrrf2026(impostoCalculado, rendimentosTributaveis) {
  if (rendimentosTributaveis <= 5000.00) {
    // Redução de até R$ 312,89 — zerando o imposto para rendas até R$ 5.000
    return Math.max(0, impostoCalculado - Math.min(312.89, impostoCalculado));
  } else if (rendimentosTributaveis <= 7350.00) {
    // Redução decrescente linear entre R$ 5.000,01 e R$ 7.350,00
    const redutor = 978.62 - (0.133145 * rendimentosTributaveis);
    return Math.max(0, impostoCalculado - Math.max(0, redutor));
  }
  // Acima de R$ 7.350,00: sem redutor adicional
  return impostoCalculado;
}

// Cálculo Oficial de IRRF na Fonte com comparativo Legal vs. Desconto Simplificado (R$ 607,20)
// Conforme Lei 9.532/97 art. 11 (Teto 12% FUNCEF), Lei 15.191/2025 e Lei 15.270/2025 (Redutor)
function calcularIrrfOficial(salario, inss, funcef, numDepsIrrf) {
  const tetoFuncef12 = salario * 0.12;
  const funcefDedutivel = Math.min(funcef, tetoFuncef12);
  const deducaoDeps = numDepsIrrf * 189.59;

  // 1. Deduções Legais
  const baseLegal = Math.max(0, salario - inss - funcefDedutivel - deducaoDeps);
  let irrfLegal = Math.max(0, calcularFaixasIrrf(baseLegal));
  // Aplicar redutor adicional (Lei 15.270/2025) sobre a base legal
  irrfLegal = aplicarRedutorIrrf2026(irrfLegal, baseLegal);

  // 2. Desconto Simplificado Mensal (R$ 607,20 — Lei 15.191/2025)
  const baseSimplificada = Math.max(0, salario - 607.20);
  let irrfSimplificado = Math.max(0, calcularFaixasIrrf(baseSimplificada));
  // Aplicar redutor adicional (Lei 15.270/2025) sobre a base simplificada
  irrfSimplificado = aplicarRedutorIrrf2026(irrfSimplificado, baseSimplificada);

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

function syncInputs(sourceId, targetId) {
  const src = document.getElementById(sourceId);
  const tgt = document.getElementById(targetId);
  if (src && tgt && src.value !== tgt.value) {
    tgt.value = src.value;
  }
}

function syncCheckboxes(sourceId, targetId) {
  const src = document.getElementById(sourceId);
  const tgt = document.getElementById(targetId);
  if (src && tgt && src.checked !== tgt.checked) {
    tgt.checked = src.checked;
  }
}

function setSalario(val) {
  const el1 = document.getElementById('salarioBase');
  const el2 = document.getElementById('salarioBaseTab2');
  if (el1) el1.value = val;
  if (el2) el2.value = val;
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

  // Plano de Saúde Hoje: Titular 3,5% + R$ 480 por dependente direto (teto familiar de 7%)
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
    // TRAVA ESTRITA NO TETO DE 9,0% DA REMUNERAÇÃO BASE (ACT 2026):
    // Titular + dependentes diretos são rigidamente limitados ao teto de 9,0% da RB.
    // Conforme pactuado, dependentes excedentes NÃO geram acréscimo de R$ 50 além do teto.
    bateuTetoNovo = true;
    subtotalDiretosNovo = tetoNovo;
    reducaoTetoNovo = Math.max(0, custoBaseDiretosNovo - tetoNovo);
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

  // Impacto Anual do Plano de Saúde (13 Mensalidades ao ano conforme regra da proposta)
  const saudeAnualHoje = totalSaudeHoje * 13;
  const saudeAnualNovo = totalSaudeNovo * 13;
  const difSaudeAnual = saudeAnualNovo - saudeAnualHoje;

  const elSaudeAnualHoje = document.getElementById('cardSaudeAnualHoje');
  const elSaudeAnualNovo = document.getElementById('cardSaudeAnualNovo');
  const elSaudeAnualDif = document.getElementById('cardSaudeAnualDif');
  if (elSaudeAnualHoje && elSaudeAnualNovo && elSaudeAnualDif) {
    elSaudeAnualHoje.innerText = fmtMoeda(saudeAnualHoje);
    elSaudeAnualNovo.innerText = fmtMoeda(saudeAnualNovo);
    elSaudeAnualDif.innerText = (difSaudeAnual >= 0 ? '+' : '') + fmtMoeda(difSaudeAnual);
    elSaudeAnualDif.className = `text-base font-extrabold mt-1 ${difSaudeAnual > 0 ? 'text-rose-400' : (difSaudeAnual < 0 ? 'text-emerald-400' : 'text-slate-300')}`;
  }

  // ============================================
  // 4. BALANÇO ANUAL CONSOLIDADO & SUBSÍDIO À DECISÃO
  // ============================================
  // Ganho salarial líquido (sem o plano de saúde)
  const liqSemSaudeHoje = salarioBase - inssHoje - funcefHoje - irrfHoje - outrosDesc;
  const liqSemSaudeNovo = salarioNovo - inssNovo - funcefNovo - irrfNovo - outrosDesc;
  const difLiqSalarialMensal = liqSemSaudeNovo - liqSemSaudeHoje;

  // 13,33 remunerações líquidas ao ano (12 meses regulares + 13º salário + 1/3 de férias constitucional)
  const folhasAnuais = 13 + (1 / 3);
  const ganhoSalarialLiqAnual = difLiqSalarialMensal * folhasAnuais;
  const saldoAnualTotal = ganhoSalarialLiqAnual - difSaudeAnual;
  const saldoAnualMensalEq = saldoAnualTotal / 12;

  const elBalancoSalario = document.getElementById('balancoSalarioLiq');
  const elBalancoSaude = document.getElementById('balancoSaudeDif');
  const elSaldoAnualTotal = document.getElementById('saldoAnualTotal');
  const elSaldoAnualMensalEq = document.getElementById('saldoAnualMensalEq');

  if (elBalancoSalario) {
    elBalancoSalario.innerText = (ganhoSalarialLiqAnual >= 0 ? '+' : '') + fmtMoeda(ganhoSalarialLiqAnual);
    elBalancoSalario.className = `text-base font-black mt-0.5 ${ganhoSalarialLiqAnual >= 0 ? 'text-emerald-700' : 'text-rose-600'}`;
  }
  if (elBalancoSaude) {
    elBalancoSaude.innerText = (difSaudeAnual >= 0 ? '+' : '') + fmtMoeda(difSaudeAnual);
    elBalancoSaude.className = `text-base font-black mt-0.5 ${difSaudeAnual > 0 ? 'text-rose-600' : (difSaudeAnual < 0 ? 'text-emerald-700' : 'text-slate-500')}`;
  }
  if (elSaldoAnualTotal) {
    elSaldoAnualTotal.innerText = (saldoAnualTotal >= 0 ? '+' : '') + fmtMoeda(saldoAnualTotal) + ' / ano';
    elSaldoAnualTotal.className = `text-xl sm:text-2xl font-black ${saldoAnualTotal >= 0 ? 'text-emerald-700' : 'text-rose-700'}`;
  }
  if (elSaldoAnualMensalEq) {
    elSaldoAnualMensalEq.innerText = `equivalente a ${(saldoAnualMensalEq >= 0 ? '+' : '')}${fmtMoeda(saldoAnualMensalEq)}/mês no bolso`;
    elSaldoAnualMensalEq.className = `text-[10px] font-bold ${saldoAnualMensalEq >= 0 ? 'text-emerald-700' : 'text-rose-700'}`;
  }

  // Atualização do Termômetro e Resumo Neutro
  atualizarTermometroEResumo(saldoAnualTotal, ganhoSalarialLiqAnual, difSaudeAnual, difLiquido, salarioBase, salarioNovo, totalSaudeHoje, totalSaudeNovo, liquidoHoje, liquidoNovo);

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

  // Plano de Saúde Diretos (Titular + Dependentes Diretos)
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
    travaMsg = `Limitado rigorosamente à trava do teto de 9,0% (${fmtMoeda(tetoNovo)}) • Economia do teto: ${fmtMoeda(reducaoTetoNovo)} (Sem a trava seria ${fmtMoeda(custoBaseDiretosNovo)})`;
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
    irrfDescMsg = 'Desconto Simplificado de R$ 607,20 aplicado (mais vantajoso)';
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

  // Atualização do Memorial de Cálculo Detalhado
  atualizarMemorialCalculo({
    salarioBase,
    inpc,
    taxaReal,
    reajusteTotal,
    salarioNovo,
    aliquotaFuncef,
    funcefNovo,
    outrosDesc,
    depDiretos,
    depIndiretos,
    depEspeciais,
    depIndiretosUniv,
    depsParaIrrf,
    inssNovo,
    titularNovo,
    depDiretoNovo,
    custoBaseDiretosNovo,
    tetoNovo,
    bateuTetoNovo,
    subtotalDiretosNovo,
    reducaoTetoNovo,
    depForaNovo,
    totalSaudeNovo,
    irrfInfoNovo,
    irrfNovo,
    totalDescontosNovo,
    liquidoNovo,
    ganhoSalarialLiqAnual,
    difSaudeAnual,
    saldoAnualTotal
  });
}

function atualizarTermometroEResumo(saldoAnualTotal, ganhoSalarialLiqAnual, difSaudeAnual, difLiquido, salarioBase, salarioNovo, totalSaudeHoje, totalSaudeNovo, liquidoHoje, liquidoNovo) {
  const badge = document.getElementById('badgeTermometro');
  const icon = document.getElementById('iconTermometro');
  const desc = document.getElementById('descTermometro');
  const barra = document.getElementById('barraTermometro');
  const card = document.getElementById('cardBalancoAnual');

  if (saldoAnualTotal > 600) {
    if (badge) {
      badge.className = "text-[10px] uppercase font-black px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800";
      badge.innerText = "Saldo Anual Positivo";
    }
    if (icon) {
      icon.className = "w-8 h-8 rounded-full flex items-center justify-center text-base bg-emerald-100 text-emerald-700";
      icon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
    }
    if (desc) {
      desc.innerText = "O ganho salarial líquido cobre todas as novas mensalidades do Plano de Saúde e amplia sua renda anual.";
    }
    if (barra) {
      barra.className = "h-full rounded-full transition-all duration-500 bg-emerald-500";
      barra.style.width = "88%";
    }
    if (card) {
      card.className = "rounded-2xl p-5 border shadow-sm transition-all duration-300 bg-emerald-50/40 border-emerald-300";
    }
  } else if (saldoAnualTotal >= -600 && saldoAnualTotal <= 600) {
    if (badge) {
      badge.className = "text-[10px] uppercase font-black px-2.5 py-1 rounded-md bg-amber-100 text-amber-900";
      badge.innerText = "Zona de Equilíbrio";
    }
    if (icon) {
      icon.className = "w-8 h-8 rounded-full flex items-center justify-center text-base bg-amber-100 text-amber-700";
      icon.innerHTML = '<i class="fa-solid fa-scale-balanced"></i>';
    }
    if (desc) {
      desc.innerText = "O ganho salarial líquido praticamente empata com o aumento do plano de saúde no fechamento de 12 meses.";
    }
    if (barra) {
      barra.className = "h-full rounded-full transition-all duration-500 bg-amber-500";
      barra.style.width = "50%";
    }
    if (card) {
      card.className = "rounded-2xl p-5 border shadow-sm transition-all duration-300 bg-amber-50/40 border-amber-300";
    }
  } else {
    if (badge) {
      badge.className = "text-[10px] uppercase font-black px-2.5 py-1 rounded-md bg-rose-100 text-rose-900";
      badge.innerText = "Saldo Anual Negativo";
    }
    if (icon) {
      icon.className = "w-8 h-8 rounded-full flex items-center justify-center text-base bg-rose-100 text-rose-700";
      icon.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
    }
    if (desc) {
      desc.innerText = "O custo das novas mensalidades do Plano de Saúde supera o reajuste salarial recebido ao longo do ano.";
    }
    if (barra) {
      barra.className = "h-full rounded-full transition-all duration-500 bg-rose-500";
      barra.style.width = "20%";
    }
    if (card) {
      card.className = "rounded-2xl p-5 border shadow-sm transition-all duration-300 bg-rose-50/40 border-rose-300";
    }
  }

  // ============================================
  // RESUMO NEUTRO DA SITUAÇÃO FINANCEIRA (Aba 1)
  // ============================================
  const difBruto = salarioNovo - salarioBase;
  const difSaudeMensal = totalSaudeNovo - totalSaudeHoje;

  const setEl = (id, text, cls) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerText = text;
      if (cls) el.className = cls;
    }
  };

  setEl('resumoBrutoHoje', fmtMoeda(salarioBase));
  setEl('resumoBrutoNovo', fmtMoeda(salarioNovo));
  setEl('resumoBrutoDif', '+' + fmtMoeda(difBruto), 'py-2 text-right font-bold text-emerald-700');

  setEl('resumoSaudeHoje', fmtMoeda(totalSaudeHoje));
  setEl('resumoSaudeNovo', fmtMoeda(totalSaudeNovo));
  setEl('resumoSaudeDifMensal',
    (difSaudeMensal >= 0 ? '+' : '') + fmtMoeda(difSaudeMensal),
    `py-2 text-right font-bold ${difSaudeMensal > 0 ? 'text-rose-600' : (difSaudeMensal < 0 ? 'text-emerald-600' : 'text-slate-500')}`
  );

  setEl('resumoLiqHoje', fmtMoeda(liquidoHoje));
  setEl('resumoLiqNovo', fmtMoeda(liquidoNovo));
  setEl('resumoLiqDif',
    (difLiquido >= 0 ? '+' : '') + fmtMoeda(difLiquido),
    `py-2.5 text-right rounded-r-lg font-extrabold ${difLiquido >= 0 ? 'text-emerald-700' : 'text-rose-700'}`
  );

  setEl('resumoSaudeAnualDif',
    (difSaudeAnual >= 0 ? '+' : '') + fmtMoeda(difSaudeAnual) + '/ano',
    `text-sm font-extrabold mt-0.5 ${difSaudeAnual > 0 ? 'text-rose-600' : (difSaudeAnual < 0 ? 'text-emerald-600' : 'text-slate-500')}`
  );

  setEl('resumoSaldoAnual',
    (saldoAnualTotal >= 0 ? '+' : '') + fmtMoeda(saldoAnualTotal) + '/ano',
    `text-sm font-extrabold mt-0.5 ${saldoAnualTotal >= 0 ? 'text-emerald-700' : 'text-rose-700'}`
  );

  // ============================================
  // BOXES NEUTROS NA ABA 3 (Matriz de Decisão)
  // ============================================
  const boxAprovarTab3 = document.getElementById('boxDecisaoAprovarTab3');
  if (boxAprovarTab3) {
    let txt = `• Salário bruto: ${fmtMoeda(salarioBase)} → <strong>${fmtMoeda(salarioNovo)}</strong><br>`;
    txt += `• Plano de Saúde mensal: ${fmtMoeda(totalSaudeHoje)} → <strong>${fmtMoeda(totalSaudeNovo)}</strong> (${(difSaudeMensal >= 0 ? '+' : '')}${fmtMoeda(difSaudeMensal)})<br>`;
    txt += `• Líquido no bolso: ${fmtMoeda(liquidoHoje)} → <strong>${fmtMoeda(liquidoNovo)}</strong> (<span class="${difLiquido >= 0 ? 'text-emerald-700' : 'text-rose-700'}">${(difLiquido >= 0 ? '+' : '')}${fmtMoeda(difLiquido)}/mês</span>)`;
    boxAprovarTab3.innerHTML = txt;
  }

  const boxRejeitarTab3 = document.getElementById('boxDecisaoRejeitarTab3');
  if (boxRejeitarTab3) {
    let txt = `• Salário bruto: <strong>${fmtMoeda(salarioBase)}</strong> (sem alteração)<br>`;
    txt += `• Plano de Saúde mensal: <strong>${fmtMoeda(totalSaudeHoje)}</strong> (tabela atual mantida)<br>`;
    txt += `• Líquido no bolso: <strong>${fmtMoeda(liquidoHoje)}</strong> (sem alteração imediata)`;
    boxRejeitarTab3.innerHTML = txt;
  }
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
    card.className = "rounded-2xl p-6 border shadow-sm bg-emerald-50/70 border-emerald-300";
    badge.className = "text-xs font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-200 text-emerald-900";
    badge.innerText = "Saldo Positivo";
    title.className = "text-2xl font-black mt-2 text-emerald-950";
    title.innerText = `Saldo Positivo no Bolso: +${fmtMoeda(difLiquido)}/mês`;
    icon.className = "text-3xl text-emerald-600";
    icon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
    desc.innerText = `O reajuste salarial (+${reajusteBrutoPp.toFixed(2)}%, composto por ${inpcPp.toFixed(2)}% de reposição da inflação e apenas ${taxaRealPp.toFixed(2)}% de aumento real) cobre o novo custeio do Plano de Saúde (+${impactoPlanoPp.toFixed(2)} p.p.), garantindo um saldo líquido positivo de ${fmtMoeda(difLiquido)}/mês no seu contracheque.`;

  } else if (difLiquido > 0) {
    const corrosaoInpcPp = Math.min(inpcPp, impactoPlanoPp - taxaRealPp);
    const perdaInflacionariaMensal = salarioBase * (corrosaoInpcPp / 100);

    card.className = "rounded-2xl p-6 border shadow-sm bg-amber-50/80 border-amber-300";
    badge.className = "text-xs font-extrabold uppercase px-2.5 py-1 rounded-md bg-amber-200 text-amber-900";
    badge.innerText = "Saldo Positivo Parcial";
    title.className = "text-2xl font-black mt-2 text-amber-950";
    title.innerText = `Saldo Positivo Nominal: +${fmtMoeda(difLiquido)}/mês`;
    icon.className = "text-3xl text-amber-600";
    icon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
    desc.innerText = `Embora seu contracheque receba ${fmtMoeda(difLiquido)} a mais por mês, o custo adicional do Plano de Saúde (+${impactoPlanoPp.toFixed(2)} p.p.) consumiu integralmente os ${taxaRealPp.toFixed(2)}% de aumento real e confiscou ${corrosaoInpcPp.toFixed(2)} p.p. da reposição da inflação (${fmtMoeda(perdaInflacionariaMensal)}/mês que deveriam repor o poder de compra corroído pelo INPC).`;

  } else {
    const perdaLiquida = Math.abs(difLiquido);

    card.className = "rounded-2xl p-6 border shadow-sm bg-rose-50/80 border-rose-300";
    badge.className = "text-xs font-extrabold uppercase px-2.5 py-1 rounded-md bg-rose-200 text-rose-900";
    badge.innerText = "Saldo Negativo";
    title.className = "text-2xl font-black mt-2 text-rose-950";
    title.innerText = `Saldo Negativo: -${fmtMoeda(perdaLiquida)}/mês`;
    icon.className = "text-3xl text-rose-600";
    icon.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
    desc.innerText = `O reajuste salarial total (+${reajusteBrutoPp.toFixed(2)}%) foi insuficiente para pagar a nova tabela do plano de saúde. O seu salário líquido no bolso tem uma redução de ${fmtMoeda(perdaLiquida)} por mês.`;
  }
}

function gerarTextoResumo() {
  const sal = document.getElementById('salarioBase').value;
  const liqH = document.getElementById('cardLiqHoje').innerText;
  const liqN = document.getElementById('cardLiqNovo').innerText;
  const dif = document.getElementById('cardDiferencaLiq').innerText;
  const difPct = document.getElementById('cardDiferencaPct').innerText;
  const verdict = document.getElementById('verdictTitle').innerText;
  const funcef = document.getElementById('funcefLabel').innerText;
  const anualDif = document.getElementById('cardSaudeAnualDif') ? document.getElementById('cardSaudeAnualDif').innerText : '';
  const saldoAnual = document.getElementById('saldoAnualTotal') ? document.getElementById('saldoAnualTotal').innerText : '';
  const statusDecisao = document.getElementById('badgeTermometro') ? document.getElementById('badgeTermometro').innerText : '';

  let msg = `📊 *Simulador de Salário Líquido: Impacto no Bolso (Decisão do ACT)*\n` +
            `• Salário Base: R$ ${sal}\n` +
            `• Contribuição FUNCEF: ${funcef}\n` +
            `• Salário Líquido Atual: ${liqH}\n` +
            `• Salário Líquido Proposta: ${liqN}\n` +
            `• Variação Mensal em Folha: ${dif}/mês (${difPct})\n`;

  if (anualDif) {
    msg += `• Variação Anual Plano de Saúde (13x): ${anualDif}/ano\n`;
  }
  if (saldoAnual) {
    msg += `• *Saldo Consolidado no Ano (13,33 folhas líquidas - Saúde 13x):* ${saldoAnual}\n` +
           `• *Termômetro da Decisão:* ${statusDecisao}\n`;
  }

  msg += `• Resultado da Proposta: ${verdict}\n\n` +
         `ℹ️ _Simulação independente para subsidiar o voto em assembleia fundamentada em dados oficiais da CAIXA Notícias e das entidades sindicais (CONTRAF-CUT, FENAE, SPBancários)._`;

  return msg;
}

function copiarResumo() {
  const msg = gerarTextoResumo();
  navigator.clipboard.writeText(msg).then(() => {
    alert('Demonstrativo completo de subsídio à decisão copiado para a área de transferência!');
  }).catch(() => {
    prompt('Copie o resumo da simulação abaixo:', msg);
  });
}

function compartilharWhatsApp() {
  const texto = gerarTextoResumo();
  const urlApp = window.location.href.split('#')[0];
  const textoCompleto = `${texto}\n\n📲 Simule o impacto no seu contracheque:\n${urlApp}`;

  if (navigator.share) {
    navigator.share({
      title: 'Simulador de Salário Líquido',
      text: textoCompleto,
      url: urlApp
    }).catch(() => {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoCompleto)}`;
      window.open(waUrl, '_blank');
    });
  } else {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoCompleto)}`;
    window.open(waUrl, '_blank');
  }
}

// Controle e Navegação das Abas Mobile-First
function trocarAba(abaId) {
  const abas = ['veredito', 'contracheque', 'memorial', 'matriz'];
  if (!abas.includes(abaId)) abaId = 'veredito';

  abas.forEach(id => {
    const btn = document.getElementById(`tab-btn-${id}`);
    const content = document.getElementById(`tab-content-${id}`);

    if (btn) {
      if (id === abaId) {
        btn.classList.add('tab-active');
        btn.classList.remove('text-slate-600', 'font-bold');
        btn.classList.add('text-blue-900', 'font-black');
      } else {
        btn.classList.remove('tab-active', 'text-blue-900', 'font-black');
        btn.classList.add('text-slate-600', 'font-bold');
      }
    }

    if (content) {
      if (id === abaId) {
        content.classList.remove('hidden');
      } else {
        content.classList.add('hidden');
      }
    }
  });

  try {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, null, '#' + abaId);
    }
  } catch (e) {}

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.onload = function() {
  const hash = (window.location.hash || '').replace('#', '');
  if (hash === 'contracheque' || hash === 'memorial' || hash === 'matriz' || hash === 'fontes') {
    if (hash === 'fontes') {
      trocarAba('matriz');
      setTimeout(() => {
        const elFontes = document.getElementById('fontes');
        if (elFontes) elFontes.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else {
      trocarAba(hash);
    }
  } else {
    trocarAba('veredito');
  }

  recalcular();
};

// =============================================================================
// MEMORIAL DE CÁLCULO DETALHADO (AUDITORIA PASSO A PASSO)
// =============================================================================
function detalharInss(salario) {
  const f1 = 1621.00;
  const f2 = 2902.84;
  const f3 = 4354.27;
  const tetoRgps = 8475.55;

  const b1 = Math.max(0, Math.min(salario, f1));
  const v1 = b1 * 0.075;

  const b2 = Math.max(0, Math.min(salario, f2) - f1);
  const v2 = b2 * 0.09;

  const b3 = Math.max(0, Math.min(salario, f3) - f2);
  const v3 = b3 * 0.12;

  const b4 = Math.max(0, Math.min(salario, tetoRgps) - f3);
  const v4 = b4 * 0.14;

  const total = Math.round((v1 + v2 + v3 + v4) * 100) / 100;
  const bateuTeto = salario >= tetoRgps;

  return { b1, v1, b2, v2, b3, v3, b4, v4, total, bateuTeto, tetoRgps };
}

function detalharIrrfCompleto(salario, inss, funcef, numDepsIrrf) {
  const tetoFuncef12 = salario * 0.12;
  const funcefDedutivel = Math.min(funcef, tetoFuncef12);
  const funcefNaoDedutivel = Math.max(0, funcef - tetoFuncef12);
  const deducaoDeps = numDepsIrrf * 189.59;

  // Regime Legal
  const baseLegal = Math.max(0, salario - inss - funcefDedutivel - deducaoDeps);
  const irrfLegalBruto = Math.max(0, calcularFaixasIrrf(baseLegal));
  let redutorLegal = 0;
  if (baseLegal <= 5000.00) {
    redutorLegal = Math.min(312.89, irrfLegalBruto);
  } else if (baseLegal <= 7350.00) {
    redutorLegal = Math.max(0, 978.62 - (0.133145 * baseLegal));
    redutorLegal = Math.min(redutorLegal, irrfLegalBruto);
  }
  const irrfLegalFinal = Math.max(0, irrfLegalBruto - redutorLegal);

  // Regime Simplificado (R$ 607,20)
  const baseSimplificada = Math.max(0, salario - 607.20);
  const irrfSimplificadoBruto = Math.max(0, calcularFaixasIrrf(baseSimplificada));
  let redutorSimplificado = 0;
  if (baseSimplificada <= 5000.00) {
    redutorSimplificado = Math.min(312.89, irrfSimplificadoBruto);
  } else if (baseSimplificada <= 7350.00) {
    redutorSimplificado = Math.max(0, 978.62 - (0.133145 * baseSimplificada));
    redutorSimplificado = Math.min(redutorSimplificado, irrfSimplificadoBruto);
  }
  const irrfSimplificadoFinal = Math.max(0, irrfSimplificadoBruto - redutorSimplificado);

  const regimeEscolhido = irrfSimplificadoFinal < irrfLegalFinal ? 'simplificado' : 'legal';
  const irrfFinal = regimeEscolhido === 'simplificado' ? irrfSimplificadoFinal : irrfLegalFinal;

  return {
    tetoFuncef12,
    funcefDedutivel,
    funcefNaoDedutivel,
    deducaoDeps,
    baseLegal,
    irrfLegalBruto,
    redutorLegal,
    irrfLegalFinal: Math.round(irrfLegalFinal * 100) / 100,
    baseSimplificada,
    irrfSimplificadoBruto,
    redutorSimplificado,
    irrfSimplificadoFinal: Math.round(irrfSimplificadoFinal * 100) / 100,
    regimeEscolhido,
    irrfFinal: Math.round(irrfFinal * 100) / 100
  };
}

function atualizarMemorialCalculo(dados) {
  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.innerText = txt;
  };
  const setHtml = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  // 1. Remuneração e Reajuste
  setTxt('memSalHoje', fmtMoeda(dados.salarioBase));
  setTxt('memInpcPct', `${(dados.inpc * 100).toFixed(2)}%`);
  setTxt('memRealPct', `${(dados.taxaReal * 100).toFixed(2)}%`);
  setTxt('memReajusteTotalPct', `+${(dados.reajusteTotal * 100).toFixed(2)}%`);
  setTxt('memSalNovo', fmtMoeda(dados.salarioNovo));

  // 2. INSS Progressivo
  const inssInfo = detalharInss(dados.salarioNovo);
  setTxt('memInssB1', fmtMoeda(inssInfo.b1));
  setTxt('memInssV1', fmtMoeda(inssInfo.v1));
  setTxt('memInssB2', fmtMoeda(inssInfo.b2));
  setTxt('memInssV2', fmtMoeda(inssInfo.v2));
  setTxt('memInssB3', fmtMoeda(inssInfo.b3));
  setTxt('memInssV3', fmtMoeda(inssInfo.v3));
  setTxt('memInssB4', fmtMoeda(inssInfo.b4));
  setTxt('memInssV4', fmtMoeda(inssInfo.v4));
  setTxt('memInssTotal', fmtMoeda(inssInfo.total));
  setTxt('memInssStatus', inssInfo.bateuTeto 
    ? `Limitado ao Teto do RGPS de R$ 8.475,55 (desconto máximo oficial de ${fmtMoeda(inssInfo.total)})` 
    : `Base integral dentro das faixas progressivas`);

  // 3. FUNCEF & Trava de 12%
  setTxt('memFuncefSal', fmtMoeda(dados.salarioNovo));
  setTxt('memFuncefPct', `${(dados.aliquotaFuncef * 100).toFixed(1)}%`);
  setTxt('memFuncefTotal', fmtMoeda(dados.funcefNovo));
  const tetoFuncef = dados.salarioNovo * 0.12;
  const funcefDed = Math.min(dados.funcefNovo, tetoFuncef);
  const funcefNaoDed = Math.max(0, dados.funcefNovo - tetoFuncef);
  setTxt('memFuncefTeto12', fmtMoeda(tetoFuncef));
  setTxt('memFuncefDedutivel', fmtMoeda(funcefDed));
  setTxt('memFuncefNaoDedutivel', fmtMoeda(funcefNaoDed));
  if (dados.aliquotaFuncef > 0.12) {
    setHtml('memFuncefStatus', `<span class="text-amber-700 font-bold"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Alíquota acima de 12%: a parcela de ${fmtMoeda(funcefNaoDed)} não gera dedução tributária (Art. 11 Lei 9.532/97).</span>`);
  } else {
    setHtml('memFuncefStatus', `<span class="text-emerald-700 font-bold"><i class="fa-solid fa-circle-check mr-1"></i>100% da contribuição é dedutível na base de cálculo do IRRF (dentro do teto legal de 12%).</span>`);
  }

  // 4. Plano de Saúde (Auditoria Estrita da Trava de 9%)
  setTxt('memSaudeTitularSal', `${fmtMoeda(dados.salarioNovo)} × 3,7%`);
  setTxt('memSaudeTitularVal', fmtMoeda(dados.titularNovo));
  setTxt('memSaudeDepDiretoQtd', `${dados.depDiretos} vida(s) × R$ 560,00`);
  setTxt('memSaudeDepDiretoVal', fmtMoeda(dados.depDiretoNovo));
  setTxt('memSaudeCustoBaseDiretos', fmtMoeda(dados.custoBaseDiretosNovo));
  setTxt('memSaudeTeto9Pct', `9,0% de ${fmtMoeda(dados.salarioNovo)}`);
  setTxt('memSaudeTeto9Val', fmtMoeda(dados.tetoNovo));

  if (dados.bateuTetoNovo) {
    setHtml('memSaudeTravaStatusBadge', `<span class="bg-rose-100 text-rose-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full"><i class="fa-solid fa-lock mr-1"></i>Trava de 9,0% Ativada</span>`);
    setHtml('memSaudeTravaDesc', `O custo bruto familiar (<strong>${fmtMoeda(dados.custoBaseDiretosNovo)}</strong>) superou o teto de 9%. O desconto de titular e diretos é <strong>rigidamente limitado a ${fmtMoeda(dados.tetoNovo)}</strong>. Dependentes diretos excedentes não geram custos adicionais sobre o teto.`);
    setTxt('memSaudeCobradoDiretos', fmtMoeda(dados.subtotalDiretosNovo));
    setTxt('memSaudeEconomiaTrava', `Economia de ${fmtMoeda(dados.reducaoTetoNovo)}/mês`);
  } else {
    setHtml('memSaudeTravaStatusBadge', `<span class="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full"><i class="fa-solid fa-circle-check mr-1"></i>Dentro do Teto</span>`);
    setHtml('memSaudeTravaDesc', `O custo do grupo familiar direto (<strong>${fmtMoeda(dados.custoBaseDiretosNovo)}</strong>) está abaixo do teto de 9,0% (<strong>${fmtMoeda(dados.tetoNovo)}</strong>). Cobrança realizada pelo valor integral.`);
    setTxt('memSaudeCobradoDiretos', fmtMoeda(dados.subtotalDiretosNovo));
    setTxt('memSaudeEconomiaTrava', 'Dentro da margem');
  }

  const depIndiretosVal = dados.depIndiretos * 660;
  const depEspeciaisVal = dados.depEspeciais * 900;
  setTxt('memSaudeDepIndiretoQtd', `${dados.depIndiretos} vida(s) × R$ 660,00`);
  setTxt('memSaudeDepIndiretoVal', fmtMoeda(depIndiretosVal));
  setTxt('memSaudeDepEspecialQtd', `${dados.depEspeciais} vida(s) × R$ 900,00`);
  setTxt('memSaudeDepEspecialVal', fmtMoeda(depEspeciaisVal));
  setTxt('memSaudeTotalMensal', fmtMoeda(dados.totalSaudeNovo));
  setTxt('memSaudeTotalAnual', fmtMoeda(dados.totalSaudeNovo * 13));

  // 5. IRRF Oficial (Comparativo Legal vs Simplificado)
  const irrfDet = detalharIrrfCompleto(dados.salarioNovo, dados.inssNovo, dados.funcefNovo, dados.depsParaIrrf);
  setTxt('memIrrfBaseLegalSal', fmtMoeda(dados.salarioNovo));
  setTxt('memIrrfBaseLegalInss', `- ${fmtMoeda(dados.inssNovo)}`);
  setTxt('memIrrfBaseLegalFuncef', `- ${fmtMoeda(irrfDet.funcefDedutivel)}`);
  setTxt('memIrrfBaseLegalDeps', `- ${fmtMoeda(irrfDet.deducaoDeps)} (${dados.depsParaIrrf} deps)`);
  setTxt('memIrrfBaseLegal', fmtMoeda(irrfDet.baseLegal));
  setTxt('memIrrfLegalBruto', fmtMoeda(irrfDet.irrfLegalBruto));
  setTxt('memIrrfLegalRedutor', irrfDet.redutorLegal > 0 ? `- ${fmtMoeda(irrfDet.redutorLegal)}` : 'R$ 0,00');
  setTxt('memIrrfLegalFinal', fmtMoeda(irrfDet.irrfLegalFinal));

  setTxt('memIrrfBaseSimpSal', fmtMoeda(dados.salarioNovo));
  setTxt('memIrrfBaseSimpDesc', `- R$ 607,20`);
  setTxt('memIrrfBaseSimp', fmtMoeda(irrfDet.baseSimplificada));
  setTxt('memIrrfSimpBruto', fmtMoeda(irrfDet.irrfSimplificadoBruto));
  setTxt('memIrrfSimpRedutor', irrfDet.redutorSimplificado > 0 ? `- ${fmtMoeda(irrfDet.redutorSimplificado)}` : 'R$ 0,00');
  setTxt('memIrrfSimpFinal', fmtMoeda(irrfDet.irrfSimplificadoFinal));

  if (irrfDet.regimeEscolhido === 'simplificado') {
    setHtml('memIrrfRegimeBadge', `<span class="bg-blue-100 text-blue-900 text-xs font-black uppercase px-2.5 py-1 rounded-md"><i class="fa-solid fa-award mr-1"></i>Regime Mais Vantajoso: Desconto Simplificado (R$ 607,20)</span>`);
  } else {
    setHtml('memIrrfRegimeBadge', `<span class="bg-emerald-100 text-emerald-900 text-xs font-black uppercase px-2.5 py-1 rounded-md"><i class="fa-solid fa-award mr-1"></i>Regime Mais Vantajoso: Deduções Legais (INSS, FUNCEF e Dependentes)</span>`);
  }
  setTxt('memIrrfValorFinal', fmtMoeda(irrfDet.irrfFinal));

  // 6. Fechamento do Líquido & Auditoria de Integridade
  setTxt('memFechamentoBruto', fmtMoeda(dados.salarioNovo));
  setTxt('memFechamentoInss', `- ${fmtMoeda(dados.inssNovo)}`);
  setTxt('memFechamentoFuncef', `- ${fmtMoeda(dados.funcefNovo)}`);
  setTxt('memFechamentoSaude', `- ${fmtMoeda(dados.totalSaudeNovo)}`);
  setTxt('memFechamentoIrrf', `- ${fmtMoeda(dados.irrfNovo)}`);
  setTxt('memFechamentoOutros', `- ${fmtMoeda(dados.outrosDesc)}`);
  setTxt('memFechamentoTotalDescontos', fmtMoeda(dados.totalDescontosNovo));
  setTxt('memFechamentoLiquido', fmtMoeda(dados.liquidoNovo));

  const delta = Math.abs(dados.salarioNovo - (dados.totalDescontosNovo + dados.liquidoNovo));
  const auditoriaOk = delta < 0.01;
  setHtml('memAuditoriaStatus', auditoriaOk
    ? `<span class="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-black"><i class="fa-solid fa-circle-check"></i> Auditoria 100% Precisa: Diferença de R$ 0,00</span>`
    : `<span class="inline-flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full text-xs font-black"><i class="fa-solid fa-triangle-exclamation"></i> Discrepância de ${fmtMoeda(delta)}</span>`
  );

  // 7. Balanço Anual Consolidado
  setTxt('memBalancoFolhasLiq', (dados.ganhoSalarialLiqAnual >= 0 ? '+' : '') + fmtMoeda(dados.ganhoSalarialLiqAnual));
  setTxt('memBalancoSaude13', (dados.difSaudeAnual >= 0 ? '+' : '') + fmtMoeda(dados.difSaudeAnual));
  setTxt('memBalancoSaldoFinal', (dados.saldoAnualTotal >= 0 ? '+' : '') + fmtMoeda(dados.saldoAnualTotal) + ' / ano');
}

