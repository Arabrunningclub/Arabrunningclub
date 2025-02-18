import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const response = await fetch("https://sheetdb.io/api/v1/0mffqh440e6we", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch events")
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error("Error fetching events:", error)
    res.status(500).json({
      message: "Failed to fetch events",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

