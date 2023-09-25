import type { NextApiRequest, NextApiResponse } from 'next'


type ExampleData = {
  id: string
  number: number
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExampleData>
) {

  const randomExampleData = {
    id: Math.random().toString(36).substring(7),
    number: Math.floor(Math.random() * 100),
  }

  res.status(200).json(randomExampleData)
}