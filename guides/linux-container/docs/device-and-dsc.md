<!--
Copyright (C) 2026 AstroPC (astroskyoffical)
SPDX-License-Identifier: GPL-3.0-only
Original project contributions only; see LICENSE-SCOPE.md. Third-party material retains its own terms.
-->
# Device, DisplayPort and DSC module

## What and why

The recorded host is a rooted NX809J / RedMagic, Android 16 (API 36), AArch64, kernel `6.12.23-android16-OP-WILD`. The PSVR2 display path uses a production `psvr2_dsc.ko` kernel module and device-specific DisplayPort configuration. A container shares this kernel.

## Installation evidence and gate

The existing module is **194,592 bytes**, SHA-256:

```text
6480f47d83f20b65a9f14ad052f54645ca1b14e5810247595174b3cb93d2c54f
```

It is preserved at `/data/adb/modules/psvr2_dsc/psvr2_dsc.ko`. The saved configuration reports enabled, `bpp=10`, `slice_height=120`, and a service targeting 4000×2040 at 120 Hz with conditional EDID/HPD handling. These identify the saved arrangement; they are not a compatibility guarantee for another kernel or phone.

**The matching production source and build configuration remain unrecovered. The module is not distributed.** The separate experimental `psvr2_dsc10.c` cannot substitute for its corresponding source. A filename, successful module load or `MODULE_LICENSE` field cannot establish matching source or portability. See the [kernel's licensing rules](https://www.kernel.org/doc/html/latest/process/license-rules.html).

There is no approved fresh-install command until matching source/build/notices and the device ABI are recovered. Do not flash, replace firmware or try arbitrary `.ko` files to complete this guide.

## Verify

Match the host model, kernel release and saved module digest before a controlled test. Separately verify physical DisplayPort enumeration, the advertised/selected mode, USB enumeration, and runtime presentation. A loaded module does not establish USB tracking or wearer comfort.

## Restore

The session `off` path returns the external output to Android; it does not uninstall the boot module. Retain the original module and configuration for recovery through the existing module manager's supported route. No kernel, module, firmware or security change was made during release review.

## Retained startup configuration

The saved production `service.sh` contains this loading line:

```sh
insmod ${0%/*}/psvr2_dsc.ko enable=1
```

This records the existing module's startup behavior, not a fresh-install instruction. `${0%/*}` is the directory containing the script, so it loads the adjacent module. The script checks Sony's `4dd9` display-identification bytes. If the mode is absent, it exposes `4000 2040 120 0` through `edid_modes` and cycles HPD, the connection-detection signal.

The recovered 12 October baseline retains `service.sh`, `module.prop` and `psvr2_dsc.ko`. Loaded snapshots identify NX809J, ARM64 and kernel `6.12.23-android16-OP-WILD`. The module targets Qualcomm's `msm_drm` path and references `register_kretprobe` and `sde_dsc_populate_dsc_config`, consistent with a compression-setup hook. Matching production C source and the first successful run's log remain unrecovered; the distribution gate above remains in force.
