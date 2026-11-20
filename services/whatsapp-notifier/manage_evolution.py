#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import os

if sys.version_info[0] < 3:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    venv_py = os.path.abspath(os.path.join(script_dir, "../../backend/venv/bin/python"))
    target_py = venv_py if os.path.isfile(venv_py) else "python3"
    args = [target_py, os.path.join(script_dir, "manage_evolution.py")] + sys.argv[1:]
    os.execv(target_py, args)

from app.evolution_cli import main

if __name__ == "__main__":
    main()
