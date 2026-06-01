
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initReveal();
  initCounters();
  drawAllCharts();
  if(typeof initChartAnimations === 'function') initChartAnimations();
  initChartControls();
  initChartModal();
});

function initTheme(){
  const html = document.documentElement;
  const button = document.getElementById('themeToggle');
  const icon = button?.querySelector('.theme-icon');
  const saved = localStorage.getItem('ppiv-theme');
  const initial = saved || 'dark';

  html.setAttribute('data-theme', initial);
  if(icon) icon.textContent = initial === 'dark' ? '☀️' : '🌙';

  button?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ppiv-theme', next);
    if(icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
  });
}

function initNavigation(){
  const menu = document.getElementById('mobileMenu');
  const nav = document.getElementById('navlinks');
  menu?.addEventListener('click', () => nav?.classList.toggle('open'));

  document.querySelectorAll('.navlinks a').forEach(link => {
    link.addEventListener('click', () => nav?.classList.remove('open'));
  });

  const sections = document.querySelectorAll('.section');
  const links = document.querySelectorAll('.navlinks a[href^="#"]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        links.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, {rootMargin:'-38% 0px -55% 0px', threshold:0.08});
  sections.forEach(section => observer.observe(section));

  document.querySelectorAll('.chip[data-target]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
      button.classList.add('active');
      document.querySelector(button.dataset.target)?.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });
}

function initReveal(){
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.15});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function animateNumber(el){
  if(el.dataset.done === '1') return;
  el.dataset.done = '1';
  const money = el.dataset.money;
  const count = el.dataset.count;
  const percent = el.dataset.percent;
  const rawTarget = money || count || percent;
  const target = parseFloat(rawTarget);
  if(Number.isNaN(target)) return;
  const duration = 1300;
  const start = performance.now();

  const format = value => {
    if(money){
      if(value >= 1000000) return 'US$ ' + (value/1000000).toFixed(2).replace('.', ',') + 'M';
      if(value >= 1000) return 'US$ ' + (value/1000).toFixed(1).replace('.', ',') + 'K';
      return 'US$ ' + Math.round(value).toLocaleString('es-AR');
    }
    if(percent) return value.toFixed(1).replace('.', ',') + '%';
    return Math.round(value).toLocaleString('es-AR');
  };

  function frame(now){
    const p = Math.min(1, (now-start)/duration);
    const ease = 1 - Math.pow(1-p, 3);
    el.textContent = format(target * ease);
    if(p < 1) requestAnimationFrame(frame);
    else el.textContent = format(target);
  }
  requestAnimationFrame(frame);
}

function initCounters(){
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        animateNumber(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.55});
  document.querySelectorAll('[data-count],[data-money],[data-percent]').forEach(el => observer.observe(el));
}

function initChartControls(){
  document.querySelectorAll('[data-discount-mode]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-discount-mode]').forEach(x => x.classList.remove('active'));
      button.classList.add('active');
      drawDiscount(button.dataset.discountMode);
      requestAnimationFrame(() => { if(typeof animateChartById === 'function') animateChartById('discountChart'); });
    });
  });
}

let modalZoom = 1;

function initChartModal(){
  const modal = document.getElementById('chartModal');
  const modalChart = document.getElementById('modalChart');
  const title = document.getElementById('modalTitle');
  const description = document.getElementById('modalDescription');
  const zoomValue = document.getElementById('zoomValue');

  document.querySelectorAll('.chart-open').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      openModal(button.dataset.chart);
    });
  });

  document.querySelectorAll('.chart').forEach(chart => {
    chart.addEventListener('click', () => {
      if(chart.id) openModal(chart.id);
    });
  });

  function setZoom(value){
    modalZoom = Math.max(.75, Math.min(1.6, value));
    if(modalChart) modalChart.style.transform = `scale(${modalZoom})`;
    if(zoomValue) zoomValue.textContent = Math.round(modalZoom*100) + '%';
  }

  function openModal(chartId){
    const source = document.getElementById(chartId);
    if(!source || !modal || !modalChart) return;
    const meta = chartMeta[chartId] || ['Gráfico ampliado', 'Vista ampliada del análisis.'];
    if(title) title.textContent = meta[0];
    if(description) description.textContent = meta[1];
    modalChart.innerHTML = source.innerHTML;
    modalChart.querySelectorAll('[data-tip]').forEach(node => {
      node.dataset.boundTip = '';
      bindTooltip(node);
    });
    modalChart.querySelectorAll('svg').forEach(svg => {
      svg.setAttribute('preserveAspectRatio', chartId === 'rfmDonuts' || chartId === 'rfmScatter' ? 'xMidYMid meet' : 'none');
    });
    requestAnimationFrame(() => { if(typeof restartChartAnimation === 'function') restartChartAnimation(modalChart); });
    setZoom(1);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
  }

  function closeModal(){
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden','true');
    hideTooltip();
  }

  document.getElementById('closeModal')?.addEventListener('click', closeModal);
  document.getElementById('zoomIn')?.addEventListener('click', () => setZoom(modalZoom + .1));
  document.getElementById('zoomOut')?.addEventListener('click', () => setZoom(modalZoom - .1));
  zoomValue?.addEventListener('click', () => setZoom(1));
  modal?.addEventListener('click', event => {
    if(event.target === modal) closeModal();
  });
  document.addEventListener('keydown', event => {
    if(event.key === 'Escape') closeModal();
  });
}

window.addEventListener('resize', () => {
  clearTimeout(window.__chartResize);
  window.__chartResize = setTimeout(() => { drawAllCharts(); if(typeof initChartAnimations === 'function') initChartAnimations(); }, 180);
});
