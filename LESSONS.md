# Lessons (Coverflow project)

## 1) Encoding is a product feature
- Force UTF‑8 at boundaries (exports, file writes, JSON, network).
- Don’t treat “weird strings” as cosmetic: it’s data corruption.
- In AppleScript exports, explicitly write as UTF‑8 (e.g., `write … as «class utf8»`).

## 2) Test target browsers early (Safari is different)
- CSS 3D transforms can behave differently across engines/compositors.
- Safari often needs `-webkit-` prefixed properties for:
  - `perspective`, `transform-style: preserve-3d`, `backface-visibility`, `mask-image`
- Validate on Safari before calling the UI “done”.

## 3) DOM churn kills transitions
- If you recreate DOM nodes on every selection change, CSS transitions can’t interpolate → snapping.
- Build cards once per dataset/filter change; update `transform/opacity/z-index` only.
- Batch visual updates with `requestAnimationFrame`.

## 4) Ship assets as files, not base64 blobs
- Base64 in JSON is convenient but bloats payloads and wastes tokens.
- Use `/resources` folder with real images (cached by browser/CDN).
- If needed, use external cover art sources and download/pin a copy.

## 5) Iterate in tight loops
- Ship → observe → isolate root cause → patch → redeploy.
- Keep changes small and reversible; let the feedback drive the next increment.
