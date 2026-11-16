require("dotenv").config();

const mongoose = require("mongoose");

const Category = require("./models/Category");
const Tag = require("./models/Tag");

const makeSlug = require("./utils/makeSlug");

const categories = [
    "Technology",
    "Education",
    "Lifestyle",
    "Travel",
    "Food",
    "Health",
    "Business",
    "Sports",
    "Entertainment"
];

const tags = [
    "Web Development",
    "JavaScript",
    "React",
    "Node.js",
    "MongoDB",
    "Programming",
    "Learning",
    "Travel Tips",
    "Healthy Living",
    "Digital Marketing"
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        for (const name of categories) {
            await Category.findOneAndUpdate(
                { slug: makeSlug(name) },
                {
                    name,
                    slug: makeSlug(name)
                },
                { upsert: true, new: true }
            );
        }

        for (const name of tags) {
            await Tag.findOneAndUpdate(
                { slug: makeSlug(name) },
                {
                    name,
                    slug: makeSlug(name)
                },
                { upsert: true, new: true }
            );
        }

        console.log("Categories and tags added successfully");
    } catch (error) {
        console.log("Seed error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

seedDatabase();