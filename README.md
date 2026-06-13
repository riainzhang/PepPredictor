# PepPredictor

**Online server:** https://peppredictor.pages.dev/

PepPredictor is a web platform for sequence-derived peptide property profiling,
developability scoring, and early-stage risk flagging. It accepts pasted peptide
sequences, FASTA text, or uploaded FASTA/TXT files, then reports peptide
developability-related descriptors with downloadable results.

## Public Access

- Main site: https://peppredictor.pages.dev/
- GitHub Pages mirror: https://riainzhang.github.io/PepPredictor/

The Cloudflare Pages site is the recommended public entry point.

## Inputs

- FASTA records
- One or more peptide sequences separated by comma, semicolon, pipe, space, tab, or new line
- Canonical amino acids only: `ACDEFGHIKLMNPQRSTVWY`
- Up to 5000 sequences per run

## Outputs

- Net charge at pH 7.4
- Net charge at pH 7.0
- Molecular weight
- Isoelectric point
- Hydrophobicity
- Amphiphilicity
- Instability index
- Aliphatic index
- GRAVY
- Boman index
- Shannon entropy
- Aromaticity
- Residue class fractions
- Extinction coefficient at 280 nm
- Solubility proxy
- Aggregation risk proxy
- Degradation hotspot scan
- Proteolysis risk proxy
- N-end rule class
- SPPS difficulty score
- Hemolysis risk proxy
- Weighted developability score
- Hard-filter report
- PASS/FAIL classification
- CSV download for all results or PASS-only results

## Note

PepPredictor is intended for early-stage computational screening. Its results do
not represent experimental validation or clinical druggability conclusions.
