import json


def main(event, context):
    
    
    if not "queryStringParameters" in event or event["queryStringParameters"] == None or not "token" in event["queryStringParameters"] or  not event["queryStringParameters"]["token"] == "ciao" :
        return {
            'statusCode': 403,
            'body': json.dumps({ "response" : "INVALID TOKEN" })
        }

    return {
        'statusCode': 200,
        'body': json.dumps({ 'body': event["body"], 'event': event, 'params' : event["queryStringParameters"] })
    }