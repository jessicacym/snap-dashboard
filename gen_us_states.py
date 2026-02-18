"""
Generate us-states.js from D3 US Atlas TopoJSON.

Reads the locally downloaded states-albers-10m.json (already projected
in AlbersUSA), parses TopoJSON manually (no external libs), and outputs
SVG path data for all 50 US states + DC.
"""

import json
import sys
import os

# FIPS code -> 2-letter abbreviation
FIPS_TO_ABBR = {
    "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA",
    "08": "CO", "09": "CT", "10": "DE", "11": "DC", "12": "FL",
    "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN",
    "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME",
    "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS",
    "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
    "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
    "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
    "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT",
    "50": "VT", "51": "VA", "53": "WA", "54": "WV", "55": "WI",
    "56": "WY",
}


def decode_arcs(topo):
    """
    Decode all arcs from the TopoJSON.
    Arcs are delta-encoded; if a quantization transform exists,
    apply scale and translate.
    """
    raw_arcs = topo["arcs"]
    transform = topo.get("transform")

    decoded = []
    for arc in raw_arcs:
        coords = []
        x, y = 0, 0
        for dx, dy in arc:
            x += dx
            y += dy
            if transform:
                sx, sy = transform["scale"]
                tx, ty = transform["translate"]
                coords.append((x * sx + tx, y * sy + ty))
            else:
                coords.append((x, y))
        decoded.append(coords)
    return decoded


def resolve_ring(arc_indices, decoded_arcs):
    """
    Resolve a ring (list of arc indices) into a coordinate list.
    Negative index ~i means arc i reversed.
    """
    coords = []
    for idx in arc_indices:
        if idx >= 0:
            arc_coords = decoded_arcs[idx]
        else:
            # ~idx gives the actual arc index; reverse the coordinates
            arc_coords = list(reversed(decoded_arcs[~idx]))

        # Avoid duplicate join points: skip the first point if it
        # duplicates the last point already in coords
        if coords and arc_coords:
            start = 1 if arc_coords[0] == coords[-1] else 0
            coords.extend(arc_coords[start:])
        else:
            coords.extend(arc_coords)
    return coords


def coords_to_svg_path(rings):
    """
    Convert a list of rings (polygon) to an SVG path string.
    Each ring is a list of (x, y) tuples.
    """
    parts = []
    for ring in rings:
        if not ring:
            continue
        cmds = []
        for i, (x, y) in enumerate(ring):
            xr = round(x, 1)
            yr = round(y, 1)
            if i == 0:
                cmds.append(f"M{xr},{yr}")
            else:
                cmds.append(f"L{xr},{yr}")
        cmds.append("Z")
        parts.append("".join(cmds))
    return "".join(parts)


def geometry_to_svg(geom, decoded_arcs):
    """
    Convert a TopoJSON geometry object to an SVG path d string.
    Handles Polygon and MultiPolygon types.
    """
    gtype = geom["type"]

    if gtype == "Polygon":
        rings = [resolve_ring(ring_indices, decoded_arcs)
                 for ring_indices in geom["arcs"]]
        return coords_to_svg_path(rings)

    elif gtype == "MultiPolygon":
        all_parts = []
        for polygon_arcs in geom["arcs"]:
            rings = [resolve_ring(ring_indices, decoded_arcs)
                     for ring_indices in polygon_arcs]
            all_parts.append(coords_to_svg_path(rings))
        return "".join(all_parts)

    else:
        print(f"  Warning: unsupported geometry type '{gtype}'", file=sys.stderr)
        return ""


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, "states-albers-10m.json")
    output_path = os.path.join(script_dir, "us-states.js")

    print(f"Reading {input_path} ...")
    with open(input_path, "r", encoding="utf-8") as f:
        topo = json.load(f)
    print("Loaded TopoJSON.")

    decoded_arcs = decode_arcs(topo)
    print(f"Decoded {len(decoded_arcs)} arcs.")

    states_obj = topo["objects"]["states"]
    geometries = states_obj["geometries"]
    print(f"Found {len(geometries)} state geometries.")

    state_paths = {}
    unmapped = []

    for geom in geometries:
        fips = geom.get("id") or geom.get("properties", {}).get("STATEFP")
        if fips is None:
            print(f"  Warning: geometry with no id: {geom.get('properties')}", file=sys.stderr)
            continue

        fips_str = str(fips).zfill(2)
        abbr = FIPS_TO_ABBR.get(fips_str)

        if abbr is None:
            unmapped.append(fips_str)
            continue

        svg_path = geometry_to_svg(geom, decoded_arcs)
        if svg_path:
            state_paths[abbr] = svg_path

    if unmapped:
        print(f"  Unmapped FIPS codes (territories, etc.): {unmapped}")

    print(f"Generated SVG paths for {len(state_paths)} states/DC.")

    expected = set(FIPS_TO_ABBR.values())
    missing = expected - set(state_paths.keys())
    if missing:
        print(f"  WARNING: Missing states: {sorted(missing)}", file=sys.stderr)

    sorted_abbrs = sorted(state_paths.keys())

    lines = []
    lines.append('/* US States SVG paths - AlbersUSA projection (viewBox: 0 0 960 600) */')
    lines.append('// eslint-disable-next-line no-unused-vars')
    lines.append('const US_STATES = {')
    for i, abbr in enumerate(sorted_abbrs):
        path = state_paths[abbr]
        comma = "," if i < len(sorted_abbrs) - 1 else ""
        lines.append(f'  {abbr}: "{path}"{comma}')
    lines.append('};')
    lines.append('')

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    file_size = os.path.getsize(output_path)
    print(f"Wrote {output_path} ({len(sorted_abbrs)} entries, {file_size:,} bytes).")


if __name__ == "__main__":
    main()
