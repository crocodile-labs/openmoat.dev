#!/usr/bin/env python3
"""Write src/data/rules.json from OpenMoat's default policy: one entry per deny and
review rule (id, verdict, title, why, reason), for the /r/<rule>/ pages that every
block message links to ("more  openmoat why --last · https://openmoat.dev/r/<rule>").

Run it after each OpenMoat release, from the site root:

    python3 -I tools/rules_from_policy.py ../openmoat/crates/openmoat-core/policies/default-v1.yaml

The policy file is plain YAML with one rule per `  - id:` line; only the top-level
`deny:` and `review:` lists and each rule's `title`, `why` and `reason` scalars are
read, so no YAML library is needed.
"""

import json
import re
import sys
from pathlib import Path

SECTION = re.compile(r"^(deny|review|allow|defer|defaults|executables|sandbox|version)\s*:")
RULE = re.compile(r"^  - id:\s*(\S+)\s*$")
FIELD = re.compile(r"^    (title|why|reason):\s*(.+?)\s*$")


def scalar(text):
    """A YAML scalar as written on one line: quotes removed, `''` read as `'`."""
    if len(text) >= 2 and text[0] == text[-1] and text[0] in "'\"":
        inner = text[1:-1]
        return inner.replace("''", "'") if text[0] == "'" else inner.replace('\\"', '"')
    return text


def rules(policy):
    section, current, out = None, None, []
    for line in policy.splitlines():
        if top := SECTION.match(line):
            section, current = top.group(1), None
            continue
        if section not in ("deny", "review"):
            continue
        if rule := RULE.match(line):
            current = {"id": rule.group(1), "verdict": section}
            out.append(current)
        elif current is not None and (field := FIELD.match(line)):
            current[field.group(1)] = scalar(field.group(2))
    return out


def main(argv):
    if len(argv) != 2:
        sys.exit(__doc__)
    found = rules(Path(argv[1]).read_text(encoding="utf-8"))
    ids = [r["id"] for r in found]
    if len(ids) != len(set(ids)):
        sys.exit("rules_from_policy: a rule id repeats")
    if not all(r.get("title") and r.get("why") for r in found):
        missing = [r["id"] for r in found if not (r.get("title") and r.get("why"))]
        sys.exit(f"rules_from_policy: deny/review rules without a title or why: {missing}")
    out = Path(__file__).resolve().parent.parent / "src" / "data" / "rules.json"
    out.write_text(json.dumps(found, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{len(found)} rules → {out}")


if __name__ == "__main__":
    main(sys.argv)
