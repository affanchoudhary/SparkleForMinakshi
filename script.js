
// script.js - canvas fireworks + simple interactions
(function(){
  // Canvas setup
  const canvas = document.getElementById('fireworkCanvas');
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  if(!canvas || !ctx) return;
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  window.addEventListener('resize', ()=>{ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; });

  // particle arrays
  const fireworks = [];
  const particles = [];

  // helpers
  function rand(min,max){ return Math.random()*(max-min)+min }
  function hue(){ return Math.floor(rand(0,360)) }

  // Firework class
  class Firework{
    constructor(x,y,tx,ty,color){
      this.x=x;this.y=y;this.tx=tx;this.ty=ty;this.color=color||`hsl(${hue()},100%,60%)`;
      this.speed=rand(3,6); this.angle=Math.atan2(ty-y,tx-x);
      this.vx=Math.cos(this.angle)*this.speed; this.vy=Math.sin(this.angle)*this.speed; this.dist=0;
    }
    update(){
      this.x+=this.vx; this.y+=this.vy; this.dist+=this.speed;
      // decelerate slightly
      this.vx*=0.995; this.vy*=0.995;
      // if close to target, explode
      if(Math.hypot(this.x-this.tx,this.y-this.ty) < 8){
        explode(this.tx,this.ty,this.color);
        return true;
      }
      return false;
    }
    draw(){ ctx.beginPath(); ctx.fillStyle=this.color; ctx.arc(this.x,this.y,2.5,0,Math.PI*2); ctx.fill(); }
  }

  // Particle class
  class Particle{
    constructor(x,y,color){
      this.x=x;this.y=y;this.color=color; this.age=0; this.life=rand(40,90);
      const speed=rand(1,6); const angle=rand(0,Math.PI*2);
      this.vx=Math.cos(angle)*speed; this.vy=Math.sin(angle)*speed; this.gravity=0.06;
    }
    update(){ this.vy += this.gravity; this.x+=this.vx; this.y+=this.vy; this.age++; }
    draw(){ const alpha = 1 - (this.age/this.life); ctx.beginPath(); ctx.fillStyle=`${this.color}`; ctx.globalAlpha = alpha; ctx.arc(this.x,this.y, Math.max(1, 3*(1-alpha)), 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; }
    done(){ return this.age > this.life; }
  }

  function explode(x,y,color){
    const count = 30 + Math.floor(rand(0,60));
    for(let i=0;i<count;i++) particles.push(new Particle(x,y,color));
  }

  // animate loop
  function loop(){
    ctx.clearRect(0,0,W,H);
    // draw faint trail background
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(0,0,W,H);

    // update fireworks
    for(let i=fireworks.length-1;i>=0;i--){
      const fw = fireworks[i];
      fw.draw();
      if(fw.update()) fireworks.splice(i,1);
    }
    // update particles
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.draw(); p.update();
      if(p.done()) particles.splice(i,1);
    }
    requestAnimationFrame(loop);
  }
  loop();

  // launch random fireworks periodically
  setInterval(()=>{
    const sx = rand(50,W-50); const sy = H; const tx = rand(100,W-100); const ty = rand(80,H/2);
    fireworks.push(new Firework(sx,sy,tx,ty,`hsl(${rand(0,360)},100%,60%)`));
  }, 900);

  // click to launch and confetti trigger
  document.addEventListener('click', (e)=>{
    fireworks.push(new Firework(rand(50,W-50), H, e.clientX, e.clientY, `hsl(${rand(0,360)},100%,60%)`));
    // small confetti using colored particles
    for(let i=0;i<20;i++) particles.push(new Particle(e.clientX, e.clientY, `hsl(${rand(0,360)},100%,60%)`));
  });

  // simple helpers for navigation on buttons with data-target hrefs
  window.easyNav = function(target){
    if(!target) return;
    window.location.href = target;
  }

})();
