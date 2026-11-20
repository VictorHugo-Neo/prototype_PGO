#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import os

try:
    import httpx
except ImportError:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    venv_py = os.path.abspath(os.path.join(script_dir, "../../backend/venv/bin/python"))
    if os.path.isfile(venv_py) and sys.executable != venv_py:
        args = [venv_py, os.path.join(script_dir, "manage_evolution.py")] + sys.argv[1:]
        os.execv(venv_py, args)

from app.evolution_cli import main

if __name__ == "__main__":
    main()
