/** @typedef {{ slug: string, title: string, cuisine: string, mealType: string, required: string[], optional?: string[], isVegetarian?: boolean, prepTime?: string, cookingStyle?: string, time?: string }} SeedDef */

/** @type {Record<string, string>} */
export const CUISINE_IMAGES = {
  Indian: "https://images.unsplash.com/photo-1585937421612-70a008296fbe?w=800&h=600&fit=crop",
  Chinese: "https://images.unsplash.com/photo-1525755662778-989a70411c0f?w=800&h=600&fit=crop",
  American: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop",
  Thai: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=600&fit=crop",
  Italian: "https://images.unsplash.com/photo-1473093295045-cdd455d1ffb8?w=800&h=600&fit=crop",
}

/** 50 curated recipes — 10 per priority cuisine. */
/** @type {SeedDef[]} */
export const SEED_RECIPES = [
  // Indian
  { slug: "indian-masala-scrambled-eggs", title: "Masala Scrambled Eggs", cuisine: "Indian", mealType: "Breakfast", required: ["Eggs", "Onion"], time: "15 minutes", prepTime: "15 Minute Meals" },
  { slug: "indian-vegetable-upma", title: "Vegetable Upma", cuisine: "Indian", mealType: "Breakfast", required: ["Oats", "Onion"], isVegetarian: true, time: "20 minutes" },
  { slug: "indian-chicken-curry", title: "Home-Style Chicken Curry", cuisine: "Indian", mealType: "Dinner", required: ["Chicken", "Tomato", "Onion"], time: "40 minutes" },
  { slug: "indian-paneer-tomato", title: "Paneer Tomato Masala", cuisine: "Indian", mealType: "Dinner", required: ["Paneer", "Tomato"], isVegetarian: true, time: "30 minutes" },
  { slug: "indian-dal-rice", title: "Dal with Rice", cuisine: "Indian", mealType: "Dinner", required: ["Lentils", "Rice"], isVegetarian: true, time: "35 minutes" },
  { slug: "indian-aloo-spinach", title: "Aloo Spinach Sabzi", cuisine: "Indian", mealType: "Lunch", required: ["Potato", "Spinach"], isVegetarian: true, time: "25 minutes" },
  { slug: "indian-egg-fried-rice", title: "Indian Egg Fried Rice", cuisine: "Indian", mealType: "Lunch", required: ["Eggs", "Rice"], time: "20 minutes", prepTime: "15 Minute Meals" },
  { slug: "indian-tomato-rice", title: "Tomato Rice", cuisine: "Indian", mealType: "Lunch", required: ["Tomato", "Rice"], isVegetarian: true, time: "25 minutes" },
  { slug: "indian-chicken-biryani", title: "Quick Chicken Biryani", cuisine: "Indian", mealType: "Dinner", required: ["Chicken", "Rice"], time: "45 minutes" },
  { slug: "indian-mushroom-pulao", title: "Mushroom Pulao", cuisine: "Indian", mealType: "Dinner", required: ["Mushroom", "Rice"], isVegetarian: true, time: "30 minutes" },
  // Chinese
  { slug: "chinese-egg-fried-rice", title: "Classic Egg Fried Rice", cuisine: "Chinese", mealType: "Dinner", required: ["Eggs", "Rice"], time: "20 minutes", prepTime: "15 Minute Meals" },
  { slug: "chinese-chicken-stir-fry", title: "Chicken Capsicum Stir Fry", cuisine: "Chinese", mealType: "Dinner", required: ["Chicken", "Capsicum"], time: "25 minutes" },
  { slug: "chinese-tofu-broccoli", title: "Tofu Broccoli Stir Fry", cuisine: "Chinese", mealType: "Lunch", required: ["Tofu", "Broccoli"], isVegetarian: true, time: "25 minutes" },
  { slug: "chinese-shrimp-fried-rice", title: "Shrimp Fried Rice", cuisine: "Chinese", mealType: "Dinner", required: ["Shrimp", "Rice"], time: "25 minutes" },
  { slug: "chinese-chicken-noodle-soup", title: "Chicken Noodle Soup", cuisine: "Chinese", mealType: "Soup", required: ["Chicken", "Noodles"], time: "30 minutes" },
  { slug: "chinese-veg-fried-rice", title: "Vegetable Fried Rice", cuisine: "Chinese", mealType: "Lunch", required: ["Rice", "Capsicum", "Corn"], isVegetarian: true, time: "20 minutes" },
  { slug: "chinese-chicken-noodles", title: "Chicken Garlic Noodles", cuisine: "Chinese", mealType: "Lunch", required: ["Chicken", "Noodles"], time: "25 minutes" },
  { slug: "chinese-egg-drop-soup", title: "Egg Drop Soup", cuisine: "Chinese", mealType: "Soup", required: ["Eggs"], time: "15 minutes", prepTime: "15 Minute Meals" },
  { slug: "chinese-mushroom-tofu", title: "Mushroom Tofu Stir Fry", cuisine: "Chinese", mealType: "Dinner", required: ["Mushroom", "Tofu"], isVegetarian: true, time: "25 minutes" },
  { slug: "chinese-tomato-egg", title: "Tomato Egg Stir Fry", cuisine: "Chinese", mealType: "Lunch", required: ["Tomato", "Eggs"], time: "20 minutes" },
  // American
  { slug: "american-scrambled-eggs-toast", title: "Scrambled Eggs on Toast", cuisine: "American", mealType: "Breakfast", required: ["Eggs", "Bread"], time: "15 minutes", prepTime: "15 Minute Meals" },
  { slug: "american-chicken-pasta", title: "Chicken Pasta Skillet", cuisine: "American", mealType: "Dinner", required: ["Chicken", "Pasta"], time: "30 minutes" },
  { slug: "american-pasta-salad", title: "Fresh Pasta Salad", cuisine: "American", mealType: "Lunch", required: ["Pasta", "Tomato"], isVegetarian: true, time: "20 minutes" },
  { slug: "american-chicken-rice-bowl", title: "Chicken Rice Bowl", cuisine: "American", mealType: "Dinner", required: ["Chicken", "Rice"], time: "30 minutes" },
  { slug: "american-oatmeal-bowl", title: "Warm Oatmeal Bowl", cuisine: "American", mealType: "Breakfast", required: ["Oats", "Milk"], isVegetarian: true, time: "15 minutes" },
  { slug: "american-cheese-sandwich", title: "Grilled Cheese Sandwich", cuisine: "American", mealType: "Lunch", required: ["Cheese", "Bread"], isVegetarian: true, time: "15 minutes" },
  { slug: "american-shrimp-pasta", title: "Shrimp Pasta", cuisine: "American", mealType: "Dinner", required: ["Shrimp", "Pasta"], time: "30 minutes" },
  { slug: "american-veggie-omelette", title: "Veggie Omelette", cuisine: "American", mealType: "Breakfast", required: ["Eggs", "Spinach", "Capsicum"], time: "20 minutes" },
  { slug: "american-chicken-soup", title: "Chicken Vegetable Soup", cuisine: "American", mealType: "Soup", required: ["Chicken", "Carrot", "Onion"], time: "35 minutes" },
  { slug: "american-corn-chowder", title: "Corn Chowder", cuisine: "American", mealType: "Soup", required: ["Corn", "Milk"], isVegetarian: true, time: "30 minutes" },
  // Thai
  { slug: "thai-basil-chicken", title: "Thai Basil Chicken", cuisine: "Thai", mealType: "Dinner", required: ["Chicken", "Capsicum", "Rice"], time: "30 minutes" },
  { slug: "thai-shrimp-stir-fry", title: "Shrimp Stir Fry", cuisine: "Thai", mealType: "Dinner", required: ["Shrimp", "Capsicum"], time: "25 minutes" },
  { slug: "thai-tofu-rice", title: "Tofu Rice Bowl", cuisine: "Thai", mealType: "Dinner", required: ["Tofu", "Rice"], isVegetarian: true, time: "25 minutes" },
  { slug: "thai-egg-fried-rice", title: "Thai Egg Fried Rice", cuisine: "Thai", mealType: "Lunch", required: ["Eggs", "Rice"], time: "20 minutes" },
  { slug: "thai-chicken-noodles", title: "Thai Chicken Noodles", cuisine: "Thai", mealType: "Lunch", required: ["Chicken", "Noodles"], time: "30 minutes" },
  { slug: "thai-tofu-noodles", title: "Tofu Peanut Noodles", cuisine: "Thai", mealType: "Dinner", required: ["Noodles", "Tofu"], isVegetarian: true, time: "25 minutes" },
  { slug: "thai-mushroom-rice", title: "Mushroom Jasmine Rice", cuisine: "Thai", mealType: "Lunch", required: ["Mushroom", "Rice"], isVegetarian: true, time: "25 minutes" },
  { slug: "thai-tomato-soup", title: "Spicy Tomato Soup", cuisine: "Thai", mealType: "Soup", required: ["Tomato"], isVegetarian: true, time: "20 minutes" },
  { slug: "thai-shrimp-rice", title: "Shrimp Lime Rice", cuisine: "Thai", mealType: "Dinner", required: ["Shrimp", "Rice"], time: "30 minutes" },
  { slug: "thai-chicken-corn-soup", title: "Chicken Corn Soup", cuisine: "Thai", mealType: "Soup", required: ["Chicken", "Corn"], time: "30 minutes" },
  // Italian
  { slug: "italian-tomato-pasta", title: "Tomato Basil Pasta", cuisine: "Italian", mealType: "Dinner", required: ["Pasta", "Tomato"], isVegetarian: true, time: "25 minutes" },
  { slug: "italian-mushroom-pasta", title: "Mushroom Pasta", cuisine: "Italian", mealType: "Lunch", required: ["Pasta", "Mushroom"], isVegetarian: true, time: "25 minutes" },
  { slug: "italian-chicken-pasta", title: "Chicken Pasta Bake", cuisine: "Italian", mealType: "Dinner", required: ["Chicken", "Pasta", "Cheese"], time: "40 minutes" },
  { slug: "italian-caprese-salad", title: "Caprese Salad", cuisine: "Italian", mealType: "Salad", required: ["Tomato", "Cheese"], isVegetarian: true, time: "15 minutes" },
  { slug: "italian-spinach-pasta", title: "Spinach Garlic Pasta", cuisine: "Italian", mealType: "Lunch", required: ["Pasta", "Spinach"], isVegetarian: true, time: "25 minutes" },
  { slug: "italian-egg-frittata", title: "Cheese Egg Frittata", cuisine: "Italian", mealType: "Breakfast", required: ["Eggs", "Cheese"], isVegetarian: true, time: "20 minutes" },
  { slug: "italian-minestrone", title: "Minestrone Soup", cuisine: "Italian", mealType: "Soup", required: ["Tomato", "Beans", "Carrot"], isVegetarian: true, time: "35 minutes" },
  { slug: "italian-chicken-risotto", title: "Chicken Risotto Style", cuisine: "Italian", mealType: "Dinner", required: ["Chicken", "Rice", "Cheese"], time: "40 minutes" },
  { slug: "italian-eggs-bread", title: "Eggs and Garlic Bread", cuisine: "Italian", mealType: "Breakfast", required: ["Eggs", "Bread"], time: "20 minutes" },
  { slug: "italian-shrimp-pasta", title: "Shrimp Pasta", cuisine: "Italian", mealType: "Dinner", required: ["Shrimp", "Pasta"], time: "30 minutes" },
]
