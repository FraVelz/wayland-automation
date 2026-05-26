use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, State};

const YDOTOOL_SOCKET: &str = "/tmp/.ydotool_socket";
const SERVICE_NAME: &str = "ydotoold.service";

struct ProcessState {
    child: Arc<Mutex<Option<Child>>>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "snake_case")]
struct ScriptOutputPayload {
    line: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "snake_case")]
struct ScriptFinishedPayload {
    code: i32,
    status: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "snake_case")]
struct DaemonInfo {
    running: bool,
    socket: String,
    pid: String,
    input_group: bool,
    autostart: String,
    service_state: String,
    uinput: String,
    status_text: String,
    ready_for_mouse: bool,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "snake_case")]
struct CursorColor {
    hex: String,
    rgb: String,
    css_rgb: String,
    hsl: String,
    r: u8,
    g: u8,
    b: u8,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "snake_case")]
struct CursorPosition {
    x: i32,
    y: i32,
    color: Option<CursorColor>,
    color_error: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
enum MacroStep {
    Delay { ms: u64 },
    MoveAbsolute { x: i32, y: i32 },
    MoveRelative { dx: i32, dy: i32 },
    Click { button: String },
}

fn require_ydotoold_running() -> Result<(), String> {
    if !Path::new(YDOTOOL_SOCKET).exists() {
        return Err("ydotoold no está activo. Inicia el daemon desde la pestaña Daemon.".into());
    }
    if !in_input_group() {
        return Err("No perteneces al grupo input. Ejecuta scripts/setup.sh y cierra sesión.".into());
    }
    if uinput_access() != "Accesible" {
        return Err(format!(
            "/dev/uinput: {}. Revisa permisos con scripts/setup.sh.",
            uinput_access()
        ));
    }
    Ok(())
}

fn ydotool(args: &[&str]) -> Result<(), String> {
    let output = Command::new("ydotool")
        .args(args)
        .env("YDOTOOL_SOCKET", YDOTOOL_SOCKET)
        .output()
        .map_err(|e| format!("No se pudo ejecutar ydotool: {e}"))?;
    if output.status.success() {
        return Ok(());
    }
    let stderr = String::from_utf8_lossy(&output.stderr);
    Err(if stderr.trim().is_empty() {
        format!("ydotool falló: {}", args.join(" "))
    } else {
        stderr.trim().to_string()
    })
}

fn click_code(button: &str) -> Result<&'static str, String> {
    match button {
        "left" => Ok("0xC0"),
        "right" => Ok("0xC1"),
        "middle" => Ok("0xC2"),
        _ => Err(format!("Botón de clic desconocido: {button}")),
    }
}

fn run_macro_steps(steps: &[MacroStep]) -> Result<(), String> {
    require_ydotoold_running()?;
    if steps.is_empty() {
        return Err("La macro no tiene pasos.".into());
    }
    for step in steps {
        match step {
            MacroStep::Delay { ms } => {
                if *ms > 0 {
                    std::thread::sleep(std::time::Duration::from_millis(*ms));
                }
            }
            MacroStep::MoveAbsolute { x, y } => {
                ydotool(&[
                    "mousemove",
                    "--absolute",
                    &x.to_string(),
                    &y.to_string(),
                ])?;
            }
            MacroStep::MoveRelative { dx, dy } => {
                ydotool(&["mousemove", &dx.to_string(), &dy.to_string()])?;
            }
            MacroStep::Click { button } => {
                let code = click_code(button)?;
                ydotool(&["click", code])?;
            }
        }
    }
    Ok(())
}

fn project_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("project root")
        .to_path_buf()
}

fn scripts_dir() -> PathBuf {
    project_dir().join("scripts")
}

fn home_dir() -> PathBuf {
    std::env::var_os("HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("/"))
}

fn find_wl_find_cursor() -> Result<PathBuf, String> {
    if let Ok(path) = std::process::Command::new("sh")
        .arg("-c")
        .arg("command -v wl-find-cursor")
        .output()
    {
        let stdout = String::from_utf8_lossy(&path.stdout).trim().to_string();
        if !stdout.is_empty() && Path::new(&stdout).is_file() {
            return Ok(PathBuf::from(stdout));
        }
    }
    let local = project_dir().join("bin/wl-find-cursor");
    if local.is_file() {
        return Ok(local);
    }
    Err("wl-find-cursor no encontrado. Ejecuta ./scripts/setup.sh".into())
}

fn script_path(name: &str) -> Result<PathBuf, String> {
    let path = scripts_dir().join(name);
    if !path.is_file() {
        return Err(format!("Script no encontrado: {}", path.display()));
    }
    Ok(path)
}

fn in_input_group() -> bool {
    let Ok(output) = Command::new("id").arg("-nG").output() else {
        return false;
    };
    let groups = String::from_utf8_lossy(&output.stdout);
    groups.split_whitespace().any(|g| g == "input")
}

fn daemon_pid() -> String {
    if !Path::new(YDOTOOL_SOCKET).exists() {
        return "—".into();
    }
    let Ok(output) = Command::new("lsof").arg("-t").arg(YDOTOOL_SOCKET).output() else {
        return "—".into();
    };
    let stdout = String::from_utf8_lossy(&output.stdout);
    stdout
        .lines()
        .next()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "—".into())
}

fn user_unit() -> PathBuf {
    home_dir().join(".config/systemd/user/ydotoold.service")
}

fn systemd_user_state(cmd: &str) -> String {
    if !user_unit().is_file() {
        return "No instalado".into();
    }
    let Ok(output) = Command::new("systemctl")
        .args(["--user", cmd, SERVICE_NAME])
        .output()
    else {
        return "Desconocido".into();
    };
    let state = String::from_utf8_lossy(&output.stdout).trim().to_string();
    match cmd {
        "is-enabled" => match state.as_str() {
            "enabled" => "Habilitado".into(),
            "disabled" | "static" | "masked" => "Deshabilitado".into(),
            _ => if state.is_empty() { "Desconocido".into() } else { state },
        },
        "is-active" => match state.as_str() {
            "active" => "Activo".into(),
            "inactive" => "Inactivo".into(),
            "failed" => "Fallido".into(),
            "activating" => "Iniciando".into(),
            "deactivating" => "Deteniendo".into(),
            _ => if state.is_empty() { "Desconocido".into() } else { state },
        },
        _ => state,
    }
}

fn uinput_access() -> String {
    let path = Path::new("/dev/uinput");
    if !path.exists() {
        return "No existe".into();
    }
    match std::fs::OpenOptions::new().read(true).write(true).open(path) {
        Ok(_) => "Accesible".into(),
        Err(_) => "Sin permisos".into(),
    }
}

fn parse_rgb_pixel(raw: &str) -> Option<(u8, u8, u8)> {
    let start = raw.find('(')? + 1;
    let end = raw.find(')')?;
    let mut parts = raw[start..end].split(',').map(str::trim);
    let r: u8 = parts.next()?.parse().ok()?;
    let g: u8 = parts.next()?.parse().ok()?;
    let b: u8 = parts.next()?.parse().ok()?;
    Some((r, g, b))
}

fn rgb_to_hsl(r: u8, g: u8, b: u8) -> (u16, u8, u8) {
    let r = r as f64 / 255.0;
    let g = g as f64 / 255.0;
    let b = b as f64 / 255.0;
    let max = r.max(g).max(b);
    let min = r.min(g).min(b);
    let l = (max + min) / 2.0;

    if (max - min).abs() < f64::EPSILON {
        return (0, 0, (l * 100.0).round() as u8);
    }

    let d = max - min;
    let s = if l < 0.5 {
        d / (max + min)
    } else {
        d / (2.0 - max - min)
    };

    let h = if (max - r).abs() < f64::EPSILON {
        ((g - b) / d + if g < b { 6.0 } else { 0.0 }) / 6.0
    } else if (max - g).abs() < f64::EPSILON {
        ((b - r) / d + 2.0) / 6.0
    } else {
        ((r - g) / d + 4.0) / 6.0
    };

    ((h * 360.0).round() as u16, (s * 100.0).round() as u8, (l * 100.0).round() as u8)
}

fn get_pixel_color(x: i32, y: i32) -> Result<CursorColor, String> {
    let tmp = std::env::temp_dir().join(format!("wa-pixel-{}-{}.png", std::process::id(), x));
    let geom = format!("{x},{y} 1x1");

    let grim = Command::new("grim")
        .args(["-g", &geom])
        .arg(&tmp)
        .output()
        .map_err(|e| format!("No se pudo ejecutar grim: {e}"))?;
    if !grim.status.success() {
        let _ = std::fs::remove_file(&tmp);
        let stderr = String::from_utf8_lossy(&grim.stderr);
        return Err(if stderr.trim().is_empty() {
            "grim falló al capturar el píxel".into()
        } else {
            stderr.trim().to_string()
        });
    }

    let tmp_str = tmp.to_string_lossy().into_owned();
    let magick = Command::new("magick")
        .args([
            tmp_str.as_str(),
            "-format",
            "%[hex:u]|%[pixel:p{0,0}]",
            "info:",
        ])
        .output()
        .map_err(|e| format!("No se pudo ejecutar magick: {e}"))?;
    let _ = std::fs::remove_file(&tmp);

    if !magick.status.success() {
        let stderr = String::from_utf8_lossy(&magick.stderr);
        return Err(if stderr.trim().is_empty() {
            "magick falló al leer el píxel".into()
        } else {
            stderr.trim().to_string()
        });
    }

    let text = String::from_utf8_lossy(&magick.stdout);
    let mut parts = text.trim().split('|');
    let hex_raw = parts.next().unwrap_or("").trim();
    let pixel = parts.next().unwrap_or("").trim();
    let (r, g, b) = parse_rgb_pixel(pixel)
        .ok_or_else(|| format!("Formato de color no reconocido: {pixel}"))?;
    let (h, s, l) = rgb_to_hsl(r, g, b);

    Ok(CursorColor {
        hex: format!("#{hex_raw}"),
        rgb: format!("{r}, {g}, {b}"),
        css_rgb: format!("rgb({r}, {g}, {b})"),
        hsl: format!("{h}°, {s}%, {l}%"),
        r,
        g,
        b,
    })
}

#[tauri::command]
fn get_cursor_position() -> Result<CursorPosition, String> {
    if std::env::var_os("WAYLAND_DISPLAY").is_none() {
        return Err("No hay sesión Wayland activa (WAYLAND_DISPLAY vacío).".into());
    }
    let bin = find_wl_find_cursor()?;
    let output = Command::new(&bin)
        .arg("-p")
        .output()
        .map_err(|e| format!("No se pudo ejecutar wl-find-cursor: {e}"))?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(if stderr.is_empty() {
            "wl-find-cursor falló".into()
        } else {
            stderr.trim().to_string()
        });
    }
    let text = String::from_utf8_lossy(&output.stdout);
    let mut parts = text.split_whitespace();
    let x: i32 = parts
        .next()
        .ok_or("Salida vacía de wl-find-cursor")?
        .parse()
        .map_err(|_| format!("Coordenada X inválida: {}", text.trim()))?;
    let y: i32 = parts
        .next()
        .ok_or("Falta coordenada Y")?
        .parse()
        .map_err(|_| format!("Coordenada Y inválida: {}", text.trim()))?;

    let (color, color_error) = match get_pixel_color(x, y) {
        Ok(c) => (Some(c), None),
        Err(e) => (None, Some(e)),
    };

    Ok(CursorPosition {
        x,
        y,
        color,
        color_error,
    })
}

#[tauri::command]
fn get_daemon_info() -> DaemonInfo {
    let running = Path::new(YDOTOOL_SOCKET).exists();
    let input_group = in_input_group();
    let uinput = uinput_access();
    let ready_for_mouse = running && input_group && uinput == "Accesible";
    DaemonInfo {
        running,
        socket: YDOTOOL_SOCKET.into(),
        pid: daemon_pid(),
        input_group,
        autostart: systemd_user_state("is-enabled"),
        service_state: systemd_user_state("is-active"),
        uinput,
        status_text: if running {
            "● Activo".into()
        } else {
            "● Inactivo".into()
        },
        ready_for_mouse,
    }
}

#[tauri::command]
fn run_script(
    app: AppHandle,
    state: State<'_, ProcessState>,
    script: String,
    args: Vec<String>,
) -> Result<(), String> {
    {
        let guard = state.child.lock().map_err(|e| e.to_string())?;
        if guard.is_some() {
            return Err("Ya hay un comando en ejecución.".into());
        }
    }

    let path = script_path(&script)?;
    let mut cmd = Command::new(&path);
    cmd.args(&args)
        .current_dir(project_dir())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let argv_display = format!("▶ {} {}\n", path.display(), args.join(" "));
    let _ = app.emit(
        "script-output",
        ScriptOutputPayload {
            line: argv_display,
        },
    );

    let mut child = cmd.spawn().map_err(|e| format!("No se pudo ejecutar: {e}"))?;

    let stdout = child.stdout.take();
    let stderr = child.stderr.take();
    let app_out = app.clone();
    let app_err = app.clone();

    if let Some(out) = stdout {
        std::thread::spawn(move || {
            let reader = BufReader::new(out);
            for line in reader.lines().map_while(Result::ok) {
                let _ = app_out.emit(
                    "script-output",
                    ScriptOutputPayload {
                        line: format!("{line}\n"),
                    },
                );
            }
        });
    }

    if let Some(err) = stderr {
        std::thread::spawn(move || {
            let reader = BufReader::new(err);
            for line in reader.lines().map_while(Result::ok) {
                let _ = app_err.emit(
                    "script-output",
                    ScriptOutputPayload {
                        line: format!("{line}\n"),
                    },
                );
            }
        });
    }

    {
        let mut guard = state.child.lock().map_err(|e| e.to_string())?;
        *guard = Some(child);
    }

    let app_finish = app.clone();
    let child_arc = Arc::clone(&state.child);
    std::thread::spawn(move || {
        let code = loop {
            let mut guard = match child_arc.lock() {
                Ok(g) => g,
                Err(_) => break -1,
            };
            let Some(ref mut proc) = *guard else {
                break 0;
            };
            match proc.try_wait() {
                Ok(Some(status)) => {
                    *guard = None;
                    break status.code().unwrap_or(1);
                }
                Ok(None) => {
                    drop(guard);
                    std::thread::sleep(std::time::Duration::from_millis(100));
                }
                Err(_) => {
                    *guard = None;
                    break 1;
                }
            }
        };

        let status = if code == 0 { "OK" } else { "error" };
        let _ = app_finish.emit(
            "script-finished",
            ScriptFinishedPayload {
                code,
                status: status.into(),
            },
        );
    });

    Ok(())
}

#[tauri::command]
fn run_macro(steps: Vec<MacroStep>) -> Result<(), String> {
    run_macro_steps(&steps)
}

#[tauri::command]
fn stop_script(state: State<'_, ProcessState>) -> Result<(), String> {
    let mut guard = state.child.lock().map_err(|e| e.to_string())?;
    if let Some(mut child) = guard.take() {
        let _ = child.kill();
        let _ = child.wait();
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(ProcessState {
            child: Arc::new(Mutex::new(None)),
        })
        .invoke_handler(tauri::generate_handler![
            get_cursor_position,
            get_daemon_info,
            run_script,
            run_macro,
            stop_script
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
