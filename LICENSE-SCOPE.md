<!--
Copyright (C) 2026 AstroPC (astroskyoffical)
SPDX-License-Identifier: GPL-3.0-only
Original project contributions only; see LICENSE-SCOPE.md. Third-party material retains its own terms.
-->
# Scope of GPL-3.0-only

AstroPC (astroskyoffical) offers **GNU General Public License version 3 only**, in the unmodified [LICENSE](LICENSE), for the original standalone software and original documentation portions identified here:

| File | Covered original software |
|---|---|
| `.github/workflows/pages.yml` | Original site build and deployment workflow; referenced Actions retain their own licenses |
| `docs/app.mjs` | Original site interactions, sound coordination and visual effects |
| `docs/visual-data.mjs` | Original cue normalization and timing helpers |
| `docs/visual-data.test.mjs` | Original helper tests |
| `docs/styles.css` | Original site styling and animations |
| `docs/index.html` | Original HTML markup, original inline SVG emblem and original page prose |

The grant also covers the original project-authored portions of these documentation files:

- `README.md`
- `LICENSE-SCOPE.md`
- `NOTICE`
- `guides/foveated-rendering.md`
- `guides/linux-container/docs/device-and-dsc.md`
- `guides/linux-container/docs/drm-leasing.md`
- `guides/linux-container/docs/droidspaces.md`
- `guides/linux-container/docs/flow.svg`
- `guides/linux-container/docs/licenses-and-provenance.md`
- `guides/linux-container/docs/linkdoctor-and-launchers.md`
- `guides/linux-container/docs/mesa.md`
- `guides/linux-container/docs/monado-and-input.md`
- `guides/linux-container/docs/optional-test-apps.md`
- `guides/linux-container/docs/paths-and-configuration.md`
- `guides/linux-container/docs/verify-and-restore.md`

These modules use native browser APIs, other listed original modules, and Node built-ins for tests. No third-party runtime is linked into this scoped site software. Third-party or attributed quotations (including the attributed iVRy acknowledgment), cited material, upstream code excerpts, trademarks, cue/component identity metadata, and all audio, video, photographs and other media are outside this grant. The original `flow.svg` diagram and inline emblem are expressly included above. Future original files need an explicit scope entry and compatibility review.

This is not a blanket relicensing of a VR stack. Mesa, Monado, Droidspaces, Wine, compatibility bridges, third-party apps, Linux and kernel-derived code retain their actual licenses and notices. Kernel GPLv2 obligations are not replaced by this GPLv3 grant. Proprietary Sony/Valve files remain external user-obtained prerequisites where applicable, not GPL-covered components. No Sony DLL is included in the published Mesa release. Hardware CAD, PCB designs and manufacturing files are outside this scope and need a separate license decision if released.

Copyright notices and applicable license terms must be preserved as required by GPL-3.0-only or the relevant upstream license. [NOTICE](NOTICE) records AstroPC's hardware/Android/display integration and glue work, iVRy's DSC research credit, and upstream attribution. It adds no advertising-credit condition. Contributors retain their copyright; no assignment is implied. Contributions must be compatible with the license of the affected file and retain required third-party notices.

Commercial use is allowed under GPL-3.0-only. Distribution of covered software must satisfy its applicable source and license obligations. Earlier licenses and grants remain effective on their own terms; this change does not retroactively revoke them. The older Mesa component release retains its own component terms and is not relicensed by the repository's new original-software license.

DroidXR is an independent community project, not affiliated with, sponsored by or endorsed by Sony Interactive Entertainment, Meta, Valve or other referenced platform vendors. Trademarks belong to their owners. This license does not certify third-party rights, guarantee legal immunity or claim finished hardware production.

Optional donations and possible PCB group buys are separate matters; this document does not settle their terms or license future hardware.
