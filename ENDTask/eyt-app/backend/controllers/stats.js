
const Task=require("../models/Task")

exports.stats=async(req,res)=>{
 const total=await Task.countDocuments()
 const completed=await Task.countDocuments({status:"completed"})
 const pending=await Task.countDocuments({status:"pending"})
 const in_progress=await Task.countDocuments({status:"in_progress"})

 const productivity= total ? Math.round((completed/total)*100):0

 res.json({
   total,
   completed,
   pending,
   in_progress,
   productivity
 })
}
