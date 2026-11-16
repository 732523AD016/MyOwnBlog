
const Category = require("../models/Category");
const categories = [
    "Technology",
    "Education",
    "Lifestyle",
    "Travel",
    "Food",
    "Health",
    "Business",
    "Entertainment",
    "Sports"
];async function seedCategories() {
    try {
        for (const name of categories) {
            await Category.updateOne(
                { name },
                { $setOnInsert: { name } },
                { upsert: true }
            );
        } console.log("Categories seeded successfully");
    } catch (error) {
        console.error("Category seeding failed:", error.message);
    }}
module.exports = seedCategories;
