import json
import boto3


def error_return(statusCode, message):
  return {
      'statusCode': statusCode,
      'body': json.dumps({
          'error_message': message
      })
  }


def lambda_handler(event, context):
  params = event.get('queryStringParameters') or event

  username = params.get('user')
  foldername = params.get('folder')
  imagefilename = params.get('image')

  if not username or not foldername or not imagefilename:
    return error_return(400, "Params 'user', folder', 'image' must be specified.")

  s3 = boto3.client('s3')
  s3bucket = 'dendritespinefinder'
  s3key = "userdata/{}/{}/captures/{}".format(username, foldername, imagefilename)

  return error_return(200, s3key)

  try:
    response = s3.get_object(Bucket=s3bucket, Key=s3key)
  except:
    return error_return(400, "Image {} not found in folder {}.".format(imagefilename, foldername))

  # TODO implement
  return {
      'statusCode': 200,
      'body': json.dumps(list(response.keys()))
  }
