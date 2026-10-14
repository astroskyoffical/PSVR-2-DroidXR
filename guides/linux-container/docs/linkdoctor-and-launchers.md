# LinkDoctor and launch scripts

## What and why

LinkDoctor is the Android controller app for the existing container/display setup. The PSVR2 host and container scripts perform the actual Linux session, display handoff and runtime launch. A successful app status screen does not prove the headset is presenting useful tracked frames.

## Installation evidence

The installed APK is `com.anland.linkdoctor.next`, **1.0.0-preview / code 100**, minimum SDK 29, target SDK 35. Its SHA-256 is:

```text
d9d12d6dd3e2e55ad50eb98d2437a7ab9e32da132756ad340e6427c90a6338a9
```

Existing Android `apksigner` verification succeeded with a v3 signature. The certificate SHA-256 is `c3f3583cf6b17af79949282d33d95c4b229cd168452b1630cae4701b0cf51acc`.

The local build has a different APK hash and different `classes.dex`. The three installed helper assets match current saved source, but that does not establish a full source match. An APK download is withheld pending original-source/build and license recovery.

The recovered PSVR2 arrangement is:

| Location | Role |
|---|---|
| `/data/local/tmp/psvr2/psvr2.sh` | Android-root host entry point |
| `${SESSION_SCRIPTS}/psvr2-c.sh` | Container nodes, headless desktop, apps and user environment |
| `${SESSION_SCRIPTS}/psvr2-monado.sh` | Compositor ICD, runtime/driver environment and lease client |
| `psvr2-lease` | Static AArch64 Linux broker/client used on host and in container |

Resolve `${SESSION_SCRIPTS}` using the installed container configuration; see [paths and accounts](paths-and-configuration.md). This is not a claimed new environment option in the historical scripts. Exact preserved script hashes are in [the manifest](../manifest.json). Host and container copies of similarly named build/helpers can differ; do not substitute one based on its filename.

The existing `on` sequence cleans up its previous processes, starts Droidspaces if necessary, copies its fixed scripts into the container, starts a headless Linux desktop, disables the selected Android external logical display, starts the host lease broker, launches Monado through the lease client, then starts WayVR. A private saved play area is reapplied. See [DRM leasing](drm-leasing.md) for the display authority path.

## Verify

Use [the provisioned-baseline checks](verify-and-restore.md), including matching hashes, correct ICD/runtime selection, hardware rendering, a usable pose and a scene through the headset. No scripts or binaries were run during release review.

## Restore and release limits

The historical launcher also changes RedMagic performance/fan settings, denies the GameAssist overlay app-op, stops processes and recreates permissive device nodes. Its `off` path restores the display and fan, but does **not** restore every setting; the overlay app-op denial persists. These actions are documented as historical behavior, not offered as a portable installer or a new permission recipe.

The scripts and app need explicit license/notice and matching-source resolution before distribution. This package does not redistribute or execute them. A future public launcher must document its complete restore behavior and retain this known device/kernel boundary.
