import type { LucideIcon } from "lucide-react"
import {
  Apple,
  Banana,
  Bean,
  Beef,
  Carrot,
  Cherry,
  Circle,
  CircleDot,
  Citrus,
  Clover,
  CupSoda,
  Drumstick,
  Egg,
  Fish,
  Flame,
  Layers,
  Leaf,
  LeafyGreen,
  Milk,
  Package,
  Salad,
  Sprout,
  Square,
  TreeDeciduous,
  Wheat,
} from "lucide-react"

/** Normalize for keyword matching: lowercase, trim, light singularization. */
function normalizeForMatch(name: string): string {
  let t = name.trim().toLowerCase()
  const plurals: Record<string, string> = {
    eggs: "egg",
    tomatoes: "tomato",
    potatoes: "potato",
    onions: "onion",
    lemons: "lemon",
    apples: "apple",
    carrots: "carrot",
    bananas: "banana",
    berries: "berry",
    cherries: "cherry",
    peppers: "pepper",
    beans: "bean",
    mushrooms: "mushroom",
    cucumbers: "cucumber",
    avocados: "avocado",
    mangoes: "mango",
    peaches: "peach",
    pears: "pear",
    plums: "plum",
    limes: "lime",
    grapes: "grape",
    shrimps: "shrimp",
  }
  if (plurals[t]) return plurals[t]
  if (t.endsWith("ies") && t.length > 4) return t.slice(0, -3) + "y"
  if (t.length > 3 && t.endsWith("es") && !t.endsWith("ss")) {
    const stem = t.slice(0, -2)
    if (stem.length >= 2) return stem
  }
  if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss")) {
    const stem = t.slice(0, -1)
    if (stem.length >= 3) return stem
  }
  return t
}

/**
 * Returns a Lucide icon for display next to an ingredient name.
 * Uses keyword matching on a normalized form (singular-ish, lowercase).
 */
export function getIngredientIcon(name: string): LucideIcon {
  const raw = name.trim().toLowerCase()
  const n = normalizeForMatch(name)

  if (n.includes("pineapple")) return Cherry
  if (/\bapple\b/.test(raw) || raw.startsWith("apple")) return Apple
  if (n.includes("banana")) return Banana
  if (n.includes("cherry") || n.includes("berry")) return Cherry
  if (
    n.includes("lemon") ||
    n.includes("lime") ||
    n.includes("orange") ||
    n.includes("grapefruit") ||
    n.includes("grape")
  ) {
    return Citrus
  }

  if (
    n.includes("fish") ||
    n.includes("salmon") ||
    n.includes("tuna") ||
    n.includes("cod") ||
    n.includes("shrimp") ||
    n.includes("prawn")
  ) {
    return Fish
  }
  if (n.includes("chicken") || n.includes("turkey") || n.includes("duck")) return Drumstick
  if (n.includes("beef") || n.includes("steak") || n.includes("pork") || n.includes("lamb") || n.includes("bacon") || n.includes("ham")) {
    return Beef
  }
  if (n.includes("egg")) return Egg
  if (n.includes("tofu")) return Square
  if (n.includes("paneer")) return Square

  if (n.includes("yogurt") || n.includes("yoghurt") || n.includes("curd") || n.includes("kefir")) return CupSoda
  if (n.includes("milk") || n.includes("cream")) return Milk
  if (
    n.includes("cheese") ||
    n.includes("cheddar") ||
    n.includes("mozzarella") ||
    n.includes("feta") ||
    n.includes("ricotta") ||
    n.includes("parmesan")
  ) {
    return Package
  }

  if (
    n.includes("rice") ||
    n.includes("pasta") ||
    n.includes("noodle") ||
    n.includes("flour") ||
    n.includes("oat") ||
    n.includes("lentil") ||
    n.includes("chickpea") ||
    n.includes("couscous") ||
    n.includes("quinoa") ||
    (n.includes("bean") && !n.includes("green bean") && !n.includes("string bean"))
  ) {
    return Wheat
  }
  if (n.includes("green bean") || n.includes("string bean")) return Bean
  if (n.includes("oil") || n.includes("vinegar") || n.includes("sauce") || n.includes("spice") || n.includes("honey") || n.includes("jam") || n.includes("sugar")) {
    return Package
  }
  if (n.includes("peppercorn") || n.includes("black pepper") || n.includes("white pepper")) return Package

  if (n.includes("tomato")) return Circle
  if ((n.includes("onion") || n.includes("shallot") || n.includes("scallion")) && !n.includes("powder")) return Layers
  if (n.includes("garlic") && !n.includes("powder")) return Clover
  if (n.includes("ginger") && !n.includes("powder")) return Leaf
  if (
    (n.includes("chili") || n.includes("chilli") || n.includes("jalapeno") || n.includes("habanero")) &&
    !n.includes("powder")
  ) {
    return Flame
  }
  if (n.includes("bell pepper") || n.includes("capsicum")) return Salad
  if (n.includes("pepper") && !n.includes("peppercorn")) return Salad

  if (n.includes("spinach") || n.includes("lettuce") || n.includes("kale") || n.includes("arugula") || n.includes("rocket")) {
    return LeafyGreen
  }
  if (n.includes("carrot")) return Carrot
  if (n.includes("broccoli") || n.includes("cauliflower") || n.includes("cabbage")) return Sprout
  if (n.includes("cucumber") || n.includes("zucchini") || n.includes("eggplant") || n.includes("aubergine")) return Salad
  if (n.includes("potato")) return CircleDot
  if (n.includes("corn") || n.includes("maize")) return Wheat
  if (n.includes("pea") && !n.includes("peanut")) return Bean
  if (n.includes("mushroom")) return TreeDeciduous

  return Package
}

/** Shared classes: theme green, ~20px, consistent stroke. */
export const INGREDIENT_ICON_CLASS = "h-5 w-5 shrink-0 text-[#4F6B1F]"
