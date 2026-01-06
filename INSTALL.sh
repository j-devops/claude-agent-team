#!/bin/bash
# HAL Installation Script

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
HAL_BIN="$SCRIPT_DIR/bin/hal"

echo "Installing HAL - Multi-Agent Team Manager"
echo "==========================================="
echo ""

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo "⚠️  Warning: tmux is not installed"
    echo ""
    echo "Install tmux:"
    echo "  Ubuntu/Debian: sudo apt install tmux"
    echo "  macOS: brew install tmux"
    echo ""
    read -p "Continue anyway? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required but not installed"
    exit 1
fi

# Make HAL executable
chmod +x "$HAL_BIN"
echo "✅ Made HAL executable"

# Detect shell
SHELL_NAME=$(basename "$SHELL")
RC_FILE=""

case "$SHELL_NAME" in
    bash)
        RC_FILE="$HOME/.bashrc"
        ;;
    zsh)
        RC_FILE="$HOME/.zshrc"
        ;;
    fish)
        RC_FILE="$HOME/.config/fish/config.fish"
        ;;
    *)
        echo "⚠️  Warning: Could not detect shell type ($SHELL_NAME)"
        RC_FILE="$HOME/.profile"
        ;;
esac

# Ask user how to install
echo ""
echo "Installation options:"
echo ""
echo "1. Add to PATH in $RC_FILE (recommended)"
echo "2. Create symlink in /usr/local/bin (requires sudo)"
echo "3. Skip (I'll configure manually)"
echo ""
read -p "Choose [1-3]: " -n 1 -r choice
echo ""

case "$choice" in
    1)
        # Add to PATH
        PATH_LINE="export PATH=\"\$PATH:$SCRIPT_DIR/bin\""

        if grep -Fxq "$PATH_LINE" "$RC_FILE" 2>/dev/null; then
            echo "✅ Already in PATH"
        else
            echo "$PATH_LINE" >> "$RC_FILE"
            echo "✅ Added to $RC_FILE"
            echo ""
            echo "Run this to use HAL now:"
            echo "  source $RC_FILE"
        fi
        ;;
    2)
        # Create symlink
        if [ -w /usr/local/bin ]; then
            ln -sf "$HAL_BIN" /usr/local/bin/hal
            echo "✅ Created symlink: /usr/local/bin/hal"
        else
            sudo ln -sf "$HAL_BIN" /usr/local/bin/hal
            echo "✅ Created symlink: /usr/local/bin/hal (with sudo)"
        fi
        ;;
    3)
        echo "⏭️  Skipped installation"
        echo ""
        echo "To use HAL, either:"
        echo "  1. Run directly: $HAL_BIN"
        echo "  2. Add to PATH: export PATH=\"\$PATH:$SCRIPT_DIR/bin\""
        echo "  3. Create symlink: sudo ln -s $HAL_BIN /usr/local/bin/hal"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "==========================================="
echo "✅ Installation complete!"
echo ""
echo "Verify installation:"
echo "  hal --version"
echo ""
echo "Get started:"
echo "  hal agents              # List available agents"
echo "  hal init ~/my-project   # Create WORKPLAN.md"
echo "  hal start ~/my-project  # Start agent team"
echo ""
echo "Documentation:"
echo "  HAL.md                  # Full command reference"
echo "  QUICK_USAGE.md          # Quick start guide"
echo "  COORDINATION_FIX.md     # How it works"
echo ""
