# api-ai-fb-webhook
API.ai Facebook Integration Webhook

## Abstract
This is a webhook implementation that connects Facebook Messenger Apps (chatbots) to [API.ai](https://api.ai).

_This work was inspired by api.ai's example webhook at https://github.com/api-ai/api-ai-facebook._

## Running locally (for testing purposes)
To run locally, you need:

1. Node v6.0.0
2. 

1. Clone this repository to your machine
2. Install node packages

## Deploy with Docker

You can either deploy with a pre-built image or buid one yourself. To use Hevlia.io's pre-build image do:

```bash
docker run -it --name api_ai_fb_webhook \
           -p <your_desired_port_here>:5000 \
           -e APIAI_ACCESS_TOKEN="Your API.AI client access token" \
           -e FB_PAGE_ACCESS_TOKEN="Your Facebook Page Access Token" \
           -e FB_VERIFY_TOKEN="Your Facebook Verify Token" \
           -e APIAI_LANG="en" \
           helvia/api_ai_fb:latest
```

If you want to build a new container do:

1. Clone this repository to your machine
2. Build with the following `docker build -t api-ai--fb-facebook .` from within the project directory.
3. Run with : `bash
              docker run -it --name api_ai_fb_webhook
                         -p <your_desired_port_here>:5000
                         -e APIAI_ACCESS_TOKEN="API.AI client access token"
                         -e FB_PAGE_ACCESS_TOKEN="Your Facebook Page Access Token"
                         -e FB_VERIFY_TOKEN="your Facebook Verify Token"
                         -e APIAI_LANG="en"
                         helvia/api-ai--fb-facebook:latest`