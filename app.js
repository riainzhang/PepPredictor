const VALID_AA = new Set("ACDEFGHIKLMNPQRSTVWY".split(""));

const KD_SCALE = {
  A: 1.8, R: -4.5, N: -3.5, D: -3.5, C: 2.5,
  Q: -3.5, E: -3.5, G: -0.4, H: -3.2, I: 4.5,
  L: 3.8, K: -3.9, M: 1.9, F: 2.8, P: -1.6,
  S: -0.8, T: -0.7, W: -0.9, Y: -1.3, V: 4.2
};

const EISENBERG_SCALE = {
  A: 0.25, R: -1.76, N: -0.64, D: -0.72, C: 0.04,
  Q: -0.69, E: -0.62, G: 0.16, H: -0.40, I: 0.73,
  L: 0.53, K: -1.10, M: 0.26, F: 0.61, P: -0.07,
  S: -0.26, T: -0.18, W: 0.37, Y: 0.02, V: 0.54
};

const BOMAN_SCALE = {
  A: -0.495, R: 0.959, N: 0.078, D: 0.023, C: 0.071,
  Q: 0.049, E: 0.346, G: 0.386, H: 0.557, I: -0.791,
  L: -0.931, K: 1.100, M: -0.657, F: -1.006, P: 0.557,
  S: 0.332, T: 0.314, W: -0.722, Y: -0.267, V: -0.584
};

const AA_AVG_MASS = {
  A: 89.0935, R: 174.2017, N: 132.1184, D: 133.1032, C: 121.159,
  Q: 146.1451, E: 147.1299, G: 75.0669, H: 155.1552, I: 131.1736,
  L: 131.1736, K: 146.1882, M: 149.2124, F: 165.19, P: 115.131,
  S: 105.093, T: 119.1197, W: 204.2262, Y: 181.1894, V: 117.1469
};

const RESIDUE_GROUPS = {
  acidic: "DE",
  basic: "KRH",
  charged: "DEKRH",
  hydrophobic: "AVILMFWYC",
  polar: "STNQCY",
  aromatic: "FWY",
  sulfur: "CM"
};

const DIWV = {
  WP: 1, WC: 1, WM: 24.68, WH: 24.68, WN: 13.34, WT: -14.03, WV: -7.49, WL: 13.34, WG: -9.37,
  CW: 24.68, CM: 33.60, CQ: -6.54, CD: 20.26, CT: 33.60, CV: -6.54, CL: 20.26, CP: 20.26,
  FW: -14.03, FD: 13.34, FP: 20.26,
  YW: -7.49, YM: 44.94, YH: 13.34, YD: 24.68, YT: -7.49, YP: 13.34, YG: -7.49,
  AC: 44.94, AH: -7.49, AD: -7.49, AP: 20.26,
  GW: 13.34, GY: -7.49, GN: -7.49, GK: -7.49, GE: -6.54, GT: -7.49, GI: -7.49, GG: 13.34,
  IH: 13.34, IK: -7.49, IE: 44.94, IV: -7.49, IP: -1.88,
  LW: 24.68, LQ: 33.60, LK: -7.49, LR: 20.26, LP: 20.26,
  VY: -6.54, VK: -7.49, VT: -7.49, VP: 20.26, VG: -7.49,
  MM: -1.88, MH: 58.28, MY: 24.68, MQ: -6.54, MD: 44.94, MR: -6.54, MS: 44.94, MT: -1.88, MA: 13.34, MP: 44.94,
  SC: 33.60, SQ: 20.26, SE: 20.26, SR: 20.26, SS: 20.26, SP: 44.94,
  TW: -14.03, TF: 13.34, TQ: -6.54, TN: -14.03, TE: 20.26, TG: -7.49,
  HY: 44.94, HF: -9.37, HN: 24.68, HK: 24.68, HS: -1.88, HT: -6.54, HI: 44.94,
  DK: -7.49, DS: 20.26,
  EW: -14.03, EC: 44.94, EQ: 20.26, ES: 20.26, EI: 20.26, EP: 20.26,
  NQ: -6.54, NK: 24.68, NI: 44.94,
  QC: -6.54, QY: -6.54, QF: -6.54, QQ: 20.26, QD: 20.26, QE: 20.26, QS: 44.94, QV: -6.54, QP: 20.26,
  KM: 33.60, KQ: 24.68, KR: 33.60,
  RW: 58.28, RH: 20.26, RY: -6.54, RQ: 20.26, RR: 58.28, RS: 44.94, RP: 20.26,
  PW: -1.88, PF: 20.26, PQ: 20.26, PD: -6.54, PE: 18.38, PR: 20.26, PS: 20.26, PA: 20.26, PV: 20.26, PP: 20.26
};

const THRESHOLDS = {
  length: [5, 50, "aa"],
  net_charge: [-1, 6, ""],
  isoelectric_point: [4, 11, "pH"],
  hydrophobicity: [-0.5, 1.2, ""],
  amphiphilicity: [0.2, 999, ""],
  instability_index: [-999, 40, ""],
  aliphatic_index: [0, 300, ""],
  gravy: [-2, 0.8, ""],
  boman_index: [0.5, 999, ""],
  shannon_entropy: [1.5, 999, ""]
};

const SCORING_WEIGHTS = {
  physicochemical_balance: 0.25,
  stability: 0.25,
  solubility_aggregation: 0.25,
  synthesizability: 0.15,
  safety_proxy: 0.10
};

const state = {
  rows: [],
  skipped: [],
  filteredRows: []
};

const els = {
  form: document.querySelector("#predictForm"),
  input: document.querySelector("#sequenceInput"),
  fileInput: document.querySelector("#fileInput"),
  fileName: document.querySelector("#fileName"),
  peptideChainMode: document.querySelector("#peptideChainMode"),
  loadExample: document.querySelector("#loadExample"),
  clearAll: document.querySelector("#clearAll"),
  resultsBody: document.querySelector("#resultsBody"),
  totalCount: document.querySelector("#totalCount"),
  passCount: document.querySelector("#passCount"),
  failCount: document.querySelector("#failCount"),
  skipCount: document.querySelector("#skipCount"),
  summaryTitle: document.querySelector("#summaryTitle"),
  miniReport: document.querySelector("#miniReport"),
  downloadAll: document.querySelector("#downloadAll"),
  downloadPass: document.querySelector("#downloadPass"),
  tableFilter: document.querySelector("#tableFilter")
};

function round(value, digits = 3) {
  return Number.parseFloat(value.toFixed(digits));
}

function parseMpnnHeader(header) {
  const info = {};
  header.split(",").forEach((part) => {
    const item = part.trim();
    if (!item) return;
    if (item.includes("=")) {
      const [rawKey, ...rest] = item.split("=");
      info[rawKey.trim()] = rest.join("=").trim();
    } else if (!info.name) {
      info.name = item;
    }
  });
  return info;
}

function selectPeptideChain(sequence, mode = "last") {
  if (!sequence.includes("/")) {
    return {
      sequence: sequence.replace(/[^A-Za-z]/g, "").toUpperCase(),
      multichain: false
    };
  }
  const chains = sequence
    .split("/")
    .map((chain) => chain.replace(/[^A-Za-z]/g, "").toUpperCase())
    .filter(Boolean);
  if (!chains.length) return { sequence: "", multichain: true };
  let selected = chains[chains.length - 1];
  if (mode === "first") selected = chains[0];
  if (mode === "longest") selected = [...chains].sort((a, b) => b.length - a.length)[0];
  if (mode === "shortest") selected = [...chains].sort((a, b) => a.length - b.length)[0];
  return { sequence: selected, multichain: true };
}

function makeRecord(header, sequence, index, chainMode) {
  const info = parseMpnnHeader(header || "");
  const selected = selectPeptideChain(sequence, chainMode);
  const sample = info.sample ?? "";
  const baseId = sample !== "" ? `sample_${sample}` : (info.name || header || `pep_${index + 1}`);
  return {
    id: String(baseId).trim().split(/\s+/)[0] || `pep_${index + 1}`,
    sequence: selected.sequence,
    sample,
    mpnn_score: info.score ?? "",
    seq_recovery: info.seq_recovery ?? "",
    source_header: header || "",
    multichain: selected.multichain,
    n_copies: 1
  };
}

function deduplicateRecords(records) {
  const counts = records.reduce((map, record) => {
    map.set(record.sequence, (map.get(record.sequence) || 0) + 1);
    return map;
  }, new Map());
  const seen = new Set();
  return records.filter((record) => {
    if (seen.has(record.sequence)) return false;
    seen.add(record.sequence);
    record.n_copies = counts.get(record.sequence) || 1;
    return true;
  });
}

function parseSequences(text) {
  const clean = text.replace(/\r/g, "").trim();
  if (!clean) return [];
  const lines = clean.split("\n").map((line) => line.trim()).filter(Boolean);
  const hasFasta = lines.some((line) => line.startsWith(">"));
  const chainMode = els.peptideChainMode.value;

  if (hasFasta) {
    const records = [];
    let currentHeader = "";
    let currentSeq = [];
    lines.forEach((line) => {
      if (line.startsWith(">")) {
        if (currentSeq.length) {
          records.push(makeRecord(currentHeader, currentSeq.join(""), records.length, chainMode));
        }
        currentHeader = line.slice(1).trim();
        currentSeq = [];
      } else {
        currentSeq.push(line);
      }
    });
    if (currentSeq.length) {
      records.push(makeRecord(currentHeader, currentSeq.join(""), records.length, chainMode));
    }
    const hasMpnnSamples = records.some((record) => record.sample !== "");
    const peptideRecords = hasMpnnSamples ? records.filter((record) => record.sample !== "") : records;
    return deduplicateRecords(peptideRecords);
  }

  const records = clean
    .split(/[\s,;|]+/)
    .map((token) => token.replace(/[^A-Za-z]/g, "").toUpperCase())
    .filter(Boolean)
    .map((sequence, index) => ({ id: `pep_${index + 1}`, sequence, sample: "", mpnn_score: "", seq_recovery: "", source_header: "", multichain: false, n_copies: 1 }));
  return deduplicateRecords(records);
}

function validateSequence(seq) {
  const sequence = seq.toUpperCase();
  const invalid = [...new Set(sequence.split("").filter((aa) => !VALID_AA.has(aa)))];
  if (invalid.length) return `non-canonical residues: ${invalid.join(",")}`;
  if (sequence.length < 3) return "sequence too short (<3 aa)";
  return "";
}

function meanScale(seq, scale, digits = 4) {
  return round(seq.split("").reduce((sum, aa) => sum + scale[aa], 0) / seq.length, digits);
}

function calcBomanIndex(seq) {
  return round(-seq.split("").reduce((sum, aa) => sum + BOMAN_SCALE[aa], 0) / seq.length, 4);
}

function calcAliphaticIndex(seq) {
  const n = seq.length;
  const xa = count(seq, "A") / n;
  const xv = count(seq, "V") / n;
  const xi = count(seq, "I") / n;
  const xl = count(seq, "L") / n;
  return round((xa + 2.9 * xv + 3.9 * (xi + xl)) * 100, 3);
}

function calcInstabilityIndex(seq) {
  let score = 0;
  for (let i = 0; i < seq.length - 1; i += 1) {
    score += DIWV[seq.slice(i, i + 2)] ?? 1.0;
  }
  return round((10 / seq.length) * score, 3);
}

function calcAmphiphilicity(seq) {
  const angle = (100 * Math.PI) / 180;
  let sumX = 0;
  let sumY = 0;
  seq.split("").forEach((aa, i) => {
    const h = EISENBERG_SCALE[aa];
    sumX += h * Math.cos(i * angle);
    sumY += h * Math.sin(i * angle);
  });
  return round(Math.sqrt(sumX * sumX + sumY * sumY) / seq.length, 4);
}

function calcShannonEntropy(seq) {
  const counts = {};
  seq.split("").forEach((aa) => {
    counts[aa] = (counts[aa] || 0) + 1;
  });
  const entropy = Object.values(counts).reduce((sum, c) => {
    const p = c / seq.length;
    return sum - p * Math.log2(p);
  }, 0);
  return round(entropy, 4);
}

function calcMolecularWeight(seq) {
  const waterMass = 18.01528;
  const freeAaMass = seq.split("").reduce((sum, aa) => sum + AA_AVG_MASS[aa], 0);
  return round(freeAaMass - (seq.length - 1) * waterMass, 3);
}

function calcResidueFraction(seq, residues) {
  const residueSet = new Set(residues.split(""));
  const hits = seq.split("").filter((aa) => residueSet.has(aa)).length;
  return round(hits / seq.length, 4);
}

function calcExtinctionCoefficient(seq) {
  const tyr = count(seq, "Y");
  const trp = count(seq, "W");
  const cysteine = count(seq, "C");
  const reduced = 1490 * tyr + 5500 * trp;
  const oxidized = reduced + 125 * Math.floor(cysteine / 2);
  return { reduced, oxidized };
}

function aggregationRiskProxy(metrics) {
  const hydrophobicLoad = metrics.hydrophobic_fraction >= 0.45 || metrics.gravy > 0.5;
  const lowRepulsion = Math.abs(metrics.net_charge) < 1;
  const aromaticRich = metrics.aromaticity >= 0.25;
  const unstable = metrics.instability_index > 40;
  const riskScore = [hydrophobicLoad, lowRepulsion, aromaticRich, unstable].filter(Boolean).length;
  if (riskScore >= 3) return "High";
  if (riskScore >= 1) return "Medium";
  return "Low";
}

function findMotifs(seq, patterns) {
  const hits = [];
  patterns.forEach(({ label, regex, priority }) => {
    const expression = new RegExp(regex, "g");
    let match = expression.exec(seq);
    while (match) {
      hits.push({
        motif: match[0],
        label,
        priority,
        position: match.index + 1
      });
      expression.lastIndex = match.index + 1;
      match = expression.exec(seq);
    }
  });
  return hits;
}

function calcDegradationHotspots(seq) {
  const motifHits = findMotifs(seq, [
    { label: "Asn deamidation", regex: "N[GSTN]", priority: "High" },
    { label: "Gln deamidation", regex: "Q[GS]", priority: "Medium" },
    { label: "Asp isomerization", regex: "D[GSDT]", priority: "High" },
    { label: "Asp-Pro acid lability", regex: "DP", priority: "Medium" },
    { label: "Diketopiperazine risk", regex: "^[GP]", priority: "Medium" },
    { label: "Pyroglutamation risk", regex: "^[QE]", priority: "Medium" },
    { label: "Adjacent cysteine beta-elimination risk", regex: "CC", priority: "Low" }
  ]);
  const oxidationResidues = seq.split("").reduce((sum, aa) => sum + ("MWCH".includes(aa) ? 1 : 0), 0);
  if (oxidationResidues) {
    motifHits.push({
      motif: "M/W/C/H",
      label: "Oxidation-prone residues",
      priority: oxidationResidues >= 3 ? "High" : "Medium",
      position: "-"
    });
  }
  return motifHits;
}

function calcLongestCleanStretch(seq) {
  const vulnerableAfter = new Set("KRFWYLM".split(""));
  let longest = 0;
  let current = 1;
  for (let i = 0; i < seq.length - 1; i += 1) {
    if (vulnerableAfter.has(seq[i]) || seq.slice(i, i + 2) === "XP") {
      longest = Math.max(longest, current);
      current = 1;
    } else {
      current += 1;
    }
  }
  return Math.max(longest, current);
}

function calcProteolysisRiskProxy(seq, longestCleanStretch) {
  const dppivRisk = /^[A-Z][PA]/.test(seq);
  const cleavageDensity = seq.split("").filter((aa) => "KRFWYLM".includes(aa)).length / seq.length;
  if (longestCleanStretch < 5 || cleavageDensity > 0.45 || dppivRisk) return "High";
  if (longestCleanStretch < 10 || cleavageDensity > 0.25) return "Medium";
  return "Low";
}

function calcNEndRuleClass(seq) {
  const stabilizing = new Set("GAVPMST".split(""));
  const destabilizing = new Set("RKLFWYI".split(""));
  const first = seq[0];
  if (stabilizing.has(first)) return "Stable";
  if (destabilizing.has(first)) return "Destabilizing";
  return "Intermediate";
}

function calcSppsDifficulty(seq, metrics) {
  const flags = [];
  let score = 0;
  if (seq.length > 30) {
    score += seq.length > 50 ? 4 : 2;
    flags.push(seq.length > 50 ? "very long peptide" : "long peptide");
  }
  if (/(?:[IVT]){4,}/.test(seq)) {
    score += 3;
    flags.push("consecutive beta-branched residues");
  }
  if (/[AVILMFWYC]{6,}/.test(seq)) {
    score += 3;
    flags.push("long hydrophobic stretch");
  }
  if (metrics.hydrophobic_fraction > 0.55) {
    score += 2;
    flags.push("high hydrophobic fraction");
  }
  if (metrics.cysteine_count % 2 === 1) {
    score += 2;
    flags.push("odd cysteine count");
  } else if (metrics.cysteine_count >= 4) {
    score += 2;
    flags.push("multiple cysteines");
  }
  if (calcResidueFraction(seq, "H") > 0.2) {
    score += 1;
    flags.push("His-rich sequence");
  }
  if (count(seq, "M") >= 2) {
    score += 1;
    flags.push("multiple methionines");
  }
  if (/DP/.test(seq)) {
    score += 1;
    flags.push("Asp-Pro motif");
  }
  if (/(?:Q{4,}|G{5,}|(?:GS){4,})/.test(seq)) {
    score += 1;
    flags.push("difficult low-complexity motif");
  }
  return {
    score,
    flags,
    class: score >= 7 ? "Difficult" : score >= 4 ? "Moderate" : "Favorable"
  };
}

function calcHemolysisRiskProxy(metrics) {
  const riskScore = [
    metrics.net_charge > 6,
    metrics.amphiphilicity > 0.5,
    metrics.gravy > 0.5,
    metrics.hydrophobic_fraction > 0.5
  ].filter(Boolean).length;
  if (riskScore >= 3) return "High";
  if (riskScore >= 1) return "Medium";
  return "Low";
}

function scoreWindow(value, min, max, idealMin, idealMax) {
  if (value >= idealMin && value <= idealMax) return 100;
  if (value < min || value > max) return 0;
  if (value < idealMin) return ((value - min) / (idealMin - min)) * 100;
  return ((max - value) / (max - idealMax)) * 100;
}

function scoreMax(value, goodMax, badMax) {
  if (value <= goodMax) return 100;
  if (value >= badMax) return 0;
  return ((badMax - value) / (badMax - goodMax)) * 100;
}

function scoreMin(value, badMin, goodMin) {
  if (value >= goodMin) return 100;
  if (value <= badMin) return 0;
  return ((value - badMin) / (goodMin - badMin)) * 100;
}

function categoryScore(value, scores) {
  return scores[value] ?? 50;
}

function calcCompositeScoring(metrics) {
  const physicochemical = average([
    scoreWindow(metrics.length, 5, 50, 8, 30),
    scoreWindow(metrics.molecular_weight_da, 500, 5000, 700, 3500),
    scoreWindow(metrics.net_charge, -1, 6, 0, 4),
    scoreWindow(metrics.isoelectric_point, 4, 11, 5, 10),
    scoreWindow(metrics.gravy, -2, 0.8, -1.2, 0.2),
    scoreMax(metrics.aromaticity, 0.25, 0.4),
    scoreMin(metrics.shannon_entropy, 1.2, 2.0)
  ]);
  const stability = average([
    scoreMax(metrics.instability_index, 40, 60),
    categoryScore(metrics.n_end_rule_class, { Stable: 100, Intermediate: 70, Destabilizing: 35 }),
    scoreMax(metrics.degradation_hotspot_count, 1, 6),
    categoryScore(metrics.proteolysis_risk_proxy, { Low: 100, Medium: 60, High: 20 })
  ]);
  const solubilityAggregation = average([
    categoryScore(metrics.solubility_proxy, { High: 100, Medium: 65, Low: 25 }),
    categoryScore(metrics.aggregation_risk_proxy, { Low: 100, Medium: 60, High: 15 }),
    scoreMax(metrics.hydrophobic_fraction, 0.45, 0.7),
    scoreWindow(metrics.amphiphilicity, 0.05, 0.65, 0.15, 0.45)
  ]);
  const synthesizability = average([
    scoreMax(metrics.spps_difficulty_score, 3, 8),
    metrics.cysteine_count % 2 === 1 ? 20 : 100,
    scoreWindow(metrics.length, 5, 60, 8, 30)
  ]);
  const safetyProxy = average([
    categoryScore(metrics.hemolysis_risk_proxy, { Low: 100, Medium: 60, High: 15 }),
    scoreMax(Math.max(0, metrics.net_charge - 6), 0, 4),
    scoreMax(metrics.aromaticity, 0.3, 0.5)
  ]);
  const domainScores = {
    physicochemical_balance_score: round(physicochemical, 1),
    stability_score: round(stability, 1),
    solubility_aggregation_score: round(solubilityAggregation, 1),
    synthesizability_score: round(synthesizability, 1),
    safety_proxy_score: round(safetyProxy, 1)
  };
  const weightedScore = Object.entries(SCORING_WEIGHTS).reduce((sum, [key, weight]) => {
    const scoreKey = `${key}_score`;
    return sum + domainScores[scoreKey] * weight;
  }, 0);
  return {
    ...domainScores,
    developability_score: round(weightedScore, 1),
    developability_class: classifyScore(weightedScore)
  };
}

function calcHardFilters(metrics) {
  const reasons = [];
  if (metrics.aggregation_risk_proxy === "High") reasons.push("high aggregation risk proxy");
  if (metrics.hemolysis_risk_proxy === "High") reasons.push("high hemolysis risk proxy");
  if (metrics.spps_difficulty_score >= 8) reasons.push("high SPPS difficulty");
  if (metrics.instability_index > 60 && metrics.longest_clean_stretch_aa < 5) {
    reasons.push("severe instability and short clean stretch");
  }
  if (metrics.cysteine_count % 2 === 1) reasons.push("odd cysteine count");
  return {
    hard_filter_pass: reasons.length === 0,
    hard_filter_reasons: reasons.join("; ")
  };
}

function classifyScore(score) {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Moderate";
  return "Low";
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function count(seq, residue) {
  return seq.split("").filter((aa) => aa === residue).length;
}

function chargeAtPH(seq, ph, amidated = true) {
  const pka = {
    nTerm: 9.69,
    cTerm: 2.34,
    C: 8.33,
    D: 3.86,
    E: 4.25,
    H: 6.00,
    K: 10.53,
    R: 12.48,
    Y: 10.07
  };
  const positive =
    1 / (1 + 10 ** (ph - pka.nTerm)) +
    count(seq, "K") / (1 + 10 ** (ph - pka.K)) +
    count(seq, "R") / (1 + 10 ** (ph - pka.R)) +
    count(seq, "H") / (1 + 10 ** (ph - pka.H));
  const negative =
    (amidated ? 0 : 1 / (1 + 10 ** (pka.cTerm - ph))) +
    count(seq, "D") / (1 + 10 ** (pka.D - ph)) +
    count(seq, "E") / (1 + 10 ** (pka.E - ph)) +
    count(seq, "C") / (1 + 10 ** (pka.C - ph)) +
    count(seq, "Y") / (1 + 10 ** (pka.Y - ph));
  return positive - negative;
}

function calcIsoelectricPoint(seq) {
  let low = 0;
  let high = 14;
  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    if (chargeAtPH(seq, mid, false) > 0) low = mid;
    else high = mid;
  }
  return round((low + high) / 2, 3);
}

function solubilityProxy(metrics) {
  let score = 0;
  if (metrics.gravy <= 0.5) score += 1;
  if (metrics.hydrophobicity <= 0.4) score += 1;
  if (Math.abs(metrics.net_charge) >= 1) score += 1;
  if (metrics.instability_index < 40) score += 1;
  if (score >= 3) return "High";
  if (score === 2) return "Medium";
  return "Low";
}

function evaluateSequence(record, index) {
  const sequence = record.sequence.toUpperCase();
  const extinction = calcExtinctionCoefficient(sequence);
  const metrics = {
    id: record.id || `pep_${index + 1}`,
    sequence,
    sample: record.sample || "",
    mpnn_score: record.mpnn_score || "",
    seq_recovery: record.seq_recovery || "",
    n_copies: record.n_copies || 1,
    source_header: record.source_header || "",
    multichain: record.multichain ? "Yes" : "No",
    length: sequence.length,
    molecular_weight_da: calcMolecularWeight(sequence),
    net_charge: round(chargeAtPH(sequence, 7.4, true), 3),
    net_charge_ph7: round(chargeAtPH(sequence, 7.0, true), 3),
    isoelectric_point: calcIsoelectricPoint(sequence),
    hydrophobicity: meanScale(sequence, EISENBERG_SCALE, 4),
    amphiphilicity: calcAmphiphilicity(sequence),
    instability_index: calcInstabilityIndex(sequence),
    aliphatic_index: calcAliphaticIndex(sequence),
    gravy: meanScale(sequence, KD_SCALE, 4),
    boman_index: calcBomanIndex(sequence),
    shannon_entropy: calcShannonEntropy(sequence),
    aromaticity: calcResidueFraction(sequence, RESIDUE_GROUPS.aromatic),
    acidic_fraction: calcResidueFraction(sequence, RESIDUE_GROUPS.acidic),
    basic_fraction: calcResidueFraction(sequence, RESIDUE_GROUPS.basic),
    charged_fraction: calcResidueFraction(sequence, RESIDUE_GROUPS.charged),
    hydrophobic_fraction: calcResidueFraction(sequence, RESIDUE_GROUPS.hydrophobic),
    polar_fraction: calcResidueFraction(sequence, RESIDUE_GROUPS.polar),
    sulfur_fraction: calcResidueFraction(sequence, RESIDUE_GROUPS.sulfur),
    proline_fraction: calcResidueFraction(sequence, "P"),
    cysteine_count: count(sequence, "C"),
    extinction_coefficient_reduced: extinction.reduced,
    extinction_coefficient_oxidized: extinction.oxidized
  };
  metrics.solubility_proxy = solubilityProxy(metrics);
  metrics.aggregation_risk_proxy = aggregationRiskProxy(metrics);
  metrics.degradation_hotspots = calcDegradationHotspots(sequence);
  metrics.degradation_hotspot_count = metrics.degradation_hotspots.length;
  metrics.degradation_hotspot_summary = metrics.degradation_hotspots
    .map((hit) => `${hit.label}:${hit.motif}@${hit.position}`)
    .join("; ");
  metrics.longest_clean_stretch_aa = calcLongestCleanStretch(sequence);
  metrics.proteolysis_risk_proxy = calcProteolysisRiskProxy(sequence, metrics.longest_clean_stretch_aa);
  metrics.n_end_rule_class = calcNEndRuleClass(sequence);
  const spps = calcSppsDifficulty(sequence, metrics);
  metrics.spps_difficulty_score = spps.score;
  metrics.spps_difficulty_class = spps.class;
  metrics.spps_flags = spps.flags.join("; ");
  metrics.hemolysis_risk_proxy = calcHemolysisRiskProxy(metrics);
  Object.assign(metrics, calcCompositeScoring(metrics));
  Object.assign(metrics, calcHardFilters(metrics));
  const failed = Object.entries(THRESHOLDS).flatMap(([key, [min, max, unit]]) => {
    const value = metrics[key];
    if (value >= min && value <= max) return [];
    const suffix = unit ? ` ${unit}` : "";
    return [`${key}=${format(value)} (expected ${formatThreshold(min, max, suffix)})`];
  });
  const hardFilterFailures = metrics.hard_filter_reasons
    ? [`hard_filter=${metrics.hard_filter_reasons}`]
    : [];
  metrics.druggability = failed.length || !metrics.hard_filter_pass ? "FAIL" : "PASS";
  metrics.fail_reasons = [...hardFilterFailures, ...failed].join("; ");
  return metrics;
}

function runPrediction() {
  const parsed = parseSequences(els.input.value);
  state.skipped = [];
  state.rows = [];

  parsed.forEach((record, index) => {
    const sequence = record.sequence.toUpperCase();
    const reason = validateSequence(sequence);
    if (reason) {
      state.skipped.push({ id: record.id || `pep_${index + 1}`, sequence, reason });
      return;
    }
    state.rows.push(evaluateSequence({ ...record, sequence }, index));
  });

  state.rows.sort((a, b) => {
    if (a.druggability !== b.druggability) return a.druggability === "PASS" ? -1 : 1;
    return b.developability_score - a.developability_score;
  });
  state.filteredRows = [...state.rows];
  els.tableFilter.value = "";
  render();
  showView("results");
}

function render() {
  const pass = state.rows.filter((row) => row.druggability === "PASS").length;
  const fail = state.rows.length - pass;
  els.totalCount.textContent = state.rows.length;
  els.passCount.textContent = pass;
  els.failCount.textContent = fail;
  els.skipCount.textContent = state.skipped.length;
  els.summaryTitle.textContent = state.rows.length ? "Prediction complete" : "Ready";
  els.downloadAll.disabled = state.rows.length === 0;
  els.downloadPass.disabled = pass === 0;

  const passRate = state.rows.length ? `${Math.round((pass / state.rows.length) * 100)}%` : "N/A";
  const skippedText = state.skipped.length
    ? ` Skipped ${state.skipped.length}: ${state.skipped.slice(0, 3).map((x) => `${x.id} ${x.reason}`).join("; ")}.`
    : "";
  els.miniReport.textContent = state.rows.length
    ? `PASS rate ${passRate}. Results are sorted with PASS entries first, then by higher developability score.${skippedText}`
    : "Results will appear after prediction.";

  if (!state.filteredRows.length) {
    els.resultsBody.innerHTML = `<tr class="empty-row"><td colspan="24">${state.rows.length ? "No rows match the filter." : "No predictions yet."}</td></tr>`;
    return;
  }

  els.resultsBody.innerHTML = state.filteredRows.map((row) => `
    <tr>
      <td>${escapeHtml(row.id)}</td>
      <td class="seq-cell">${escapeHtml(row.sequence)}</td>
      <td>${row.n_copies || 1}</td>
      <td>${escapeHtml(row.mpnn_score || "-")}</td>
      <td><span class="status ${row.druggability.toLowerCase()}">${row.druggability}</span></td>
      <td>${format(row.developability_score)}</td>
      <td>${row.developability_class}</td>
      <td>${row.hard_filter_pass ? "PASS" : "FAIL"}</td>
      <td>${row.length}</td>
      <td>${format(row.molecular_weight_da)}</td>
      <td>${format(row.net_charge)}</td>
      <td>${format(row.isoelectric_point)}</td>
      <td>${format(row.hydrophobicity)}</td>
      <td>${format(row.gravy)}</td>
      <td>${format(row.instability_index)}</td>
      <td>${format(row.boman_index)}</td>
      <td>${formatPercent(row.aromaticity)}</td>
      <td>${formatPercent(row.hydrophobic_fraction)}</td>
      <td>${row.extinction_coefficient_reduced}/${row.extinction_coefficient_oxidized}</td>
      <td>${row.solubility_proxy}</td>
      <td>${row.aggregation_risk_proxy}</td>
      <td>${row.proteolysis_risk_proxy}</td>
      <td>${row.spps_difficulty_class}</td>
      <td>${escapeHtml(row.fail_reasons || "-")}</td>
    </tr>
  `).join("");
}

function filterTable() {
  const query = els.tableFilter.value.trim().toLowerCase();
  state.filteredRows = query
    ? state.rows.filter((row) => Object.values(row).join(" ").toLowerCase().includes(query))
    : [...state.rows];
  render();
}

function toCsv(rows) {
  const columns = [
    "id", "sequence", "sample", "mpnn_score", "seq_recovery", "n_copies", "multichain", "source_header",
    "druggability", "developability_score", "developability_class",
    "hard_filter_pass", "hard_filter_reasons", "fail_reasons",
    "physicochemical_balance_score", "stability_score", "solubility_aggregation_score",
    "synthesizability_score", "safety_proxy_score", "length", "molecular_weight_da",
    "net_charge", "net_charge_ph7", "isoelectric_point", "hydrophobicity",
    "amphiphilicity", "instability_index", "aliphatic_index", "gravy",
    "boman_index", "shannon_entropy", "aromaticity", "acidic_fraction",
    "basic_fraction", "charged_fraction", "hydrophobic_fraction", "polar_fraction",
    "sulfur_fraction", "proline_fraction", "cysteine_count",
    "extinction_coefficient_reduced", "extinction_coefficient_oxidized",
    "solubility_proxy", "aggregation_risk_proxy", "hemolysis_risk_proxy",
    "proteolysis_risk_proxy", "longest_clean_stretch_aa", "n_end_rule_class",
    "degradation_hotspot_count", "degradation_hotspot_summary",
    "spps_difficulty_score", "spps_difficulty_class", "spps_flags"
  ];
  const lines = [columns.join(",")];
  rows.forEach((row) => {
    lines.push(columns.map((column) => csvCell(row[column])).join(","));
  });
  return lines.join("\n");
}

function csvCell(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(rows, filename) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function format(value) {
  return Number.isFinite(value) ? String(round(value, 4)) : "";
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${round(value * 100, 1)}%` : "";
}

function formatThreshold(min, max, suffix) {
  if (min <= -998) return `<=${max}${suffix}`;
  if (max >= 998) return `>=${min}${suffix}`;
  return `${min}-${max}${suffix}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function showView(viewName) {
  const normalizedView = viewName === "thresholds" ? "method" : viewName;
  const view = ["predict", "results", "method"].includes(normalizedView) ? normalizedView : "predict";
  document.querySelectorAll(".view-panel").forEach((panel) => {
    panel.hidden = panel.id !== view;
  });
  document.querySelectorAll(".nav a").forEach((link) => {
    const isActive = link.getAttribute("href") === `#${view}`;
    link.classList.toggle("active", isActive);
    link.setAttribute("aria-current", isActive ? "page" : "false");
  });
  if (window.location.hash !== `#${view}`) {
    history.pushState(null, "", `#${view}`);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  runPrediction();
});

els.fileInput.addEventListener("change", async () => {
  const file = els.fileInput.files[0];
  if (!file) return;
  els.fileName.textContent = file.name;
  els.input.value = await file.text();
});

els.loadExample.addEventListener("click", () => {
  els.input.value = `>pep_1
DHPKKGGPTPT
>pep_2
GLFDIIKKIAESF
>pep_3
ACDEFGHIKLMNPQRSTVWY
>low_complexity
AAAAAAA`;
  runPrediction();
});

els.clearAll.addEventListener("click", () => {
  els.input.value = "";
  els.fileInput.value = "";
  els.fileName.textContent = "No file selected";
  state.rows = [];
  state.skipped = [];
  state.filteredRows = [];
  render();
});

els.downloadAll.addEventListener("click", () => {
  downloadCsv(state.rows, "peppredictor_results.csv");
});

els.downloadPass.addEventListener("click", () => {
  downloadCsv(state.rows.filter((row) => row.druggability === "PASS"), "peppredictor_pass_only.csv");
});

els.tableFilter.addEventListener("input", filterTable);

window.addEventListener("hashchange", () => {
  showView(window.location.hash.replace("#", ""));
});

showView(window.location.hash.replace("#", "") || "predict");
