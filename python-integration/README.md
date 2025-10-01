# Python Integration Bridge

This directory contains the glue required to invoke the Python
`pybrain` and `pyheart` packages from the TypeScript SDK. The
`bridge.py` script exposes a JSON-over-STDIN/STDOUT contract that the
SDK uses to access advanced AI and interoperability workflows without
requiring consumers to manage Python directly.

## Prerequisites

- Python 3.10 or newer (3.13 tested)
- Local checkout of [`pybrain-pyheart`](../pybrain-pyheart) – this
	repository already vendors the packages under
	`pybrain-pkg/src` and `pyheart-pkg/src`

## Quick start

```bash
python3 bridge.py --package pybrain --action extract_entities <<'JSON'
{"text": "Patient diagnosed with diabetes and hypertension"}
JSON
```

## Virtual environment (optional)

While the bridge is able to import the packages directly from the
vendored sources, you can also install them into a dedicated virtual
environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ../pybrain-pyheart/pybrain-pkg
pip install -e ../pybrain-pyheart/pyheart-pkg
```

## Contract

- Payload is supplied via `--payload '{...}'` or STDIN
- Output is JSON written to STDOUT
- Non-zero exit codes communicate errors; STDOUT remains empty and
	STDERR carries a JSON error payload

The TypeScript wrapper in `src/python/index.ts` provides ergonomic
helpers and validation.
