/* jshint node: true */
'use strict';

const apiai = require('apiai');
const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('node-uuid');
const request = require('request');
const JSONbigint = require('json-bigint');
const fbClient = require('./fb_client');
const apiaiClient = require('./apiai_client');

const WEBSERVER_PORT = (process.env.PORT || 5000);
const APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_TOKEN;
const APIAI_LANG = process.env.APIAI_LANG || 'en';
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

// Create apiai service
const apiAiService = apiai(APIAI_ACCESS_TOKEN, {language: APIAI_LANG, requestSource: "fb"});
const sessionIds = new Map();

/**
 * Process an incoming event from facebook
 *
 * @param sender The ID of the user messaging with Maia.
 */
function processFacebookEvent(event) {

    // Get sender id
    var sender = event.sender.id.toString();

    if (event.message && event.message.text) {
        var text = event.message.text;

        // Store a new session for this sender
        if (!sessionIds.has(sender)) {
            sessionIds.set(sender, uuid.v1());
        }

        console.log("Got text from Facebook: ", text);

        fbClient.userInfoRequest(sender)
            .then(userInfoStr=> {
                // Initialize userInto
                let userInfo = {first_name: "friend"};
                try {
                    var userInfo = JSON.parse(userInfoStr);
                } catch (err) {
                    console.error("Could not parse userInfoStr: %s", userInfoStr)
                }
                let apiaiRequest = apiAiService.textRequest(text,
                    {
                        sessionId: sessionIds.get(sender),
                        contexts: [
                            {
                                name: "generic",
                                parameters: {
                                    facebook_user: userInfo.first_name
                                }
                            }
                        ]
                    });

                // Handle response
                apiaiRequest.on('response', response => {
                    apiaiClient.handleApiAiResponse(sender, response);
                });
                apiaiRequest.on('error', error => console.error(error));
                apiaiRequest.end();

            }).catch(err => {
            console.error(err);
        });
    }
}


// Create Express Server
const app = express();

// Enable json parsing
app.use(bodyParser.text({type: 'application/json'}));

// Main webhook endpoint configuration
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] == FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);

        setTimeout(function () {
            fbClient.subscribeRequest();
        }, 3000);
    } else {
        res.send('Error, wrong validation token');
    }
});

app.post('/webhook/', function (req, res) {
    try {
        // Load data
        var data = JSONbigint.parse(req.body);

        for (var i = 0; i < data.entry[0].messaging.length; i++) {
            var event = data.entry[0].messaging[i];
            processFacebookEvent(event);
        }
        return res.status(200).json({
            status: "ok"
        });
    } catch (err) {
        return res.status(400).json({
            status: "error",
            error: err
        });
    }

});

// For testing purposes (testing api.ai-like callback posts)
app.post('/test-apiai-callback/', function (req, res) {
    try {
        // Load data
        var data = JSONbigint.parse(req.body);

        // Forward data to Api.AI
        apiaiClient.handleApiAiResponse('1217505768324329', data);

        return res.status(200).json({
            status: "ok"
        });
    } catch (err) {
        return res.status(400).json({
            status: "error",
            error: err
        });
    }

});

// Start web server
app.listen(WEBSERVER_PORT, function () {
    console.log('Rest service ready on port ' + WEBSERVER_PORT);
});

// Subscribe
fbClient.subscribeRequest();