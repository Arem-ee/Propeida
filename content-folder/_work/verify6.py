"""Find the script's lookalike strings."""
import re

src = open('scripts/solve-econs1.mjs', encoding='utf-8').read()
allq = re.findall(r"'([^']{30,40})'", src)
for x in allq:
    if '14051a' in x or '4051ab' in x:
        print(repr(x))
        print([hex(ord(c)) for c in x])
        print()
