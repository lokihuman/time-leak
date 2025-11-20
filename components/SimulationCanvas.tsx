import React, { useRef, useEffect, useState } from 'react';
import { TimeData } from '../types';

interface SimulationCanvasProps {
  data: TimeData;
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  category: 'source' | 'social' | 'proc' | 'fear' | 'goal';

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 1;
    this.vy = Math.random() * 2 + 2;
    this.radius = Math.random() * 2 + 2;
    this.color = '#FFD700'; // Gold
    this.life = 1.0;
    this.category = 'source';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    
    // Slight gravity/acceleration
    this.vy += 0.05;
    
    // Air resistance
    this.vx *= 0.98;
    this.vy *= 0.98;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.life;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Stats for display on overlay
  const [goalPercentage, setGoalPercentage] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let frameCount = 0;

    const resize = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = 600; // Fixed height for consistency
      }
    };
    
    resize();
    window.addEventListener('resize', resize);

    // Pipeline definitions (relative Y positions)
    const Y_START = 50;
    const Y_LEAK_1 = 180; // Social Media
    const Y_LEAK_2 = 320; // Procrastination
    const Y_LEAK_3 = 460; // Fear
    const Y_GOAL = 580;

    // Calculate probabilities per frame based on data
    // We normalize flow. 
    // If totalAvailable is 16h.
    // Social media is 4h. That is 25% of total particles should leave at Leak 1.
    
    // However, strictly removing percentage at each stage requires conditional probability.
    // But for visual simplicity:
    // We spawn N particles.
    // Leak 1 removes (Social / Total) proportion of INITIAL stream.
    // Leak 2 removes (Proc / Total) proportion of INITIAL stream.
    // etc.
    
    const ratioSocial = data.socialMedia / data.totalAvailable;
    const ratioProc = data.procrastination / data.totalAvailable;
    const ratioFear = data.fear / data.totalAvailable;
    
    // We need "regions" for leaks.
    const LEAK_HEIGHT = 40;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Structure ( The "Funnel" )
      const cx = canvas.width / 2;
      
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      
      // Helper to draw pipe segment
      const drawPipe = (y1: number, y2: number, width: number) => {
        ctx.beginPath();
        ctx.moveTo(cx - width/2, y1);
        ctx.lineTo(cx - width/2, y2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(cx + width/2, y1);
        ctx.lineTo(cx + width/2, y2);
        ctx.stroke();
      };

      // Main Pipe Logic
      // Top Funnel
      ctx.beginPath();
      ctx.moveTo(cx - 60, 10);
      ctx.lineTo(cx - 20, Y_START);
      ctx.moveTo(cx + 60, 10);
      ctx.lineTo(cx + 20, Y_START);
      ctx.strokeStyle = '#666';
      ctx.stroke();

      // Segments
      drawPipe(Y_START, Y_LEAK_1, 40); // Segment 1
      drawPipe(Y_LEAK_1 + LEAK_HEIGHT, Y_LEAK_2, 40); // Segment 2
      drawPipe(Y_LEAK_2 + LEAK_HEIGHT, Y_LEAK_3, 40); // Segment 3
      drawPipe(Y_LEAK_3 + LEAK_HEIGHT, Y_GOAL, 40); // Segment 4 to goal

      // Draw Leak Exits
      // Leak 1 (Right) - Social Media
      ctx.font = "12px Inter";
      ctx.fillStyle = "#555";
      ctx.fillText("Social Media", cx + 50, Y_LEAK_1 + 20);
      ctx.beginPath();
      ctx.moveTo(cx + 20, Y_LEAK_1);
      ctx.quadraticCurveTo(cx + 60, Y_LEAK_1 + 20, cx + 80, Y_LEAK_1 + 50);
      ctx.strokeStyle = '#444';
      ctx.stroke();

      // Leak 2 (Left) - Procrastination
      ctx.fillText("Procrastination", cx - 130, Y_LEAK_2 + 20);
      ctx.beginPath();
      ctx.moveTo(cx - 20, Y_LEAK_2);
      ctx.quadraticCurveTo(cx - 60, Y_LEAK_2 + 20, cx - 80, Y_LEAK_2 + 50);
      ctx.strokeStyle = '#444';
      ctx.stroke();

      // Leak 3 (Right) - Fear
      ctx.fillText("Fear", cx + 50, Y_LEAK_3 + 20);
      ctx.beginPath();
      ctx.moveTo(cx + 20, Y_LEAK_3);
      ctx.quadraticCurveTo(cx + 60, Y_LEAK_3 + 20, cx + 80, Y_LEAK_3 + 50);
      ctx.strokeStyle = '#444';
      ctx.stroke();
      
      // Goal Bucket
      ctx.fillStyle = '#222';
      ctx.fillRect(cx - 30, Y_GOAL, 60, 80);
      ctx.strokeStyle = '#FFF';
      ctx.strokeRect(cx - 30, Y_GOAL, 60, 80);
      ctx.fillStyle = '#FFF';
      ctx.textAlign = "center";
      ctx.fillText("YOUR GOALS", cx, Y_GOAL + 100);


      // Particle Logic
      if (frameCount % 2 === 0) { // Spawn rate
        const p = new Particle(cx + (Math.random() * 20 - 10), 10);
        particles.push(p);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();

        // 1. Check Social Media Leak (Right side)
        if (p.category === 'source' && p.y > Y_LEAK_1 && p.y < Y_LEAK_1 + LEAK_HEIGHT) {
          // Chance to leak based on ratio
          // We need to approximate the probability. 
          // If total is 16, social is 4. We need 25% of ALL particles to leave here.
          // But we only check once.
          // Let's assign a random "destiny" value at creation?
          // Or just use dice roll here.
          // Since the stream is continuous, a simple dice roll works for "this specific particle".
          // However, if ratioSocial is 0.5, we want 50% of *incoming* to leave.
          
          // Current Logic: All Source particles pass through here.
          if (Math.random() < 0.1) { // Scatter effect
             // Determines if it actually leaves based on user data
             // We use a determinstic approach to visually match the slider exactly? 
             // No, probabilistic is better for particles.
             
             // To ensure exact % over time:
             // We can tag particles at spawn time.
          }
        }
      }
      
      // Improved Logic: Tag particles at birth
      // We move the spawn logic to handle distribution
      
      particles.forEach(p => p.draw(ctx));
      
      // Filter out dead particles
      particles = particles.filter(p => p.y < canvas.height + 10 && p.life > 0 && p.x > 0 && p.x < canvas.width);

      frameCount++;
      animationFrameId = requestAnimationFrame(render);
    };

    // Redefine render loop with smarter spawning for accurate visuals
    const smartRender = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;

      // --- DRAW STATIC BACKGROUND (Redrawing every frame is fine for this complexity) ---
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      
      // Top Feed
      ctx.beginPath(); ctx.moveTo(cx-25, 0); ctx.lineTo(cx-15, Y_START); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+25, 0); ctx.lineTo(cx+15, Y_START); ctx.stroke();
      
      // Vertical sections
      const drawV = (y1: number, y2: number) => {
        ctx.beginPath(); ctx.moveTo(cx-15, y1); ctx.lineTo(cx-15, y2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+15, y1); ctx.lineTo(cx+15, y2); ctx.stroke();
      };
      
      drawV(Y_START, Y_LEAK_1);
      drawV(Y_LEAK_1 + 30, Y_LEAK_2);
      drawV(Y_LEAK_2 + 30, Y_LEAK_3);
      drawV(Y_LEAK_3 + 30, Y_GOAL);

      // Draw Exits
      // Social
      ctx.fillStyle = "#666"; ctx.font = "12px Inter"; ctx.textAlign = "left";
      ctx.fillText("Social Media", cx + 40, Y_LEAK_1 + 15);
      ctx.beginPath(); ctx.moveTo(cx+15, Y_LEAK_1); ctx.quadraticCurveTo(cx+40, Y_LEAK_1+5, cx+60, Y_LEAK_1+40); ctx.strokeStyle='#444'; ctx.stroke();

      // Procrastination
      ctx.textAlign = "right";
      ctx.fillText("Procrastination", cx - 40, Y_LEAK_2 + 15);
      ctx.beginPath(); ctx.moveTo(cx-15, Y_LEAK_2); ctx.quadraticCurveTo(cx-40, Y_LEAK_2+5, cx-60, Y_LEAK_2+40); ctx.stroke();

      // Fear
      ctx.textAlign = "left";
      ctx.fillText("Fear", cx + 40, Y_LEAK_3 + 15);
      ctx.beginPath(); ctx.moveTo(cx+15, Y_LEAK_3); ctx.quadraticCurveTo(cx+40, Y_LEAK_3+5, cx+60, Y_LEAK_3+40); ctx.stroke();

      // Bucket
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(cx - 25, Y_GOAL, 50, 60);
      ctx.strokeStyle = '#FFF';
      ctx.strokeRect(cx - 25, Y_GOAL, 50, 60);
      ctx.fillStyle = '#FFF'; ctx.textAlign = "center";
      ctx.fillText("GOALS", cx, Y_GOAL + 80);


      // --- PARTICLE SYSTEM ---
      
      // Spawning
      // Spawn 3 particles per frame for density
      for(let k=0; k<3; k++) {
         const p = new Particle(cx + (Math.random() * 20 - 10), -10);
         
         // Assign destiny at birth based on ratios
         const r = Math.random();
         // Normalizing ratios: 
         // totalAvailable is the denominator.
         const pSocial = data.socialMedia / data.totalAvailable;
         const pProc = data.procrastination / data.totalAvailable;
         const pFear = data.fear / data.totalAvailable;
         
         if (r < pSocial) {
            p.category = 'social';
         } else if (r < pSocial + pProc) {
            p.category = 'proc';
         } else if (r < pSocial + pProc + pFear) {
            p.category = 'fear';
         } else {
            p.category = 'goal';
         }
         particles.push(p);
      }

      // Update & Draw
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Apply forces logic based on destiny
        
        // 1. Approaching Social Leak
        if (p.category === 'social' && p.y > Y_LEAK_1 && p.y < Y_LEAK_1 + 50) {
             p.vx += 0.5; // Push right
             p.vy *= 0.9; // Slow down fall
             p.life -= 0.02; // Fade
        }
        // 2. Approaching Proc Leak
        else if (p.category === 'proc' && p.y > Y_LEAK_2 && p.y < Y_LEAK_2 + 50) {
             p.vx -= 0.5; // Push left
             p.vy *= 0.9;
             p.life -= 0.02;
        }
        // 3. Approaching Fear Leak
        else if (p.category === 'fear' && p.y > Y_LEAK_3 && p.y < Y_LEAK_3 + 50) {
             p.vx += 0.5; // Push right
             p.vy *= 0.9;
             p.life -= 0.02;
        }
        // 4. Goal logic
        else if (p.y > Y_GOAL + 60) {
             // Hit bottom of bucket
             p.vy = 0;
             p.vx = 0;
             p.life -= 0.05; // Fade out in bucket
        }

        // Bounce off walls if still in main pipe
        if (p.life > 0.9) { // Roughly implies still in pipe
            if (p.x < cx - 15) p.vx += 0.2;
            if (p.x > cx + 15) p.vx -= 0.2;
        }
        
        p.update();
        p.draw(ctx);
      }
      
      // Clean up
      particles = particles.filter(p => p.life > 0);

      animationFrameId = requestAnimationFrame(smartRender);
    };

    smartRender();

    // Calc stats for UI
    const goalTime = Math.max(0, data.totalAvailable - (data.socialMedia + data.procrastination + data.fear));
    setGoalPercentage((goalTime / data.totalAvailable) * 100);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [data]);

  return (
    <div ref={containerRef} className="relative w-full h-[600px] bg-gray-950 rounded-xl border border-gray-800 overflow-hidden shadow-inner">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      <div className="absolute top-4 right-4 bg-black/70 p-2 rounded border border-gray-700 backdrop-blur text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <span className="text-gray-300">Efficiency: {goalPercentage.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};