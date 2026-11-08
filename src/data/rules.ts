// Every rule id an OpenMoat block message links to (openmoat.dev/r/<id>):
// the default policy's deny and review rules (rules.json, written by
// tools/rules_from_policy.py) and OpenMoat's own checks (builtin-rules.json,
// the table in crates/openmoat-cli/src/notice/builtin.rs).
import policy from './rules.json';
import builtin from './builtin-rules.json';

export interface Rule {
  id: string;
  verdict: 'deny' | 'review';
  title: string;
  why: string;
  reason?: string;
  next?: string;
  source: 'policy' | 'builtin';
}

const extra: Rule[] = [
  { id: 'default.net', verdict: 'deny', source: 'builtin',
    title: 'sending to a host your policy does not list',
    why: 'a command that can send data could carry what the agent read to any host',
    next: 'If you trust the host, run `openmoat allow --site <host>` in your own terminal.' },
];

export const rules: Rule[] = [
  ...(policy as Omit<Rule, 'source'>[]).map((r) => ({ ...r, source: 'policy' as const })),
  ...(builtin as Omit<Rule, 'source'>[]).map((r) => ({ ...r, source: 'builtin' as const })),
  ...extra,
];

const ids = rules.map((r) => r.id);
if (new Set(ids).size !== ids.length) throw new Error('rules: a rule id repeats');
