#!/usr/bin/env python3
"""
sync_definitions.py — Sync warehouse .md definitions into definitions.json.

Usage:
    python3 sync_definitions.py --action upsert --files path/to/view.md [...] \
                                --definitions-file definitions.json

    python3 sync_definitions.py --action delete --files path/to/view.md [...] \
                                --definitions-file definitions.json

Path convention:
    Warehouses/<db>/<schema>/Views/<viewname>.md
    -> schema   = <schema>  (directory directly above Views/)
    -> viewname = <viewname> (filename without .md extension)
"""

import argparse
import json
import re
import sys
import uuid
from datetime import date
from pathlib import Path

try:
    import yaml
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'pyyaml', '-q'])
    import yaml


# ---------------------------------------------------------------------------
# Path helpers
# ---------------------------------------------------------------------------

def path_to_parts(filepath: str) -> tuple[str, str]:
    """Extract (schema, viewname) from .../<schema>/Views/<viewname>.md"""
    p = Path(filepath)
    viewname = p.stem
    parts = p.parts
    views_idx = next(
        (i for i, part in enumerate(parts) if part.lower() == 'views'),
        None
    )
    if views_idx is None or views_idx < 1:
        raise ValueError(
            f"Cannot extract schema from path '{filepath}'. "
            "Expected pattern: .../<schema>/Views/<viewname>.md"
        )
    schema = parts[views_idx - 1]
    return schema, viewname


# ---------------------------------------------------------------------------
# .md parser
# ---------------------------------------------------------------------------

def parse_md(path: Path) -> dict:
    """
    Parse a definition .md file.

    Expected format:
        ---
        eigenaar: "Name"
        categorie: "Financieel"
        status: "Concept"
        ---
        The rest of the file is the technical definition (beschrijving).
    """
    text = path.read_text(encoding='utf-8')
    fm_match = re.match(r'^---\r?\n(.*?)\r?\n---\r?\n?(.*)', text, re.DOTALL)
    if not fm_match:
        raise ValueError(
            f"No YAML frontmatter found in '{path}'. "
            "File must start with --- frontmatter block ---"
        )

    frontmatter_text = fm_match.group(1)
    body = fm_match.group(2).strip()
    front = yaml.safe_load(frontmatter_text) or {}

    return {
        'beschrijving':    body,
        'eigenaar':        str(front.get('eigenaar', '')),
        'categorie':       str(front.get('categorie', 'Overig')),
        'status':          str(front.get('status', 'Concept')),
        'laatstBijgewerkt': str(date.today()),
        'transformaties':  [],
        'lineageBranches': None,
        'mergeStappen':    None,
    }


def read_sql(md_path: Path) -> str:
    """Read the paired .sql file (same name, .sql extension). Returns '' if not found."""
    sql_path = md_path.with_suffix('.sql')
    if sql_path.exists():
        return sql_path.read_text(encoding='utf-8')
    return ''


# ---------------------------------------------------------------------------
# definitions.json helpers
# ---------------------------------------------------------------------------

def load_definitions(definitions_file: Path) -> list:
    if definitions_file.exists():
        text = definitions_file.read_text(encoding='utf-8').strip()
        if text:
            return json.loads(text)
    return []


def save_definitions(definitions_file: Path, definitions: list) -> None:
    definitions_file.write_text(
        json.dumps(sorted(definitions, key=lambda d: d.get('naam', '').lower()), indent=2, ensure_ascii=False),
        encoding='utf-8'
    )


def upsert_definition(definitions: list, entry: dict) -> str:
    """Name-based upsert. Returns 'created' or 'updated'."""
    key = entry['naam'].lower()
    for i, existing in enumerate(definitions):
        if existing.get('naam', '').lower() == key:
            # Preserve id; merge everything else
            definitions[i] = {**existing, **entry, 'id': existing['id']}
            # Clear soft-delete flag if re-added
            definitions[i].pop('_deleted', None)
            return 'updated'
    # New entry — generate a UUID
    entry['id'] = str(uuid.uuid4())
    definitions.append(entry)
    return 'created'


def soft_delete_definition(definitions: list, naam: str) -> str:
    """Soft-delete: set status → Concept, flag _deleted. Returns 'deleted' or 'not-found'."""
    key = naam.lower()
    for entry in definitions:
        if entry.get('naam', '').lower() == key:
            entry['status'] = 'Concept'
            entry['_deleted'] = True
            return 'deleted'
    return 'not-found'


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description='Sync warehouse definitions to definitions.json')
    parser.add_argument('--action',           required=True, choices=['upsert', 'delete'])
    parser.add_argument('--files',            required=True, nargs='+', help='.md file paths')
    parser.add_argument('--definitions-file', default='definitions.json',
                        help='Path to definitions.json (default: definitions.json)')
    args = parser.parse_args()

    definitions_file = Path(args.definitions_file)
    definitions = load_definitions(definitions_file)
    errors = []

    for filepath in args.files:
        filepath = filepath.strip()
        if not filepath:
            continue
        try:
            schema, viewname = path_to_parts(filepath)

            if args.action == 'upsert':
                md_path = Path(filepath)
                if not md_path.exists():
                    raise FileNotFoundError(f"File not found: {filepath}")

                payload = parse_md(md_path)
                payload['naam']       = viewname
                payload['schema']     = schema
                payload['sqlContent'] = read_sql(md_path)

                action = upsert_definition(definitions, payload)
                print(f"  [upsert] {schema}/{viewname} → {action}")

            else:  # delete
                action = soft_delete_definition(definitions, viewname)
                print(f"  [delete] {schema}/{viewname} → {action}")

        except Exception as exc:
            print(f"  ERROR  {filepath}: {exc}", file=sys.stderr)
            errors.append(filepath)

    save_definitions(definitions_file, definitions)

    if errors:
        print(f"\n{len(errors)} file(s) failed. See errors above.", file=sys.stderr)
        sys.exit(1)

    print(f"\nDone. {len(args.files) - len(errors)}/{len(args.files)} file(s) synced successfully.")
    print(f"definitions.json updated ({len(definitions)} total entries).")


if __name__ == '__main__':
    main()
