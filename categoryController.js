const Category = require("../models/Category");
const makeSlug = require("../utils/makeSlug");
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });

        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get categories"
        });}}
const addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
 if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        } const slug = makeSlug(name);
 const existingCategory = await Category.findOne({
            $or: [
                { name: name.trim() },
                { slug }
            ]
        });
if (existingCategory) {
            return res.status(400).json({
                message: "Category already exists"
            });
        } const category = await Category.create({
            name: name.trim(),
            slug,
            description
        });

        res.status(201).json({
            message: "Category added successfully",
            category
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to add category"  });
    }
};const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
 const category = await Category.findById(req.params.id);
 if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }  if (name && name.trim()) {
            const slug = makeSlug(name);

            const existingCategory = await Category.findOne({
                slug,
                _id: { $ne: category._id }
            });

            if (existingCategory) {
                return res.status(400).json({
                    message: "Category already exists"
                });
            }category.name = name.trim();
            category.slug = slug;}
        if (description !== undefined) {
            category.description = description;}
        await category.save();

        res.status(200).json({
            message: "Category updated successfully",
            category
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update category"
        });}
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(
            req.params.id
        );

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });}
        res.status(200).json({
            message: "Category deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete category"
        });
    }};
module.exports = {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory
};