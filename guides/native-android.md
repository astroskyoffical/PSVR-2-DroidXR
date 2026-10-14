<!-- Copyright (C) 2026 AstroPC (astroskyoffical)
SPDX-License-Identifier: GPL-3.0-only -->
# Native Android progress

The native Android route has reached an image and head-follow in PSVR2. AstroPC confirmed this while wearing the headset at 03:40 UTC on 14 October 2026. Frame pacing and stability are in development, followed by integration and qualification of controller input, gaze calibration, room setup, recovery and repeatable start/stop.

This route talks to the headset through Android's USB, graphics and application interfaces. The working Linux-container Skyrim route remains the separate baseline for the game, eye tracking, DXVK foveation and SGSR2 results.

## Retained test sequence

| Test | Full pose records | Result |
|---|---|---|
| Earlier native V2, unworn | 557 / 666 accepted | Two-view projection screenshot. VALID set; TRACKED clear. |
| Earlier native, worn, 45 seconds | 0 / 1,755 accepted | Black output; all complete pose packets rejected. |
| 14 October, 03:40 UTC, worn | New packet counts not retained here | Image and head-follow confirmed by AstroPC; updates arrived unevenly. |

The first two counts come from the supplied test summary. [OpenXR distinguishes valid data from actively tracked data](https://registry.khronos.org/OpenXR/specs/1.1/man/html/XrSpaceLocationFlagBits.html). The later worn result is a new milestone rather than a reinterpretation of the failed earlier run. The site displays saved records, not live headset telemetry.
