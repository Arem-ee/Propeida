"""Precise full-id comparison."""
import json

old = json.load(open('content-folder/_work/econs-solve.json', encoding='utf-8'))
new = json.load(open('content-folder/_work/econs-now.json', encoding='utf-8'))
idmap = json.load(open('content-folder/_work/econs-idmap.json', encoding='utf-8'))
new_by_id = {r['id']: r for r in new}

phantoms = [
    '07af719b-ab01-444e-a3d5-317c5b992e43',
    '2b041905-ab6d-403e-8ea7-cfcd7b2ef2e0',
    '2b8a36ed-8dcc-4fdb-9717-4d061b853b1a',
    '2ec956ea-c6cc-4580-a5ba-f22640cd35de',
    '30481d4c-9133-45eb-be38-47e19f403875',
    '5aceb9d6-3437-4d47-8ae1-4a6cc9ba5f1d',
    '60f04ca5-67e1-400e-ad50-4122f5759c9c',
    '666cfa52-ad97-4219-9848-105c9c3a2439',
    '679deeac-1282-49f0-842a-2bd14817226d',
    '75f31b1a-0976-410a-8e20-05fb2e29cc21',
    '7fee1248-d4a3-4edd-b4f1-a94f0d3d34ea',
    '8d441238-b94a-47ee-a059-9d8bfb2158fc',
    '90d19be1-e0bc-40e6-b15a-1bade8ae057a',
    '91a61a2a-8561-493e-81bf-c0b3dcd27ae1',
    '99b79511-65aa-4465-b969-e30357534dee',
    '9b6df656-637d-4ba8-ba391bb5ce4f623',
    '9d55eef8-1d05-4577-b096-d5b8d5fe1398',
    'a29354fd-9a26-48e2-951c-62435bc81fa8',
    'ad315d59-3986-4d2f-9f70-2c0304146b08',
    'cb0e59c1-0749-415e-a703-4577595ae781',
    'de4ae396-3601-400c-9a15-cb9a28f443b2',
    'fc323316-46b6-4ade-9704-f1bd770a2c1a',
]

by_text_old = {r['question_text']: r['id'] for r in old}
for p in phantoms:
    if p in new_by_id:
        print('PHANTOM ACTUALLY PRESENT:', p)
    else:
        print('phantom confirmed absent:', p[:8])
