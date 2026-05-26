from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = PROJECT_DIR / "scripts"
BIN_DIR = PROJECT_DIR / "bin"

CURSOR_SCRIPT = SCRIPTS_DIR / "cursor.sh"
MOUSE_SCRIPT = SCRIPTS_DIR / "mover_raton.sh"
DAEMON_SCRIPT = SCRIPTS_DIR / "ydotoold.sh"
SETUP_SCRIPT = SCRIPTS_DIR / "setup.sh"

YDOTOOL_SOCKET = "/tmp/.ydotool_socket"
