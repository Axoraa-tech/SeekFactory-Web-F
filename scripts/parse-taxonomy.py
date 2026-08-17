import json
import re
from pathlib import Path

import openpyxl

EXCEL = Path(r"c:\Users\abhinav\Downloads\SEEKFACTORY MACHINERY EQUIPMENT PRODUCT LIST NAMES.xlsx")
OUT = Path(__file__).resolve().parents[1] / "src" / "shared" / "mocks" / "machinery-taxonomy.ts"

ICON_MAP = {
    "agriculture": "agriculture",
    "aircraft-and-ground-support-equipment": "aircraft",
    "boats-and-marine-equipment": "marine",
    "construction": "construction",
    "energy": "energy",
    "food-and-beverage-processing": "food",
    "forestry": "forestry",
    "industrial-automation": "automation",
    "machine-tools": "machine-tools",
    "material-handling": "material-handling",
    "oil-gas-and-mining": "mining",
    "printing": "printing",
    "processing": "processing",
    "semiconductors": "semiconductors",
    "test-lab-medical-equipment": "medical",
    "textile-and-leather-manufacturing": "textile",
    "transportation-and-trailers": "transport",
    "waste-and-recycling": "waste",
    "woodworking": "woodworking",
    "other": "other",
}


def slugify(name: str) -> str:
    s = name.lower().replace("&", "and")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-{2,}", "-", s).strip("-")


def parse_count(text: str) -> tuple[int | None, str]:
    match = re.search(r"\(([0-9,]+)\s*(Listings)?\)\s*$", text, re.I)
    if not match:
        return None, text
    count = int(match.group(1).replace(",", ""))
    name = re.sub(r"\s*\(([0-9,]+)\s*(Listings)?\)\s*$", "", text, flags=re.I).strip()
    return count, name


def unique_slug(base: str, used: set[str]) -> str:
    slug = base
    i = 2
    while slug in used:
        slug = f"{base}-{i}"
        i += 1
    used.add(slug)
    return slug


def main() -> None:
    wb = openpyxl.load_workbook(EXCEL, data_only=True)
    ws = wb["Sheet2"]
    used: set[str] = set()
    roots: list[dict] = []
    children: list[dict] = []
    current: dict | None = None

    for row in ws.iter_rows(values_only=True):
        raw = next((cell for cell in row if cell is not None and str(cell).strip()), None)
        if raw is None:
            continue
        text = str(raw).replace("\xa0", " ").replace("\u200b", "").strip()
        if not text or text.lower().startswith("view all"):
            continue
        count, name = parse_count(text)
        if count is None:
            continue
        is_root = bool(re.search(r"listings", text, re.I))
        slug = unique_slug(slugify(name), used)
        if is_root:
            icon = ICON_MAP.get(slug, "other")
            current = {
                "id": f"cat-{slug}",
                "slug": slug,
                "name": name,
                "listingCount": count,
                "parentId": None,
                "icon": icon,
            }
            roots.append(current)
        elif current:
            children.append(
                {
                    "id": f"cat-{slug}",
                    "slug": slug,
                    "name": name,
                    "listingCount": count,
                    "parentId": current["id"],
                    "icon": current["icon"],
                }
            )

    items = roots + children
    lines = [
        'import type { Category } from "@/entities/category";',
        "",
        "/** SeekFactory machinery taxonomy from client Excel Sheet2. Frozen listing counts. */",
        "export const categories: Category[] = [",
    ]
    for item in items:
        parent = "null" if item["parentId"] is None else json.dumps(item["parentId"])
        lines.append(
            "  { "
            f"id: {json.dumps(item['id'])}, "
            f"slug: {json.dumps(item['slug'])}, "
            f"name: {json.dumps(item['name'])}, "
            f"listingCount: {item['listingCount']}, "
            f"parentId: {parent}, "
            f"icon: {json.dumps(item['icon'])} "
            "},"
        )
    lines.extend(
        [
            "];",
            "",
            "export const rootCategories = categories.filter((item) => item.parentId === null);",
            "",
            "export function childrenOf(parentId: string) {",
            "  return categories.filter((item) => item.parentId === parentId);",
            "}",
            "",
        ]
    )
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"roots={len(roots)} children={len(children)} wrote={OUT}")
    for root in roots:
        n = sum(1 for child in children if child["parentId"] == root["id"])
        print(f"  {root['slug']} ({root['listingCount']}) subs={n}")


if __name__ == "__main__":
    main()
