import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
export async function GET(){
 const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});
 const user=await prisma.user.findUnique({where:{id:s.userId},select:{id:true,fullName:true,email:true,role:true}});
 return NextResponse.json({user});
}
