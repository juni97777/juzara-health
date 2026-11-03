import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";
export async function GET() {
 const auth = await requireRoles(["PATIENT","DOCTOR","FACILITY_ADMIN","SUPER_ADMIN"]);
 if (auth.response) return auth.response;
 const articles = await prisma.healthArticle.findMany({ where: { isPublished: true }, orderBy: { publishedAt: "desc" } });
 return NextResponse.json({ articles });
}
