
const ChartColors = {
  blue: '#0a4a8f',
  blue2: '#3aa7df',
  green: '#1f9d67',
  red: '#d64545',
  amber: '#f2a93b',
  violet: '#6a5acd',
  gray: '#7f8a9a'
};

const RFM_COLORS = {
  Champions: '#1b9e77',
  Loyal: '#377eb8',
  'At Risk': '#e41a1c',
  'Needs Attention': '#f39c12',
  'New Customers': '#8bc34a',
  Lost: '#7f7f7f',
  Potential: '#6a5acd'
};

const chartMeta = {
  categoryChart: ['Ventas y ganancia por categoría', 'Compara volumen de ventas y resultado económico por categoría.'],
  subSalesChart: ['Top 10 subcategorías por ventas', 'Ranking de facturación de las subcategorías principales.'],
  subProfitChart: ['Ganancia por subcategoría', 'Muestra las líneas que generan margen y las que destruyen valor.'],
  regionChart: ['Ventas por región', 'Ventas regionales con referencia de margen efectivo.'],
  segmentChart: ['Ventas por segmento', 'Comparación de facturación por tipo de cliente.'],
  discountChart: ['Impacto de descuentos', 'Relación entre política de descuentos y resultado económico.'],
  annualChart: ['Evolución anual', 'Ventas y ganancias agregadas por año.'],
  monthlyChart: ['Evolución mensual', 'Serie temporal completa con picos recurrentes al cierre del año.'],
  rfmDonuts: ['Distribución RFM', 'Comparación entre participación de clientes y participación de revenue por segmento.'],
  rfmRevenue: ['Revenue histórico RFM', 'Aporte económico acumulado de cada segmento.'],
  rfmScatter: ['Mapa RFM', 'Recencia, frecuencia y valor monetario por segmento.']
};

function $(selector){ return document.querySelector(selector); }
function $$(selector){ return Array.from(document.querySelectorAll(selector)); }

function formatMoney(value){
  const abs = Math.abs(value);
  if(abs >= 1000000) return 'US$ ' + (value/1000000).toFixed(2).replace('.', ',') + 'M';
  if(abs >= 1000) return 'US$ ' + (value/1000).toFixed(1).replace('.', ',') + 'K';
  return 'US$ ' + Math.round(value).toLocaleString('es-AR');
}
function formatNumber(value){ return Number(value).toLocaleString('es-AR'); }
function formatPct(value){ return Number(value).toFixed(1).replace('.', ',') + '%'; }

function createSvg(container, width=860, height=390, aspect='none'){
  container.innerHTML = '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', aspect);
  container.appendChild(svg);
  return svg;
}

function el(name, attrs={}, text=''){
  const node = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attrs).forEach(([key,val]) => node.setAttribute(key, val));
  if(text !== '') node.textContent = text;
  return node;
}

function addTooltip(node, html){
  node.dataset.tip = html;
  node.setAttribute('data-tip', html);
  bindTooltip(node);
}

function bindTooltip(node){
  const tip = node.dataset.tip || node.getAttribute('data-tip');
  if(!tip || node.dataset.boundTip === '1') return;
  node.dataset.boundTip = '1';
  node.addEventListener('mouseenter', event => showTooltip(event, tip));
  node.addEventListener('mousemove', moveTooltip);
  node.addEventListener('mouseleave', hideTooltip);
}

function showTooltip(event, html){
  const tooltip = $('#tooltip');
  if(!tooltip) return;
  tooltip.innerHTML = html;
  tooltip.style.opacity = '1';
  moveTooltip(event);
}

function moveTooltip(event){
  const tooltip = $('#tooltip');
  if(!tooltip) return;
  tooltip.style.left = event.clientX + 'px';
  tooltip.style.top = (event.clientY - 12) + 'px';
}

function hideTooltip(){
  const tooltip = $('#tooltip');
  if(tooltip) tooltip.style.opacity = '0';
}

function addGrid(svg, width, height, margin, ticks=4){
  for(let i=0; i<=ticks; i++){
    const y = margin.top + (height - margin.top - margin.bottom) * i / ticks;
    svg.appendChild(el('line', {x1:margin.left, x2:width-margin.right, y1:y, y2:y, class:'axis-line'}));
  }
}

function addYAxis(svg, width, height, margin, min, max, formatter){
  for(let i=0; i<=4; i++){
    const value = max - (max-min)*i/4;
    const y = margin.top + (height-margin.top-margin.bottom)*i/4 + 4;
    svg.appendChild(el('text', {x:margin.left-10, y, 'text-anchor':'end', class:'axis-text'}, formatter(value)));
  }
}

function addXAxis(svg, width, height, margin, min, max, formatter){
  for(let i=0; i<=4; i++){
    const value = min + (max-min)*i/4;
    const x = margin.left + (width-margin.left-margin.right)*i/4;
    svg.appendChild(el('text', {x, y:height-margin.bottom+35, 'text-anchor':'middle', class:'axis-text'}, formatter(value)));
  }
}

function stagger(container){
  container.querySelectorAll('.bar-y,.bar-x,.bar-x-neg,.point,.bubble,.slice').forEach((node,index) => {
    node.style.animationDelay = `${Math.min(index, 16)*45}ms`;
  });
}

function animateLinePath(path){
  try{
    const len = path.getTotalLength();
    path.dataset.lineLength = String(len);
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    path.style.transition = 'none';
    path.style.opacity = '0';
  }catch(e){}
}

function restartChartAnimation(chart){
  if(!chart) return;

  chart.classList.remove('animate');

  const animatedNodes = chart.querySelectorAll('.bar-y,.bar-x,.bar-x-neg,.point,.bubble,.slice');
  animatedNodes.forEach((node, index) => {
    node.style.animation = 'none';
    node.style.animationDelay = `${Math.min(index, 18) * 55}ms`;
  });

  const linePaths = chart.querySelectorAll('.line-path');
  linePaths.forEach(path => {
    try{
      const len = Number(path.dataset.lineLength) || path.getTotalLength();
      path.dataset.lineLength = String(len);
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.style.transition = 'none';
      path.style.opacity = '0';
    }catch(e){}
  });

  chart.getBoundingClientRect();

  animatedNodes.forEach(node => {
    node.style.animation = '';
  });

  chart.classList.add('animate');

  linePaths.forEach((path, index) => {
    try{
      const len = Number(path.dataset.lineLength) || path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.style.opacity = '1';
      window.setTimeout(() => {
        path.style.transition = 'stroke-dashoffset 1.55s cubic-bezier(.2,.85,.2,1)';
        path.style.strokeDashoffset = '0';
      }, 130 + index * 120);
    }catch(e){}
  });
}

function initChartAnimations(){
  const charts = document.querySelectorAll('.chart');
  if(!charts.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        restartChartAnimation(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.28, rootMargin:'0px 0px -8% 0px'});

  charts.forEach(chart => observer.observe(chart));
}

function animateChartById(id){
  const chart = typeof id === 'string' ? document.getElementById(id) : id;
  if(chart) restartChartAnimation(chart);
}

function drawGroupedBars(){
  const container = $('#categoryChart');
  const legend = $('#categoryLegend');
  if(!container) return;
  const width=860, height=390, margin={left:76,right:28,top:30,bottom:70};
  const svg=createSvg(container,width,height);
  const rows = PROJECT_DATA.category;
  const max = Math.max(...rows.flatMap(d => [d.sales,d.profit])) * 1.15;
  addGrid(svg,width,height,margin,4);
  addYAxis(svg,width,height,margin,0,max,formatMoney);
  const groupWidth = (width-margin.left-margin.right)/rows.length;
  const barWidth = groupWidth*.22;
  rows.forEach((d,i) => {
    const cx = margin.left + i*groupWidth + groupWidth/2;
    [['sales',ChartColors.blue,'Ventas'],['profit',ChartColors.blue2,'Ganancia']].forEach((series,j) => {
      const val = d[series[0]];
      const bh = (height-margin.top-margin.bottom)*val/max;
      const x = cx + (j-.5)*barWidth*1.35 - barWidth/2;
      const y = height-margin.bottom-bh;
      const rect = el('rect', {x, y, width:barWidth, height:bh, rx:7, fill:series[1], class:'bar-y'});
      addTooltip(rect, `<b>${d.Category}</b><br>${series[2]}: ${formatMoney(val)}<br>Margen: ${formatPct(d.margin)}<br>Unidades: ${formatNumber(d.units)}`);
      svg.appendChild(rect);
    });
    svg.appendChild(el('text',{x:cx,y:height-margin.bottom+22,'text-anchor':'middle',class:'label-text'}, d.Category.replace('Office Supplies','Office')));
  });
  svg.appendChild(el('line',{x1:margin.left,x2:width-margin.right,y1:height-margin.bottom,y2:height-margin.bottom,class:'zero-line'}));
  if(legend){
    legend.innerHTML = `<span><i class="swatch" style="background:${ChartColors.blue}"></i>Ventas</span><span><i class="swatch" style="background:${ChartColors.blue2}"></i>Ganancia</span>`;
  }
  stagger(container);
}

function drawHorizontal(id, rows, valueKey, options={}){
  const container = $(id);
  if(!container) return;
  const width=860, height=390, margin={left:132,right:62,top:28,bottom:60};
  const svg=createSvg(container,width,height);
  const values = rows.map(d => d[valueKey]);
  const min = Math.min(0,...values), max = Math.max(0,...values);
  const span = max-min || 1;
  const plotW = width-margin.left-margin.right;
  const zeroX = margin.left + (0-min)/span*plotW;
  addGrid(svg,width,height,margin,4);
  addXAxis(svg,width,height,margin,min,max, options.number ? formatNumber : formatMoney);
  svg.appendChild(el('line',{x1:zeroX,x2:zeroX,y1:margin.top,y2:height-margin.bottom,class:'zero-line'}));
  rows.forEach((d,i) => {
    const rowH = (height-margin.top-margin.bottom)/rows.length;
    const barH = rowH*.60;
    const y = margin.top + i*rowH + rowH*.20;
    const val = d[valueKey];
    const bw = Math.abs(val)/span*plotW;
    const x = val >= 0 ? zeroX : zeroX-bw;
    const fill = val < 0 ? ChartColors.red : (options.color || ChartColors.blue);
    const cls = val < 0 ? 'bar-x-neg' : 'bar-x';
    const rect = el('rect',{x,y,width:bw,height:barH,rx:6,fill,class:cls});
    const name = d['Sub-Category'] || d.segment || d.Segment || d.Region || d.DiscountLabel || d.label || d.Category;
    const detail = options.number ? formatNumber(val) : formatMoney(val);
    addTooltip(rect, `<b>${name}</b><br>${options.label||'Valor'}: ${detail}${d.profit !== undefined ? '<br>Ganancia: '+formatMoney(d.profit) : ''}${d.sales !== undefined ? '<br>Ventas: '+formatMoney(d.sales) : ''}`);
    svg.appendChild(rect);
    svg.appendChild(el('text',{x:10,y:y+barH*.68,class:'label-text'}, String(name)));
    svg.appendChild(el('text',{x: val >= 0 ? x+bw+7 : x-7, y:y+barH*.68, 'text-anchor':val>=0?'start':'end', class:'label-text'}, detail));
  });
  stagger(container);
}

function drawSubCharts(){
  drawHorizontal('#subSalesChart', PROJECT_DATA.subSales, 'sales', {label:'Ventas', color:ChartColors.blue});
  drawHorizontal('#subProfitChart', PROJECT_DATA.subProfit, 'profit', {label:'Ganancia', color:ChartColors.green});
}

function drawRegion(){
  const container = $('#regionChart'), legend=$('#regionLegend');
  if(!container) return;
  const width=860,height=390,margin={left:76,right:42,top:30,bottom:68};
  const svg=createSvg(container,width,height);
  const rows=PROJECT_DATA.region;
  const max=Math.max(...rows.map(d=>d.sales))*1.15;
  addGrid(svg,width,height,margin,4);
  addYAxis(svg,width,height,margin,0,max,formatMoney);
  const group=(width-margin.left-margin.right)/rows.length;
  const barW=group*.42;
  rows.forEach((d,i)=>{
    const x=margin.left+i*group+group/2-barW/2;
    const bh=(height-margin.top-margin.bottom)*d.sales/max;
    const y=height-margin.bottom-bh;
    const color=d.Region==='Central'?ChartColors.amber:ChartColors.blue;
    const rect=el('rect',{x,y,width:barW,height:bh,rx:8,fill:color,class:'bar-y'});
    addTooltip(rect,`<b>${d.Region}</b><br>Ventas: ${formatMoney(d.sales)}<br>Ganancia: ${formatMoney(d.profit)}<br>Margen: ${formatPct(d.margin)}<br>Órdenes: ${formatNumber(d.orders)}`);
    svg.appendChild(rect);
    const marker=el('circle',{cx:x+barW/2,cy:y-18,r:Math.max(5,d.margin*.7),fill:d.margin<9?ChartColors.red:ChartColors.green,opacity:.9,class:'point'});
    addTooltip(marker,`<b>${d.Region}</b><br>Margen efectivo: ${formatPct(d.margin)}`);
    svg.appendChild(marker);
    svg.appendChild(el('text',{x:x+barW/2,y:height-margin.bottom+22,'text-anchor':'middle',class:'label-text'},d.Region));
  });
  svg.appendChild(el('line',{x1:margin.left,x2:width-margin.right,y1:height-margin.bottom,y2:height-margin.bottom,class:'zero-line'}));
  if(legend) legend.innerHTML=`<span><i class="swatch" style="background:${ChartColors.blue}"></i>Ventas</span><span><i class="swatch" style="background:${ChartColors.green}"></i>Margen saludable</span><span><i class="swatch" style="background:${ChartColors.amber}"></i>Central</span>`;
  stagger(container);
}

function drawSegment(){
  const rows = PROJECT_DATA.segment.map(d => ({label:d.Segment, sales:d.sales, profit:d.profit, ticket_line:d.ticket_line}));
  drawHorizontal('#segmentChart', rows, 'sales', {label:'Ventas', color:ChartColors.violet});
}

function drawDiscount(mode='profit'){
  const key = mode === 'sales' ? 'sales' : mode === 'operations' ? 'operations' : 'profit';
  const rows = PROJECT_DATA.discount.map(d => ({
    label: `${Math.round(d.Discount*100)}%`,
    sales:d.sales,
    profit:d.profit,
    operations:d.operations
  }));
  drawHorizontal('#discountChart', rows, key, {label: mode==='operations'?'Operaciones':mode==='sales'?'Ventas':'Ganancia', color: mode==='sales'?ChartColors.blue:ChartColors.violet, number:mode==='operations'});
}

function drawLine(id, rows, xKey, yKey, opts={}){
  const container=$(id);
  if(!container) return;
  const width=860,height=390,margin={left:70,right:40,top:32,bottom:70};
  const svg=createSvg(container,width,height);
  const values=rows.map(d=>d[yKey]);
  const min=Math.min(0,...values), max=Math.max(...values)*1.15;
  const x = i => margin.left + i*(width-margin.left-margin.right)/(rows.length-1 || 1);
  const y = v => height-margin.bottom - (v-min)/(max-min)*(height-margin.top-margin.bottom);
  addGrid(svg,width,height,margin,4);
  addYAxis(svg,width,height,margin,min,max,opts.money?formatMoney:(v=>formatNumber(Math.round(v))));
  let path='', area=`M ${margin.left} ${height-margin.bottom}`;
  rows.forEach((d,i)=>{
    path += `${i?' L':'M'} ${x(i)} ${y(d[yKey])}`;
    area += ` L ${x(i)} ${y(d[yKey])}`;
  });
  area += ` L ${x(rows.length-1)} ${height-margin.bottom} Z`;
  svg.appendChild(el('path',{d:area,fill:opts.fill||'rgba(10,74,143,.12)'}));
  const line=el('path',{d:path,fill:'none',stroke:opts.color||ChartColors.blue,'stroke-width':4,'stroke-linecap':'round',class:'line-path'});
  svg.appendChild(line);
  animateLinePath(line);
  const step = rows.length > 15 ? Math.ceil(rows.length/8) : 1;
  rows.forEach((d,i)=>{
    const cx=x(i), cy=y(d[yKey]);
    const dot=el('circle',{cx,cy,r:6,fill:opts.color||ChartColors.blue,class:'point'});
    addTooltip(dot,`<b>${d[xKey]}</b><br>${opts.label||'Valor'}: ${opts.money?formatMoney(d[yKey]):formatNumber(d[yKey])}`);
    svg.appendChild(dot);
    if(i%step===0 || i===rows.length-1){
      svg.appendChild(el('text',{x:cx,y:height-margin.bottom+24,'text-anchor':'middle',class:'label-text'},String(d[xKey]).replace('201','’1')));
    }
  });
  svg.appendChild(el('line',{x1:margin.left,x2:width-margin.right,y1:height-margin.bottom,y2:height-margin.bottom,class:'zero-line'}));
  stagger(container);
}

function drawAnnual(){
  const salesRows=PROJECT_DATA.annual.map(d=>({label:String(d.Year), value:d.sales}));
  drawLine('#annualChart', salesRows, 'label', 'value', {label:'Ventas', money:true, color:ChartColors.blue, fill:'rgba(10,74,143,.14)'});
}

function drawMonthly(){
  const rows=PROJECT_DATA.monthly.map(d=>({label:d['Order Year-Month'], value:d.sales}));
  drawLine('#monthlyChart', rows, 'label', 'value', {label:'Ventas', money:true, color:ChartColors.amber, fill:'rgba(242,169,59,.16)'});
}

function donutPath(cx,cy,r0,r1,a0,a1){
  const p=(r,a)=>[cx+r*Math.cos(a),cy+r*Math.sin(a)];
  const [x1,y1]=p(r1,a0), [x2,y2]=p(r1,a1), [x3,y3]=p(r0,a1), [x4,y4]=p(r0,a0);
  const large=a1-a0>Math.PI?1:0;
  return `M ${x1} ${y1} A ${r1} ${r1} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r0} ${r0} 0 ${large} 0 ${x4} ${y4} Z`;
}

function drawRfmDonuts(){
  const container=$('#rfmDonuts');
  if(!container) return;
  const width=900,height=430;
  const svg=createSvg(container,width,height,'xMidYMid meet');
  const draw=(cx,key,title)=>{
    let start=-Math.PI/2;
    PROJECT_DATA.rfm.forEach(d=>{
      const pct=d[key], end=start+pct/100*Math.PI*2;
      const slice=el('path',{d:donutPath(cx,150,70,108,start,end),fill:RFM_COLORS[d.segment],class:'slice'});
      addTooltip(slice,`<b>${d.segment}</b><br>${title}: ${formatPct(pct)}<br>Clientes: ${d.clients}<br>Revenue: ${formatMoney(d.revenue)}<br>Acción: ${d.action}`);
      svg.appendChild(slice);
      start=end;
    });
    svg.appendChild(el('text',{x:cx,y:145,'text-anchor':'middle','font-weight':'900',fill:'currentColor','font-size':23},title));
    svg.appendChild(el('text',{x:cx,y:172,'text-anchor':'middle',class:'label-text'},'por segmento'));
  };
  draw(245,'clientPct','Clientes');
  draw(645,'revenuePct','Revenue');
  const legendX=80, legendY=302, colW=205;
  PROJECT_DATA.rfm.forEach((d,i)=>{
    const x=legendX+(i%4)*colW, y=legendY+Math.floor(i/4)*28;
    svg.appendChild(el('rect',{x,y,width:13,height:13,rx:3,fill:RFM_COLORS[d.segment]}));
    svg.appendChild(el('text',{x:x+20,y:y+11,class:'label-text'},`${d.segment} · ${formatPct(d.revenuePct)} rev.`));
  });
  stagger(container);
}

function drawRfmRevenue(){
  const rows=[...PROJECT_DATA.rfm].sort((a,b)=>b.revenue-a.revenue).map(d=>({segment:d.segment, revenue:d.revenue, clients:d.clients, action:d.action}));
  drawHorizontal('#rfmRevenue', rows, 'revenue', {label:'Revenue', color:ChartColors.green});
}

function drawRfmScatter(){
  const container=$('#rfmScatter');
  if(!container) return;
  const width=860,height=390,margin={left:70,right:45,top:35,bottom:70};
  const svg=createSvg(container,width,height,'xMidYMid meet');
  addGrid(svg,width,height,margin,4);
  const maxX=390,maxY=10;
  addXAxis(svg,width,height,margin,0,maxX,v=>Math.round(v)+'d');
  addYAxis(svg,width,height,margin,0,maxY,v=>Math.round(v));
  svg.appendChild(el('line',{x1:margin.left,x2:width-margin.right,y1:height-margin.bottom,y2:height-margin.bottom,class:'zero-line'}));
  svg.appendChild(el('line',{x1:margin.left,x2:margin.left,y1:margin.top,y2:height-margin.bottom,class:'zero-line'}));
  PROJECT_DATA.rfm.forEach(d=>{
    const x=margin.left+d.recency/maxX*(width-margin.left-margin.right);
    const y=height-margin.bottom-d.frequency/maxY*(height-margin.top-margin.bottom);
    const r=9+Math.sqrt(d.revenue)/95;
    const bubble=el('circle',{cx:x,cy:y,r:r,fill:RFM_COLORS[d.segment],opacity:.78,class:'bubble'});
    addTooltip(bubble,`<b>${d.segment}</b><br>Recencia: ${d.recency} días<br>Frecuencia: ${d.frequency}<br>Revenue: ${formatMoney(d.revenue)}<br>Acción: ${d.action}`);
    svg.appendChild(bubble);
    svg.appendChild(el('text',{x:x,y:y-r-5,'text-anchor':'middle',class:'label-text'},d.segment.split(' ')[0]));
  });
  svg.appendChild(el('text',{x:width/2,y:height-14,'text-anchor':'middle',class:'label-text'},'Recencia: días desde la última compra'));
  svg.appendChild(el('text',{x:19,y:height/2,transform:`rotate(-90 19 ${height/2})`,'text-anchor':'middle',class:'label-text'},'Frecuencia promedio'));
  stagger(container);
}

function drawRfmTable(){
  const table=$('#rfmTable');
  if(!table) return;
  table.innerHTML = '<thead><tr><th>Segmento</th><th>Clientes</th><th>% Revenue</th><th>Recencia</th><th>Ticket</th><th>Acción</th></tr></thead><tbody>' +
    PROJECT_DATA.rfm.map(d => `<tr><td><b>${d.segment}</b></td><td>${d.clients}</td><td>${formatPct(d.revenuePct)}</td><td>${d.recency} días</td><td>${formatMoney(d.ticket)}</td><td>${d.action}</td></tr>`).join('') +
    '</tbody>';
}

function drawAllCharts(){
  drawGroupedBars();
  drawSubCharts();
  drawRegion();
  drawSegment();
  drawDiscount('profit');
  drawAnnual();
  drawMonthly();
  drawRfmDonuts();
  drawRfmRevenue();
  drawRfmScatter();
  drawRfmTable();
}
