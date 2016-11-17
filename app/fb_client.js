/* jshint node: true */
'use strict';

const request = require('request');
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const misc = require('./misc');
const async = require('async');

/**
 * Sends a text message ensuring that long messages are split
 */
function sendSplitTextMessages(recipientId, messageText, callback) {

    var splitText = misc.splitResponse(messageText);

    async.eachSeries(splitText, (textPart) => {
        sendTextMessage(recipientId, textPart, callback);
    });
}

/**
 * Send a text message using the Send API.
 *
 * @param recipientId The ID of the user messaging with Maia.
 * @param messageText The text to sent.
 * @param callback Callback function.
 */
function sendTextMessage(recipientId, messageText, callback) {
    var messageData = {
        recipient: {id: recipientId},
        message: {text: messageText}
    };

    return callSendAPI(messageData, callback);
}

/**
 * Send a generic quickReply question.
 *
 * @param recipientId The ID of the user messaging with Maia.
 * @param question A text question.
 * @param answers An array with the quick replies.
 */
function sendQuickReplyQuestion(recipientId, question, answers) {

    let quick_replies = answers.map((x) => {
        return {
            "content_type": "text",
            "title": x.text,
            "payload": x.payload
        };
    });

    let messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: question || 'Please choose one:',
            quick_replies: quick_replies
        }
    };

    return callSendAPI(messageData);
}

/**
 * Send an image using the Send API.
 *
 * @param recipientId The ID of the user messaging with our bot.
 * @param imageUrl The URL of the image.
 */
function sendImageMessage(recipientId, imageUrl) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url: imageUrl
                }
            }
        }
    };

    callSendAPI(messageData);
}

/**
 * Get user ID from graph API
 *
 * @param userId The ID of the user we want to get information for.
 */
function userInfoRequest(userId) {
    return new Promise((resolve, reject) => {
        request({
                method: 'GET',
                uri: "https://graph.facebook.com/v2.6/" + userId + "?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=" + FB_PAGE_ACCESS_TOKEN
            },
            function (error, response) {
                if (error) {
                    console.error('Error while userInfoRequest: ', error);
                    reject(error);
                } else {
                    console.log('userInfoRequest result: ', response.body);
                    resolve(response.body);
                }
            });
    });
}

/**
 * Subscribe webhook
 */
function doSubscribeRequest() {
    request({
            method: 'POST',
            uri: "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=" + FB_PAGE_ACCESS_TOKEN
        },
        function (error, response, body) {
            if (error) {
                console.error('Error while subscription: ', error);
            } else {
                console.log('Subscription result: ', response.body);
            }
        });
}

/**
 * Send a Card layout using the Send API.
 *
 * @param recipientId The ID of the user messaging with our bot.
 * @param title Title of the Card.
 * @param subtitle Subtitle of the Card.
 * @param imageUrl The URL of the image shown in the card.
 * @param buttons Post-back buttons to print in the card.
 */
function sendCardMessage(recipientId, title, subtitle, imageUrl, buttons) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: title,
                        subtitle: subtitle,
                        image_url: imageUrl,
                        buttons: buttons
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
function callSendAPI(messageData, callback) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: FB_PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: messageData
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }

        if (callback) {
            callback();
        }
    });
}

// Export module functions
module.exports = {
    sendQuickReplyQuestion: sendQuickReplyQuestion,
    subscribeRequest: doSubscribeRequest,
    sendCardMessage: sendCardMessage,
    sendTextMessage: sendTextMessage,
    sendSplitMessages: sendSplitTextMessages,
    sendImageMessage: sendImageMessage,
    userInfoRequest: userInfoRequest
};