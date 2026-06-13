# PepPredictor Scoring Rules

Version: 1.2.5  
Last updated: June 11, 2026  
Scope: sequence-derived early-stage screening for linear peptides composed of canonical amino acids.

## 1. Current Scope

PepPredictor currently evaluates linear peptide sequences made from the 20 canonical amino acids:

`A C D E F G H I K L M N P Q R S T V W Y`

Sequences shorter than 3 amino acids are skipped. The current version does not explicitly model cyclic peptides, stapled peptides, D-amino acids, noncanonical amino acids, terminal modifications, lipidation, PEGylation, glycosylation, disulfide topology, 3D conformation, target binding, pharmacokinetics, toxicity assays, or clinical druggability.

The result should therefore be interpreted as an early sequence-level physicochemical and developability screen, not as experimental validation.

## 2. Overall Decision Logic

PepPredictor uses a two-tier decision system:

1. Descriptor calculation
2. Hard filter assessment
3. Weighted soft scoring
4. Final PASS / FAIL assignment

The final `druggability` output is:

- `PASS`: the peptide passes all predefined descriptor thresholds and all hard filters.
- `FAIL`: the peptide violates at least one predefined descriptor threshold or at least one hard filter.

The `developability_score` is still reported for both PASS and FAIL sequences, so a failed peptide can still be ranked and inspected.

## 3. Main Output Columns

The current web version calculates and exports the following major outputs:

- `id`
- `sequence`
- `druggability`
- `developability_score`
- `developability_class`
- `hard_filter_pass`
- `hard_filter_reasons`
- `fail_reasons`
- `physicochemical_balance_score`
- `stability_score`
- `solubility_aggregation_score`
- `synthesizability_score`
- `safety_proxy_score`
- `length`
- `molecular_weight_da`
- `net_charge`
- `net_charge_ph7`
- `isoelectric_point`
- `hydrophobicity`
- `amphiphilicity`
- `instability_index`
- `aliphatic_index`
- `gravy`
- `boman_index`
- `shannon_entropy`
- `aromaticity`
- residue class fractions
- extinction coefficients
- solubility, aggregation, hemolysis, proteolysis, degradation, and SPPS proxy outputs

## 4. Descriptor Thresholds for PASS / FAIL

The following thresholds are used as the direct descriptor screen. A sequence fails if any value falls outside the allowed range.

| Descriptor | Current PASS Range | Notes |
|---|---:|---|
| `length` | 5 to 50 aa | Typical short therapeutic-peptide range |
| `net_charge` | -1 to +6 at pH 7.4 | Moderately cationic peptides are allowed; very high charge is penalized |
| `isoelectric_point` | pI 4.0 to 11.0 | Avoids extreme predicted ionization behavior |
| `hydrophobicity` | -0.5 to +1.2 | Eisenberg mean hydrophobicity |
| `amphiphilicity` | >= 0.20 | Hydrophobic moment proxy |
| `instability_index` | <= 40 | ProtParam convention; below 40 indicates predicted stability |
| `aliphatic_index` | 0 to 300 | Intentionally broad and mostly non-restrictive |
| `gravy` | -2.0 to +0.8 | Kyte-Doolittle mean hydropathy |
| `boman_index` | >= 0.5 | Protein-binding potential proxy |
| `shannon_entropy` | >= 1.5 | Low-complexity sequence filter |

## 5. Hard Filters

A peptide fails the hard-filter tier if any of the following conditions are met:

| Hard Filter | Failure Condition |
|---|---|
| Aggregation risk | `aggregation_risk_proxy` is `High` |
| Hemolysis risk | `hemolysis_risk_proxy` is `High` |
| SPPS difficulty | `spps_difficulty_score >= 8` |
| Severe instability and proteolysis risk | `instability_index > 60` and `longest_clean_stretch_aa < 5` |
| Cysteine pairing ambiguity | odd cysteine count |

Hard-filter failure reasons are reported in `hard_filter_reasons` and are also included in `fail_reasons`.

## 6. Weighted Developability Score

The final soft score is `developability_score`, ranging from 0 to 100.

It is calculated from five domain scores:

| Domain Score | Weight |
|---|---:|
| `physicochemical_balance_score` | 25% |
| `stability_score` | 25% |
| `solubility_aggregation_score` | 25% |
| `synthesizability_score` | 15% |
| `safety_proxy_score` | 10% |

Formula:

```text
developability_score =
  0.25 * physicochemical_balance_score
+ 0.25 * stability_score
+ 0.25 * solubility_aggregation_score
+ 0.15 * synthesizability_score
+ 0.10 * safety_proxy_score
```

## 7. Developability Classes

The weighted score is converted into a class:

| Score Range | Class |
|---:|---|
| >= 80 | Excellent |
| >= 65 and < 80 | Good |
| >= 50 and < 65 | Moderate |
| < 50 | Low |

This class is a ranking aid. It does not override the PASS / FAIL result.

## 8. Domain Score Details

### 8.1 Physicochemical Balance Score

This score is the average of seven sub-scores:

| Feature | Scoring Rule |
|---|---|
| Length | best: 8-30 aa; allowed: 5-50 aa |
| Molecular weight | best: 700-3500 Da; allowed: 500-5000 Da |
| Net charge | best: 0 to +4; allowed: -1 to +6 |
| pI | best: 5-10; allowed: 4-11 |
| GRAVY | best: -1.2 to +0.2; allowed: -2.0 to +0.8 |
| Aromaticity | full score <= 0.25; zero score >= 0.40 |
| Shannon entropy | full score >= 2.0; zero score <= 1.2 |

### 8.2 Stability Score

This score is the average of four sub-scores:

| Feature | Scoring Rule |
|---|---|
| Instability index | full score <= 40; zero score >= 60 |
| N-end rule class | Stable = 100, Intermediate = 70, Destabilizing = 35 |
| Degradation hotspot count | full score <= 1; zero score >= 6 |
| Proteolysis risk proxy | Low = 100, Medium = 60, High = 20 |

### 8.3 Solubility / Aggregation Score

This score is the average of four sub-scores:

| Feature | Scoring Rule |
|---|---|
| Solubility proxy | High = 100, Medium = 65, Low = 25 |
| Aggregation risk proxy | Low = 100, Medium = 60, High = 15 |
| Hydrophobic fraction | full score <= 0.45; zero score >= 0.70 |
| Amphiphilicity | best: 0.15-0.45; allowed: 0.05-0.65 |

### 8.4 Synthesizability Score

This score is the average of three sub-scores:

| Feature | Scoring Rule |
|---|---|
| SPPS difficulty score | full score <= 3; zero score >= 8 |
| Cysteine parity | even cysteine count = 100; odd cysteine count = 20 |
| Length | best: 8-30 aa; allowed: 5-60 aa |

### 8.5 Safety Proxy Score

This score is the average of three sub-scores:

| Feature | Scoring Rule |
|---|---|
| Hemolysis risk proxy | Low = 100, Medium = 60, High = 15 |
| Excess positive charge | no penalty at `net_charge <= +6`; zero score when excess charge reaches +4 |
| Aromaticity | full score <= 0.30; zero score >= 0.50 |

## 9. Proxy Rules

### 9.1 Solubility Proxy

The solubility proxy counts four favorable conditions:

- `gravy <= 0.5`
- `hydrophobicity <= 0.4`
- `abs(net_charge) >= 1`
- `instability_index < 40`

Classification:

| Favorable Conditions | Solubility Proxy |
|---:|---|
| 3-4 | High |
| 2 | Medium |
| 0-1 | Low |

### 9.2 Aggregation Risk Proxy

The aggregation proxy counts four risk conditions:

- hydrophobic load: `hydrophobic_fraction >= 0.45` or `gravy > 0.5`
- low electrostatic repulsion: `abs(net_charge) < 1`
- aromatic-rich sequence: `aromaticity >= 0.25`
- predicted instability: `instability_index > 40`

Classification:

| Risk Conditions | Aggregation Risk |
|---:|---|
| >= 3 | High |
| 1-2 | Medium |
| 0 | Low |

### 9.3 Hemolysis Risk Proxy

The hemolysis proxy counts four risk conditions:

- `net_charge > 6`
- `amphiphilicity > 0.5`
- `gravy > 0.5`
- `hydrophobic_fraction > 0.5`

Classification:

| Risk Conditions | Hemolysis Risk |
|---:|---|
| >= 3 | High |
| 1-2 | Medium |
| 0 | Low |

### 9.4 Proteolysis Risk Proxy

Proteolysis risk uses cleavage-prone residues and motifs:

- Cleavage-prone residues: `K R F W Y L M`
- DPP-IV-like N-terminal risk: sequence begins with any amino acid followed by `P` or `A`
- `longest_clean_stretch_aa` is calculated by tracking stretches without cleavage-prone residues or `XP` motifs

Classification:

| Condition | Proteolysis Risk |
|---|---|
| `longest_clean_stretch_aa < 5`, or cleavage density > 0.45, or DPP-IV-like N-terminal risk | High |
| `longest_clean_stretch_aa < 10`, or cleavage density > 0.25 | Medium |
| Otherwise | Low |

### 9.5 N-End Rule Class

The first residue is classified as:

| N-terminal Residue | Class |
|---|---|
| `G A V P M S T` | Stable |
| `R K L F W Y I` | Destabilizing |
| Other canonical residues | Intermediate |

### 9.6 SPPS Difficulty Score

The SPPS difficulty score accumulates penalties:

| Feature | Penalty |
|---|---:|
| Length > 30 aa | +2 |
| Length > 50 aa | +4 instead of +2 |
| Four or more consecutive beta-branched residues among `I V T` | +3 |
| Six or more consecutive hydrophobic residues among `A V I L M F W Y C` | +3 |
| Hydrophobic fraction > 0.55 | +2 |
| Odd cysteine count | +2 |
| Four or more cysteines | +2 |
| Histidine fraction > 0.20 | +1 |
| Two or more methionines | +1 |
| `DP` motif | +1 |
| Low-complexity motifs: `Q{4,}`, `G{5,}`, or `(GS){4,}` | +1 |

SPPS class:

| SPPS Difficulty Score | Class |
|---:|---|
| >= 7 | Difficult |
| 4-6 | Moderate |
| 0-3 | Favorable |

## 10. Degradation Hotspots

PepPredictor scans for the following degradation-related motifs:

| Motif Rule | Label | Priority |
|---|---|---|
| `N[GSTN]` | Asn deamidation | High |
| `Q[GS]` | Gln deamidation | Medium |
| `D[GSDT]` | Asp isomerization | High |
| `DP` | Asp-Pro acid lability | Medium |
| N-terminal `G` or `P` | Diketopiperazine risk | Medium |
| N-terminal `Q` or `E` | Pyroglutamation risk | Medium |
| `CC` | Adjacent cysteine beta-elimination risk | Low |
| Any `M/W/C/H` | Oxidation-prone residues | Medium or High depending on count |

## 11. Important Limitations

The current scoring rules are intentionally transparent and sequence-derived. They are useful for early filtering and ranking, but they should not be interpreted as definitive evidence of druggability.

Important limitations:

- No experimental solubility, stability, permeability, hemolysis, cytotoxicity, immunogenicity, or PK data are used.
- No target, binding affinity, selectivity, or mechanism-of-action data are used.
- No 3D structure or conformational ensemble is used.
- Chemical modifications are not represented.
- Cyclic, stapled, crosslinked, D-amino-acid, and noncanonical peptides are not explicitly modeled.
- Charge and pI are approximations calculated from sequence-level pKa assumptions.
- Some proxy rules are heuristic and should be recalibrated when experimental datasets become available.

## 12. Recommended Interpretation

Use PepPredictor as an early screening layer:

1. Remove obvious high-risk sequences.
2. Rank candidates by `developability_score`.
3. Inspect `fail_reasons` and domain scores.
4. Prioritize candidates with balanced physicochemical properties, lower aggregation risk, lower predicted instability, and manageable synthesis risk.
5. Validate promising candidates experimentally.

The best use case is comparative triage among candidate peptide sequences, not final clinical developability prediction.
