#!/usr/bin/env python3
"""
Move heavy third-party imports from module-level into function bodies.

For each atoms.py file:
1. Parse the AST to find top-level imports of heavy modules
2. For each function, find which heavy symbols it uses
3. Move those imports into the function body
4. Remove the now-unused top-level imports

Keeps eager: numpy, scipy, icontract, sciona, __future__, typing,
collections, dataclasses, enum, abc, math, functools, operator,
numbers, warnings, pathlib, re, itertools, ctypes, array, heapq,
and all relative imports (witnesses, state_models, expressions, etc.)

Usage:
    python lazify-heavy-imports.py --dry-run
    python lazify-heavy-imports.py --apply
"""

import ast
import sys
import glob
import os
import re
from collections import defaultdict
from typing import NamedTuple

DRY_RUN = "--apply" not in sys.argv
BASE = "/Users/conrad/personal"

# Modules to keep at top level (cheap or required at decoration time)
EAGER_MODULES = {
    "numpy", "np", "scipy", "icontract", "sciona",
    "__future__", "typing", "typing_extensions",
    "collections", "dataclasses", "enum", "abc",
    "math", "functools", "operator", "numbers",
    "warnings", "pathlib", "re", "itertools",
    "ctypes", "array", "heapq", "os", "sys",
    "copy", "struct", "io",
}

# Relative imports are always eager (witnesses, state_models, etc.)
# They're identified by node.level > 0 in ImportFrom


class ImportInfo(NamedTuple):
    """A top-level import that may need to be moved."""
    line: int           # 1-based line number
    source: str         # original source line
    module: str         # top-level module name
    symbols: list       # imported symbol names (for 'from X import a, b')
    is_star: bool       # from X import *
    full_module: str    # full dotted module path


def get_top_level_heavy_imports(tree: ast.Module, lines: list[str]) -> list[ImportInfo]:
    """Find all top-level imports of heavy (non-eager) modules."""
    imports = []
    for node in ast.iter_child_nodes(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                mod = alias.name.split(".")[0]
                if mod not in EAGER_MODULES:
                    source = lines[node.lineno - 1].rstrip()
                    symbols = [alias.asname or alias.name.split(".")[-1]]
                    imports.append(ImportInfo(
                        line=node.lineno,
                        source=source,
                        module=mod,
                        symbols=symbols,
                        is_star=False,
                        full_module=alias.name,
                    ))
        elif isinstance(node, ast.ImportFrom):
            if node.level > 0:  # relative import — keep eager
                continue
            if node.module is None:
                continue
            mod = node.module.split(".")[0]
            if mod not in EAGER_MODULES:
                # Reconstruct multi-line imports
                start = node.lineno
                end = node.end_lineno or start
                source_lines = [lines[i].rstrip() for i in range(start - 1, end)]
                source = "\n".join(source_lines)

                is_star = any(a.name == "*" for a in node.names)
                symbols = []
                if not is_star:
                    symbols = [a.asname or a.name for a in node.names]

                imports.append(ImportInfo(
                    line=node.lineno,
                    source=source,
                    module=mod,
                    symbols=symbols,
                    is_star=is_star,
                    full_module=node.module,
                ))
    return imports


def get_function_used_names(func_node: ast.FunctionDef) -> set[str]:
    """Get all Name identifiers used inside a function."""
    names = set()
    for node in ast.walk(func_node):
        if isinstance(node, ast.Name):
            names.add(node.id)
        elif isinstance(node, ast.Attribute):
            # For X.Y.Z, capture X
            root = node
            while isinstance(root, ast.Attribute):
                root = root.value
            if isinstance(root, ast.Name):
                names.add(root.id)
    return names


def build_lazy_import_line(imp: ImportInfo) -> str:
    """Build the import statement to insert inside a function."""
    if imp.is_star:
        return imp.source  # can't easily lazify star imports
    return imp.source


def transform_file(filepath: str) -> tuple[bool, int, list[str]]:
    """
    Transform a file to use lazy imports.
    Returns (changed, num_imports_moved, details).
    """
    with open(filepath) as f:
        content = f.read()

    lines = content.split("\n")

    try:
        tree = ast.parse(content)
    except SyntaxError:
        return False, 0, [f"SKIP: syntax error"]

    heavy_imports = get_top_level_heavy_imports(tree, lines)
    if not heavy_imports:
        return False, 0, []

    # Skip star imports — too risky to move
    star_imports = [i for i in heavy_imports if i.is_star]
    movable_imports = [i for i in heavy_imports if not i.is_star]

    if not movable_imports:
        return False, 0, [f"SKIP: only star imports from heavy modules"]

    # Build symbol → import mapping
    symbol_to_import: dict[str, ImportInfo] = {}
    for imp in movable_imports:
        for sym in imp.symbols:
            symbol_to_import[sym] = imp

    # Find all top-level functions (decorated with @register_atom)
    functions: list[ast.FunctionDef] = []
    for node in ast.iter_child_nodes(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions.append(node)

    # For each function, determine which heavy imports it needs
    func_imports: dict[str, set[int]] = {}  # func_name → set of import line numbers
    import_used_by_any_func: set[int] = set()

    for func in functions:
        used_names = get_function_used_names(func)
        needed_imports = set()
        for sym, imp in symbol_to_import.items():
            if sym in used_names:
                needed_imports.add(imp.line)
                import_used_by_any_func.add(imp.line)
        if needed_imports:
            func_imports[func.name] = needed_imports

    # Check if any heavy import is used in truly module-level code
    # (not inside any function — including helper functions).
    # Class bodies, assignments, and bare expressions count as module-level.
    imports_used_at_module_level: set[int] = set()
    for node in ast.iter_child_nodes(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            continue  # functions (including helpers) don't count
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            continue
        for child in ast.walk(node):
            if isinstance(child, ast.Name) and child.id in symbol_to_import:
                imports_used_at_module_level.add(symbol_to_import[child.id].line)

    # Only move imports that are NOT used at module level
    movable_lines = import_used_by_any_func - imports_used_at_module_level

    if not movable_lines:
        return False, 0, [f"SKIP: all heavy imports used at module level"]

    # Build the new file content
    imports_by_line = {i.line: i for i in movable_imports}

    # Lines to remove (import lines)
    lines_to_remove: set[int] = set()
    for line_no in movable_lines:
        imp = imports_by_line.get(line_no)
        if imp:
            # Handle multi-line imports
            source_line_count = imp.source.count("\n") + 1
            for i in range(source_line_count):
                lines_to_remove.add(line_no + i)  # 1-based

    # Build function insertions
    # For each function, collect the import lines to insert
    func_insertions: dict[int, list[str]] = {}  # func body start line → import lines
    for func in functions:
        if func.name not in func_imports:
            continue
        needed = func_imports[func.name] & movable_lines
        if not needed:
            continue

        # Determine indentation of function body
        body_line = func.body[0].lineno
        body_text = lines[body_line - 1]
        indent = len(body_text) - len(body_text.lstrip())
        indent_str = body_text[:indent]

        # Build import lines with proper indentation
        insert_lines = []
        for line_no in sorted(needed):
            imp = imports_by_line[line_no]
            # Re-indent the import source
            for src_line in imp.source.split("\n"):
                stripped = src_line.lstrip()
                insert_lines.append(indent_str + stripped)

        func_insertions[body_line] = insert_lines

    if not func_insertions:
        return False, 0, []

    # Reconstruct the file
    new_lines = []
    details = []
    i = 1  # 1-based line counter
    while i <= len(lines):
        if i in lines_to_remove:
            # Skip this line (removed top-level import)
            i += 1
            continue

        if i in func_insertions:
            # Insert lazy imports before the first line of the function body
            for insert_line in func_insertions[i]:
                new_lines.append(insert_line)
            details.append(f"  inserted {len(func_insertions[i])} import(s) at line {i}")

        new_lines.append(lines[i - 1])
        i += 1

    # Clean up: remove consecutive blank lines left by removed imports
    cleaned = []
    prev_blank = False
    for line in new_lines:
        is_blank = line.strip() == ""
        if is_blank and prev_blank:
            continue
        cleaned.append(line)
        prev_blank = is_blank

    new_content = "\n".join(cleaned)

    moved_count = len(movable_lines)
    details.insert(0, f"  moved {moved_count} import(s) into {len(func_insertions)} function(s)")

    if not DRY_RUN:
        with open(filepath, "w") as f:
            f.write(new_content)

    return True, moved_count, details


def main():
    print(f"{'DRY RUN' if DRY_RUN else 'APPLYING'}: lazy import transformation\n")

    atom_files = sorted(glob.glob(f"{BASE}/sciona-atoms*/src/sciona/atoms/**/atoms.py", recursive=True))

    total_changed = 0
    total_moved = 0

    for filepath in atom_files:
        short = filepath.replace(BASE + "/", "")
        changed, moved, details = transform_file(filepath)
        if changed:
            total_changed += 1
            total_moved += moved
            print(f"{short}")
            for d in details:
                print(d)

    print(f"\n{'─' * 60}")
    print(f"SUMMARY: {total_moved} imports moved in {total_changed} files")
    if DRY_RUN:
        print("Dry run — no files modified. Run with --apply to execute.")


if __name__ == "__main__":
    main()
