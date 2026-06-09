# PepPredictor

PepPredictor is a static web app for peptide property prediction. It accepts pasted
peptide sequences, FASTA text, or uploaded FASTA/TXT files, then calculates basic
druggability-related descriptors in the browser.

## Preview

Open `index.html` directly in a browser.

## Inputs

- FASTA records
- One or more peptide sequences separated by comma, semicolon, pipe, space, tab, or new line
- Canonical amino acids only: `ACDEFGHIKLMNPQRSTVWY`

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

## Calculation note

This first version runs fully in the browser for easy static deployment. The
manual descriptor scales and thresholds are adapted from the earlier Python
script; charge and pI are JavaScript estimates using standard pKa equations.
If exact `modlamp` parity is required later, add a small Python API backend.

## Deploy

GitHub Pages:

1. Push this folder to a GitHub repository.
2. In repository settings, enable Pages from the main branch root.

Cloudflare Pages:

1. Create a Pages project from the GitHub repository.
2. Use no build command.
3. Set the output directory to `/`.
