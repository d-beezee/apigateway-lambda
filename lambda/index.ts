import { APIGatewayProxyResultV2, SQSEvent } from "aws-lambda";

export async function main(event: SQSEvent): Promise<APIGatewayProxyResultV2> {
  const messages = event.Records.map((record) => {
    const body = JSON.parse(record.body) as {
      Subject: string;
      Message: string;
    };

    return { subject: body.Subject, message: body.Message };
  });

  // put the messages into the bucket from this lambda
  return {
    body: JSON.stringify({ messages }),
    statusCode: 200,
  };
}
