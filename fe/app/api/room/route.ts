import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
      const body = await req.json();

      const response = await fetch(`${process.env.EXPRESS_API_URL}/api/v1/room/new`, {
            method: 'POST',
            headers: {
                  'Content-Type': 'application/json',
                  Authorization: req.headers.get('Authorization') ?? '',
            },
            body: JSON.stringify(body),
      });

      const data = await response.json();
      return Response.json(data);
}