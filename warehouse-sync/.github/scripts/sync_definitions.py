#!/usr/bin/env python3
"""
sync_definitions.py — Sync warehouse .md definitions to the Data Compass API.

Usage:
    python3 sync_definitions.py --action upsert --files path/to/view.md [...]
                                --api-url https://your-server.example.com
                                --api-key YOUR_SECRET_KEY

    python3 sync_definitions.py --action delete --files path/to/view.md [...]
                                --api-url https://your-server.example.com
                                --api-key YOUR_SECRET_KEY

Path convention:
    warehouse/<schema>/Views/<viewname>.md
    -> schema   = <schema>  (e.g. bus_bereken)
    -> viewname = <viewname> (filename without .md extension)
"""

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
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
    """Extract (schema, viewname) from warehouse/<schema>/Views/<viewname>.md"""
    p = Path(filepath)
    viewname = p.stem  # filename without extension
    parts = p.parts
    # Find the 'Views' directory in the path
    views_idx = next(
        (i for i, part in enumerate(parts) if part.lower() == 'views'),
        None
    )
    if views_idx is None or views_idx < 1:
        raise ValueError(
            f"Cannot extract schema from path '{filepath}'. "
            "Expected pattern: warehouse/<schema>/Views/<viewname>.md"
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

    Returns a dict matching (a subset of) the DataDefinition interface.
    """
    text = path.read_text(encoding='utf-8')

    # Split on YAML frontmatter delimiters
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
# API calls
# ---------------------------------------------------------------------------

def api_upsert(base_url: str, api_key: str, schema: str, viewname: str, payload: dict) -> dict:
    url = f"{base_url.rstrip('/')}/api/definitions/{schema}/{viewname}"
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data,
        method='POST',
        headers={
            'Content-Type': 'application/json',
            'X-API-Key':    api_key,
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        raise RuntimeError(f"HTTP {e.code} from {url}: {body}") from e


def api_delete(base_url: str, api_key: str, schema: str, viewname: str) -> dict:
    url = f"{base_url.rstrip('/')}/api/definitions/{schema}/{viewname}"
    req = urllib.request.Request(
        url,
        method='DELETE',
        headers={'X-API-Key': api_key},
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return {'action': 'not-found', 'viewname': viewname}
        body = e.read().decode('utf-8', errors='replace')
        raise RuntimeError(f"HTTP {e.code} from {url}: {body}") from e


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description='Sync warehouse definitions to Data Compass')
    parser.add_argument('--action',  required=True, choices=['upsert', 'delete'])
    parser.add_argument('--files',   required=True, nargs='+', help='.md file paths')
    parser.add_argument('--api-url', required=True, help='Base URL of the Data Compass server')
    parser.add_argument('--api-key', required=True, help='WEBHOOK_API_KEY secret')
    args = parser.parse_args()

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

                result = api_upsert(args.api_url, args.api_key, schema, viewname, payload)
                print(f"  [upsert] {schema}/{viewname} → {result.get('action', '?')} (id: {result.get('id', '?')})")

            else:  # delete
                result = api_delete(args.api_url, args.api_key, schema, viewname)
                print(f"  [delete] {schema}/{viewname} → {result.get('action', '?')}")

        except Exception as exc:
            print(f"  ERROR  {filepath}: {exc}", file=sys.stderr)
            errors.append(filepath)

    if errors:
        print(f"\n{len(errors)} file(s) failed. See errors above.", file=sys.stderr)
        sys.exit(1)

    print(f"\nDone. {len(args.files) - len(errors)}/{len(args.files)} file(s) synced successfully.")


if __name__ == '__main__':
    main()
