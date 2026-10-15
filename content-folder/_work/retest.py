import importlib.util
import re

spec = importlib.util.spec_from_file_location('jp', 'scripts/jamb-parse.py')
jp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(jp)

hits = []
with open('content-folder/_dump/Literature.txt', encoding='utf-8') if False else open('/dev/null'):
    pass
