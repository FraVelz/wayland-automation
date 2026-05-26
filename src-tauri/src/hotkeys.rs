use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};

use evdev::{Device, EventSummary, KeyCode};
use serde::Deserialize;
use tauri::{AppHandle, Emitter, Runtime};

#[derive(Debug, Clone, Default)]
struct Modifiers {
    ctrl: bool,
    alt: bool,
    shift: bool,
    super_key: bool,
}

#[derive(Debug, Clone)]
struct ParsedHotkey {
    id: String,
    mods: Modifiers,
    key: KeyCode,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct HotkeyBindingCmd {
    pub id: String,
    pub hotkey: String,
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub struct HotkeyPressedPayload {
    pub id: String,
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub struct HotkeyStatusPayload {
    pub active: bool,
    pub device_count: usize,
    pub message: String,
}

pub struct HotkeyListenerState {
    pub bindings: Mutex<Vec<ParsedHotkey>>,
    pub enabled: AtomicBool,
    stop_flag: Mutex<Option<Arc<AtomicBool>>>,
}

impl HotkeyListenerState {
    pub fn new() -> Self {
        Self {
            bindings: Mutex::new(Vec::new()),
            enabled: AtomicBool::new(false),
            stop_flag: Mutex::new(None),
        }
    }
}

fn parse_key_token(token: &str) -> Result<KeyCode, String> {
    let t = token.trim();
    if t.is_empty() {
        return Err("Tecla vacía".into());
    }
    let code = match t.to_uppercase().as_str() {
        "A" => KeyCode::KEY_A,
        "B" => KeyCode::KEY_B,
        "C" => KeyCode::KEY_C,
        "D" => KeyCode::KEY_D,
        "E" => KeyCode::KEY_E,
        "F" => KeyCode::KEY_F,
        "G" => KeyCode::KEY_G,
        "H" => KeyCode::KEY_H,
        "I" => KeyCode::KEY_I,
        "J" => KeyCode::KEY_J,
        "K" => KeyCode::KEY_K,
        "L" => KeyCode::KEY_L,
        "M" => KeyCode::KEY_M,
        "N" => KeyCode::KEY_N,
        "O" => KeyCode::KEY_O,
        "P" => KeyCode::KEY_P,
        "Q" => KeyCode::KEY_Q,
        "R" => KeyCode::KEY_R,
        "S" => KeyCode::KEY_S,
        "T" => KeyCode::KEY_T,
        "U" => KeyCode::KEY_U,
        "V" => KeyCode::KEY_V,
        "W" => KeyCode::KEY_W,
        "X" => KeyCode::KEY_X,
        "Y" => KeyCode::KEY_Y,
        "Z" => KeyCode::KEY_Z,
        "0" => KeyCode::KEY_0,
        "1" => KeyCode::KEY_1,
        "2" => KeyCode::KEY_2,
        "3" => KeyCode::KEY_3,
        "4" => KeyCode::KEY_4,
        "5" => KeyCode::KEY_5,
        "6" => KeyCode::KEY_6,
        "7" => KeyCode::KEY_7,
        "8" => KeyCode::KEY_8,
        "9" => KeyCode::KEY_9,
        "SPACE" => KeyCode::KEY_SPACE,
        "ENTER" => KeyCode::KEY_ENTER,
        "ESC" | "ESCAPE" => KeyCode::KEY_ESC,
        "TAB" => KeyCode::KEY_TAB,
        "BACKSPACE" => KeyCode::KEY_BACKSPACE,
        "DELETE" => KeyCode::KEY_DELETE,
        "INSERT" => KeyCode::KEY_INSERT,
        "HOME" => KeyCode::KEY_HOME,
        "END" => KeyCode::KEY_END,
        "PAGEUP" => KeyCode::KEY_PAGEUP,
        "PAGEDOWN" => KeyCode::KEY_PAGEDOWN,
        "UP" => KeyCode::KEY_UP,
        "DOWN" => KeyCode::KEY_DOWN,
        "LEFT" => KeyCode::KEY_LEFT,
        "RIGHT" => KeyCode::KEY_RIGHT,
        "F1" => KeyCode::KEY_F1,
        "F2" => KeyCode::KEY_F2,
        "F3" => KeyCode::KEY_F3,
        "F4" => KeyCode::KEY_F4,
        "F5" => KeyCode::KEY_F5,
        "F6" => KeyCode::KEY_F6,
        "F7" => KeyCode::KEY_F7,
        "F8" => KeyCode::KEY_F8,
        "F9" => KeyCode::KEY_F9,
        "F10" => KeyCode::KEY_F10,
        "F11" => KeyCode::KEY_F11,
        "F12" => KeyCode::KEY_F12,
        other => return Err(format!("Tecla no soportada: {other}")),
    };
    Ok(code)
}

fn parse_hotkey(id: String, raw: &str) -> Result<ParsedHotkey, String> {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return Err("Atajo vacío".into());
    }
    let mut mods = Modifiers::default();
    let mut key = None;
    for part in trimmed.split('+') {
        let token = part.trim();
        if token.is_empty() {
            continue;
        }
        match token.to_uppercase().as_str() {
            "CTRL" | "CONTROL" => mods.ctrl = true,
            "ALT" | "OPTION" => mods.alt = true,
            "SHIFT" => mods.shift = true,
            "SUPER" | "CMD" | "COMMAND" | "META" | "WIN" => mods.super_key = true,
            _ => {
                if key.is_some() {
                    return Err(format!("Atajo inválido (varias teclas): {raw}"));
                }
                key = Some(parse_key_token(token)?);
            }
        }
    }
    Ok(ParsedHotkey {
        id,
        mods,
        key: key.ok_or_else(|| format!("Falta tecla principal en: {raw}"))?,
    })
}

fn update_modifier(code: KeyCode, pressed: bool, mods: &mut Modifiers) -> bool {
    match code {
        KeyCode::KEY_LEFTCTRL | KeyCode::KEY_RIGHTCTRL => {
            mods.ctrl = pressed;
            true
        }
        KeyCode::KEY_LEFTALT | KeyCode::KEY_RIGHTALT => {
            mods.alt = pressed;
            true
        }
        KeyCode::KEY_LEFTSHIFT | KeyCode::KEY_RIGHTSHIFT => {
            mods.shift = pressed;
            true
        }
        KeyCode::KEY_LEFTMETA | KeyCode::KEY_RIGHTMETA => {
            mods.super_key = pressed;
            true
        }
        _ => false,
    }
}

fn mods_match(current: &Modifiers, wanted: &Modifiers) -> bool {
    current.ctrl == wanted.ctrl
        && current.alt == wanted.alt
        && current.shift == wanted.shift
        && current.super_key == wanted.super_key
}

fn open_keyboard_devices() -> Vec<Device> {
    let mut devices = Vec::new();
    let Ok(entries) = std::fs::read_dir("/dev/input") else {
        return devices;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if !path.to_string_lossy().contains("/dev/input/event") {
            continue;
        }
        let Ok(mut dev) = Device::open(&path) else {
            continue;
        };
        if dev
            .supported_keys()
            .map(|keys| keys.contains(KeyCode::KEY_A))
            .unwrap_or(false)
        {
            let _ = dev.set_nonblocking(true);
            devices.push(dev);
        }
    }
    devices
}

fn listener_loop<R: Runtime>(
    app: AppHandle<R>,
    state: Arc<HotkeyListenerState>,
    stop: Arc<AtomicBool>,
) {
    let mut devices = open_keyboard_devices();
    let count = devices.len();
    let _ = app.emit(
        "hotkey-status",
        HotkeyStatusPayload {
            active: count > 0,
            device_count: count,
            message: if count == 0 {
                "No se pudo abrir teclados en /dev/input. ¿Grupo input y sesión reiniciada?"
                    .into()
            } else {
                format!("Escuchando atajos vía evdev ({count} dispositivo(s))")
            },
        },
    );

    if devices.is_empty() {
        return;
    }

    let mut mods = Modifiers::default();
    let mut last_fire: HashMap<String, Instant> = HashMap::new();

    loop {
        if stop.load(Ordering::SeqCst) {
            break;
        }
        if !state.enabled.load(Ordering::SeqCst) {
            thread::sleep(Duration::from_millis(50));
            continue;
        }

        let mut had_event = false;
        for dev in &mut devices {
            let events: Vec<_> = match dev.fetch_events() {
                Ok(iter) => iter.collect(),
                Err(_) => continue,
            };
            for event in events {
                had_event = true;
                let EventSummary::Key(_, code, value) = event.destructure() else {
                    continue;
                };
                let pressed = value == 1;
                if update_modifier(code, pressed, &mut mods) {
                    continue;
                }
                if !pressed {
                    continue;
                }

                let bindings = state
                    .bindings
                    .lock()
                    .map(|g| g.clone())
                    .unwrap_or_default();
                for binding in &bindings {
                    if binding.key != code || !mods_match(&mods, &binding.mods) {
                        continue;
                    }
                    let now = Instant::now();
                    if last_fire
                        .get(&binding.id)
                        .is_some_and(|t| now.duration_since(*t) < Duration::from_millis(300))
                    {
                        continue;
                    }
                    last_fire.insert(binding.id.clone(), now);
                    let _ = app.emit(
                        "hotkey-pressed",
                        HotkeyPressedPayload {
                            id: binding.id.clone(),
                        },
                    );
                }
            }
        }
        if !had_event {
            thread::sleep(Duration::from_millis(5));
        }
    }

    let _ = app.emit(
        "hotkey-status",
        HotkeyStatusPayload {
            active: false,
            device_count: 0,
            message: "Listener de atajos detenido".into(),
        },
    );
}

pub fn start_listener<R: Runtime>(app: AppHandle<R>, state: Arc<HotkeyListenerState>) {
    let stop = {
        let mut stop_guard = state.stop_flag.lock().expect("hotkey stop lock");
        if let Some(prev) = stop_guard.take() {
            prev.store(true, Ordering::SeqCst);
        }
        let stop = Arc::new(AtomicBool::new(false));
        *stop_guard = Some(stop.clone());
        stop
    };
    thread::spawn(move || listener_loop(app, state, stop));
}

#[tauri::command]
pub fn set_hotkey_bindings(
    bindings: Vec<HotkeyBindingCmd>,
    enabled: bool,
    state: tauri::State<'_, Arc<HotkeyListenerState>>,
) -> Result<usize, String> {
    let mut parsed = Vec::new();
    let mut seen = std::collections::HashSet::new();
    for b in bindings {
        if b.hotkey.trim().is_empty() {
            continue;
        }
        let hotkey = parse_hotkey(b.id.clone(), &b.hotkey)?;
        let sig = format!(
            "{:?}{}{}{}{}",
            hotkey.key.code(),
            hotkey.mods.ctrl,
            hotkey.mods.alt,
            hotkey.mods.shift,
            hotkey.mods.super_key
        );
        if !seen.insert(sig) {
            continue;
        }
        parsed.push(hotkey);
    }
    state.enabled.store(enabled && !parsed.is_empty(), Ordering::SeqCst);
    let mut guard = state.bindings.lock().map_err(|e| e.to_string())?;
    *guard = parsed;
    Ok(guard.len())
}
