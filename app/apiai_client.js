/* jshint node: true */
'use strict';

const fbClient = require('./fb_client');
const misc = require('./misc');
const async = require('async');

/**
 * Handles API.AI Responses
 *
 * @param sender The ID of the user messaging with Maia.
 * @param response Response from API.AI.
 * @param callback Callback function.
 */
function handleApiAiResponse(sender, response, callback) {

    // Do we have a result?
    if (misc.isDefined(response.result)) {

        // Load messages
        var messages = response.result.fulfillment.messages;

        // Adding delay between responses
        var i = 0;
        async.whilst(
            function () {
                return i <= messages.length - 1;
            },
            function (innerCallback) {
                sendResponse(sender, messages[i], function () {
                    setTimeout(function () {
                        i++;
                        innerCallback();
                    }, 1000);
                })
            }, callback);
    }
}

/**
 * Send a response based on the message type
 *
 * @param sender The ID of the user messaging with Maia.
 * @param message Message to send to API.AI.
 * @param callback Callback function.
 */
function sendResponse(sender, message, callback) {

    switch (message.type) {
        case 0: // message text
            fbClient.sendSplitMessages(sender, message.speech);
            break;
        case 1: // card
            var buttons = [];
            if (misc.isDefined(message.buttons)) {
                async.eachSeries(message.buttons, (button, innerCallback) => {
                    buttons.push({
                        type: "postback",
                        title: button.text,
                        payload: button.payload || button.text
                    });
                    innerCallback();
                });
            }
            fbClient.sendCardMessage(sender, message.title, message.subtitle, message.imageUrl, buttons);
            break;
        case 2: // quick replies
            if (misc.isDefined(message.replies)) {
                var questions = [];
                async.eachSeries(message.replies, (reply, innerCallback) => {
                    questions.push({text: reply, payload: reply});
                    innerCallback();
                });
                fbClient.sendQuickReplyQuestion(sender, message.title, questions);
            }
            break;
        case 3: // image
            if (misc.isDefined(message.imageUrl)) {
                fbClient.sendImageMessage(sender, message.imageUrl);
            }
            break;
    }
    if (callback) {
        callback();
    }
}

// Expoer module functions
module.exports = {
    handleApiAiResponse: handleApiAiResponse
};