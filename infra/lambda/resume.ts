import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

// The database client is created once and reused between requests.
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}))

// These two values are set by CDK (see infra-stack.ts).
const TABLE_NAME = process.env.TABLE_NAME ?? ''
const WRITE_KEY = process.env.WRITE_KEY ?? ''

function reply(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  const method = event.requestContext.http.method

  // GET /api/resume  ->  return the saved resume
  if (method === 'GET') {
    const result = await db.send(
      new GetCommand({ TableName: TABLE_NAME, Key: { pk: 'resume' } }),
    )
    if (!result.Item) return reply(404, { message: 'No resume saved yet' })
    return reply(200, result.Item.data)
  }

  // PUT /api/resume  ->  save the resume (needs the secret write key)
  if (method === 'PUT') {
    const sentKey = event.headers['x-write-key']
    if (!WRITE_KEY || sentKey !== WRITE_KEY) {
      return reply(401, { message: 'Wrong or missing write key' })
    }

    let data: unknown
    try {
      data = JSON.parse(event.body ?? '')
    } catch {
      return reply(400, { message: 'Body must be valid JSON' })
    }
    const looksValid =
      typeof data === 'object' &&
      data !== null &&
      typeof (data as { fullName?: unknown }).fullName === 'string'
    if (!looksValid) return reply(400, { message: 'This does not look like a resume' })

    await db.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { pk: 'resume', data, updatedAt: new Date().toISOString() },
      }),
    )
    return reply(200, { message: 'Saved' })
  }

  return reply(405, { message: 'Method not allowed' })
}
