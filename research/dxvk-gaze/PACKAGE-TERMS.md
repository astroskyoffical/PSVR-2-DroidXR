<!-- Copyright (C) 2026 AstroPC (astroskyoffical)
SPDX-License-Identifier: GPL-3.0-only -->
# Source-package license scope and credit

AstroPC (astroskyoffical) offers GPL-3.0-only for the original project-authored changes in patches `0001`, `0002` and `0003`, the original template text in the two `.env.example` files, and the original portions of `README.md`, `TECHNICAL-REFERENCE.md`, both SVG files in `diagrams/`, and this document. The full, unmodified GPLv3 text is in [LICENSE-GPL-3.0.txt](LICENSE-GPL-3.0.txt). Commercial use is allowed under its terms. The repository's [scope](https://github.com/astroskyoffical/PSVR-2-DroidXR/blob/main/LICENSE-SCOPE.md) records the same boundary.

The patches are plainly marked local alterations to DXVK, not upstream DXVK support. They retain unchanged upstream context under the DXVK zlib/libpng terms in the verbatim [LICENSE-DXVK.txt](LICENSE-DXVK.txt). This grant does not relicense DXVK's unchanged code or dependencies. Preserve both applicable notices and terms in a covered distribution. Identity hashes, component names and recorded configuration values are metadata, not an invention or ownership claim.

AstroPC's work is the local integration, gaze transport, injection and configuration. Credit remains with the DXVK authors named in its notice, Monado, Mesa/Turnip, Khronos Vulkan/OpenXR, Qualcomm SGSR2 and AMD FSR/RCAS. Their algorithms and components retain their own licenses. No Sony/Valve/game code, runtime binary, PDB, signing key or private log is included.

Patches 0001 and 0002 are the recovered original changes. Patch 0003 is newly authored diagnostic instrumentation and is not part of the phone-tested DLLs; it passed syntax checking only. This source package is not a complete headset installer or a newly qualified binary distribution.
