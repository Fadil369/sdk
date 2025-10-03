#!/usr/bin/env python3
"""Integration bridge for invoking PyBrain and PyHeart capabilities.

This script exposes a compact JSON interface that the TypeScript SDK can use to
leverage the Python-based intelligence (PyBrain) and interoperability
(PyHeart) stacks without requiring consumers to craft bespoke Python glue
code. It reads a JSON payload from stdin, executes the requested action, and
writes a JSON response to stdout.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
import time
from dataclasses import asdict
from pathlib import Path
from typing import Any, Dict, Tuple

ROOT = Path(__file__).resolve().parents[1]
PYBRAIN_SRC = ROOT / "pybrain-pyheart" / "pybrain-pkg" / "src"
PYHEART_SRC = ROOT / "pybrain-pyheart" / "pyheart-pkg" / "src"

sys.path.insert(0, str(PYBRAIN_SRC))
sys.path.insert(0, str(PYHEART_SRC))

try:
    from pybrain import AIEngine  # type: ignore[import-not-found]
    from pyheart import WorkflowEngine, ProcessDefinition  # type: ignore[import-not-found]
    from pyheart.core.workflow import Task, TaskStatus  # type: ignore[import-not-found]
except ModuleNotFoundError as exc:  # pragma: no cover - hard failure path
    sys.stderr.write(
        json.dumps(
            {
                "error": "missing-dependency",
                "detail": (
                    "Unable to import PyBrain/PyHeart modules. Ensure the"
                    " pybrain-pyheart sub-repository is present and readable."
                ),
                "exception": str(exc),
            }
        )
        + "\n"
    )
    sys.exit(1)


AI_ENGINE = AIEngine()


class BridgeError(Exception):
    """Raised when an action cannot be completed."""


def _load_payload(raw_arg: str | None) -> Dict[str, Any]:
    """Deserialize payload JSON from CLI argument or stdin."""
    if raw_arg:
        return json.loads(raw_arg)

    if sys.stdin.isatty():
        return {}

    raw_stdin = sys.stdin.read().strip()
    return json.loads(raw_stdin) if raw_stdin else {}


def _serialize_task_result(result: Any) -> Dict[str, Any]:
    """Convert TaskResult dataclass to JSON-friendly structure."""
    if result is None:
        return {"status": "unknown"}

    asdict_result = asdict(result)
    serialized: Dict[str, Any] = {
        "status": asdict_result.get("status")
        if isinstance(asdict_result.get("status"), str)
        else getattr(asdict_result.get("status"), "value", str(asdict_result.get("status"))),
        "output": asdict_result.get("output"),
        "error": asdict_result.get("error"),
        "startedAt": None,
        "completedAt": None,
    }

    started_at = asdict_result.get("started_at")
    if started_at is not None:
        serialized["startedAt"] = started_at.isoformat()

    completed_at = asdict_result.get("completed_at")
    if completed_at is not None:
        serialized["completedAt"] = completed_at.isoformat()

    return serialized


async def _await_instance(engine: WorkflowEngine, instance_id: str, timeout: float = 5.0) -> Dict[str, Any]:
    """Wait for a WorkflowEngine instance to finish and serialize the result."""
    deadline = time.monotonic() + timeout

    while time.monotonic() < deadline:
        instance = engine.get_instance_status(instance_id)
        if instance and instance.status in {TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED}:
            task_map = {
                task_id: _serialize_task_result(task_result)
                for task_id, task_result in instance.task_results.items()
            }
            return {
                "instanceId": instance.id,
                "status": instance.status.value,
                "variables": instance.variables,
                "tasks": task_map,
            }
        await asyncio.sleep(0.05)

    raise BridgeError("Workflow execution timed out")


async def _run_pyheart_workflow(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a demonstration clinical workflow using PyHeart."""
    from pyheart.core.workflow import TaskType  # type: ignore[import-not-found]

    patient = payload.get("patient", {})
    risk_score = float(payload.get("riskScore", 0.0))
    context = payload.get("context", {})
    care_team = payload.get("careTeam", [])

    engine = WorkflowEngine()

    process = ProcessDefinition(
        id="clinical-risk-routing",
        name="Clinical Risk Routing",
        description="Routes patients based on AI-derived risk scores",
        tasks=[
            Task(
                id="fetch-context",
                name="Fetch Clinical Context",
                type=TaskType.API_CALL,
                config={
                    "method": "GET",
                    "url": "${fhir_server}/Patient/${patient_id}",
                },
            ),
            Task(
                id="evaluate-risk",
                name="Evaluate Risk Thresholds",
                type=TaskType.DECISION,
                dependencies=["fetch-context"],
                config={
                    "rules": [
                        {
                            "condition": {"operator": "gt", "left": "$risk_score", "right": 0.8},
                            "actions": [
                                {"type": "set_variable", "variable": "care_plan", "value": "critical-response"},
                                {
                                    "type": "notification",
                                    "recipient": "${primary_physician}",
                                },
                            ],
                        },
                        {
                            "condition": {"operator": "gt", "left": "$risk_score", "right": 0.5},
                            "actions": [
                                {"type": "set_variable", "variable": "care_plan", "value": "priority-followup"},
                            ],
                        },
                    ]
                },
            ),
            Task(
                id="notify-team",
                name="Notify Care Team",
                type=TaskType.NOTIFICATION,
                dependencies=["evaluate-risk"],
                config={
                    "type": "email",
                    "recipient": ",".join(care_team) if care_team else "${primary_physician}",
                    "template": "risk-alert",
                },
            ),
        ],
    )

    engine.register_process(process)

    instance_id = await engine.start_process(
        process.id,
        {
            "patient_id": patient.get("id", "unknown"),
            "patient_name": patient.get("name", ""),
            "risk_score": risk_score,
            "fhir_server": context.get("fhirServer", "https://fhir.example.com"),
            "primary_physician": context.get("primaryPhysician", "care.team@example.com"),
        },
    )

    workflow_result = await _await_instance(engine, instance_id)
    workflow_result["riskScore"] = risk_score
    return workflow_result


def _handle_pybrain_extract(payload: Dict[str, Any]) -> Dict[str, Any]:
    text = payload.get("text", "")
    entities = AI_ENGINE.extract_clinical_entities(text)
    return {
        "entities": entities,
        "meta": {
            "model": AI_ENGINE.config.model_name,
            "modelType": AI_ENGINE.config.model_type,
        },
    }


def _handle_pybrain_risk(payload: Dict[str, Any]) -> Dict[str, Any]:
    patient = payload.get("patient", payload)
    score = AI_ENGINE.predict_risk_score(patient)
    readmission = AI_ENGINE.predict_readmission_risk(patient)
    fall = AI_ENGINE.predict_fall_risk({"demographics": patient, **patient})

    return {
        "riskScore": score,
        "secondaryScores": {
            "readmission": readmission,
            "fall": fall,
        },
    }


def execute_action(package_name: str, action: str, payload: Dict[str, Any]) -> Tuple[bool, Any]:
    if package_name == "pybrain":
        if action == "extract_entities":
            return True, _handle_pybrain_extract(payload)
        if action == "predict_risk":
            return True, _handle_pybrain_risk(payload)
        raise BridgeError(f"Unsupported PyBrain action: {action}")

    if package_name == "pyheart":
        if action == "run_workflow":
            result = asyncio.run(_run_pyheart_workflow(payload))
            return True, result
        raise BridgeError(f"Unsupported PyHeart action: {action}")

    raise BridgeError(f"Unsupported package: {package_name}")


def main() -> int:
    parser = argparse.ArgumentParser(description="PyBrain/PyHeart bridge")
    parser.add_argument("--package", choices=["pybrain", "pyheart"], required=True)
    parser.add_argument("--action", required=True)
    parser.add_argument("--payload", type=str)
    args = parser.parse_args()

    try:
        payload = _load_payload(args.payload)
        _, response = execute_action(args.package, args.action, payload)
        sys.stdout.write(json.dumps(response, default=str) + "\n")
        return 0
    except BridgeError as exc:
        sys.stderr.write(json.dumps({"error": str(exc)}) + "\n")
        return 1
    except json.JSONDecodeError as exc:
        sys.stderr.write(json.dumps({"error": "invalid-json", "detail": str(exc)}) + "\n")
        return 1
    except Exception as exc:  # pragma: no cover - safeguard for unexpected errors
        sys.stderr.write(json.dumps({"error": "unexpected", "detail": str(exc)}) + "\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
