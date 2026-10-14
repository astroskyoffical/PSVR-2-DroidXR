# Paths and account configuration

This documentation preview uses `${VARIABLE}` to represent installation-specific paths. JSON stores these as literal templates; it does not expand environment variables. File hashes still identify the recovered artifacts. Original engineering paths remain in private evidence.

Resolve values from your installed Droidspaces configuration and the relevant Linux account. These names are public documentation conventions, not a claim that the historical scripts or broker already implement them. No generic installer or live path migration is supplied.

| Variable | Where to obtain it | Path context |
|---|---|---|
| `CONTAINER_NAME` | Selected container name in Droidspaces | Android host |
| `CONTAINER_ROOTFS` | That container's actual rootfs location in the manager configuration | Android host |
| `DROIDSPACES_BIN` | Installed Droidspaces backend executable | Android host |
| `CONTAINER_ENV` | Environment-file path selected by that container configuration | Android host |
| `DESKTOP_INIT` | Custom init helper selected by that container configuration | Inside the container |
| `SESSION_SCRIPTS` | Directory containing the installed `psvr2-c.sh`, `psvr2-monado.sh` and lease client | Inside the container |
| `LINUX_HOME` | Home of the Linux desktop/app account; read `$HOME` while logged in as that account, or its passwd entry | Inside the container |
| `VR_FILES` | Configured base directory for custom graphics and compatibility files | Inside the container |
| `XR_PREFIX` | Installation prefix containing the selected Monado `bin`, `lib` and `share` directories | Inside the container |
| `SERVICE_HOME` | Home of the runtime service account from its passwd entry; root in the recorded recipe | Inside the container |
| `XDG_RUNTIME_DIR` | Existing runtime directory for the Linux desktop/app account | Inside the container |

Read `$HOME` and `id -u` in the intended Linux desktop account, not in an Android root shell. If its session already defines `XDG_RUNTIME_DIR`, use that existing value. Otherwise the standard `/run/user/<UID>` layout is only a candidate: confirm the directory exists and belongs to that account. Do not assume a numeric UID, create it with guessed ownership or share another account's session directory. Keep the runtime service's home separate from the desktop account's home.

Container names are labels. Inspect `/usr/lib/os-release` (or `/etc/os-release`) inside the selected container to identify the distribution; its name does not identify its operating system. The recorded distribution is Ubuntu 26.04 LTS ARM64. A different image or folder layout is not a tested equivalent.

If Droidspaces uses its recorded default storage layout, a rootfs may be under `/data/local/Droidspaces/Containers/${CONTAINER_NAME}/rootfs`. Obtain the actual path from configuration instead of deriving it blindly. Likewise, the backend was installed under `/data/local/Droidspaces/bin/`; this is an Android application/backend location, not a personal home path.

Paths cross a namespace boundary: Android uses `CONTAINER_ROOTFS` to locate files from outside the container; Linux commands use their paths inside it. Do not prepend the host rootfs to a path already being passed to a command running inside the container.

## Paths that retain their technical meaning

- `/data/adb/modules/psvr2_dsc/psvr2_dsc.ko` identifies the recorded KernelSU module layout. It is not a username placeholder.
- `/data/local/tmp/psvr2/psvr2.sh` identifies the recovered Android host-script staging layout. Confirm that exact reviewed helper is installed before using its documented interface.
- `/dev/dri/card0` and `/dev/dri/renderD128` are recorded DRM device nodes. Their numbers are device-specific; discover the actual connector/device rather than substituting a username.
- The lease socket `/var/tmp/psvr2-lease.sock` is a protocol endpoint inside the container, not a private network address. The host broker must resolve it relative to the correct rootfs.
- `com.anland.linkdoctor.next` is the installed Android package identity. Public path cleanup does not rename its package, change signing identity or rebrand third-party apps.

The recovered broker embeds a rootfs path, and the launchers contain account/path assumptions. Changing this documentation does not patch those binaries. A portable release needs those values implemented as explicit configuration and tested across start, stop and restoration before claiming another layout works.
