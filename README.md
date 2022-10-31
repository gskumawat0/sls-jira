# SLS-JIRA

User daily task management api with serverless

## Prerequistic

-   NodeJs 16.17.0+
-   NPM8.15.0+

## How to Install

-   let's start by cloning this repo using `git clone git@github.com:gskumawat0/sls-jira.git`
-   install `serverless` module using `npm i -g serverless`
-   install project dependencies using `npm i`
-   install aws-cli or upgrade to latest version. https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
-   after installing aws-cli, create a `sls-jira` profile (configured at `provider.profile` in `serverless.yml` file ) by `aws configure --profile sls-jira`
-   install dynamodb on your system by `sls dynamodb install`. you can uninstall dynamodb by `sls dynamodb remove` if needed.
-   now start dynamodb local server using `sls dynamodb start`
-   start the development api server with `sls offline` and play around with this project

### Deployment

```
$ serverless deploy
```

After deploying, you should see output similar to:

```bash
Deploying aws-node-http-api-project to stage dev (us-east-1)

✔ Service deployed to stack aws-node-http-api-project-dev (152s)

endpoint: GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/
functions:
  hello: aws-node-http-api-project-dev-hello (1.9 kB)
```

you can delete all of your resources with `sls remove`.  
for more help, please run `sls --help`

### Invocation

After successful deployment, you can call the created application via HTTP:

```bash
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/
```

Which should result in response similar to the following (removed `input` content for brevity):

```json
{
  "message": "Go Serverless v3.0! Your function executed successfully!",
  "input": {
    ...
  }
}
```
