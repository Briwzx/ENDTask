
export async function getStats(){
 const res = await fetch("http://localhost:5000/api/stats")
 return await res.json()
}

export async function getNotifications(){
 const res = await fetch("http://localhost:5000/api/tasks/notifications")
 return await res.json()
}
