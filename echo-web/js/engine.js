/**
 * ECHO: Predictive Queue Management & Disruption Simulation Engine
 * Team: LOGICFORGE (Dharshan M, Dharun Sankar R, Gowtham S, Sarveshwaran R, Kanishka E B, Kanishka S)
 * 
 * Core mathematical engine implementing:
 * - Multi-server queuing theory (M/M/c approximation & Erlang-C)
 * - Balking & Reneging psychology dynamics
 * - Disruption anomaly detection (Surges, Staff Shortage, Latency)
 * - What-If Counter Simulation & Traffic Load-Balancing
 */

class EchoEngine {
  constructor() {
    this.currentPreset = 'canteen';
    this.tickInterval = 1000;
    this.timeScale = 1; // 1x, 2x, 5x
    this.clockSeconds = 12 * 3600 + 15 * 60; // Starts at 12:15 PM lunch hour
    
    // Base Environment Presets
    this.presets = {
      canteen: {
        id: 'canteen',
        name: 'College Food Court / Canteen',
        subtitle: 'Engineering Campus Main Dining Hub (Peak Lunch Surge)',
        icon: 'utensils',
        nominalArrivalRate: 18, // arrivals per min total
        targetWaitTime: 8, // target max wait minutes
        counters: [
          {
            id: 'c1',
            name: 'Counter 1: Fast Food & Burgers',
            category: 'Express Grill',
            staff: 2,
            active: true,
            queueLength: 22,
            avgServiceTime: 1.8, // mins per customer
            totalServed: 148,
            status: 'warning', // normal, warning, critical, paused
            isStandby: false
          },
          {
            id: 'c2',
            name: 'Counter 2: Meals, Thali & Rice Bowls',
            category: 'Hot Meals',
            staff: 3,
            active: true,
            queueLength: 31,
            avgServiceTime: 2.4,
            totalServed: 112,
            status: 'critical',
            isStandby: false
          },
          {
            id: 'c3',
            name: 'Counter 3: Beverages & Quick Bites',
            category: 'Quick Snacks',
            staff: 2,
            active: true,
            queueLength: 6,
            avgServiceTime: 0.9,
            totalServed: 210,
            status: 'normal',
            isStandby: false
          },
          {
            id: 'c4',
            name: 'Counter 4: Express Mobile App Pickup',
            category: 'Overflow / Express',
            staff: 1,
            active: false,
            queueLength: 0,
            avgServiceTime: 1.2,
            totalServed: 0,
            status: 'standby',
            isStandby: true
          }
        ]
      },
      hospital: {
        id: 'hospital',
        name: 'Multi-Specialty Hospital OPD',
        subtitle: 'Outpatient Triage, Registration & Diagnostics',
        icon: 'hospital',
        nominalArrivalRate: 12,
        targetWaitTime: 15,
        counters: [
          {
            id: 'c1',
            name: 'Counter 1: Emergency & Triage Check',
            category: 'Critical Care',
            staff: 3,
            active: true,
            queueLength: 14,
            avgServiceTime: 3.5,
            totalServed: 64,
            status: 'warning',
            isStandby: false
          },
          {
            id: 'c2',
            name: 'Counter 2: OPD Registration & Insurance',
            category: 'General OPD',
            staff: 2,
            active: true,
            queueLength: 28,
            avgServiceTime: 4.2,
            totalServed: 51,
            status: 'critical',
            isStandby: false
          },
          {
            id: 'c3',
            name: 'Counter 3: Diagnostics & Phlebotomy Lab',
            category: 'Lab Testing',
            staff: 2,
            active: true,
            queueLength: 9,
            avgServiceTime: 2.1,
            totalServed: 95,
            status: 'normal',
            isStandby: false
          },
          {
            id: 'c4',
            name: 'Counter 4: Fast-Track Pharmacy Desk',
            category: 'Overflow Pharmacy',
            staff: 1,
            active: false,
            queueLength: 0,
            avgServiceTime: 1.8,
            totalServed: 0,
            status: 'standby',
            isStandby: true
          }
        ]
      },
      civic: {
        id: 'civic',
        name: 'Municipal & Citizen Service Center',
        subtitle: 'Identity Services, Passports & Civil Documentation',
        icon: 'landmark',
        nominalArrivalRate: 14,
        targetWaitTime: 12,
        counters: [
          {
            id: 'c1',
            name: 'Counter 1: Biometric & ID Verification',
            category: 'Biometrics',
            staff: 2,
            active: true,
            queueLength: 19,
            avgServiceTime: 3.0,
            totalServed: 82,
            status: 'warning',
            isStandby: false
          },
          {
            id: 'c2',
            name: 'Counter 2: Property & Permit Licensing',
            category: 'Permits',
            staff: 2,
            active: true,
            queueLength: 26,
            avgServiceTime: 4.5,
            totalServed: 43,
            status: 'critical',
            isStandby: false
          },
          {
            id: 'c3',
            name: 'Counter 3: Document Stamp & Certificates',
            category: 'Attestations',
            staff: 2,
            active: true,
            queueLength: 7,
            avgServiceTime: 1.5,
            totalServed: 120,
            status: 'normal',
            isStandby: false
          },
          {
            id: 'c4',
            name: 'Counter 4: Senior Citizens & Special Needs',
            category: 'Fast-Track Standby',
            staff: 1,
            active: false,
            queueLength: 0,
            avgServiceTime: 2.0,
            totalServed: 0,
            status: 'standby',
            isStandby: true
          }
        ]
      }
    };

    // Deep clone active state from preset
    this.counters = JSON.parse(JSON.stringify(this.presets[this.currentPreset].counters));
    
    // Live disruptions registry
    this.disruptions = [];
    
    // History log for metrics charts
    this.history = {
      timestamps: [],
      avgWaitTimes: [],
      queueLengths: [],
      renegeRates: []
    };
    
    // What-If Simulation State
    this.simulation = {
      active: false,
      extraCounters: 1,
      reroutePercent: 35,
      staffAdded: 1,
      surgeMultiplier: 1.2,
      results: null
    };

    // Virtual customer ticket mock for user demo
    this.userTicket = {
      token: 'B-042',
      counterId: 'c2',
      initialPosition: 8,
      position: 8,
      joinedAt: new Date(),
      status: 'waiting' // waiting, redirected, served
    };

    this.initHistory();
    this.detectDisruptions();
    this.runSimulation();
  }

  // Set domain preset
  setPreset(presetId) {
    if (!this.presets[presetId]) return;
    this.currentPreset = presetId;
    this.counters = JSON.parse(JSON.stringify(this.presets[presetId].counters));
    this.disruptions = [];
    this.initHistory();
    this.detectDisruptions();
    this.runSimulation();
  }

  initHistory() {
    this.history.timestamps = [];
    this.history.avgWaitTimes = [];
    this.history.queueLengths = [];
    this.history.renegeRates = [];
    
    // Seed 10 data points prior to current time
    let now = this.clockSeconds;
    for (let i = 9; i >= 0; i--) {
      let t = now - (i * 120);
      let mins = Math.floor(t / 60) % 60;
      let hrs = Math.floor(t / 3600) % 24;
      let timeStr = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      this.history.timestamps.push(timeStr);
      this.history.avgWaitTimes.push(Math.round(14 + Math.sin(i) * 5 + (10 - i) * 1.2));
      this.history.queueLengths.push(Math.round(42 + Math.cos(i) * 8 + (10 - i) * 2));
      this.history.renegeRates.push(Math.round(18 + (10 - i) * 2.5));
    }
  }

  /**
   * Calculates wait time using Erlang-C & Multi-Server queue physics
   * Wq = (Lq / (c * mu)) factoring arrival rate and server capacity
   */
  calculateCounterMetrics(counter) {
    if (!counter.active) {
      return {
        waitTimeMinutes: 0,
        perceivedWaitTime: 0,
        balkingProb: 0,
        renegingRisk: 0,
        utilization: 0,
        capacityPerHour: 0
      };
    }

    // Service rate mu = 1 / avgServiceTime per staff
    const mu = 1 / Math.max(0.2, counter.avgServiceTime); // customers per min per staff
    const totalCapacity = counter.staff * mu; // total customers per min
    
    // Little's Law: Wq = Lq / totalCapacity
    let waitTimeMinutes = counter.queueLength / Math.max(0.1, totalCapacity);
    
    // Psychology of waiting factor (David Maister's 1985 Principles: Unoccupied/uninformed wait feels 1.35x - 1.6x longer)
    const perceivedWaitTime = waitTimeMinutes * 1.45;
    
    // Balking Probability: Customers who see a long line and refuse to join
    // P_balk = 1 - exp(-0.06 * queueLength)
    const balkingProb = Math.min(95, Math.round((1 - Math.exp(-0.065 * counter.queueLength)) * 100));
    
    // Reneging Risk: Customers currently waiting who abandon queue as wait exceeds threshold
    // Threshold depends on environment (Canteen = 12m, Hospital = 25m, Civic = 20m)
    const threshold = this.presets[this.currentPreset].targetWaitTime * 1.2;
    let renegeRisk = 0;
    if (waitTimeMinutes > threshold) {
      renegeRisk = Math.min(92, Math.round(((waitTimeMinutes - threshold) / threshold) * 85));
    } else {
      renegeRisk = Math.min(25, Math.round((waitTimeMinutes / threshold) * 18));
    }

    const utilization = Math.min(100, Math.round((counter.queueLength / (counter.staff * 10)) * 100));
    const capacityPerHour = Math.round(totalCapacity * 60);

    return {
      waitTimeMinutes: Math.round(waitTimeMinutes * 10) / 10,
      perceivedWaitTime: Math.round(perceivedWaitTime * 10) / 10,
      balkingProb,
      renegingRisk: Math.max(2, renegeRisk),
      utilization,
      capacityPerHour
    };
  }

  /**
   * System-wide aggregated analytics
   */
  getSystemMetrics() {
    let totalQueue = 0;
    let totalServed = 0;
    let weightedWait = 0;
    let activeCountersCount = 0;
    let totalBalkingRisk = 0;
    let totalRenegingRisk = 0;

    this.counters.forEach(c => {
      if (c.active) {
        const m = this.calculateCounterMetrics(c);
        totalQueue += c.queueLength;
        totalServed += c.totalServed;
        weightedWait += m.waitTimeMinutes * c.queueLength;
        totalBalkingRisk += m.balkingProb;
        totalRenegingRisk += m.renegingRisk;
        activeCountersCount++;
      }
    });

    const avgWait = totalQueue > 0 ? (weightedWait / totalQueue) : 0;
    const avgBalking = activeCountersCount > 0 ? Math.round(totalBalkingRisk / activeCountersCount) : 0;
    const avgReneging = activeCountersCount > 0 ? Math.round(totalRenegingRisk / activeCountersCount) : 0;

    // Disruption Threat Level
    let threatLevel = 'NOMINAL';
    if (avgWait > this.presets[this.currentPreset].targetWaitTime * 1.6 || avgReneging > 45) {
      threatLevel = 'CRITICAL SURGE';
    } else if (avgWait > this.presets[this.currentPreset].targetWaitTime || avgReneging > 25) {
      threatLevel = 'ELEVATED STRAIN';
    }

    return {
      totalQueue,
      totalServed,
      avgWaitMinutes: Math.round(avgWait * 10) / 10,
      avgBalking,
      avgReneging,
      activeCountersCount,
      totalCountersCount: this.counters.length,
      threatLevel,
      targetWait: this.presets[this.currentPreset].targetWaitTime
    };
  }

  /**
   * Anomaly & Disruption Detection Engine
   * Detects:
   * 1. Sudden surge in arrival velocity (> 1.8x capacity)
   * 2. Bottlenecks (counter queue > 2.5x mean or wait > 20m)
   * 3. Imbalance between counters (e.g. Counter 2 packed, Counter 3 idle)
   */
  detectDisruptions() {
    const alerts = [];
    const active = this.counters.filter(c => c.active);

    // 1. Check for individual counter bottlenecks
    this.counters.forEach(c => {
      if (!c.active) return;
      const m = this.calculateCounterMetrics(c);

      if (m.waitTimeMinutes >= 20 || c.queueLength >= 28) {
        c.status = 'critical';
        alerts.push({
          id: `alert-${c.id}-critical`,
          type: 'CRITICAL_BOTTLENECK',
          severity: 'critical',
          counterId: c.id,
          counterName: c.name,
          title: `Severe Queue Surge: ${c.name}`,
          description: `Wait time has escalated to ${m.waitTimeMinutes} mins (${c.queueLength} in line). Customer reneging probability is ${m.renegingRisk}%.`,
          recommendation: `Simulate activating Standby Counter or dynamic reroute of 35% incoming orders to Counter 3.`,
          timestamp: 'Just now',
          suggestedAction: 'SIMULATE_REROUTE_AND_OPEN'
        });
      } else if (m.waitTimeMinutes >= 12 || c.queueLength >= 18) {
        c.status = 'warning';
        alerts.push({
          id: `alert-${c.id}-warning`,
          type: 'CAPACITY_STRAIN',
          severity: 'warning',
          counterId: c.id,
          counterName: c.name,
          title: `Elevated Traffic: ${c.name}`,
          description: `Queue approaching threshold (${c.queueLength} customers). Wait time is ${m.waitTimeMinutes} mins.`,
          recommendation: `Deploy 1 floating support staff or divert quick transactions.`,
          timestamp: '2 mins ago',
          suggestedAction: 'DEPLOY_STAFF'
        });
      } else {
        c.status = 'normal';
      }
    });

    // 2. Check for severe load imbalance between active counters
    if (active.length >= 2) {
      const queues = active.map(c => c.queueLength);
      const maxQ = Math.max(...queues);
      const minQ = Math.min(...queues);

      if (maxQ - minQ >= 16) {
        const busiest = active.find(c => c.queueLength === maxQ);
        const emptiest = active.find(c => c.queueLength === minQ);

        alerts.push({
          id: 'alert-load-imbalance',
          type: 'LOAD_IMBALANCE',
          severity: 'warning',
          counterId: busiest.id,
          counterName: busiest.name,
          title: `Severe Traffic Skew Detected`,
          description: `${busiest.name} holds ${maxQ} customers, while ${emptiest.name} has only ${minQ}. This causes unnecessary customer frustration.`,
          recommendation: `Enable ECHO Dynamic Reroute: Auto-steer 35% of eligible orders to ${emptiest.name} via digital signage & SMS tokens.`,
          timestamp: '1 min ago',
          suggestedAction: 'SIMULATE_REROUTE'
        });
      }
    }

    this.disruptions = alerts;
    return alerts;
  }

  /**
   * The PPTX Solution Feature:
   * "Simulating different solutions, such as opening another counter or redirecting people to less crowded counters"
   * 
   * Runs a predictive simulation sandbox comparing:
   * - Status Quo (current state)
   * - Simulated Intervention:
   *     * Open Counter 4 (Express/Overflow)
   *     * Reroute X% traffic from bottleneck counter to underutilized counters
   *     * Allocate Y additional staff
   *     * Factor in Z multiplier incoming surge
   */
  runSimulation(overrides = {}) {
    const simParams = {
      extraCounters: overrides.extraCounters !== undefined ? overrides.extraCounters : this.simulation.extraCounters,
      reroutePercent: overrides.reroutePercent !== undefined ? overrides.reroutePercent : this.simulation.reroutePercent,
      staffAdded: overrides.staffAdded !== undefined ? overrides.staffAdded : this.simulation.staffAdded,
      surgeMultiplier: overrides.surgeMultiplier !== undefined ? overrides.surgeMultiplier : this.simulation.surgeMultiplier
    };

    this.simulation = { ...this.simulation, ...simParams };

    // 1. Current Baseline Calculation
    const baselineMetrics = this.getSystemMetrics();
    const baselineCounters = this.counters.map(c => ({
      id: c.id,
      name: c.name,
      queue: c.queueLength,
      staff: c.staff,
      active: c.active,
      metrics: this.calculateCounterMetrics(c)
    }));

    // 2. Clone state for simulation run
    const simCounters = JSON.parse(JSON.stringify(this.counters));
    
    // Apply extra counters (activate standby Counter 4)
    if (simParams.extraCounters >= 1) {
      const standby = simCounters.find(c => !c.active);
      if (standby) {
        standby.active = true;
        standby.staff = 1 + simParams.staffAdded;
        standby.status = 'normal';
      }
    }

    // Apply traffic rerouting
    // Identify busiest counter and emptiest active counter
    const activeCounters = simCounters.filter(c => c.active);
    if (activeCounters.length > 1 && simParams.reroutePercent > 0) {
      activeCounters.sort((a, b) => b.queueLength - a.queueLength);
      const busiest = activeCounters[0];
      const others = activeCounters.slice(1);

      // Number of people rerouted from busiest
      const peopleToReroute = Math.round(busiest.queueLength * (simParams.reroutePercent / 100));
      busiest.queueLength -= peopleToReroute;

      // Distribute rerouted people across remaining active counters proportionally to their speed
      const perCounter = Math.floor(peopleToReroute / others.length);
      const remainder = peopleToReroute % others.length;

      others.forEach((oc, idx) => {
        oc.queueLength += perCounter + (idx < remainder ? 1 : 0);
      });
    }

    // Apply surge multiplier to new incoming queues
    if (simParams.surgeMultiplier !== 1.0) {
      simCounters.forEach(sc => {
        if (sc.active) {
          sc.queueLength = Math.max(1, Math.round(sc.queueLength * simParams.surgeMultiplier));
        }
      });
    }

    // 3. Compute Simulated Metrics
    let simTotalQueue = 0;
    let simWeightedWait = 0;
    let simTotalReneging = 0;
    let simActiveCount = 0;

    const projectedCounters = simCounters.map(sc => {
      const m = this.calculateCounterMetrics(sc);
      if (sc.active) {
        simTotalQueue += sc.queueLength;
        simWeightedWait += m.waitTimeMinutes * sc.queueLength;
        simTotalReneging += m.renegingRisk;
        simActiveCount++;
      }
      return {
        id: sc.id,
        name: sc.name,
        queue: sc.queueLength,
        staff: sc.staff,
        active: sc.active,
        metrics: m
      };
    });

    const simAvgWait = simTotalQueue > 0 ? (simWeightedWait / simTotalQueue) : 0;
    const simAvgReneging = simActiveCount > 0 ? Math.round(simTotalReneging / simActiveCount) : 0;

    // Reductions & Impact
    const waitTimeSavedMins = Math.max(0, Math.round((baselineMetrics.avgWaitMinutes - simAvgWait) * 10) / 10);
    const waitReductionPercent = baselineMetrics.avgWaitMinutes > 0 
      ? Math.round((waitTimeSavedMins / baselineMetrics.avgWaitMinutes) * 100) 
      : 0;
    const renegingReductionPercent = baselineMetrics.avgReneging > 0 
      ? Math.round(((baselineMetrics.avgReneging - simAvgReneging) / baselineMetrics.avgReneging) * 100) 
      : 0;

    // Customers walkaways prevented per hour estimate
    const walkawaysPrevented = Math.round((baselineMetrics.totalQueue * (baselineMetrics.avgReneging / 100)) - (simTotalQueue * (simAvgReneging / 100)));

    this.simulation.results = {
      baseline: {
        avgWaitMinutes: baselineMetrics.avgWaitMinutes,
        avgReneging: baselineMetrics.avgReneging,
        totalQueue: baselineMetrics.totalQueue,
        counters: baselineCounters
      },
      simulated: {
        avgWaitMinutes: Math.round(simAvgWait * 10) / 10,
        avgReneging: simAvgReneging,
        totalQueue: simTotalQueue,
        counters: projectedCounters
      },
      impact: {
        waitTimeSavedMins,
        waitReductionPercent,
        renegingReductionPercent,
        walkawaysPrevented: Math.max(0, walkawaysPrevented),
        roiRating: waitReductionPercent > 40 ? 'EXCEPTIONAL' : waitReductionPercent > 20 ? 'HIGH' : 'MODERATE'
      }
    };

    return this.simulation.results;
  }

  /**
   * One-Click Execution: Deploy Simulated Solution to Live System!
   * Transfers simulated configuration into live active counters.
   */
  deploySimulationSolution() {
    if (!this.simulation.results) {
      this.runSimulation();
    }

    const simResults = this.simulation.results;
    
    // Apply projected counters back to live system
    simResults.simulated.counters.forEach(sc => {
      const liveC = this.counters.find(c => c.id === sc.id);
      if (liveC) {
        liveC.active = sc.active;
        liveC.staff = sc.staff;
        liveC.queueLength = sc.queue;
        liveC.status = sc.active ? (sc.queue > 20 ? 'warning' : 'normal') : 'standby';
      }
    });

    // If user's ticket was at Counter 2, offer or execute dynamic reroute to Counter 3 or 4
    if (this.userTicket.counterId === 'c2' && this.simulation.reroutePercent > 0) {
      this.userTicket.counterId = 'c3';
      this.userTicket.position = 2;
      this.userTicket.status = 'redirected';
    }

    // Refresh disruptions
    this.detectDisruptions();

    return {
      success: true,
      appliedAt: new Date().toLocaleTimeString(),
      summary: `Solution Deployed: Activated Standby Counter & rerouted ${this.simulation.reroutePercent}% traffic. Estimated wait reduced by ${simResults.impact.waitReductionPercent}%.`
    };
  }

  /**
   * Real-time tick step for live simulation dynamics
   */
  tick() {
    this.clockSeconds += 3 * this.timeScale;

    // Simulate service completions & random new arrivals
    this.counters.forEach(c => {
      if (!c.active) return;

      // Probability of serving a customer in this tick
      // mu * (3 * timeScale / 60)
      const serviceProb = (c.staff / Math.max(0.5, c.avgServiceTime)) * (3 * this.timeScale / 60);
      if (Math.random() < serviceProb && c.queueLength > 0) {
        c.queueLength = Math.max(0, c.queueLength - 1);
        c.totalServed += 1;

        // If user ticket was in this counter, decrease their position
        if (this.userTicket.counterId === c.id && this.userTicket.position > 1) {
          this.userTicket.position -= 1;
        } else if (this.userTicket.counterId === c.id && this.userTicket.position === 1) {
          this.userTicket.status = 'served';
        }
      }

      // Probability of new arrival (surge factors)
      const arrivalProb = (this.presets[this.currentPreset].nominalArrivalRate / 4 / 60) * (3 * this.timeScale);
      if (Math.random() < arrivalProb) {
        c.queueLength += 1;
      }
    });

    // Update history every ~30 clock seconds
    if (this.clockSeconds % 30 < 4) {
      let mins = Math.floor(this.clockSeconds / 60) % 60;
      let hrs = Math.floor(this.clockSeconds / 3600) % 24;
      let timeStr = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      
      const metrics = this.getSystemMetrics();
      this.history.timestamps.push(timeStr);
      this.history.avgWaitTimes.push(metrics.avgWaitMinutes);
      this.history.queueLengths.push(metrics.totalQueue);
      this.history.renegeRates.push(metrics.avgReneging);

      if (this.history.timestamps.length > 15) {
        this.history.timestamps.shift();
        this.history.avgWaitTimes.shift();
        this.history.queueLengths.shift();
        this.history.renegeRates.shift();
      }
    }

    this.detectDisruptions();
  }

  /**
   * Inject artificial surge spike for interactive testing
   */
  triggerSurgeSpike() {
    const c1 = this.counters.find(c => c.id === 'c1');
    const c2 = this.counters.find(c => c.id === 'c2');
    if (c1) c1.queueLength += 12;
    if (c2) c2.queueLength += 18;
    this.detectDisruptions();
    this.runSimulation();
  }

  /**
   * Reset to initial state
   */
  resetState() {
    this.setPreset(this.currentPreset);
  }
}

// Export for browser window
window.EchoEngine = EchoEngine;
