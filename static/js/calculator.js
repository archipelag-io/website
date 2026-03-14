/**
 * Hardware Earnings Calculator
 *
 * Estimates potential earnings for prospective Archipelag.io hosts
 * based on their GPU model, using the same bandwidth table and
 * fit scoring logic as the coordinator placement engine.
 */
(function () {
  'use strict';

  var form = document.getElementById('calc-form');
  if (!form) return;

  // GPU bandwidth table (GB/s) — subset matching coordinator's GpuSpecs module
  var GPU_DB = [
    // NVIDIA Data Center
    { name: 'NVIDIA H100',           vram: 80,  bw: 3350,  tier: 'enterprise' },
    { name: 'NVIDIA A100 80GB',      vram: 80,  bw: 2039,  tier: 'enterprise' },
    { name: 'NVIDIA A100 40GB',      vram: 40,  bw: 1555,  tier: 'enterprise' },
    { name: 'NVIDIA L40S',           vram: 48,  bw: 864,   tier: 'enterprise' },
    { name: 'NVIDIA A40',            vram: 48,  bw: 696,   tier: 'high_end' },
    { name: 'NVIDIA L4',             vram: 24,  bw: 300,   tier: 'mid_range' },
    { name: 'NVIDIA T4',             vram: 16,  bw: 320,   tier: 'mid_range' },
    // NVIDIA Workstation
    { name: 'NVIDIA RTX A6000',      vram: 48,  bw: 768,   tier: 'high_end' },
    { name: 'NVIDIA RTX A5000',      vram: 24,  bw: 768,   tier: 'high_end' },
    { name: 'NVIDIA RTX A4000',      vram: 16,  bw: 448,   tier: 'mid_range' },
    // RTX 50 series
    { name: 'NVIDIA RTX 5090',       vram: 32,  bw: 1792,  tier: 'enterprise' },
    { name: 'NVIDIA RTX 5080',       vram: 16,  bw: 960,   tier: 'high_end' },
    { name: 'NVIDIA RTX 5070 Ti',    vram: 16,  bw: 896,   tier: 'high_end' },
    { name: 'NVIDIA RTX 5070',       vram: 12,  bw: 672,   tier: 'mid_range' },
    // RTX 40 series
    { name: 'NVIDIA RTX 4090',       vram: 24,  bw: 1008,  tier: 'enterprise' },
    { name: 'NVIDIA RTX 4080 Super', vram: 16,  bw: 736,   tier: 'high_end' },
    { name: 'NVIDIA RTX 4080',       vram: 16,  bw: 716.8, tier: 'high_end' },
    { name: 'NVIDIA RTX 4070 Ti Super', vram: 16, bw: 672, tier: 'high_end' },
    { name: 'NVIDIA RTX 4070 Ti',    vram: 12,  bw: 504,   tier: 'mid_range' },
    { name: 'NVIDIA RTX 4070 Super', vram: 12,  bw: 504,   tier: 'mid_range' },
    { name: 'NVIDIA RTX 4070',       vram: 12,  bw: 504,   tier: 'mid_range' },
    { name: 'NVIDIA RTX 4060 Ti',    vram: 8,   bw: 288,   tier: 'entry' },
    { name: 'NVIDIA RTX 4060',       vram: 8,   bw: 272,   tier: 'entry' },
    // RTX 30 series
    { name: 'NVIDIA RTX 3090 Ti',    vram: 24,  bw: 1008,  tier: 'high_end' },
    { name: 'NVIDIA RTX 3090',       vram: 24,  bw: 936.2, tier: 'high_end' },
    { name: 'NVIDIA RTX 3080 Ti',    vram: 12,  bw: 912.4, tier: 'high_end' },
    { name: 'NVIDIA RTX 3080',       vram: 10,  bw: 760.3, tier: 'mid_range' },
    { name: 'NVIDIA RTX 3070 Ti',    vram: 8,   bw: 608.3, tier: 'mid_range' },
    { name: 'NVIDIA RTX 3070',       vram: 8,   bw: 448,   tier: 'mid_range' },
    { name: 'NVIDIA RTX 3060 Ti',    vram: 8,   bw: 448,   tier: 'entry' },
    { name: 'NVIDIA RTX 3060',       vram: 12,  bw: 360,   tier: 'entry' },
    // RTX 20 series
    { name: 'NVIDIA RTX 2080 Ti',    vram: 11,  bw: 616,   tier: 'mid_range' },
    { name: 'NVIDIA RTX 2080 Super', vram: 8,   bw: 496,   tier: 'mid_range' },
    { name: 'NVIDIA RTX 2070 Super', vram: 8,   bw: 448,   tier: 'entry' },
    { name: 'NVIDIA RTX 2060 Super', vram: 8,   bw: 448,   tier: 'entry' },
    // GTX
    { name: 'NVIDIA GTX 1080 Ti',    vram: 11,  bw: 484,   tier: 'entry' },
    { name: 'NVIDIA GTX 1080',       vram: 8,   bw: 320,   tier: 'entry' },
    { name: 'NVIDIA GTX 1070',       vram: 8,   bw: 256.3, tier: 'entry' },
    // AMD
    { name: 'AMD RX 7900 XTX',       vram: 24,  bw: 960,   tier: 'high_end' },
    { name: 'AMD RX 7900 XT',        vram: 20,  bw: 800,   tier: 'high_end' },
    { name: 'AMD RX 7800 XT',        vram: 16,  bw: 624,   tier: 'mid_range' },
    { name: 'AMD RX 7700 XT',        vram: 12,  bw: 432,   tier: 'mid_range' },
    { name: 'AMD RX 6900 XT',        vram: 16,  bw: 512,   tier: 'mid_range' },
    { name: 'AMD RX 6800 XT',        vram: 16,  bw: 512,   tier: 'mid_range' },
    // Apple Silicon
    { name: 'Apple M4 Max',          vram: 48,  bw: 546,   tier: 'high_end' },
    { name: 'Apple M4 Pro',          vram: 24,  bw: 273,   tier: 'mid_range' },
    { name: 'Apple M3 Max',          vram: 48,  bw: 400,   tier: 'mid_range' },
    { name: 'Apple M3 Pro',          vram: 18,  bw: 150,   tier: 'entry' },
    { name: 'Apple M2 Max',          vram: 32,  bw: 400,   tier: 'mid_range' },
    { name: 'Apple M2 Pro',          vram: 16,  bw: 200,   tier: 'entry' },
    // CPU only
    { name: 'CPU only (no GPU)',      vram: 0,   bw: 0,     tier: 'cpu_only' }
  ];

  // Tier multipliers (match coordinator pricing.ex)
  var TIER_MULT = {
    enterprise: 2.0,
    high_end:   1.5,
    mid_range:  1.2,
    entry:      1.0,
    cpu_only:   0.5
  };

  // Reference workloads
  var WORKLOADS = [
    { name: 'LLM Chat (7B)',      minVram: 6,  modelGb: 4.5,  basePrice: 1.0,  type: 'llm' },
    { name: 'LLM Chat (13B)',     minVram: 10, modelGb: 8.0,  basePrice: 2.0,  type: 'llm' },
    { name: 'LLM Chat (70B)',     minVram: 40, modelGb: 40.0, basePrice: 8.0,  type: 'llm' },
    { name: 'Image Generation',   minVram: 8,  modelGb: 3.0,  basePrice: 3.0,  type: 'container' },
    { name: 'WASM Task',          minVram: 0,  modelGb: 0,    basePrice: 0.5,  type: 'wasm' }
  ];

  var PLATFORM_FEE = 0.20;
  var CREDIT_VALUE = 0.01; // $0.01 per credit (beta)

  // Utilization: percentage of online time the GPU is actually running jobs.
  // Beta network has limited demand — conservative estimate.
  var UTILIZATION = 0.15; // 15% of online time is actual job execution

  // Populate GPU selector
  var select = document.getElementById('calc-gpu');
  GPU_DB.forEach(function (gpu) {
    var opt = document.createElement('option');
    opt.value = gpu.name;
    opt.textContent = gpu.name + (gpu.vram > 0 ? ' (' + gpu.vram + ' GB)' : '');
    select.appendChild(opt);
  });

  // Hours slider
  var hoursSlider = document.getElementById('calc-hours');
  var hoursValue = document.getElementById('calc-hours-value');
  hoursSlider.addEventListener('input', function () {
    hoursValue.textContent = hoursSlider.value + 'h';
  });

  // Calculate
  var btn = document.getElementById('calc-btn');
  var results = document.getElementById('calc-results');

  btn.addEventListener('click', function () {
    var gpuName = select.value;
    if (!gpuName) return;

    var gpu = GPU_DB.find(function (g) { return g.name === gpuName; });
    if (!gpu) return;

    var hoursPerDay = parseInt(hoursSlider.value, 10);
    var mult = TIER_MULT[gpu.tier] || 1.0;

    var html = '';
    var bestDaily = 0; // Track best single workload (GPU runs one at a time)

    WORKLOADS.forEach(function (wl) {
      var canRun = gpu.vram >= wl.minVram;
      var tokS = 0;
      var throughputLabel = '';
      var fitLevel = '';
      var creditsPerHour = 0;

      if (canRun && wl.type === 'llm' && gpu.bw > 0) {
        // Bandwidth-based tok/s estimation
        var efficiency = 0.55;
        var modeFactor = gpu.vram >= (wl.modelGb * 1.2) ? 1.0 : 0.5;
        tokS = Math.round(gpu.bw / wl.modelGb * efficiency * modeFactor);
        throughputLabel = tokS + ' tok/s';
        fitLevel = modeFactor === 1.0 ? 'Perfect' : 'Good';
        // A typical chat request: ~200 output tokens at this tok/s rate,
        // plus ~2s overhead (scheduling, container, prefill).
        // Time per job = (200 / tokS) + 2 seconds
        var secsPerJob = (200 / Math.max(tokS, 1)) + 2;
        var maxJobsPerHour = Math.floor(3600 / secsPerJob);
        // Apply utilization — GPU isn't busy 100% of the time
        var jobsPerHour = Math.round(maxJobsPerHour * UTILIZATION);
        creditsPerHour = jobsPerHour * wl.basePrice * mult * (1 - PLATFORM_FEE);
      } else if (canRun && wl.type === 'container') {
        // Image generation: ~30s per image, not 15s
        var maxPerHour = 120;
        var jobsPerHour = Math.round(maxPerHour * UTILIZATION);
        throughputLabel = jobsPerHour + ' jobs/hr';
        fitLevel = gpu.vram >= wl.minVram * 1.5 ? 'Perfect' : 'Good';
        creditsPerHour = jobsPerHour * wl.basePrice * mult * (1 - PLATFORM_FEE);
      } else if (canRun && wl.type === 'wasm') {
        // WASM: lightweight but still rate-limited by demand
        var maxPerHour = 300;
        var jobsPerHour = Math.round(maxPerHour * UTILIZATION);
        throughputLabel = jobsPerHour + ' jobs/hr';
        fitLevel = 'Perfect';
        creditsPerHour = jobsPerHour * wl.basePrice * mult * (1 - PLATFORM_FEE);
      }

      // Track best single workload (a GPU serves one workload type at a time)
      var thisDaily = canRun ? (creditsPerHour * hoursPerDay) : 0;
      if (thisDaily > bestDaily) bestDaily = thisDaily;

      html += '<tr class="' + (canRun ? '' : 'calc-disabled') + '">';
      html += '<td>' + wl.name + '</td>';
      html += '<td>';
      if (!canRun) {
        html += '<span class="calc-badge calc-badge-tight">Needs ' + wl.minVram + ' GB</span>';
      } else {
        html += '<span class="calc-badge calc-badge-' + fitLevel.toLowerCase() + '">' + fitLevel + '</span>';
      }
      html += '</td>';
      html += '<td>' + (canRun ? throughputLabel : '&mdash;') + '</td>';
      html += '<td>';
      if (canRun) {
        html += Math.round(creditsPerHour).toLocaleString() + ' cr/hr';
      } else {
        html += '&mdash;';
      }
      html += '</td>';
      html += '</tr>';
    });

    // Summary: use best single workload, not sum of all
    var dailyCredits = Math.round(bestDaily);
    var monthlyCredits = dailyCredits * 30;
    var monthlyUsd = (monthlyCredits * CREDIT_VALUE).toFixed(2);

    document.getElementById('calc-daily').textContent = dailyCredits.toLocaleString();
    document.getElementById('calc-monthly').textContent = monthlyCredits.toLocaleString();
    document.getElementById('calc-usd').textContent = '$' + monthlyUsd;
    document.getElementById('calc-tier').textContent = gpu.tier.replace(/_/g, ' ');
    document.getElementById('calc-mult').textContent = mult + 'x';

    document.getElementById('calc-table-body').innerHTML = html;
    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
})();
