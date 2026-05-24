## Goal

Eliminate the dead-scroll gaps between panels and make sure every panel's RTL text sits opposite its logo with a clean, monotonic rotation arc.

## Issues found

1. **Scroll gaps between panels.** `STOPS = [0, 0.14, 0.24, 0.42, 0.50, 0.68, 0.78, 1]` leaves 8–10% of scroll between each pair of holds. During those windows the previous text is gone, the next hasn't faded in yet, and the logo is still mid-rotation — looks like empty scroll.
2. **Text fade ranges spill into hold windows.** Each panel's `fadeIn/fadeOut` extends ±0.05 past its hold, which overlaps the next panel's hold and causes a brief stacking/flash.
3. **RTL alignment of Panel 3.** Logo `logoX = "-26%"` moves it to the viewport's left, and text uses `right-[2.5vw] text-right`. That is the correct mirror for the other panels, but worth re-verifying against the live preview.
4. **Rotation deltas are uneven.** Current jumps: 0.55π → 0.55π → 0.65π. Small, but the last leg is noticeably faster. Should be equal increments so the spin reads as one continuous turn.

## Plan

### 1. Remove scroll gaps
Switch from "hold–gap–hold" to **adjacent holds**: each panel owns 25% of scroll and the transition happens at the boundary. New stops:

```
panel 1 hold: 0.00 → 0.22
transition:   0.22 → 0.28
panel 2 hold: 0.28 → 0.47
transition:   0.47 → 0.53
panel 3 hold: 0.53 → 0.72
transition:   0.72 → 0.78
panel 4 hold: 0.78 → 1.00
```

Transitions shrink from ~10% to 6% so movement feels deliberate but never empty.

### 2. Tighten text fades to the transition window
Each panel's text fades **inside its own transition band**, not past it:
- fadeIn = transition start of incoming panel
- fadeOut = transition end of outgoing panel

No overlap, no stacking flash.

### 3. Even rotation arc
Replace the current rotations with equal 0.6π increments so the logo turns at a constant rate across the four panels:

```
Panel 1: FRONT
Panel 2: FRONT + 0.60π
Panel 3: FRONT + 1.20π
Panel 4: FRONT + 1.80π
```

Total ~1 full turn across the whole scroll, no sudden jumps. The existing exponential smoothing in `useFrame` keeps it visually buttery.

### 4. RTL verification pass
After the edit, screenshot each of the 4 panel hold positions and confirm:
- Panel 1: logo right, text left ✓ expected
- Panel 2: logo right, text left ✓ expected
- Panel 3: logo left, text right ✓ expected
- Panel 4: logo right, text left ✓ expected

Fix any mismatch by flipping `logoX` sign or swapping `left-[2.5vw]` / `right-[2.5vw]` on that panel.

## Scope

Single file: `src/components/EtqanHero3D.tsx`. No other components, no new dependencies, no design-token changes. Spring tuning from the previous step stays as is.
