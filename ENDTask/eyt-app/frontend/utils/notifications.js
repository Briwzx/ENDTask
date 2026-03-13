
export function buildNotifications(tasks){

 const today=new Date()

 const vencidas=[]
 const porVencer=[]

 tasks.forEach(t=>{
  const diff=(new Date(t.dueDate)-today)/(1000*60*60*24)

  if(diff<0) vencidas.push(t)
  else if(diff<=3) porVencer.push(t)
 })

 return {vencidas,porVencer}
}
