# PepPredictor

**Online server:** https://peppredictor.pages.dev/

PepPredictor is a web platform for sequence-derived peptide property profiling,
developability scoring, and early-stage risk flagging. It accepts pasted peptide
sequences, FASTA text, or uploaded FASTA/TXT files, then reports
druggability-related descriptors with downloadable results.

## Public Access

- Main site: https://peppredictor.pages.dev/
- GitHub Pages mirror: https://riainzhang.github.io/PepPredictor/

The Cloudflare Pages site is the recommended public entry point. The GitHub
Pages mirror uses the same Cloudflare HTTPS API endpoint for the Python/modlamp
descriptor service.

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

PepPredictor uses a hybrid deployment. The web interface is hosted on
Cloudflare Pages and GitHub Pages. Charge, pI, and Boman index are preferentially
calculated by a Python FastAPI backend using `modlamp`, currently deployed on a
Google Cloud VM and exposed through a Cloudflare HTTPS proxy. If the backend is
temporarily unavailable, the browser falls back to local JavaScript estimates so
the interface remains usable.

## Deployment

- Frontend: Cloudflare Pages and GitHub Pages
- Backend: Google Cloud VM, FastAPI, `modlamp`, Nginx, systemd
- Public API proxy: `https://peppredictor.pages.dev/api/modlamp`

Cloudflare Pages is connected to this GitHub repository and automatically
redeploys after commits to `main`.
