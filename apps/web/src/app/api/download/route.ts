import { NextResponse } from "next/server"
import JSZip from "jszip"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const payloadStr = formData.get('payload') as string
    if (!payloadStr) return new NextResponse("Missing payload", { status: 400 })
    
    const { files, title } = JSON.parse(payloadStr)

    if (!files || !Array.isArray(files)) {
      return new NextResponse("Invalid files payload", { status: 400 })
    }

    const zip = new JSZip()

    files.forEach((file: any) => {
      if (file.path && file.content) {
        zip.file(file.path, file.content)
      }
    })

    const buffer = await zip.generateAsync({ type: "nodebuffer" })

    const fileName = title ? `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-project.zip` : "black-ai-project.zip"

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
      }
    })
  } catch (error: any) {
    console.error("ZIP Generation Error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
