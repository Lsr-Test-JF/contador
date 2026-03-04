const START_YEAR = 2022;
const END_YEAR = 2040;
const COLLAPSE_AFTER = 2027;
const ANNIVERSARY_MONTH = 2;
const ANNIVERSARY_DAY = 7;

const fallbackMessages = [
  "Você é meu melhor encontro diário ❤️",
  "Cada 07 de março me lembra como foi incrível te conhecer.",
  "Nosso amor floresce como girassol ao sol 🌻",
  "Com você, até os dias comuns viram lembranças especiais.",
];

const fallbackMemories = [
  { title: "Nosso começo", text: "Escreva aqui como tudo começou.", image: "", imageLabel: "Substitua pela foto 1" },
  { title: "Memória favorita", text: "Coloque aqui uma lembrança inesquecível.", image: "", imageLabel: "Substitua pela foto 2" },
  { title: "Próxima aventura", text: "Planeje aqui o próximo aniversário juntos.", image: "", imageLabel: "Substitua pela foto 3" },
];

const timelineGrid = document.querySelector("#timeline-grid");
const nextAnniversaryEl = document.querySelector("#next-anniversary");
const toggleFutureBtn = document.querySelector("#toggle-future-btn");
const memoriesGrid = document.querySelector("#memories-grid");
const drawMessageBtn = document.querySelector("#draw-message-btn");
const messageStatusEl = document.querySelector("#message-status");

const now = new Date();
let futureExpanded = false;
let messages = [...fallbackMessages];
let memories = [...fallbackMemories];

const formatDateBR = (date) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);

const isValidArray = (value) => Array.isArray(value) && value.length > 0;

async function loadData() {
  try {
    const [messagesResponse, memoriesResponse] = await Promise.all([
      fetch("./data/messages.json", { cache: "no-store" }),
      fetch("./data/memories.json", { cache: "no-store" }),
    ]);

    if (messagesResponse.ok) {
      const loadedMessages = await messagesResponse.json();
      if (isValidArray(loadedMessages)) {
        messages = loadedMessages.filter((item) => typeof item === "string" && item.trim());
      }
    }

    if (memoriesResponse.ok) {
      const loadedMemories = await memoriesResponse.json();
      if (isValidArray(loadedMemories)) {
        memories = loadedMemories.map((item, index) => ({
          title: item.title || `Memória ${index + 1}`,
          text: item.text || "Edite este texto com sua lembrança.",
          image: item.image || "",
          imageLabel: item.imageLabel || `Substitua pela foto ${index + 1}`,
        }));
      }
    }
  } catch {
    messages = [...fallbackMessages];
    memories = [...fallbackMemories];
  }

  if (!isValidArray(messages)) {
    messages = [...fallbackMessages];
  }
}

function getAnniversaryDate(year) {
  return new Date(year, ANNIVERSARY_MONTH, ANNIVERSARY_DAY, 0, 0, 0, 0);
}

function diffYMD(fromDate, toDate) {
  let years = toDate.getFullYear() - fromDate.getFullYear();
  let months = toDate.getMonth() - fromDate.getMonth();
  let days = toDate.getDate() - fromDate.getDate();

  if (days < 0) {
    const previousMonthDays = new Date(toDate.getFullYear(), toDate.getMonth(), 0).getDate();
    days += previousMonthDays;
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return { years: Math.max(years, 0), months: Math.max(months, 0), days: Math.max(days, 0) };
}

function getUpcomingAnniversary() {
  const thisYearDate = getAnniversaryDate(now.getFullYear());
  const target = now > thisYearDate ? getAnniversaryDate(now.getFullYear() + 1) : thisYearDate;
  return { target, diff: diffYMD(now, target) };
}

function renderSummary() {
  const { target, diff } = getUpcomingAnniversary();
  nextAnniversaryEl.textContent = `Próximo aniversário: ${formatDateBR(target)} · faltam ${diff.years} ano(s), ${diff.months} mês(es) e ${diff.days} dia(s).`;
}

function renderYearCard(year) {
  const targetDate = getAnniversaryDate(year);
  const isPast = now >= targetDate;
  const anniversaryIndex = year - START_YEAR;

  const card = document.createElement("article");
  card.className = "year-card";

  if (year > COLLAPSE_AFTER) {
    card.classList.add("hidden-year");
  }

  const statusBadge = isPast
    ? '<span class="badge badge--ok" aria-label="Data já passou">✔ Já passou</span>'
    : '<span class="badge badge--pending" aria-label="Data futura">⏳ Aguardando</span>';

  let content = "";
  if (isPast) {
    const celebration = anniversaryIndex === 0
      ? "Ano de início do namoro celebrado."
      : `${anniversaryIndex}º aniversário celebrado. Hora de comemorar!`;
    content = `<p>✅ ${celebration}</p>`;
  } else {
    const { years, months, days } = diffYMD(now, targetDate);
    content = `
      <p>Faltam para esta data:</p>
      <div class="countdown" role="list" aria-label="Contagem para ${year}">
        <div class="countdown__item" role="listitem"><span class="countdown__value">${years}</span><span class="countdown__label">anos</span></div>
        <div class="countdown__item" role="listitem"><span class="countdown__value">${months}</span><span class="countdown__label">meses</span></div>
        <div class="countdown__item" role="listitem"><span class="countdown__value">${days}</span><span class="countdown__label">dias</span></div>
      </div>
    `;
  }

  card.innerHTML = `
    <div class="year-card__head">
      <h3>${year} · 07/03/${year}</h3>
      ${statusBadge}
    </div>
    ${content}
  `;

  return card;
}

function renderTimeline() {
  for (let year = START_YEAR; year <= END_YEAR; year += 1) {
    timelineGrid.appendChild(renderYearCard(year));
  }
}

function bindToggle() {
  const hiddenCards = document.querySelectorAll(".hidden-year");
  toggleFutureBtn.addEventListener("click", () => {
    futureExpanded = !futureExpanded;
    hiddenCards.forEach((card) => card.classList.toggle("show", futureExpanded));
    toggleFutureBtn.textContent = futureExpanded ? "Ocultar anos 2028 a 2040" : "Exibir anos 2028 a 2040";
    toggleFutureBtn.setAttribute("aria-expanded", String(futureExpanded));
  });
}

function renderMemories() {
  memoriesGrid.innerHTML = "";

  memories.forEach(({ title, text, image, imageLabel }) => {
    const card = document.createElement("article");
    card.className = "memory-card";

    const imageMarkup = image
      ? `<img class="memory-card__img" src="${image}" alt="${title}" loading="lazy" decoding="async" />`
      : `<div class="memory-card__placeholder">${imageLabel}</div>`;

    card.innerHTML = `
      <div class="memory-card__photo">${imageMarkup}</div>
      <div class="memory-card__body">
        <h3>${title}</h3>
        <p>${text}</p>
      </div>
    `;

    memoriesGrid.appendChild(card);
  });
}

function bindRandomMessage() {
  drawMessageBtn.addEventListener("click", () => {
    drawMessageBtn.disabled = true;
    messageStatusEl.classList.add("is-loading");
    messageStatusEl.textContent = "Buscando mensagem...";

    window.setTimeout(() => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      messageStatusEl.classList.remove("is-loading");
      messageStatusEl.textContent = randomMessage;
      drawMessageBtn.disabled = false;
    }, 1000);
  });
}

async function initPage() {
  await loadData();
  renderSummary();
  renderTimeline();
  bindToggle();
  renderMemories();
  bindRandomMessage();
}

initPage();
