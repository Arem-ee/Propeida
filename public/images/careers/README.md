# Career imagery

This folder holds first-party images for the expanded career pages under `/explore/careers/[slug]`.

Each curated career lives in its own folder:

```
public/images/careers/<career-slug>/
  hero.webp                 main hero banner
  sector-<key>.webp         sector scene (key matches OPPORTUNITIES sector keys)
  specialization-<name>.webp  specialization scene (kebab-case of the specialization name)
  project-<level>.webp      project scene (beginner | intermediate | advanced)
  stage-<stage>.webp        learning stage scene (foundation | build | specialize | employable)
```

All images are optional. When a file is missing, the page renders a deterministic inline SVG
scene instead, so the experience never breaks and no image is ever faked or hot-linked.

## Guidelines

- WebP, ideally below ~150 KB per image.
- Portrait-ish crops work best for cards (4:3 ratio); hero images should be wide (16:9 or wider).
- Use flat, friendly, editorial illustrations — no text baked into the image, no watermarks,
  no people that could be mistaken for real students.
- Keep every folder's visual tone consistent with the other folders.

## Asset keys

The file names above must match keys used in code:

- Sectors: power-energy, renewable-energy, telecommunications, manufacturing, oil-gas,
  construction, automation-control, technology, infrastructure, research, banking-finance,
  healthcare, agriculture, education, public-service, media-communication, real-estate,
  e-commerce, fmcg, transport-logistics, startups, mining-solid-minerals
- Specializations: kebab-case of the specialization name in `learningPath.specializations`
- Projects: beginner, intermediate, advanced
- Stages: foundation, build, specialize, employable

Adding a new career's images is therefore just: create the folder, drop the files in with the
correct names, deploy. No code changes needed.