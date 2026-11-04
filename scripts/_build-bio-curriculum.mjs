import { readFileSync, writeFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
    .map((line) => {
      const i = line.indexOf('=')
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^"|"$/g, '')]
    }),
)
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const descriptions = {
  'living-organisms':
    'The seven life processes that separate living from non-living things, and the traps that decide exam questions.',
  'cell-structure-and-function':
    'Shared cell structures, plant and animal differences, and the functions of the organelles.',
  'levels-of-organisation':
    'The sequence from cell to tissue, organ, system and organism, with the syllabus examples.',
  'evolution-among-the-following':
    'The five kingdoms, the prokaryote-eukaryote divide, and the trend of increasing structural complexity.',
  'monera-and-protista':
    'Bacteria, blue-green algae, Amoeba, Paramecium and Euglena, and how the two single-celled kingdoms differ.',
  fungi:
    'Hyphae, spores, saprophytic feeding, Rhizopus and mushrooms, and the economic importance of fungi.',
  'plant-divisions':
    'Thallophyta, Bryophyta, Pteridophyta and Spermatophyta, and the move from water to land.',
  'plant-life-spans':
    'Annuals, biennials and perennials, their examples, and how each completes its life cycle.',
  invertebrates:
    'Coelenterata, Platyhelminthes, Nematoda, Annelida, Arthropoda and Mollusca, and their advancing body plans.',
  insects:
    'Insect structure, complete and incomplete metamorphosis, and their economic and environmental importance.',
  vertebrates:
    'Pisces, Amphibia, Reptilia, Aves and Mammalia, and the adaptations that took life from water to land.',
  'structural-functional-and-behavioural':
    'Cryptic colouration, countershading, warning colouration and mimicry, and what each does for the organism.',
  'social-insects':
    'Termite and bee castes, division of labour, communication and the economic importance of colonies.',
  'feeding-adaptations':
    'Bird beaks and feet and insect mouthparts matched to the food each organism eats.',
  'defence-and-mating-adaptations':
    'Camouflage, startle displays, chemical defence, sexual dimorphism and courtship.',
  'temperature-and-water-regulation':
    'Basking, hibernation, aestivation, endothermy, xerophytes and water conservation.',
  'internal-structure-of-a-flowering-plant':
    'Left unpublished after the B.1 split; its content is taught by four dedicated lessons.',
  'root-and-stem-anatomy':
    'Transverse sections of root and stem, and how each structure does its job.',
  'leaf-anatomy':
    'Leaf anatomy from cuticle to vein, and how structure serves photosynthesis and gas exchange.',
  'plant-supporting-tissues':
    'Collenchyma, sclerenchyma, xylem and phloem fibres, and their distribution in roots, stems and leaves.',
  'mammalian-internal-organs':
    'The digestive, reproductive and excretory organs and where they sit in the body cavity.',
  nutrition:
    'Autotrophic and heterotrophic nutrition, and the four heterotrophic feeding patterns.',
  'photosynthesis-and-mineral-requirements':
    'Photosynthesis, chemosynthesis, macro and micronutrients, and deficiency symptoms.',
  'classes-of-food-and-balanced-diet':
    'The six classes of food, food tests, balanced diet, and deficiency diseases.',
  'mammalian-teeth-and-alimentary-canal':
    'Tooth structure and types, dental formulae, and the alimentary canal with its accessory organs.',
  transport:
    'Why large organisms need a transport system, the materials moved, and the media that carry them.',
  'mammalian-circulatory-system':
    'The heart, arteries, veins, capillaries, the two circuits and the named vessels.',
  'blood-and-lymph':
    'Plasma, blood cells, platelets, tissue fluid and lymph, and their functions.',
  'plant-transport':
    'Xylem and phloem, transpiration pull, root pressure and active transport.',
  'diffusion-osmosis-and-water-relations':
    'Diffusion, osmosis, plasmolysis and turgidity as mechanisms of transport.',
  respiration:
    'Respiratory surfaces, gaseous exchange, aerobic and anaerobic respiration, and fermentation.',
  excretion:
    'Excretory structures from contractile vacuoles to kidneys, and the excretory products of plants.',
  'support-and-movement':
    'Plant movements, supporting tissues, skeletons and joints in animals.',
  reproduction:
    'Asexual and sexual reproduction, flowering-plant reproduction and mammalian reproduction.',
  growth:
    'The meaning of growth, seed germination and the difference between epigeal and hypogeal germination.',
  'co-ordination-and-control':
    'Nervous coordination, sense organs, hormones and homeostasis.',
  'factors-affecting-the-distribution-of-organisms':
    'Abiotic and biotic factors that determine where organisms live.',
  'symbiotic-interactions-of-plants-and-animals':
    'Symbiosis, energy flow, food chains and webs, and the carbon, water and nitrogen cycles.',
  'natural-habitats':
    'Aquatic and terrestrial habitats and the adaptive features of the organisms in them.',
  'local-nigerian-biomes':
    'Tropical rainforest, Guinea and Sudan savanna, desert and the highland plateaus of Nigeria.',
  'the-ecology-of-populations':
    'Population density, competition, population size, ecological succession and climax communities.',
  soil: 'Soil types, components, fertility, erosion and the maintenance of productive soil.',
  'humans-and-environment':
    "Disease, drug abuse, pollution, sanitation, conservation and Nigeria's parks and reserves.",
  'variation-in-population':
    'Morphological and physiological variation and its use in identity, transfusion and paternity.',
  heredity:
    'Heritable characters, chromosomes, genetic crosses, sex determination and sex-linked traits.',
  biotechnology:
    'Applications of biotechnology in agriculture, medicine, pharmaceuticals and the food industry.',
  'theories-of-evolution':
    "Organic evolution, Lamarck's and Darwin's theories, and the evidence that supports them.",
  'evidence-of-evolution':
    'Fossils, comparative anatomy, embryology and other evidence for organic evolution.',
}

const sections = {
  A: 'Variety of Organisms',
  B: 'Form and Functions',
  C: 'Ecology',
  D: 'Heredity and Variations',
  E: 'Evolution',
}

const { data: subject } = await db.from('subjects').select('id').eq('slug', 'biology').single()
const { data: existing } = await db
  .from('topics')
  .select('slug, name, syllabus_ref, section_title, sort_order')
  .eq('subject_id', subject.id)
  .order('sort_order')

if (!existing?.length) throw new Error('no biology topics')

const split = [
  {
    slug: 'living-organisms',
    name: 'Characteristics of Living Things',
    syllabus_ref: 'A.1',
  },
  {
    slug: 'cell-structure-and-function',
    name: 'Cell Structure and Function',
    syllabus_ref: 'A.1',
  },
  {
    slug: 'levels-of-organisation',
    name: 'Levels of Organisation',
    syllabus_ref: 'A.1',
  },
  {
    slug: 'evolution-among-the-following',
    name: 'The Five Kingdoms',
    syllabus_ref: 'A.2',
  },
  {
    slug: 'monera-and-protista',
    name: 'Monera and Protista',
    syllabus_ref: 'A.2',
  },
  {
    slug: 'fungi',
    name: 'Fungi',
    syllabus_ref: 'A.2',
  },
  {
    slug: 'plant-divisions',
    name: 'Plant Divisions',
    syllabus_ref: 'A.2',
  },
  {
    slug: 'plant-life-spans',
    name: 'Plant Life Spans',
    syllabus_ref: 'A.2',
  },
  {
    slug: 'invertebrates',
    name: 'Invertebrate Phyla',
    syllabus_ref: 'A.2',
  },
  {
    slug: 'insects',
    name: 'Insects and Their Importance',
    syllabus_ref: 'A.2',
  },
  {
    slug: 'vertebrates',
    name: 'Vertebrate Classes',
    syllabus_ref: 'A.2',
  },
  {
    slug: 'structural-functional-and-behavioural',
    name: 'Adaptive Colouration',
    syllabus_ref: 'A.3',
  },
  {
    slug: 'social-insects',
    name: 'Social Insects: Termites and Bees',
    syllabus_ref: 'A.3',
  },
  {
    slug: 'feeding-adaptations',
    name: 'Feeding Adaptations',
    syllabus_ref: 'A.3',
  },
  {
    slug: 'defence-and-mating-adaptations',
    name: 'Defence and Mating Adaptations',
    syllabus_ref: 'A.3',
  },
  {
    slug: 'temperature-and-water-regulation',
    name: 'Temperature and Water Regulation',
    syllabus_ref: 'A.3',
  },
  {
    slug: 'root-and-stem-anatomy',
    name: 'Root and Stem Anatomy',
    syllabus_ref: 'B.1',
  },
  {
    slug: 'leaf-anatomy',
    name: 'Leaf Anatomy',
    syllabus_ref: 'B.1',
  },
  {
    slug: 'plant-supporting-tissues',
    name: 'Supporting Tissues in Plants',
    syllabus_ref: 'B.1',
  },
  {
    slug: 'mammalian-internal-organs',
    name: 'Mammalian Internal Organs',
    syllabus_ref: 'B.1',
  },
  {
    slug: 'nutrition',
    name: 'Modes of Nutrition',
    syllabus_ref: 'B.2',
  },
  {
    slug: 'photosynthesis-and-mineral-requirements',
    name: 'Photosynthesis and Mineral Requirements',
    syllabus_ref: 'B.2',
  },
  {
    slug: 'classes-of-food-and-balanced-diet',
    name: 'Classes of Food and Balanced Diet',
    syllabus_ref: 'B.2',
  },
  {
    slug: 'mammalian-teeth-and-alimentary-canal',
    name: 'Mammalian Teeth and Alimentary Canal',
    syllabus_ref: 'B.2',
  },
  {
    slug: 'transport',
    name: 'Why Transport?',
    syllabus_ref: 'B.3',
  },
  {
    slug: 'mammalian-circulatory-system',
    name: 'The Mammalian Circulatory System',
    syllabus_ref: 'B.3',
  },
  {
    slug: 'blood-and-lymph',
    name: 'Blood and Lymph',
    syllabus_ref: 'B.3',
  },
  {
    slug: 'plant-transport',
    name: 'Plant Transport',
    syllabus_ref: 'B.3',
  },
  {
    slug: 'diffusion-osmosis-and-water-relations',
    name: 'Diffusion, Osmosis and Water Relations',
    syllabus_ref: 'B.3',
  },
].map((topic, index) => ({
  ...topic,
  section: sections[String(topic.syllabus_ref ?? 'A').split('.')[0]] ?? sections.A,
  order: index + 1,
}))

const splitSlugs = new Set(split.map((topic) => topic.slug))
const rest = existing
  .filter((topic) => !splitSlugs.has(topic.slug))
  .map((topic, index) => ({
    slug: topic.slug,
    name: topic.name,
    syllabus_ref: topic.syllabus_ref ?? undefined,
    section: sections[String(topic.syllabus_ref ?? 'A')[0]] ?? topic.section_title,
    order: index + split.length + 1,
  }))

const topics = [...split, ...rest].map((topic) => ({
  slug: topic.slug,
  name: topic.name,
  ...(topic.syllabus_ref ? { syllabus_ref: topic.syllabus_ref } : {}),
  section: topic.section,
  order: topic.order,
  description: descriptions[topic.slug] ?? topic.name,
}))

const lessons = JSON.parse(readFileSync('scripts/_bio-lessons.json', 'utf8'))

const source = {
  subject: 'biology',
  source: 'JAMB/IBASS Biology syllabus (2026); lessons checked against the structured syllabus',
  topics,
  lessons,
}

writeFileSync('content-folder/biology-curriculum.json', JSON.stringify(source, null, 2) + '\n')
console.log('topics', topics.length, 'lessons', lessons.length)
for (const t of topics) console.log(t.order, t.syllabus_ref ?? '-', t.slug, '|', t.section)
