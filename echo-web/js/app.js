/**
 * ECHO UI Application Controller & Simulation Canvas
 * Team: LOGICFORGE (Dharshan M, Dharun Sankar R, Gowtham S, Sarveshwaran R, Kanishka E B, Kanishka S)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Engine
  const engine = new EchoEngine();

  // Audio State & Synthesizer (Web Audio API)
  let audioEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  function playSound(type) {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'deploy') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // Toast Notification System
  function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-animate pointer-events-auto p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 transition-all ${
      type === 'success'
        ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
        : type === 'warning'
        ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
        : type === 'danger'
        ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
        : 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
    }`;

    const icon = type === 'success' ? 'fa-circle-check text-emerald-400' :
                 type === 'warning' ? 'fa-triangle-exclamation text-amber-400' :
                 type === 'danger'  ? 'fa-bolt text-rose-400' : 'fa-circle-info text-cyan-400';

    toast.innerHTML = `
      <i class="fa-solid ${icon} text-lg shrink-0 mt-0.5"></i>
      <div class="flex-1">
        <h4 class="text-xs font-bold text-white uppercase tracking-wider">${title}</h4>
        <p class="text-xs text-gray-300 mt-0.5 leading-relaxed">${message}</p>
      </div>
      <button class="text-gray-400 hover:text-white text-xs">&times;</button>
    `;

    toast.querySelector('button').addEventListener('click', () => toast.remove());
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  // 2. Tab Navigation
  const tabButtons = document.querySelectorAll('.tab-btn');
  const views = {
    'command-center': document.getElementById('view-command-center'),
    'simulation-sandbox': document.getElementById('view-simulation-sandbox'),
    'public-signage': document.getElementById('view-public-signage'),
    'virtual-pass': document.getElementById('view-virtual-pass'),
    'team-info': document.getElementById('view-team-info')
  };

  function switchTab(tabKey) {
    tabButtons.forEach(btn => {
      const active = btn.dataset.tab === tabKey;
      if (active) {
        btn.classList.add('bg-cyan-500/15', 'text-cyan-400', 'border-cyan-500/30');
        btn.classList.remove('text-gray-400');
      } else {
        btn.classList.remove('bg-cyan-500/15', 'text-cyan-400', 'border-cyan-500/30');
        btn.classList.add('text-gray-400');
      }
    });

    Object.keys(views).forEach(k => {
      if (views[k]) {
        if (k === tabKey) {
          views[k].classList.remove('hidden');
        } else {
          views[k].classList.add('hidden');
        }
      }
    });

    playSound('click');
    if (tabKey === 'simulation-sandbox') {
      engine.runSimulation();
      updateSimulationUI();
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Preset Selector
  const presetSelect = document.getElementById('presetSelect');
  presetSelect.addEventListener('change', (e) => {
    engine.setPreset(e.target.value);
    showToast('Venue Changed', `Switched environment to ${engine.presets[e.target.value].name}`, 'info');
    updateAllViews();
  });

  // Surge Trigger & Reset
  document.getElementById('btnSurgeSpike').addEventListener('click', () => {
    engine.triggerSurgeSpike();
    playSound('alert');
    showToast('Surge Injected', 'Sudden rush of customers arrived at frontline counters!', 'danger');
    updateAllViews();
  });

  document.getElementById('btnResetState').addEventListener('click', () => {
    engine.resetState();
    playSound('click');
    showToast('State Reset', 'All queues and staff allocations reset to nominal baseline.', 'info');
    updateAllViews();
  });

  // Audio Toggle
  const btnAudioToggle = document.getElementById('btnAudioToggle');
  const audioIcon = document.getElementById('audioIcon');
  btnAudioToggle.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    if (audioEnabled) {
      audioIcon.className = 'fa-solid fa-volume-high text-cyan-400';
      playSound('click');
    } else {
      audioIcon.className = 'fa-solid fa-volume-xmark text-gray-500';
    }
  });

  // 3. Initialize Chart.js for Telemetry
  let telemetryChart = null;
  function initChart() {
    const ctx = document.getElementById('telemetryChart');
    if (!ctx) return;

    telemetryChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: engine.history.timestamps,
        datasets: [
          {
            label: 'Avg Wait Time (mins)',
            data: engine.history.avgWaitTimes,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointBackgroundColor: '#06b6d4',
            yAxisID: 'y'
          },
          {
            label: 'Reneging Walkaway Risk (%)',
            data: engine.history.renegeRates,
            borderColor: '#f43f5e',
            backgroundColor: 'rgba(244, 63, 94, 0.05)',
            borderWidth: 2,
            borderDash: [4, 4],
            fill: false,
            tension: 0.3,
            pointRadius: 2,
            pointBackgroundColor: '#f43f5e',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827',
            titleColor: '#f3f4f6',
            bodyColor: '#e5e7eb',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 10
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#9ca3af', font: { family: 'JetBrains Mono', size: 10 } }
          },
          y: {
            type: 'linear',
            position: 'left',
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: { color: '#06b6d4', font: { family: 'JetBrains Mono', size: 10 } },
            title: { display: true, text: 'Wait Time (min)', color: '#06b6d4', font: { size: 10 } }
          },
          y1: {
            type: 'linear',
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: '#f43f5e', font: { family: 'JetBrains Mono', size: 10 } },
            title: { display: true, text: 'Reneging Risk %', color: '#f43f5e', font: { size: 10 } },
            min: 0,
            max: 100
          }
        }
      }
    });
  }

  // 4. Command Center UI Updates
  function updateCommandCenterUI() {
    const metrics = engine.getSystemMetrics();

    // Top KPI Bar
    document.getElementById('metricTotalQueue').textContent = metrics.totalQueue;
    document.getElementById('metricAvgWait').textContent = metrics.avgWaitMinutes;
    document.getElementById('metricReneging').textContent = metrics.avgReneging + '%';
    document.getElementById('metricBalking').textContent = metrics.avgBalking + '%';
    document.getElementById('metricTotalServed').textContent = metrics.totalServed;
    document.getElementById('metricTargetWait').textContent = metrics.targetWait;

    // Header threat badge
    const threatLabel = document.getElementById('threatLabel');
    const threatDot = document.getElementById('threatDot');
    const threatPing = document.getElementById('threatPing');

    threatLabel.textContent = metrics.threatLevel;
    if (metrics.threatLevel === 'CRITICAL SURGE') {
      threatLabel.className = 'text-xs font-bold font-mono text-rose-400';
      threatDot.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500';
      threatPing.className = 'animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75';
    } else if (metrics.threatLevel === 'ELEVATED STRAIN') {
      threatLabel.className = 'text-xs font-bold font-mono text-amber-400';
      threatDot.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500';
      threatPing.className = 'animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75';
    } else {
      threatLabel.className = 'text-xs font-bold font-mono text-emerald-400';
      threatDot.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500';
      threatPing.className = 'animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75';
    }

    // Live Disruption Banner
    const banner = document.getElementById('disruptionBanner');
    const activeAlert = engine.disruptions[0];
    if (activeAlert) {
      banner.classList.remove('hidden');
      document.getElementById('disruptionTitle').textContent = activeAlert.title;
      document.getElementById('disruptionDesc').textContent = activeAlert.description;
      document.getElementById('disruptionAiRec').textContent = `ECHO Recommendation: ${activeAlert.recommendation}`;
    } else {
      banner.classList.add('hidden');
    }

    // Render Counter Grid
    const grid = document.getElementById('counterGrid');
    grid.innerHTML = '';

    engine.counters.forEach(c => {
      const m = engine.calculateCounterMetrics(c);
      const isCritical = c.status === 'critical';
      const isWarning = c.status === 'warning';
      const isStandby = !c.active;

      const card = document.createElement('div');
      card.className = `glass-panel p-4 rounded-xl border flex flex-col justify-between glass-card-interactive ${
        isCritical ? 'border-rose-500/50 bg-rose-950/15' :
        isWarning ? 'border-amber-500/40 bg-amber-950/10' :
        isStandby ? 'border-white/5 opacity-70 bg-gray-900/40' :
        'border-cyan-500/30'
      }`;

      // Status pill
      const statusPill = isStandby ? '<span class="px-2 py-0.5 text-[10px] font-mono rounded bg-gray-700 text-gray-300">STANDBY</span>' :
                         isCritical ? '<span class="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">SURGE BOTTLENECK</span>' :
                         isWarning ? '<span class="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">STRAIN</span>' :
                         '<span class="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">OPTIMAL</span>';

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-mono text-cyan-400 font-semibold uppercase">${c.category}</span>
            ${statusPill}
          </div>
          <h4 class="text-sm font-bold text-white mt-1">${c.name}</h4>

          <div class="mt-4 grid grid-cols-2 gap-2 text-center bg-black/25 p-2 rounded-lg border border-white/5">
            <div>
              <span class="text-[10px] text-gray-400 font-mono block">WAITING</span>
              <span class="text-xl font-black font-mono ${c.queueLength > 20 ? 'text-rose-400' : 'text-white'}">${c.queueLength}</span>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 font-mono block">EST. WAIT</span>
              <span class="text-xl font-black font-mono ${m.waitTimeMinutes > 15 ? 'text-rose-400' : 'text-cyan-400'}">${m.waitTimeMinutes}m</span>
            </div>
          </div>

          <!-- Psychology metric: Perceived wait -->
          <div class="mt-2 text-[11px] flex justify-between text-gray-400">
            <span>Perceived Wait:</span>
            <span class="font-mono text-amber-300 font-medium">${m.perceivedWaitTime}m (uninformed)</span>
          </div>

          <!-- Staffing indicator -->
          <div class="mt-2 flex items-center justify-between text-xs text-gray-300">
            <span class="flex items-center gap-1.5">
              <i class="fa-solid fa-user-tie text-cyan-400"></i> Staff: <strong>${c.staff}</strong>
            </span>
            <span class="text-[10px] text-gray-400 font-mono">Speed: ${c.avgServiceTime}m/person</span>
          </div>
        </div>

        <!-- Quick Action Bar -->
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-1.5">
          <button data-action="toggle" data-id="${c.id}" class="text-xs px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition">
            ${c.active ? 'Pause' : 'Activate'}
          </button>
          
          <div class="flex items-center gap-1">
            <button data-action="minus-staff" data-id="${c.id}" class="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-xs flex items-center justify-center transition" title="Decrease staff">-</button>
            <button data-action="plus-staff" data-id="${c.id}" class="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-xs flex items-center justify-center transition" title="Increase staff">+</button>
          </div>

          <button data-action="simulate" data-id="${c.id}" class="text-[11px] px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-semibold transition" title="Simulate this counter">
            <i class="fa-solid fa-flask"></i> Test
          </button>
        </div>
      `;

      grid.appendChild(card);
    });

    // Attach counter action buttons
    grid.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        const cId = btn.dataset.id;
        const counter = engine.counters.find(c => c.id === cId);
        if (!counter) return;

        if (action === 'toggle') {
          counter.active = !counter.active;
          showToast('Counter Status', `${counter.name} is now ${counter.active ? 'Active' : 'Standby'}`, 'info');
        } else if (action === 'plus-staff') {
          counter.staff += 1;
          showToast('Staff Added', `Increased staff at ${counter.name} to ${counter.staff}`, 'success');
        } else if (action === 'minus-staff') {
          if (counter.staff > 1) {
            counter.staff -= 1;
            showToast('Staff Reduced', `Decreased staff at ${counter.name} to ${counter.staff}`, 'warning');
          }
        } else if (action === 'simulate') {
          switchTab('simulation-sandbox');
        }

        engine.detectDisruptions();
        engine.runSimulation();
        updateAllViews();
      });
    });

    // Update Chart
    if (telemetryChart) {
      telemetryChart.data.labels = engine.history.timestamps;
      telemetryChart.data.datasets[0].data = engine.history.avgWaitTimes;
      telemetryChart.data.datasets[1].data = engine.history.renegeRates;
      telemetryChart.update('none');
    }
  }

  // Launch What-If Sandbox directly from Alert
  document.getElementById('btnLaunchSandboxFromAlert').addEventListener('click', () => {
    switchTab('simulation-sandbox');
  });

  document.getElementById('btnQuickDeployAlert').addEventListener('click', () => {
    const res = engine.deploySimulationSolution();
    playSound('deploy');
    showToast('Solution Executed', res.summary, 'success');
    updateAllViews();
  });

  // 5. What-If Simulation Sandbox Controller
  const simExtraCounters = document.getElementById('simExtraCounters');
  const simReroutePercent = document.getElementById('simReroutePercent');
  const simStaffAdded = document.getElementById('simStaffAdded');
  const simSurgeMultiplier = document.getElementById('simSurgeMultiplier');

  function updateSimulationSliders() {
    const res = engine.runSimulation({
      extraCounters: parseInt(simExtraCounters.value),
      reroutePercent: parseInt(simReroutePercent.value),
      staffAdded: parseInt(simStaffAdded.value),
      surgeMultiplier: parseFloat(simSurgeMultiplier.value)
    });

    document.getElementById('labelSimExtraCounters').textContent = simExtraCounters.value === '1' ? 'Active (+1 Standby Lane)' : 'Disabled (0 Lane)';
    document.getElementById('labelSimReroutePercent').textContent = `${simReroutePercent.value}% Rerouted`;
    document.getElementById('labelSimStaffAdded').textContent = `+${simStaffAdded.value} Personnel`;
    document.getElementById('labelSimSurgeMultiplier').textContent = `${simSurgeMultiplier.value}x (${parseFloat(simSurgeMultiplier.value) > 1 ? 'Surge' : 'Standard'})`;

    updateSimulationUI(res);
  }

  [simExtraCounters, simReroutePercent, simStaffAdded, simSurgeMultiplier].forEach(input => {
    input.addEventListener('input', updateSimulationSliders);
  });

  document.getElementById('btnResetSimulationSliders').addEventListener('click', () => {
    simExtraCounters.value = 1;
    simReroutePercent.value = 35;
    simStaffAdded.value = 1;
    simSurgeMultiplier.value = 1.2;
    updateSimulationSliders();
    playSound('click');
  });

  function updateSimulationUI(simResults = engine.simulation.results) {
    if (!simResults) return;

    // Comparison cards
    document.getElementById('simBaseWait').textContent = `${simResults.baseline.avgWaitMinutes}m`;
    document.getElementById('simProjectedWait').textContent = `${simResults.simulated.avgWaitMinutes}m`;
    document.getElementById('simWaitSavedPercent').textContent = `${simResults.impact.waitReductionPercent}% reduction (${simResults.impact.waitTimeSavedMins}m saved)`;

    document.getElementById('simBaseReneging').textContent = `${simResults.baseline.avgReneging}%`;
    document.getElementById('simProjectedReneging').textContent = `${simResults.simulated.avgReneging}%`;
    document.getElementById('simRenegingSavedPercent').textContent = `${simResults.impact.renegingReductionPercent}% walkaway risk saved`;

    document.getElementById('simWalkawaysCount').textContent = `+${simResults.impact.walkawaysPrevented}`;

    // Optimization Score
    const score = Math.min(99, Math.max(45, 60 + Math.round(simResults.impact.waitReductionPercent * 0.45) + (simResults.simulated.counters.length >= 4 ? 10 : 0)));
    document.getElementById('simRoiScore').textContent = `${score} / 100`;

    // Counter by counter comparison rows
    const container = document.getElementById('simCounterComparisonRows');
    container.innerHTML = '';

    simResults.simulated.counters.forEach(sc => {
      const bc = simResults.baseline.counters.find(c => c.id === sc.id);
      const row = document.createElement('div');
      row.className = 'p-3 rounded-lg bg-black/30 border border-white/5 space-y-2';

      const diff = sc.queue - (bc ? bc.queue : 0);
      const diffBadge = diff < 0 ? `<span class="text-emerald-400 font-mono text-xs font-semibold">${diff} people</span>` :
                        diff > 0 ? `<span class="text-cyan-400 font-mono text-xs font-semibold">+${diff} people</span>` :
                        `<span class="text-gray-400 font-mono text-xs">No change</span>`;

      row.innerHTML = `
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-gray-200">${sc.name}</span>
          <div class="flex items-center gap-3">
            <span class="text-gray-400">Baseline: <strong class="text-white">${bc ? bc.queue : 0}</strong></span>
            <i class="fa-solid fa-arrow-right text-gray-500 text-[10px]"></i>
            <span class="text-cyan-300">Simulated: <strong class="text-white">${sc.queue}</strong> (${diffBadge})</span>
            <span class="text-emerald-400 font-mono font-bold">${sc.metrics.waitTimeMinutes}m wait</span>
          </div>
        </div>
        <div class="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden flex">
          <div class="bg-cyan-500 h-1.5 transition-all duration-300" style="width: ${Math.min(100, sc.queue * 2.5)}%"></div>
        </div>
      `;
      container.appendChild(row);
    });
  }

  // Deploy simulated solution button
  document.getElementById('btnDeploySimulation').addEventListener('click', () => {
    const res = engine.deploySimulationSolution();
    playSound('deploy');
    showToast('🚀 Solution Deployed Live!', res.summary, 'success');
    switchTab('command-center');
    updateAllViews();
  });

  // 6. Simulation Canvas Animation (Visual queue dots flowing)
  const canvas = document.getElementById('queueCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Create moving customer particles
  function initParticles() {
    particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * (canvas ? canvas.width * 0.4 : 200),
        y: 40 + Math.random() * (canvas ? canvas.height - 80 : 180),
        targetY: 40 + (i % 4) * 55,
        speed: 1.2 + Math.random() * 1.5,
        targetCounter: i % 4,
        size: 3.5 + Math.random() * 2,
        color: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'][i % 4]
      });
    }
  }
  initParticles();

  function renderSimulationCanvas() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const counterYPositions = [h * 0.2, h * 0.4, h * 0.6, h * 0.8];

    // Draw 4 Service Counters on Right
    engine.counters.forEach((c, idx) => {
      const cy = counterYPositions[idx];
      const cx = w - 160;

      // Counter Station Box
      ctx.fillStyle = c.active ? (c.status === 'critical' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(6, 182, 212, 0.15)') : 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = c.active ? (c.status === 'critical' ? '#f43f5e' : '#06b6d4') : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx, cy - 22, 140, 44, 8);
      ctx.fill();
      ctx.stroke();

      // Counter Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
      ctx.fillText(c.name.split(':')[0], cx + 12, cy - 4);

      ctx.fillStyle = c.active ? '#a5f3fc' : '#9ca3af';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(c.active ? `${c.queueLength} in line • ${c.staff} staff` : 'STANDBY (OFF)', cx + 12, cy + 12);

      // Lane Guide Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(30, cy);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Dynamic Rerouting Flow Arrow when active
    if (engine.simulation.reroutePercent > 0) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(w * 0.45, counterYPositions[1]);
      ctx.quadraticCurveTo(w * 0.6, counterYPositions[1] + 35, w - 170, counterYPositions[2]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(`⚡ ECHO Reroute (${engine.simulation.reroutePercent}%)`, w * 0.42, counterYPositions[1] + 24);
    }

    // Render & Move Particles
    particles.forEach(p => {
      // Direct particle to appropriate counter target
      const targetY = counterYPositions[p.targetCounter];
      p.x += p.speed;
      p.y += (targetY - p.y) * 0.05;

      const destX = w - 170 - (Math.random() * 40);
      if (p.x > destX) {
        p.x = 20;
        p.y = 40 + Math.random() * (h - 80);
        // If rerouting, redirect traffic away from counter 2
        if (engine.simulation.reroutePercent > 20 && Math.random() < (engine.simulation.reroutePercent / 100)) {
          p.targetCounter = engine.simulation.extraCounters > 0 ? 3 : 2;
        } else {
          p.targetCounter = Math.floor(Math.random() * (engine.simulation.extraCounters > 0 ? 4 : 3));
        }
      }

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(renderSimulationCanvas);
  }
  requestAnimationFrame(renderSimulationCanvas);

  // 7. Public Digital Signage / Kiosk UI Updates
  function updatePublicSignageUI() {
    const venue = engine.presets[engine.currentPreset];
    const metrics = engine.getSystemMetrics();

    document.getElementById('kioskVenueTitle').textContent = `${venue.name} • Live Display`;
    document.getElementById('kioskAvgWait').textContent = `${metrics.avgWaitMinutes} Mins`;

    const grid = document.getElementById('kioskCountersGrid');
    grid.innerHTML = '';

    engine.counters.forEach((c, idx) => {
      const m = engine.calculateCounterMetrics(c);
      const isStandby = !c.active;
      const waitColor = m.waitTimeMinutes <= 5 ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40' :
                        m.waitTimeMinutes <= 12 ? 'text-amber-400 bg-amber-500/20 border-amber-500/40' :
                        'text-rose-400 bg-rose-500/20 border-rose-500/40';

      const card = document.createElement('div');
      card.className = `p-5 rounded-2xl border flex flex-col justify-between ${
        isStandby ? 'bg-black/30 border-white/5 opacity-60' : 'bg-gradient-to-b from-gray-800/80 to-gray-900/90 border-white/10 shadow-xl'
      }`;

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <span class="text-xs font-mono font-bold uppercase text-cyan-400">${c.category}</span>
            <span class="text-xs font-mono text-gray-400">${c.name.split(':')[0]}</span>
          </div>

          <div class="py-5 text-center">
            <span class="text-xs text-gray-400 font-mono uppercase tracking-widest">NOW SERVING</span>
            <div class="text-4xl sm:text-5xl font-black font-mono text-white mt-1 tracking-wider">
              ${isStandby ? 'OFFLINE' : `#${String.fromCharCode(65 + idx)}-${c.totalServed + 1}`}
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-white/10 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-gray-400 font-mono block">WAIT TIME</span>
            <span class="text-sm font-bold font-mono px-2 py-0.5 rounded border ${waitColor}">
              ${isStandby ? 'N/A' : `~${m.waitTimeMinutes} mins`}
            </span>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-gray-400 font-mono block">IN QUEUE</span>
            <span class="text-sm font-bold font-mono text-white">${isStandby ? '0' : c.queueLength}</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    // Dynamic Psychology Announcement Ticker
    const busiest = engine.counters.reduce((prev, curr) => (curr.active && curr.queueLength > prev.queueLength) ? curr : prev, engine.counters[0]);
    const fastest = engine.counters.filter(c => c.active).reduce((prev, curr) => (curr.queueLength < prev.queueLength) ? curr : prev, engine.counters[0]);

    if (fastest && fastest.queueLength <= 8) {
      document.getElementById('kioskTickerText').textContent = `⚡ SMART QUEUE TIP: ${fastest.name} has only ~${Math.round(fastest.queueLength * fastest.avgServiceTime)} min wait! Switch to Counter ${fastest.name.split(':')[0].replace(/\D/g, '')} for expedited service.`;
    } else {
      document.getElementById('kioskTickerText').textContent = `⚡ ECHO Intelligence Active: Predictive wait times displayed dynamically to keep you informed. Average satisfaction rating 96%.`;
    }
  }

  // 8. Customer Mobile Virtual Pass Controller
  function updateVirtualPassUI() {
    const venue = engine.presets[engine.currentPreset];
    const ticket = engine.userTicket;
    const counter = engine.counters.find(c => c.id === ticket.counterId) || engine.counters[0];
    const m = engine.calculateCounterMetrics(counter);

    document.getElementById('phoneVenueName').textContent = venue.name;
    document.getElementById('phoneTokenId').textContent = ticket.token;
    document.getElementById('phoneCounterAssigned').textContent = counter.name;
    document.getElementById('phonePeopleAhead').textContent = ticket.position;
    document.getElementById('phoneEstWait').textContent = `${Math.round(ticket.position * counter.avgServiceTime)}m`;

    const progress = Math.min(100, Math.max(10, Math.round(((ticket.initialPosition - ticket.position) / ticket.initialPosition) * 100)));
    document.getElementById('phoneProgressBar').style.width = `${progress}%`;

    const rerouteCard = document.getElementById('phoneRerouteCard');
    if (ticket.counterId === 'c2' && counter.queueLength > 18) {
      rerouteCard.classList.remove('hidden');
    } else {
      rerouteCard.classList.add('hidden');
    }

    if (ticket.position <= 0 || ticket.status === 'served') {
      document.getElementById('phoneProgressLabel').textContent = 'NOW SERVING YOUR TOKEN!';
      document.getElementById('phoneProgressLabel').className = 'font-mono text-emerald-400 font-bold animate-pulse';
    } else {
      document.getElementById('phoneProgressLabel').textContent = `In Queue (${ticket.position} ahead)`;
      document.getElementById('phoneProgressLabel').className = 'font-mono text-cyan-400';
    }
  }

  document.getElementById('btnPhoneAcceptReroute').addEventListener('click', () => {
    engine.userTicket.counterId = 'c3';
    engine.userTicket.token = 'C-089';
    engine.userTicket.position = 1;
    engine.userTicket.status = 'redirected';
    playSound('deploy');
    showToast('Token Rerouted', 'Switched to Counter 3. You are next in line!', 'success');
    updateVirtualPassUI();
  });

  document.getElementById('btnSimulateMobileAdvance').addEventListener('click', () => {
    if (engine.userTicket.position > 0) {
      engine.userTicket.position -= 1;
      playSound('click');
      updateVirtualPassUI();
    }
  });

  document.getElementById('btnResetMobileTicket').addEventListener('click', () => {
    engine.userTicket = {
      token: `B-${Math.floor(100 + Math.random() * 900)}`,
      counterId: 'c2',
      initialPosition: 8,
      position: 8,
      joinedAt: new Date(),
      status: 'waiting'
    };
    playSound('click');
    showToast('New Ticket Issued', `Claimed token ${engine.userTicket.token} for Counter 2`, 'info');
    updateVirtualPassUI();
  });

  // 9. Real-Time Clocks & Heartbeat Loop
  function updateClocks() {
    const secs = engine.clockSeconds;
    const hrs = Math.floor(secs / 3600) % 24;
    const mins = Math.floor(secs / 60) % 60;
    const s = secs % 60;
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const displayHrs = hrs % 12 || 12;

    const timeStr = `${displayHrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} ${ampm}`;
    const shortStr = `${displayHrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;

    const liveClock = document.getElementById('liveClock');
    if (liveClock) liveClock.textContent = timeStr;

    const kioskClock = document.getElementById('kioskClock');
    if (kioskClock) kioskClock.textContent = shortStr;

    const phoneClock = document.getElementById('phoneClock');
    if (phoneClock) phoneClock.textContent = `${displayHrs}:${mins.toString().padStart(2, '0')}`;
  }

  function updateAllViews() {
    updateClocks();
    updateCommandCenterUI();
    updateSimulationUI();
    updatePublicSignageUI();
    updateVirtualPassUI();
  }

  // Periodic Tick (1 second interval)
  setInterval(() => {
    engine.tick();
    updateAllViews();
  }, 1000);

  // Initial Run
  initChart();
  updateSimulationSliders();
  updateAllViews();
});
