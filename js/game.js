// Importar datos de industrias
import { industries } from './data.js';
import { countries } from './countries.js';
import { lenders } from './lenders.js';

// Estado del juego
const gameState = {
    money: 3800000, // 3.8M USD de capital inicial
    date: {
        year: 1980,
        month: 1,
        week: 1
    },
    ownedIndustries: [], // Ahora cada industria tendrá un remainingConstructionTime
    storage: [], // Almacenamiento de productos
    lastQuarterlyUpdate: 0, // Último mes en que se actualizó la producción
 
};
gameState.salesHistory = [];
gameState.loans = [];
gameState.productsSoldThisWeek = new Set();
gameState.weeklyOffers = {}; 

// Elementos del DOM
const moneyDisplay = document.getElementById('money');
const dateDisplay = document.getElementById('date');
const nextWeekButton = document.getElementById('nextWeek');
const industriesList = document.getElementById('industriesList');
const ownedIndustriesList = document.getElementById('ownedIndustries');
const weeklyIncomeDisplay = document.getElementById('weeklyIncome');
const monthlyIncomeDisplay= document.getElementById('monthlyIncome');
const lenderModal   = document.getElementById('lenderModal');
const lenderImgEl   = document.getElementById('lenderImg');
const lenderNameEl  = document.getElementById('lenderName');
const lenderAudioEl = document.getElementById('lenderAudio');
const lenderCloseEl = document.getElementById('lenderClose');



// ───── Panel navigation setup ─────
const panelButtons = document.querySelectorAll('.panel-button');
const panels       = document.querySelectorAll('.panel');

// Función de cambio de panel (solo UNA vez)
function switchPanel(panelId) {
  panels.forEach(p => p.classList.remove('active'));
  panelButtons.forEach(b => b.classList.remove('active'));

  if (panelId === 'history') renderHistory();
  if (panelId === 'loans') {
  renderLoanOptions();
}


  document.getElementById(`${panelId}-panel`).classList.add('active');
  document.querySelector(`[data-panel="${panelId}"]`).classList.add('active');
}


// Añadir listeners (solo UNA vez)
panelButtons.forEach(button => {
    button.addEventListener('click', () => {
        switchPanel(button.dataset.panel);
    });
});



// Formatear moneda
function formatMoney(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(amount);
}

// Formatear fecha
function formatDate(date) {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${months[date.month - 1]} ${date.year}`;
}

// Ratio empleados actuales / plantilla base
function empRatio(ind) {
     const base    = ind.production.employees;                       // ← clave original
    const current = ind.production.currentEmployees ?? base;        // si aún no contrataste
    return current / base;
}

// Ingreso y producción ajustados al nº de empleados
function weeklyIncome(ind) {
  return Math.round(ind.weeklyIncome);
}
function quarterlyOutput(ind) {
  return Math.round(ind.production.quarterlyAmount * empRatio(ind));
}


function computeWeeklyNet() {
  let gross    = 0;   // ingresos brutos de industrias terminadas
  let salaries = 0;   // sueldos de empleados + obreros de obra
  // ── 1) Industrias ─────────────────────────────────────────────
  gameState.ownedIndustries.forEach(ind => {
    if (ind.remainingConstructionTime === 0) {
      gross += weeklyIncome(ind);
      salaries += calcularGastosSalariales(ind);
    } else {
      salaries += (ind.constructionWorkers ?? 0) * (ind.constructionWage ?? 0);
    }
  });
  // ── 2) Cuotas de préstamos (prorrateadas por semana) ──────────
  const loansWeekly =
    gameState.loans.reduce((acc, l) => acc + l.monthlyPayment, 0) / 4;

  const net = gross - salaries - loansWeekly;
  return { gross, salaries, loansWeekly, net };
}


// Actualizar la interfaz
function updateUI() {
    moneyDisplay.textContent = formatMoney(gameState.money);
    dateDisplay.textContent = formatDate(gameState.date);
    renderIndustries();
    renderOwnedIndustries();
    renderStorage(); // Asegurarnos de que el almacén también se actualice
    const { net: weeklyNet } = computeWeeklyNet();
    weeklyIncomeDisplay.textContent  = formatMoney(weeklyNet);
    monthlyIncomeDisplay.textContent = formatMoney(weeklyNet * 4);
}

// Crear tarjeta de industria
function createIndustryCard(industry) {
    const card = document.createElement('div');
    card.className = 'industry-card';
    card.innerHTML = `
        <img src="${industry.image}" alt="${industry.name}" class="industry-image">
        <h3 class="industry-name">${industry.name}</h3>
        <p class="industry-description">${industry.description}</p>
        <p class="industry-price">Precio: ${formatMoney(industry.price)}</p>
        <button class="button buy-button" ${gameState.money < industry.price ? 'disabled' : ''}>
            Comprar
        </button>
    `;

    const buyButton = card.querySelector('.buy-button');
    buyButton.addEventListener('click', () => buyIndustry(industry));

    return card;
}

// Renderizar industrias disponibles
function renderIndustries() {
    industriesList.innerHTML = '';
    industries.forEach(industry => {
        if (!gameState.ownedIndustries.find(owned => owned.id === industry.id)) {
            industriesList.appendChild(createIndustryCard(industry));
        }
    });
}

// Renderizar industrias propias
function calcularGastosSalariales(industry) {
    const n = industry.production?.currentEmployees ?? 0;
    return n * (industry.production?.salaryPerEmployee ?? 0);
}

function renderOwnedIndustries() {
  ownedIndustriesList.innerHTML = '';

  gameState.ownedIndustries.forEach(industry => {
    const card = document.createElement('div');
    card.className = 'industry-card';

    /* ─── ① HTML de la tarjeta ─────────────────────── */
    const ingresoBruto   = weeklyIncome(industry);           // NUEVO
    const gastosSalarial = calcularGastosSalariales(industry);
    const ingresoNeto    = ingresoBruto - gastosSalarial;    // NUEVO
    const isUnderConstruction = industry.remainingConstructionTime > 0;

    card.innerHTML = `
      <img src="${industry.image}" alt="${industry.name}" class="industry-image">
      <h3 class="industry-name">${industry.name}</h3>
      <p class="industry-description">${industry.description}</p>

      ${
        isUnderConstruction
          ? `
            <p class="industry-status">
              En construcción: ${industry.remainingConstructionTime} sem.
            </p>
            <p class="industry-salary">
              Obreros: ${industry.constructionWorkers} &nbsp;|&nbsp;
              Sueldo semanal: ${formatMoney(industry.constructionWorkers *
                                            industry.constructionWage)}
            </p>
          `
          : `
            <div class="industry-financials">
              <p class="industry-income">
                Ingreso bruto semanal: ${formatMoney(ingresoBruto)}
              </p>
              <p class="industry-employees">
                Empleados: ${industry.production.currentEmployees}
              </p>
              <!-- ② Controles de contratación -->
              <div class="hire-controls">
                ${[5,10,50,100,500,1000].map(n=>`
                  <button class="fire-btn" data-fire="${n}">-${n}</button>
                  <button class="hire-btn" data-hire="${n}">+${n}</button>
                `).join('')}
              </div>
              <p class="industry-salary">
                Gastos salariales: ${formatMoney(gastosSalarial)}
              </p>
              <p class="industry-net">
                Ingreso neto semanal: ${formatMoney(ingresoNeto)}
              </p>

              
            </div>
          `
      }
    `;

    /* ─── ③ Listener para cada botón de contratación ── */
    card.querySelectorAll('.hire-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const extra = parseInt(btn.dataset.hire, 10);
        industry.production.currentEmployees += extra;
        updateUI();               // refresca todos los números
      });
    });
    card.querySelectorAll('.fire-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const remove = parseInt(btn.dataset.fire, 10);
        const base   = industry.production.employees;
        industry.production.currentEmployees =
          Math.max(base, industry.production.currentEmployees - remove);
        updateUI();
      });
    });

    if (isUnderConstruction) card.classList.add('under-construction');
    ownedIndustriesList.appendChild(card);
  });
}


// Comprar industria
function buyIndustry(industry) {
    if (gameState.money >= industry.price) {
        gameState.money -= industry.price;
        // Crear una copia de la industria con el tiempo de construcción restante
        
        const workers   = Math.ceil((industry.production?.employees ?? 0) * 0.3);
        const wagePerWk = 850;          // USD/semana por obrero


        const newIndustry = {
        ...industry,
        remainingConstructionTime: industry.constructionTime,
        constructionWorkers: workers,
        constructionWage: wagePerWk,
        production: {
            ...industry.production,
            currentEmployees: industry.production.employees // Empleados iniciales
        }
        };
        gameState.ownedIndustries.push(newIndustry);
        updateUI();
    }
}
function nextWeek() {
  const { net: weeklyNet } = computeWeeklyNet();
  gameState.money += weeklyNet;
  // 1) Calcular ingresos y gastos de industrias
  let grossIncome     = 0;
  let weeklySalaries = 0;
  gameState.ownedIndustries.forEach(industry => {
    if (industry.remainingConstructionTime === 0) {
      grossIncome   += weeklyIncome(industry);
      weeklySalaries += calcularGastosSalariales(industry);
    } else {
      // Industria en obra: pagamos obreros
      const costObra = (industry.constructionWorkers ?? 0)
                     * (industry.constructionWage    ?? 0);
      weeklySalaries += costObra;
    }
  });
  gameState.money += (grossIncome  - weeklySalaries);

  // 2) Reducir tiempo de construcción
  gameState.ownedIndustries.forEach(industry => {
    if (industry.remainingConstructionTime > 0) {
      industry.remainingConstructionTime--;
    }
  });

  // 3) Avanzar fecha UNA vez
  let newMonth = false;
  gameState.date.week++;
  if (gameState.date.week > 4) {
    gameState.date.week = 1;
    gameState.date.month++;
    newMonth = true;
    if (gameState.date.month > 12) {
      gameState.date.month = 1;
      gameState.date.year++;
    }
  }
    gameState.productsSoldThisWeek.clear();
    gameState.weeklyOffers = {};
  // 4) Actualizar producción trimestral
  updateProduction();

  // 5) Si arrancó un mes nuevo, descontar cuota mensual de cada préstamo
  if (newMonth) {
    gameState.loans.forEach(loan => {
      const pay = Math.min(loan.monthlyPayment, loan.principal);
      gameState.money   -= pay;
      loan.principal    -= pay;
      loan.monthsLeft--;
      if (loan.principal <= 0 || loan.monthsLeft <= 0) {
        showModal('¡Préstamo cancelado!', `Has saldado ${loan.lenderName}.`);
      }
    });
    // Eliminar préstamos finalizados
    gameState.loans = gameState.loans.filter(l => l.principal > 0);
  }

  // 6) Refrescar UI
  updateUI();
}

// Actualizar producción trimestral
function updateProduction() {
    if (gameState.date.month !== gameState.lastQuarterlyUpdate) {
        if ((gameState.date.month - 1) % 3 === 0) { // Cada 3 meses
            gameState.ownedIndustries.forEach(industry => {
                if (industry.remainingConstructionTime === 0 && industry.production) {
                    // Buscar si ya existe el producto en el almacén
                    let storageItem = gameState.storage.find(item => item.productName === industry.production.item);
                    
                    if (!storageItem) {
                        // Si no existe, crear nuevo item en almacén
                        storageItem = {
                            productName: industry.production.item,
                            amount: 0,
                            basePrice: industry.production.basePrice,
                            image: industry.production.image  
                        };
                        gameState.storage.push(storageItem);
                    }
                    
                    // Agregar la producción al almacén
                    storageItem.amount += quarterlyOutput(industry);
                }
            });
            gameState.lastQuarterlyUpdate = gameState.date.month;
            renderStorage();
        }
    }
}

// Genera un valor aleatorio con distribución normal estándar (media 0, σ 1)
function gaussianRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();  // Evitar log(0)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Para conveniencia: variación con μ = -0.1, σ = 0.1
function priceVariationGaussian() {
    return gaussianRandom() * 0.1 - 0.1;
}

// sellProducts recibe buyerCountry y muestra modal con su bandera
function sellProducts(productName, amount, fixedPrice = null, buyerCountry) {
  amount = parseInt(amount, 10);
  const item = gameState.storage.find(i => i.productName === productName);
  if (!item || amount <= 0 || item.amount < amount) {
    showModal('Error', 'No hay suficientes unidades para vender.');
    return;
  }

  const variation  = priceVariationGaussian();
  const finalPrice = fixedPrice !== null ? fixedPrice : item.basePrice * (1 + variation);
  const revenue    = amount * finalPrice;

  // Actualizar estado
  item.amount -= amount;
  gameState.money += revenue;
  if (item.amount === 0) {
    gameState.storage = gameState.storage.filter(i => i !== item);
  }

  // Historial
  const record = {
    date: `${gameState.date.month}/${gameState.date.week}/${gameState.date.year}`,
    country: buyerCountry,
    product: productName,
    quantity: amount,
    unitPrice: finalPrice,
    total: revenue
  };
  gameState.salesHistory.unshift(record);
  gameState.productsSoldThisWeek.add(productName);
  updateUI();

  // Mostrar modal
  showModal(
    '¡Venta exitosa!',
    `<div class="modal-flag">
       <img src="${buyerCountry.flagUrl}" alt="${buyerCountry.name}" class="flag-img" />
       ${buyerCountry.name}
     </div>`,
    `Producto: ${productName}`,
    `Cantidad: ${amount}`,
    `Precio unitario: ${formatMoney(finalPrice)}`,
    `Total: ${formatMoney(revenue)}`
  );
}



function sellAllProducts() {
    if (gameState.storage.length === 0) {
        alert('No hay productos para vender.');
        return;
    }

    let totalRevenue = 0;
    let reportLines  = [];

    gameState.storage.forEach(item => {
        const variation   = 0.9 + Math.random() * 0.2;
        const finalPrice  = item.basePrice * variation;
        const revenue     = item.amount * finalPrice;
        totalRevenue     += revenue;

        reportLines.push(
            `${item.amount.toLocaleString()} × ${item.productName} ` +
            `a ${formatMoney(finalPrice)} c/u → ${formatMoney(revenue)}`
        );
    });

    // Vaciar almacén y actualizar dinero
    gameState.storage = [];
    gameState.money  += totalRevenue;

    updateUI();

    alert(
        'Venta total realizada:\n\n' +
        reportLines.join('\n') +
        `\n\nIngreso total: ${formatMoney(totalRevenue)}`
    );
}


// renderStorage con país comprador fijo y pasaje a sellProducts
function renderStorage() {
  const storageContainer = document.getElementById('storage');
  if (!storageContainer) return;
  storageContainer.innerHTML = '<h2></h2>';

  if (gameState.storage.length === 0) {
    storageContainer.innerHTML += '<p class="empty-storage">No hay productos almacenados</p>';
    return;
  }

  gameState.storage.forEach(item => {
    let offer = gameState.weeklyOffers[item.productName];

if (!offer) {
  const variation = priceVariationGaussian();
  const currentPrice = item.basePrice * (1 + variation);
  const buyerCountry = countries[
    Math.floor(Math.random() * countries.length)
  ];

  offer = {
    country: buyerCountry,
    price: currentPrice,
    variation: variation
  };

    gameState.weeklyOffers[item.productName] = offer;
    }

    const currentPrice = offer.price;
    const buyerCountry = offer.country;
    const variation = offer.variation;
    const diffSign = variation >= 0 ? '+' : '';
    const diffClass = variation >= 0 ? 'price-up' : 'price-down';
    const industryForItem = industries.find(ind => ind.production?.item === item.productName);
    const productImage = item.image || 'assets/img/default-product.png';

    // Crear tarjeta
    const itemDiv = document.createElement('div');
    itemDiv.className = 'storage-item';
    itemDiv.innerHTML = `
      <h3>
        ${item.productName} 
      </h3>
      <img src="${productImage}" alt="${item.productName}" class="product-image" />
      <p>Cantidad: ${item.amount.toLocaleString()} unidades</p>
      <p>Precio base: ${formatMoney(item.basePrice)}</p>
      <p>
        Precio actual:&nbsp;
        <span class="${diffClass}">
          ${formatMoney(currentPrice)} (${diffSign}${(variation*100).toFixed(1)}%)
        </span>
      </p>
            <div class="buyer-info">
        <img src="${buyerCountry.flagUrl}" alt="${buyerCountry.name}" class="flag-img-large" />
        <p>${buyerCountry.name}</p>
        </div>

      <div class="sell-controls">
        <button class="button percent-button" data-percent="0.10">Vender 10%</button>
        <button class="button percent-button" data-percent="0.25">Vender 25%</button>
        <button class="button percent-button" data-percent="0.50">Vender 50%</button>
        <button class="button percent-button" data-percent="1.00">Vender 100%</button>
        <input type="number" min="1" max="${item.amount}" value="1" id="sell-${item.productName}" />
        <button class="button sell-button">Vender</button>
      </div>
    `;

     const isSoldThisWeek = gameState.productsSoldThisWeek.has(item.productName);
    // Listeners
   
    const sellInput  = itemDiv.querySelector('input[type="number"]');
    const sellButton = itemDiv.querySelector('.sell-button');
    sellButton.disabled = isSoldThisWeek;
    if (isSoldThisWeek) {
        sellButton.textContent = 'Ya vendido esta semana';
        sellButton.classList.add('disabled');
        }
    const percentBtns = itemDiv.querySelectorAll('.percent-button');

    percentBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const pct = parseFloat(btn.dataset.percent);
        let qty = Math.floor(item.amount * pct);
        qty = Math.max(1, Math.min(qty, item.amount));
        sellInput.value = qty;
      });
    });

    sellButton.addEventListener('click', () => {
      sellProducts(
        item.productName,
        sellInput.value,
        currentPrice,
        buyerCountry // pasar el país seleccionado
      );
    });

    storageContainer.appendChild(itemDiv);
  });

  // Botón Vender todo
  const sellAllBtn = document.getElementById('sellAll') || document.createElement('button');
  sellAllBtn.id = 'sellAll';
  sellAllBtn.className = 'button sell-all';
  sellAllBtn.textContent = 'Vender todo';
  sellAllBtn.onclick = sellAllProducts;
  storageContainer.appendChild(sellAllBtn);
}

// Add click event listeners to panel buttons
panelButtons.forEach(button => {
    button.addEventListener('click', () => {
        const panelId = button.getAttribute('data-panel');
        switchPanel(panelId);
    });
});

// Función genérica para mostrar el modal
function showModal(title, ...lines) {
  const modal     = document.getElementById('saleModal');
  const details   = document.getElementById('saleDetails');
  details.innerHTML = `<h4>${title}</h4>` + lines.map(l => `<p>${l}</p>`).join('');
  modal.classList.remove('hidden');
}

// Cerrar modal
document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('saleModal').classList.add('hidden');
});

function renderHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = '';

    // ── Mostrar suma total ───────────────────────────────────
  const totalSales = computeTotalSales();
  const totalLi = document.createElement('li');
  totalLi.innerHTML = `
    <strong>Total histórico:</strong> ${formatMoney(totalSales)}
  `;
  totalLi.style.marginTop = '1rem';
  totalLi.style.fontWeight = 'bold';
  list.appendChild(totalLi);

  gameState.salesHistory.forEach(rec => {
    const li = document.createElement('h4');
    li.innerHTML = `
      <strong>${rec.date}</strong> &mdash;
      <span class="history-country">
        <img src="${rec.country.flagUrl}" 
            alt="${rec.country.name}" 
            class="flag-img" />&nbsp;${rec.country.name}
        </span><br/>
      ${rec.quantity}× ${rec.product} &commat; 
      ${formatMoney(rec.unitPrice)} = ${formatMoney(rec.total)}
    `;
    list.appendChild(li);
  });

}


function renderLoanOptions() {
  const container = document.getElementById('loanOptions');
  container.innerHTML = '';

  // —————————————————————————————————————————
  // 1) Formulario de solicitud
  // —————————————————————————————————————————
  const reqDiv = document.createElement('div');
  reqDiv.className = 'loan-request';
  reqDiv.innerHTML = `
    <p><strong>Dinero actual:</strong> ${formatMoney(gameState.money)}</p>
    <p><strong>Solicitar nuevo préstamo:</strong></p>
    <div class="loan-input-group">
      <select id="loanLender">
        ${lenders.map(l => `<option value="${l.id}">${l.name}</option>`).join('')}
      </select>
      <input type="number" id="loanAmount" placeholder="Monto" />
      <button class="button" id="requestLoan">Pedir Préstamo</button>
    </div>
  `;
  container.appendChild(reqDiv);

  // Al cambiar de prestador, actualizo la cuota aproximada del máximo
  const lenderSelect = reqDiv.querySelector('#loanLender');
  const amountInput  = reqDiv.querySelector('#loanAmount');
  const updatePlaceholder = () => {
    const chosen = lenders.find(l => l.id == lenderSelect.value);
    const approx = computeMonthlyPayment(
      chosen.maxAmount, chosen.annualRate, chosen.termMonths
    );
    amountInput.placeholder = `Hasta ${formatMoney(chosen.maxAmount)} → cuota aprox ${formatMoney(approx)}/mes`;
  };
  lenderSelect.addEventListener('change', updatePlaceholder);
  updatePlaceholder();

  // Manejo click “Pedir Préstamo”
  reqDiv.querySelector('#requestLoan').addEventListener('click', () => {
    const lender = lenders.find(l => l.id == lenderSelect.value);
    let amount   = parseInt(amountInput.value, 10);
    if (isNaN(amount) || amount < 1 || amount > lender.maxAmount) {
      alert(`Ingresa un monto entre 1 y ${formatMoney(lender.maxAmount)}.`);
      return;
    }
    // Calculamos la cuota mensual real:
    const monthlyPayment = computeMonthlyPayment(
      amount, lender.annualRate, lender.termMonths
    );
    // Guardamos el préstamo
    gameState.loans.push({
      lenderId:       lender.id,
      lenderName:     lender.name,
      principal:      amount,
      monthlyPayment: monthlyPayment,
      monthsLeft:     lender.termMonths,
      annualRate:     lender.annualRate
    });
    gameState.money += amount;
    updateUI();
    showModal(
      '¡Préstamo recibido!',
      `Prestador: ${lender.name}`,
      `Monto: ${formatMoney(amount)}`,
      `Tasa: ${(lender.annualRate*100).toFixed(1)}% anual`,
      `Cuota mensual: ${formatMoney(monthlyPayment)}`,
      `Plazo: ${lender.termMonths} meses`
    );
    // refrescar todo el bloque
    renderLoanOptions();
  });

  // —————————————————————————————————————————
  // 2) Lista de prestadores (para consulta rápida)
  // —————————————————————————————————————————
  const list = document.createElement('div');
  list.className = 'lenders-list';
  lenders.forEach(lender => {
    const approxMonthly = computeMonthlyPayment(
      lender.maxAmount, lender.annualRate, lender.termMonths
    );
    const card = document.createElement('div');
    card.className = 'lender-card';
    card.innerHTML = `
      <h4>${lender.name}</h4>
      <ul>
        <p> Monto máximo: ${formatMoney(lender.maxAmount)}</p>
        <p> Plazo: ${lender.termMonths} meses</p>
        <p> Tasa: ${(lender.annualRate*100).toFixed(1)}% anual (${lender.interestType})</p>
        <button class="talk-btn">
            <i class="fa-solid fa-video"></i>
            <span>VIDEOLLAMADA</span>
        </button>
        </ul>
    `;
    card.querySelector('.talk-btn')
    .addEventListener('click', () => openLenderModal(lender));
    list.appendChild(card);
  });
  container.appendChild(list);

  // —————————————————————————————————————————
  // 3) Historial de préstamos tomados
  // —————————————————————————————————————————
  const histDiv = document.createElement('div');
  histDiv.className = 'loan-history';
  histDiv.innerHTML = `<h3>Préstamos en curso</h3>`;
  if (gameState.loans.length === 0) {
    histDiv.innerHTML += `<p>No tienes préstamos en curso.</p>`;
  } else {
    const ul = document.createElement('ul');
    gameState.loans.forEach((loan, i) => {
      ul.insertAdjacentHTML('beforeend', `
        <li>
          <strong>#${i+1} — ${loan.lenderName}</strong><br/>
          Restante: ${formatMoney(loan.principal)} &middot;
          Cuota: ${formatMoney(loan.monthlyPayment)} / mes &middot;
          Meses restantes: ${loan.monthsLeft}
        </li>
      `);
    });
    histDiv.appendChild(ul);
  }
  container.appendChild(histDiv);
}



function renderLoansStatus() {
  const loanOptionsContainer = document.getElementById('loanOptions');
  loanOptionsContainer.innerHTML = '<h3>Préstamos en curso</h3>';

  if (gameState.loans.length === 0) {
    loanOptionsContainer.innerHTML += '<p>No tienes préstamos en curso.</p>';
    return;
  }

  const ul = document.createElement('ul');
  gameState.loans.forEach((loan, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>Préstamo #${index + 1}</strong> &mdash; 
      Restante: ${formatMoney(loan.amount)}<br/>
      Cuota semanal: ${formatMoney(loan.weeklyPayment)}<br/>
      Semanas restantes: ${loan.weeksLeft}
    `;
    ul.appendChild(li);
  });

  loanOptionsContainer.appendChild(ul);
}



// Calcular cuota mensual de un préstamo
function computeMonthlyPayment(principal, annualRate, nMonths) {
  const r = annualRate / 12; 
  return principal * (r * Math.pow(1 + r, nMonths)) 
                   / (Math.pow(1 + r, nMonths) - 1);
}

// Solicitar un préstamo
function requestLoan(amount, lender) {
  // 1) Calculamos la cuota mensual real
  const monthlyPayment = computeMonthlyPayment(
    amount,
    lender.annualRate,
    lender.termMonths
  );

  // 2) Añadimos al estado un objeto de préstamo
  gameState.loans.push({
    lenderId:       lender.id,
    lenderName:     lender.name,
    principal:      amount,
    monthlyPayment: monthlyPayment,
    monthsLeft:     lender.termMonths,
    annualRate:     lender.annualRate
  });

  // 3) Acreditamos inmediatamente el dinero
  gameState.money += amount;
  updateUI();

  // 4) Mostramos el modal con todos los datos
  showModal(
    '¡Préstamo recibido!',
    `Prestador: ${lender.name}`,
    `Monto: ${formatMoney(amount)}`,
    `Tasa: ${(lender.annualRate * 100).toFixed(1)}% anual`,
    `Cuota mensual: ${formatMoney(monthlyPayment)}`,
    `Plazo: ${lender.termMonths} meses`
  );
}

// ─── Toggle de música ───────────────────────────────────────────────────
const audio   = document.getElementById('bgMusic');
const btnAud  = document.getElementById('audioToggle');
let  musicOn  = false;

btnAud.addEventListener('click', () => {
  musicOn = !musicOn;
  if (musicOn) {
    audio.play().catch(console.error);     // algunos navegadores exigen interacción
    btnAud.innerHTML = '<i class="fas fa-volume-high"></i>';
  } else {
    audio.pause();
    btnAud.innerHTML = '<i class="fas fa-volume-xmark"></i>';
  }
});
function openLenderModal(lender) {
  // Rellenar contenido
  lenderImgEl.src        = lender.image;
  lenderNameEl.textContent = lender.name;
  lenderAudioEl.src      = lender.audio;

  // Mostrar modal
  lenderModal.classList.remove('hidden');

  // Reproducir solo una vez
  lenderAudioEl.currentTime = 0;
  lenderAudioEl.play().catch(() => {});      // Por si el navegador exige interacción previa
}

lenderCloseEl.addEventListener('click', () => {
  lenderModal.classList.add('hidden');
  lenderAudioEl.pause();
  lenderAudioEl.currentTime = 0;
});

function computeTotalSales() {
  return gameState.salesHistory.reduce((sum, record) => sum + record.total, 0);
}

// Inicializar el juego
function initGame() {
    updateUI();
    nextWeekButton.addEventListener('click', nextWeek);
}

// Iniciar el juego cuando se carga la página
window.addEventListener('load', initGame);