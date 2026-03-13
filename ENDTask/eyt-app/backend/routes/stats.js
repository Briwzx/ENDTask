
const router=require("express").Router()
const c=require("../controllers/stats")

router.get("/",c.stats)

module.exports=router
