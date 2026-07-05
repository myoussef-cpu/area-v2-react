import { getToolById } from '../../domains/registry';
import type { ScanResult, DetectedInput } from './scan-types';

function extractJson(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function parseVisionResponse(raw: string): ScanResult | null {
  const json = extractJson(raw);
  if (!json) return null;

  const toolId = String(json.toolId || '').trim();
  const inputs = json.inputs as Record<string, number> | undefined;
  const unit = String(json.unit || 'م');
  const summary = String(json.summary || '');
  const details = String(json.details || '');
  const rawSpecs = json.inputSpecs as Array<Record<string, unknown>> | undefined;

  if (!toolId || !inputs || Object.keys(inputs).length === 0) return null;

  const toolDef = getToolById(toolId);
  const toolName = toolDef?.name || toolId;

  const inputSpecs: DetectedInput[] = (rawSpecs || []).map((s) => ({
    key: String(s.key || ''),
    label: String(s.label || s.key || ''),
    value: Number(s.value) || 0,
    unit: String(s.unit || unit),
  }));

  if (inputSpecs.length === 0) {
    for (const [key, val] of Object.entries(inputs)) {
      inputSpecs.push({ key, label: key, value: Number(val) || 0, unit });
    }
  }

  const numericInputs: Record<string, number> = {};
  for (const [key, val] of Object.entries(inputs)) {
    numericInputs[key] = Number(val) || 0;
  }

  return {
    toolId,
    toolName,
    category: toolDef?.category,
    inputs: numericInputs,
    unit,
    confidence: 0.8,
    summary,
    details,
    rawExtraction: raw,
    inputSpecs,
  };
}
