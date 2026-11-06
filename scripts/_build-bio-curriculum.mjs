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
    'Why cells respire, how ATP carries energy, and the difference between aerobic and anaerobic pathways.',
  'respiratory-organs-and-surfaces':
    'Body surfaces, gills, tracheae, lungs, stomata and lenticels, and the features of a good exchange surface.',
  'gas-exchange-in-plants':
    'Stomatal opening and closing, lenticels, and how leaf gas exchange changes between day and night.',
  'aerobic-respiration':
    'Glycolysis, the Krebs cycle and the oxygen-dependent stage that releases most ATP.',
  'anaerobic-respiration-and-fermentation':
    'Lactic acid in muscles, ethanol and carbon dioxide in yeast, oxygen debt and economic uses.',
  excretion:
    'The meaning and significance of excretion, and the nitrogenous wastes animals produce.',
  'excretory-structures':
    'Contractile vacuoles, flame cells, nephridia, Malpighian tubules, kidneys, stomata and lenticels.',
  'mammalian-kidney':
    'Kidney structure, the nephron, urine formation and osmoregulation.',
  'lungs-and-skin':
    'The excretory products and functions of the lungs and skin, including sweat and temperature control.',
  'plant-excretion-and-products':
    'Plant excretory products such as tannins, resins, gums, mucilage and alkaloids, and their economic uses.',
  'support-and-movement':
    'Why organisms need support and movement, and how plants and animals meet both needs.',
  'plant-movements':
    'Tropisms, tactic and nastic movements, sleep movements, growth regions and the role of auxins.',
  'animal-supporting-tissues':
    'Chitin, cartilage and bone, where each is found and how its structure supports the body.',
  'skeletons-and-their-functions':
    "Exoskeletons, endoskeletons and the mammalian skeleton's support, protection, movement and breathing roles.",
  'joints-and-movement':
    'Fibrous, cartilaginous and synovial joints, joint structure and antagonistic muscles.',
  reproduction:
    'Asexual and sexual reproduction compared, with binary fission and budding.',
  'vegetative-propagation':
    'Natural and artificial vegetative propagation, crop applications and the risks of uniform clones.',
  'flower-structure-and-pollination':
    'Floral parts, pollination agents, self- versus cross-pollination and the advantages of cross-pollination.',
  'fertilization-and-seed-formation':
    'Pollen-tube growth, double fertilization, and how ovules and ovaries become seeds and fruits.',
  'fruits-placentation-and-dispersal':
    'Placentation types, simple, aggregate and multiple fruits, and seed dispersal agents.',
  'mammalian-reproductive-systems':
    'Male and female reproductive organs, gametes, hormones and the menstrual cycle.',
  'pregnancy-and-birth':
    'Fertilization, implantation, placental exchange, gestation, labour and maternal nutrition.',
  'reproductive-health-and-contraception':
    'Family planning, modern contraceptive methods, STIs and reproductive health.',
  growth:
    'The meaning and measurement of growth, growth curves, and where growth occurs in plants and animals.',
  'seed-germination':
    'Conditions for germination, the sequence from imbibition to seedling establishment, and seed dormancy.',
  'epigeal-and-hypogeal-germination':
    'The two germination patterns, their examples, and how cotyledon position affects planting depth and survival.',
  'co-ordination-and-control':
    'The need for coordination, nervous versus hormonal control, neuron structure, impulse transmission and synapses.',
  'brain-spinal-cord-and-reflexes':
    'The central nervous system, brain regions, spinal cord and reflex arcs; reflex, voluntary and conditioned actions.',
  'skin-nose-and-tongue':
    'Touch, pressure, temperature and pain in the skin; smell in the nose; taste in the tongue; and common defects.',
  'the-eye':
    'Eye structure, rods and cones, accommodation, the pupil reflex and defects such as myopia and hypermetropia.',
  'the-ear':
    'Hearing, the ossicles and cochlea, balance and common ear defects.',
  'animal-hormones':
    'Endocrine glands, pituitary, thyroid, parathyroid, adrenal, pancreas and gonads, and hormone disorders.',
  'plant-hormones':
    'Auxins and tropisms, gibberellins, cytokinins, abscisic acid, ethylene and their agricultural uses.',
  homeostasis:
    'Negative feedback, temperature regulation, and salt and water balance by ADH and aldosterone.',
  'factors-affecting-the-distribution-of-organisms':
    'Abiotic factors such as temperature, rainfall, wind and salinity; biotic factors; and how human activities shift distributions.',
  'symbiotic-interactions-of-plants-and-animals':
    'Mutualism, commensalism, parasitism, saprophytism, competition, predation, amensalism and cooperation.',
  'food-chains-webs-and-trophic-levels':
    'Producers, consumers and decomposers, food chains versus webs, and energy loss between trophic levels.',
  'nutrient-cycles':
    'The carbon, water and nitrogen cycles and the organisms that drive them.',
  'natural-habitats':
    'Aquatic habitats: ponds, streams, lakes, seashores and mangrove swamps, and their adaptations.',
  'terrestrial-and-arboreal-habitats':
    'Grassland, tree-top and burrow life, and the adaptations of their inhabitants.',
  'local-nigerian-biomes':
    'The tropical rainforest and Niger Delta swamp of southern Nigeria.',
  'savanna-desert-and-highland-biomes':
    'Guinea and Sudan savanna, the northern desert, and the Jos, Obudu and Mambilla highlands.',
  'the-ecology-of-populations':
    'Population density, sampling and the biotic and abiotic factors that set population size.',
  'competition-and-niche':
    'Intra- and inter-specific competition and niche differentiation.',
  'ecological-succession':
    'Primary and secondary succession to the climax community.',
  soil: 'Sandy, clayey and loamy soils, soil structure, components and soil organisms.',
  'soil-fertility-and-conservation':
    'Loss of fertility and ways to renew and conserve soil.',
  'humans-and-environment':
    'Common endemic diseases, their vectors and control.',
  'drug-abuse':
    'Drug abuse and addiction, effects on health, and prevention.',
  'pollution-conservation-and-parks':
    'Pollution and its control, conservation and Nigeria\u2019s parks and reserves.',
  'variation-in-population':
    'Continuous and discontinuous variation, colour patterns, fingerprints and identity.',
  'physiological-variation':
    'Tongue rolling, PTC tasting, blood groups, and uses in transfusion, paternity and crime detection.',
  heredity:
    'Heritable characters, genes, alleles, DNA and chromosome segregation.',
  'genetic-crosses-and-probability':
    'Monohybrid and dihybrid crosses, Punnett squares and probability.',
  'sex-determination-and-sex-linked-traits':
    'XX/XY determination, X-linked colour blindness and haemophilia, and baldness.',
  'heredity-applications':
    'Cross-breeding, marriage counselling, GMO biosafety and recombinant DNA products.',
  biotechnology:
    'Biotechnology in agriculture, medicine, pharmaceuticals and the food industry.',
  'theories-of-evolution':
    'Lamarck\u2019s use and disuse, inheritance of acquired characters, and criticism.',
  'darwin-and-organic-evolution':
    'Natural selection, finches and moths, and Darwin versus Lamarck.',
  'the-organic-theory-of-evolution':
    'Inherited variation, mutation and the origin of new species.',
  'evidence-of-evolution':
    'Fossils, transitional forms and the horse series.',
  'comparative-anatomy-and-embryology':
    'Homologous and analogous structures and embryological similarity.',
  'biogeography-vestigial-organs-and-dna':
    'Biogeography, vestigial organs and DNA evidence.',
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
  {
    slug: 'respiration',
    name: 'Respiration and Energy',
    syllabus_ref: 'B.4',
  },
  {
    slug: 'respiratory-organs-and-surfaces',
    name: 'Respiratory Organs and Surfaces',
    syllabus_ref: 'B.4',
  },
  {
    slug: 'gas-exchange-in-plants',
    name: 'Gas Exchange in Plants',
    syllabus_ref: 'B.4',
  },
  {
    slug: 'aerobic-respiration',
    name: 'Aerobic Respiration',
    syllabus_ref: 'B.4',
  },
  {
    slug: 'anaerobic-respiration-and-fermentation',
    name: 'Anaerobic Respiration and Fermentation',
    syllabus_ref: 'B.4',
  },
  {
    slug: 'excretion',
    name: 'Excretion and Excretory Products',
    syllabus_ref: 'B.5',
  },
  {
    slug: 'excretory-structures',
    name: 'Excretory Structures',
    syllabus_ref: 'B.5',
  },
  {
    slug: 'mammalian-kidney',
    name: 'The Mammalian Kidney',
    syllabus_ref: 'B.5',
  },
  {
    slug: 'lungs-and-skin',
    name: 'Lungs and Skin as Excretory Organs',
    syllabus_ref: 'B.5',
  },
  {
    slug: 'plant-excretion-and-products',
    name: 'Plant Excretion and Its Products',
    syllabus_ref: 'B.5',
  },
  {
    slug: 'support-and-movement',
    name: 'Why Support and Movement?',
    syllabus_ref: 'B.6',
  },
  {
    slug: 'plant-movements',
    name: 'Plant Movements and Tropisms',
    syllabus_ref: 'B.6',
  },
  {
    slug: 'animal-supporting-tissues',
    name: 'Supporting Tissues in Animals',
    syllabus_ref: 'B.6',
  },
  {
    slug: 'skeletons-and-their-functions',
    name: 'Skeletons and Their Functions',
    syllabus_ref: 'B.6',
  },
  {
    slug: 'joints-and-movement',
    name: 'Joints and Movement',
    syllabus_ref: 'B.6',
  },
  {
    slug: 'reproduction',
    name: 'Asexual and Sexual Reproduction',
    syllabus_ref: 'B.7',
  },
  {
    slug: 'vegetative-propagation',
    name: 'Vegetative Propagation',
    syllabus_ref: 'B.7',
  },
  {
    slug: 'flower-structure-and-pollination',
    name: 'Flower Structure and Pollination',
    syllabus_ref: 'B.7',
  },
  {
    slug: 'fertilization-and-seed-formation',
    name: 'Fertilization and Seed Formation',
    syllabus_ref: 'B.7',
  },
  {
    slug: 'fruits-placentation-and-dispersal',
    name: 'Fruits, Placentation and Dispersal',
    syllabus_ref: 'B.7',
  },
  {
    slug: 'mammalian-reproductive-systems',
    name: 'Mammalian Reproductive Systems',
    syllabus_ref: 'B.7',
  },
  {
    slug: 'pregnancy-and-birth',
    name: 'Pregnancy and Birth',
    syllabus_ref: 'B.7',
  },
  {
    slug: 'reproductive-health-and-contraception',
    name: 'Reproductive Health and Contraception',
    syllabus_ref: 'B.7',
  },
  {
    slug: 'growth',
    name: 'Meaning and Measurement of Growth',
    syllabus_ref: 'B.8',
  },
  {
    slug: 'seed-germination',
    name: 'Seed Germination',
    syllabus_ref: 'B.8',
  },
  {
    slug: 'epigeal-and-hypogeal-germination',
    name: 'Epigeal and Hypogeal Germination',
    syllabus_ref: 'B.8',
  },
  {
    slug: 'co-ordination-and-control',
    name: 'Nervous Coordination and Neurons',
    syllabus_ref: 'B.9',
  },
  {
    slug: 'brain-spinal-cord-and-reflexes',
    name: 'Brain, Spinal Cord and Reflexes',
    syllabus_ref: 'B.9',
  },
  {
    slug: 'skin-nose-and-tongue',
    name: 'Skin, Nose and Tongue',
    syllabus_ref: 'B.9',
  },
  {
    slug: 'the-eye',
    name: 'The Eye',
    syllabus_ref: 'B.9',
  },
  {
    slug: 'the-ear',
    name: 'The Ear',
    syllabus_ref: 'B.9',
  },
  {
    slug: 'animal-hormones',
    name: 'Animal Hormones',
    syllabus_ref: 'B.9',
  },
  {
    slug: 'plant-hormones',
    name: 'Plant Hormones',
    syllabus_ref: 'B.9',
  },
  {
    slug: 'homeostasis',
    name: 'Homeostasis',
    syllabus_ref: 'B.9',
  },
  {
    slug: 'factors-affecting-the-distribution-of-organisms',
    name: 'Factors Affecting the Distribution of Organisms',
    syllabus_ref: 'C.1',
  },
  {
    slug: 'symbiotic-interactions-of-plants-and-animals',
    name: 'Species Interactions',
    syllabus_ref: 'C.2',
  },
  {
    slug: 'food-chains-webs-and-trophic-levels',
    name: 'Food Chains, Webs and Trophic Levels',
    syllabus_ref: 'C.2',
  },
  {
    slug: 'nutrient-cycles',
    name: 'Carbon, Water and Nitrogen Cycles',
    syllabus_ref: 'C.2',
  },
  {
    slug: 'natural-habitats',
    name: 'Aquatic Habitats',
    syllabus_ref: 'C.3',
  },
  {
    slug: 'terrestrial-and-arboreal-habitats',
    name: 'Terrestrial and Arboreal Habitats',
    syllabus_ref: 'C.3',
  },
  {
    slug: 'local-nigerian-biomes',
    name: 'Tropical Rainforest of Nigeria',
    syllabus_ref: 'C.4',
  },
  {
    slug: 'savanna-desert-and-highland-biomes',
    name: 'Savanna, Desert and Highland Biomes',
    syllabus_ref: 'C.4',
  },
  {
    slug: 'the-ecology-of-populations',
    name: 'Population Density and Size',
    syllabus_ref: 'C.5',
  },
  {
    slug: 'competition-and-niche',
    name: 'Competition and Niche',
    syllabus_ref: 'C.5',
  },
  {
    slug: 'ecological-succession',
    name: 'Ecological Succession',
    syllabus_ref: 'C.5',
  },
  {
    slug: 'soil',
    name: 'Soil Types and Components',
    syllabus_ref: 'C.6',
  },
  {
    slug: 'soil-fertility-and-conservation',
    name: 'Soil Fertility and Conservation',
    syllabus_ref: 'C.6',
  },
  {
    slug: 'humans-and-environment',
    name: 'Diseases, Vectors and Control',
    syllabus_ref: 'C.7',
  },
  {
    slug: 'drug-abuse',
    name: 'Drug Abuse',
    syllabus_ref: 'C.7',
  },
  {
    slug: 'pollution-conservation-and-parks',
    name: 'Pollution, Conservation and National Parks',
    syllabus_ref: 'C.7',
  },
  {
    slug: 'variation-in-population',
    name: 'Morphological Variation',
    syllabus_ref: 'D.1',
  },
  {
    slug: 'physiological-variation',
    name: 'Physiological Variation and Applications',
    syllabus_ref: 'D.1',
  },
  {
    slug: 'heredity',
    name: 'Genes, Chromosomes and Heritable Characters',
    syllabus_ref: 'D.2',
  },
  {
    slug: 'genetic-crosses-and-probability',
    name: 'Genetic Crosses and Probability',
    syllabus_ref: 'D.2',
  },
  {
    slug: 'sex-determination-and-sex-linked-traits',
    name: 'Sex Determination and Sex-Linked Traits',
    syllabus_ref: 'D.2',
  },
  {
    slug: 'heredity-applications',
    name: 'Heredity in Practice',
    syllabus_ref: 'D.2',
  },
  {
    slug: 'biotechnology',
    name: 'Biotechnology and Its Applications',
    syllabus_ref: 'D.3',
  },
  {
    slug: 'theories-of-evolution',
    name: "Lamarck's Theory of Evolution",
    syllabus_ref: 'E.1',
  },
  {
    slug: 'darwin-and-organic-evolution',
    name: "Darwin's Theory of Natural Selection",
    syllabus_ref: 'E.1',
  },
  {
    slug: 'the-organic-theory-of-evolution',
    name: 'The Organic Theory of Evolution',
    syllabus_ref: 'E.1',
  },
  {
    slug: 'evidence-of-evolution',
    name: 'Fossil Evidence for Evolution',
    syllabus_ref: 'E.2',
  },
  {
    slug: 'comparative-anatomy-and-embryology',
    name: 'Comparative Anatomy and Embryology',
    syllabus_ref: 'E.2',
  },
  {
    slug: 'biogeography-vestigial-organs-and-dna',
    name: 'Biogeography, Vestigial Organs and DNA',
    syllabus_ref: 'E.2',
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
