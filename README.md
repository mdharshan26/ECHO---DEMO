# ECHO: Predictive Queue Management & Disruption Simulation Platform
> **Developed by Team LOGICFORGE**  
> **Team Members:** Dharshan M, Dharun Sankar R, Gowtham S, Sarveshwaran R, Kanishka E B, Kanishka S

---

## 📌 Executive Summary & Problem Mapping

Traditional Queue Management Systems (QMS) suffer from a critical flaw: **they only show current queues or static estimated waiting times, but they do not help administrators decide what action to take when conditions change.**

In high-volume environments like **college canteens, hospitals, and municipal service centers**, queue times suddenly spike due to:
1. **Sudden rushes of people** (e.g. lunch hour rush, shift change, emergency surge).
2. **Staff shortages** (e.g. counter operator steps away or is absent).
3. **Slower service latency** (e.g. machine glitch, payment terminal delay, complex order).

**ECHO** is designed to solve this problem by:
- **Predicting Waiting Times:** Using multi-server queuing theory ($M/M/c$ queuing model & Erlang-C approximations) to provide accurate predictive wait indicators.
- **Managing Waiting Psychology:** Mitigating **balking** (customers refusing to join long lines) and **reneging** (customers abandoning queues) through digital signage engagement and mobile token transparency.
- **Detecting Disruptions in Real Time:** Automated anomaly detection flagging sudden velocity spikes and counter bottlenecks.
- **Simulating Different Solutions ("What-If" Decision Sandbox):** Empowering administrators to test operational interventions (such as *opening standby counters*, *reallocating floating staff*, or *redirecting people to less crowded counters*) in a live simulation before executing them.
- **One-Click Automated Deployment:** Instantaneous synchronization across live service counters, digital signage displays, and customer virtual passes.

---

## 🚀 Key Modules & Frontend Views

### 1. Operations Command Center (Admin View)
- **Real-Time Telemetry Bar:** Displays Total Waiting, Predictive Average Wait Time, Reneging Walkaway Risk, Balking Likelihood, and Total Customers Served.
- **Dynamic Disruption Alert Banner:** Highlights real-time bottlenecks with root cause analysis and immediate AI recommendations.
- **Live Counter Grid:** Live cards for all counters with status badges (*Optimal*, *Strain*, *Surge Bottleneck*, *Standby*), staff allocations, and instant adjustment toggles (+Staff, -Staff, Pause/Resume).
- **Queue Dynamics & Telemetry Chart:** Real-time Chart.js tracking wait times and reneging risk curve over time.
- **Psychology of Waiting Panel:** David Maister's wait-time perception matrix measuring perceived vs actual wait time.

### 2. "What-If" Simulation Sandbox (Flagship Slide Innovation)
- **Interactive Parameter Sliders:**
  - *Open Standby Counter 4* (Toggle 0 to 1 overflow lane)
  - *Dynamic Traffic Redirection Rate* (Divert 0% to 60% from overloaded counter to underutilized counters)
  - *Floating Staff Allocation* (+0 to +3 additional support personnel)
  - *Incoming Surge Stress-Test* (1.0x to 2.5x arrival velocity spike)
- **Live Animated Queue Flow Canvas:** 2D interactive canvas rendering real-time customer avatars flowing into counter queues and visually demonstrating dynamic rerouting.
- **Side-by-Side Impact Matrix:** Real-time calculation of Baseline vs Simulated Wait Time, Reneging Averted, Customers Saved/Hour, and AI Optimization Score.
- **One-Click Deploy Solution:** Applies simulated configuration to the live production environment.

### 3. Public Digital Signage & Kiosk TV Mode
- Large-format display designed for wall-mounted TV screens in dining halls or triage lobbies.
- High-visibility "Now Serving" token numbers, expected wait times with color indicators (Green/Amber/Red).
- **Psychology of Waiting Ticker:** Context-aware announcements encouraging visitors to use fast counters (e.g. *"Counter 3 has only 2 min wait! Fresh Beverages & Wraps available with zero line"*).

### 4. Customer Virtual Mobile Pass
- Interactive mobile smartphone mockup displaying the customer's live digital token (`#B-042`).
- Real-time queue position countdown (*"8 people ahead of you"*).
- **Dynamic Fast-Pass Reroute Card:** Offers customer the option to switch to an empty counter with 1 tap.

### 5. LOGICFORGE Team & PPTX Research Overview
- Complete documentation of team members and slide mapping for presentations and evaluations.

