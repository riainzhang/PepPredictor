from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from modlamp.descriptors import GlobalDescriptor
except ImportError as exc:
    raise RuntimeError("modlamp is required for the PepPredictor API") from exc


VALID_AA = set("ACDEFGHIKLMNPQRSTVWY")

app = FastAPI(
    title="PepPredictor modlamp API",
    version="0.1.0",
    description="Reference descriptor service for PepPredictor charge, pI, and Boman calculations.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://peppredictor.pages.dev",
        "https://riainzhang.github.io",
        "https://riainzhang.github.io/PepPredictor",
    ],
    allow_origin_regex=r"https://.*\.peppredictor\.pages\.dev",
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class ModlampRequest(BaseModel):
    sequences: List[str] = Field(..., min_length=1, max_length=500)


def normalize_sequence(sequence: str) -> str:
    clean = "".join(ch for ch in sequence.upper() if ch.isalpha())
    invalid = sorted(set(clean) - VALID_AA)
    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Non-canonical residues found: {', '.join(invalid)}",
        )
    if len(clean) < 3:
        raise HTTPException(status_code=400, detail="Sequences shorter than 3 aa are not supported.")
    return clean


def descriptor_value(descriptor: GlobalDescriptor) -> float:
    return float(descriptor.descriptor[0][0])


def calculate_modlamp_descriptors(sequence: str) -> dict:
    descriptor = GlobalDescriptor([sequence])

    descriptor.calculate_charge(ph=7.4, amide=True)
    net_charge = round(descriptor_value(descriptor), 3)

    descriptor.calculate_charge(ph=7.0, amide=True)
    net_charge_ph7 = round(descriptor_value(descriptor), 3)

    descriptor.isoelectric_point()
    isoelectric_point = round(descriptor_value(descriptor), 3)

    descriptor.boman_index()
    boman_index = round(descriptor_value(descriptor), 4)

    return {
        "sequence": sequence,
        "net_charge": net_charge,
        "net_charge_ph7": net_charge_ph7,
        "isoelectric_point": isoelectric_point,
        "boman_index": boman_index,
        "engine": "modlamp",
    }


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "engine": "modlamp"}


@app.post("/api/modlamp")
def modlamp_descriptors(payload: ModlampRequest) -> dict:
    unique_sequences = list(dict.fromkeys(normalize_sequence(seq) for seq in payload.sequences))
    return {
        "results": [calculate_modlamp_descriptors(seq) for seq in unique_sequences],
    }
