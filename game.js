(() => {
  const N = 20, S = 24, GOAL = 10;
  const cv = document.getElementById('c'), cx = cv.getContext('2d');
  const $ = id => document.getElementById(id);
  const overlay = $('overlay');
  let cat, dir, next, fish, score, caught, timer, running, over;
  let best = 0;
  try { best = +localStorage.getItem('meowgic-best') || 0; } catch (e) {}
  $('best').textContent = best;

  function reset() {
    cat = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
    dir = next = {x:1,y:0};
    score = 0; caught = 0; over = false; running = false;
    clearInterval(timer);
    placeFish(); render(); hud();
    overlay.textContent = 'Press a key to start';
    overlay.classList.remove('hide');
  }
  function placeFish() {
    const free = [];
    for (let x=0;x<N;x++) for (let y=0;y<N;y++)
      if (!cat.some(c => c.x===x && c.y===y)) free.push({x,y});
    fish = free[Math.floor(Math.random()*free.length)];
  }
  function hud() {
    $('score').textContent = score;
    $('best').textContent = best;
    $('bar').value = Math.min(caught, GOAL);
    $('mission').textContent = caught >= GOAL ? 'Mission complete! 🎉' : `${caught} / ${GOAL} caught`;
  }
  function start() {
    if (running || over) return;
    running = true; overlay.classList.add('hide');
    timer = setInterval(tick, 130);
  }
  function tick() {
    dir = next;
    const h = {x:cat[0].x+dir.x, y:cat[0].y+dir.y};
    if (h.x<0||h.y<0||h.x>=N||h.y>=N||cat.some(c=>c.x===h.x&&c.y===h.y)) return end();
    cat.unshift(h);
    if (h.x===fish.x && h.y===fish.y) {
      score += 10; caught++;
      if (score > best) { best = score; try { localStorage.setItem('meowgic-best', best); } catch (e) {} }
      placeFish();
    } else cat.pop();
    render(); hud();
  }
  function end() {
    clearInterval(timer); running = false; over = true;
    overlay.textContent = `Game over. Score ${score}. Press New game to retry.`;
    overlay.classList.remove('hide');
  }
  function render() {
    for (let x=0;x<N;x++) for (let y=0;y<N;y++) {
      cx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue((x+y)%2 ? '--grass1' : '--grass2');
      cx.fillRect(x*S, y*S, S, S);
    }
    cx.font = (S-4)+'px serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText('🐟', fish.x*S+S/2, fish.y*S+S/2+1);
    cat.forEach((c,i) => {
      if (i === 0) { cx.fillText('🐱', c.x*S+S/2, c.y*S+S/2+1); return; }
      cx.fillStyle = i%2 ? '#f08a3c' : '#f7b267';
      cx.beginPath(); cx.arc(c.x*S+S/2, c.y*S+S/2, S/2-2, 0, 7); cx.fill();
    });
  }
  const keys = {ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
  function turn(dx, dy) {
    if (dx === -dir.x && dy === -dir.y) return;
    next = {x:dx, y:dy}; start();
  }
  addEventListener('keydown', e => {
    const k = keys[e.key] || keys[e.key.toLowerCase()];
    if (!k) return;
    e.preventDefault(); turn(k[0], k[1]);
  });
  let t0;
  cv.addEventListener('touchstart', e => { t0 = e.touches[0]; }, {passive:true});
  cv.addEventListener('touchend', e => {
    if (!t0) return;
    const t = e.changedTouches[0], dx = t.clientX-t0.clientX, dy = t.clientY-t0.clientY;
    if (Math.max(Math.abs(dx),Math.abs(dy)) < 20) return;
    Math.abs(dx) > Math.abs(dy) ? turn(Math.sign(dx),0) : turn(0,Math.sign(dy));
  }, {passive:true});
  $('new').addEventListener('click', reset);
  reset();
})();
