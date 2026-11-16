const cron = require("node-cron");
const Post = require("../models/Post");
function startScheduledPosts() {
  cron.schedule("* * * * *", async ()=>{
    try {
      const result = await Post.updateMany(
        {
          status: "scheduled",
          publishAt: { $lte: new Date() }
        },
        {
          $set: { status: "published" }
        });
      if (result.modifiedCount > 0) {
        console.log(`${result.modifiedCount} scheduled blog(s) published.`);}
    } catch (error) {
      console.error("Scheduled publishing error:", error.message);
    }
  });

  console.log("Scheduled post checker started.");}
module.exports = startScheduledPosts;