const Tag = require("../models/Tag");
const makeSlug = require("../utils/makeSlug");
const getTags = async (req, res) => {
    try {
        const tags = await Tag.find().sort({ name: 1 });
 res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get tags"
        });}};
const addTag = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Tag name is required"
            });}
        const slug = makeSlug(name);

        const existingTag = await Tag.findOne({
            $or: [
                { name: name.trim() },
                { slug }
            ]
        });
        if (existingTag) {
            return res.status(400).json({
                message: "Tag already exists"
            });}
        const tag = await Tag.create({
            name: name.trim(),
            slug
        });

        res.status(201).json({
            message: "Tag added successfully",
            tag
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to add tag"
        });
    }
};

const deleteTag = async (req, res) => {
    try {
        const tag = await Tag.findByIdAndDelete(req.params.id);

        if (!tag) {
            return res.status(404).json({
                message: "Tag not found"
            });
        }

        res.status(200).json({
            message: "Tag deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete tag"
        });
    }
};

module.exports = {
    getTags,
    addTag,
    deleteTag
};