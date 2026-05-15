export type FridgeCategory = "Vegetables" | "Fruits" | "Dairy" | "Proteins" | "Pantry" | "Others"

const VEG = new RegExp(
  "\\b(" +
    "tomato|cherry tomato|cucumber|onion|red onion|white onion|shallot|spring onion|scallion|" +
    "capsicum|bell pepper|jalapeno|pepper|potato|sweet potato|carrot|spinach|broccoli|corn|" +
    "garlic|ginger|lettuce|kale|celery|cabbage|napa cabbage|bok choy|cauliflower|zucchini|" +
    "eggplant|aubergine|brinjal|mushroom|shiitake|enoki|oyster mushroom|beans|green beans|" +
    "peas|snow peas|edamame|asparagus|radish|daikon|beet|beetroot|okra|pumpkin|squash|" +
    "avocado|artichoke|leek|olive|pickles|kimchi|seaweed|nori|wakame|bamboo shoot|lotus root" +
  ")\\b",
  "i"
);

const FRUIT = new RegExp(
  "\\b(" +
    "apple|banana|orange|mandarin|grape|mango|pineapple|papaya|melon|watermelon|kiwi|" +
    "pear|plum|peach|apricot|berry|strawberry|blueberry|raspberry|blackberry|pomegranate|" +
    "coconut|fig|dates|lime|lemon|grapefruit|passion fruit|dragon fruit|lychee" +
  ")\\b",
  "i"
);

const DAIRY = new RegExp(
  "\\b(" +
    "milk|whole milk|skim milk|almond milk|soy milk|oat milk|coconut milk|" +
    "cheese|mozzarella|cheddar|parmesan|ricotta|cream cheese|feta|goat cheese|" +
    "yogurt|greek yogurt|yoghurt|curd|cream|heavy cream|sour cream|butter|ghee|" +
    "paneer|labneh|kefir" +
  ")\\b",
  "i"
);

const PROTEIN = new RegExp(
  "\\b(" +
    "egg|eggs|chicken|beef|steak|pork|bacon|ham|sausage|turkey|duck|lamb|mutton|" +
    "fish|salmon|tuna|cod|tilapia|shrimp|prawn|crab|lobster|scallop|anchovy|" +
    "tofu|tempeh|seitan|lentil|lentils|dal|dhal|toor dal|moong dal|masoor dal|" +
    "urad dal|chana dal|chickpea|garbanzo|rajma|kidney bean|black bean|white bean|" +
    "pinto bean|soybean|green gram|black gram|peas|quinoa|edamame|sprouts|peanut|" +
    "almond|cashew|walnut|pistachio|hazelnut|protein" +
  ")\\b",
  "i"
);

const PANTRY = new RegExp(
  "\\b(" +
    "rice|basmati rice|jasmine rice|sushi rice|brown rice|pasta|spaghetti|macaroni|" +
    "penne|fettuccine|noodle|noodles|ramen|udon|soba|rice noodle|glass noodle|" +
    "bread|bagel|bun|tortilla|wrap|pita|naan|flour|all purpose flour|wheat flour|" +
    "bread flour|rice flour|corn flour|oats|cereal|granola|oil|olive oil|sesame oil|" +
    "vegetable oil|avocado oil|vinegar|rice vinegar|balsamic vinegar|soy sauce|tamari|" +
    "fish sauce|oyster sauce|hoisin|gochujang|miso|ketchup|mustard|mayonnaise|" +
    "hot sauce|salsa|salt|paprika|turmeric|cumin|coriander|oregano|thyme|basil|" +
    "parsley|rosemary|cinnamon|nutmeg|clove|cardamom|curry powder|garam masala|" +
    "sesame seed|chia seed|flax seed|sugar|brown sugar|honey|maple syrup|stock|" +
    "broth|breadcrumbs" +
  ")\\b",
  "i"
);

export function categorizeIngredient(name: string): FridgeCategory {
  const n = name.trim()
  if (!n) return "Others"
  if (VEG.test(n)) return "Vegetables"
  if (FRUIT.test(n)) return "Fruits"
  if (DAIRY.test(n)) return "Dairy"
  if (PROTEIN.test(n)) return "Proteins"
  if (PANTRY.test(n)) return "Pantry"
  return "Others"
}
