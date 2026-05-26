use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};

use serde::Serialize;
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
        .manage(ProcessState {
            child: Arc::new(Mutex::new(None)),
        })
        .invoke_handler(tauri::generate_handler![
            get_daemon_info,
            run_script,
            stop_script
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
