import json
import subprocess
from pathlib import Path

root = Path("files")
items = []

for path in sorted(root.rglob("*")):
    if not path.is_file() or path.name == ".gitkeep":
        continue
    rel = path.relative_to(root).as_posix()
    date = subprocess.check_output(
        ["git", "log", "-1", "--format=%cs", "--", path.as_posix()],
        text=True,
    ).strip()
    items.append({"name": rel, "bytes": path.stat().st_size, "date": date})

Path("files.json").write_text(
    json.dumps(items, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
