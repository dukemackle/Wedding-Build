"""Run from the repo root: python3 scripts/batch-a/add-suite.py spec.json.
Register a Batch A painted suite by cloning golden-hills. Usage: python3 addsuite.py spec.json (run from repo root)."""
import re, json, sys
c=json.load(open(sys.argv[1]))
ID,NAME,ART,FILE,BG=c["id"],c["name"],c["art"],c["file"],c["bg"]
pals=c["palettes"]
for f,pat in [("src/lib/site-design.ts",f'id: "{ID}"'),("src/lib/save-the-date/templates.ts",f'id: "{ID}"'),("src/lib/site-templates.ts",f'id: "{ID}"'),("src/components/site-scene.tsx",f'  {ID}:'),("src/components/site-scene.tsx",f'"{ID}":')]:
    assert pat not in open(f).read(), ("id taken", f, pat)  # [[key,label,ink,accent,muted,family]]
def sub(path, old, new):
    s=open(path).read(); assert old in s, (path, old[:60]); open(path,'w').write(s.replace(old,new,1))
def oneblock(s, id_):
    i=s.index('  {\n    id: "%s",'%id_); j=s.index('\n  {\n    id: "', i+10)+1
    assert s[i:j].count('\n    id: "')==1
    return i,j
sub("src/components/save-the-date/art.tsx",'  starlitStd: batchA(',f'  {ART}: batchA("{c["label"]}", "{FILE}-std", 1000, 1400),\n  starlitStd: batchA(')
p="src/lib/save-the-date/templates.ts"; s=open(p).read()
i,j=oneblock(s,"golden-hills"); nb=s[i:j]
nb=nb.replace('id: "golden-hills"',f'id: "{ID}"').replace('name: "Golden Hills"',f'name: "{NAME}"').replace('family: "Landscape"',f'family: "{c["family"]}"')
nb=re.sub(r'mood: "[^"]*"',f'mood: "{c["mood"]}"',nb,1)
nb=nb.replace('label: "Golden hills", art: "goldenHillsStd"',f'label: "{c["label"]}", art: "{ART}"')
pl="\n".join(f'      {{ id: "{k}", label: "{l}", paper: "{BG}", ink: "{ink}", accent: "{acc}", muted: "{mu}", onPhoto: "#ffffff" }},' for k,l,ink,acc,mu,_ in pals)
nb=re.sub(r'    palettes: \[.*?\n    \],', '    palettes: [\n'+pl+'\n    ],', nb, flags=re.S).replace('{ id: "hills", label',f'{{ id: "{FILE}", label')
assert ART in nb; s=s[:i]+nb+s[i:]; open(p,'w').write(s)
p="src/lib/save-the-date/invitations.ts"; s=open(p).read()
s=re.sub(r'(\n\];\n\nexport const INVITATION_PREFIX)', f'\n  "{ID}",\\1', s, 1)
i=s.index('  "golden-hills": [\n    art('); j=s.index('  ],\n',i)+5
blk=s[i:j].replace('"golden-hills": [',f'"{ID}": [').replace('label: "Golden hills", art: "goldenHillsStd"',f'label: "{c["label"]}", art: "{ART}"')
assert ART in blk; s=s[:i]+blk+s[i:]; open(p,'w').write(s)
sub("src/lib/save-the-date/back.ts",'  "golden-hills": [{',f'  "{ID}": [{{ kind: "art", id: "back-scene", label: "{c["label"]}", art: "{ART}", x: 0, y: 0, w: 1000 }}],\n  "golden-hills": [{{')
s=open("src/lib/save-the-date/back.ts").read(); s=re.sub(r'(const BACK_LIFT[^;]*?) \};', lambda m: m.group(1)+f', "{ID}": {c.get("lift",200)} }};', s,1); open("src/lib/save-the-date/back.ts","w").write(s)
p="src/components/site-scene.tsx"
sub(p,'  "golden-hills": "#f9f4ec",\n',f'  "golden-hills": "#f9f4ec",\n  "{ID}": "{BG}",\n')
sub(p,'  "golden-hills": foot(',f'  "{ID}": foot("{FILE}-panorama", {c["pw"]}, {c["ph"]}, "{c["x"]}", sky("{ID}"){", true" if c.get("whole") else ""}),\n  "golden-hills": foot(')
p="src/lib/site-design.ts"
sub(p,'  { id: "golden-hills", label',f'  {{ id: "{ID}", label: "{c["scene"]}", place: "foot" }},\n  {{ id: "golden-hills", label')
sp="\n".join(f'  {{ id: "{FILE}-{k}", name: "{l}", family: "{fam}", bg: "{BG}", ink: "{ink}", heading: "{ink}", accent: "{acc}" }},' for k,l,ink,acc,mu,fam in pals)
sub(p,'  { id: "hills-sunset",',sp+'\n  { id: "hills-sunset",')
ks=[f'{FILE}-{p[0]}' for p in pals]
for p,rep in [("src/lib/site-templates.ts",[('"golden-hills"',f'"{ID}"'),('name: "Golden Hills"',f'name: "{NAME}"'),("Your names in script on warm ivory paper, oak-dotted hills under a golden sunset at the foot of the page",c["blurb"]),('palette: "hills-sunset"',f'palette: "{ks[0]}"'),('["hills-sage", "hills-rose"]',f'["{ks[1]}", "{ks[2]}"]')]),
              ("src/lib/suites.ts",[('"golden-hills"',f'"{ID}"'),('name: "Golden Hills"',f'name: "{NAME}"'),('{ sunset: "hills-sunset", sage: "hills-sage", rose: "hills-rose" }','{ '+", ".join(f'{p[0]}: "{FILE}-{p[0]}"' for p in pals)+' }')])]:
    s=open(p).read(); i=s.index('  {\n    id: "golden-hills",'); j=s.index('  {\n    id: "', i+10)
    blk=s[i:j]
    for a,b in rep: blk=blk.replace(a,b)
    assert f'"{ID}"' in blk and ks[0] in blk, p
    s=s[:j]+blk+s[j:]; open(p,'w').write(s)
p="src/app/save-the-date/prototype/studio.tsx"; s=open(p).read()
s=re.sub(r'(const BATCH_A = \[[^\]]*?)\]', lambda m: m.group(1)+f', "{ID}"]', s,1); open(p,'w').write(s)
print("ok",ID)
