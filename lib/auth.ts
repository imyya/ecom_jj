import "server-only";
import { cache } from "react";
import { getSession } from "./session";
import prisma from "./prisma";
import { AdminRole } from "@/generated/prisma";
import { redirect } from "next/navigation";

export const getCurrentAdmin = cache(async()=>{
    const session = await getSession()
    if(!session) return null

    const admin = await prisma.admin.findUnique({
        where:{id: session.adminId},
        select: { id: true, name: true, email: true, role: true, isActive: true },
        
    })

    if(!admin || !admin.isActive) return null

    return admin
})

export async function requireAdmin(allowedRoles?: AdminRole[])
{
    const admin = await getCurrentAdmin()
    if(!admin) redirect("/login")
    
    if(allowedRoles && !allowedRoles.includes(admin.role)) throw new Error("Vous n'avez pas les droits pour cette action")

    return admin
}