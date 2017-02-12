/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * Read out the contents of wtfjhd.com 
 * To start with, I'll just support the most current day
 * 
 * Built from the Random Facts skill sample. Its description is below:
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';

var Alexa = require('alexa-sdk');
const cheerio = require('cheerio');
const htmlencode = require('htmlencode');
const request = require('request');

const NewsFeedURL = "https://whatthefuckjusthappenedtoday.com/atom.xml";

// Read the ATOM feed and get the most recent day.
// Call callback function with formatted text string when completed.
// TODO: Cache news feed somewhere.
function getTodaysNews(callback) {
  request(NewsFeedURL, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body, {
        xmlMode: true
      });

      // TODO: support different days. For now, most recent one only.
      var mostRecentDay = $('entry').first().children('content').html();
      var mostRecentDay = htmlencode.htmlDecode(mostRecentDay);
      console.log(mostRecentDay);

      var formatted = formatDay(mostRecentDay);
      callback(formatted);
    }
  });
}

/**
 * Helper function for formatting the ATOM data for a given day.
 *
 * @param data is HTML from the ATOM feed, representing one day's news.
 * This is extremely brittle, but we don't have a more reliable data source.
 * Careful editing, or even re-ordering these lines.
 */
function formatDay(data) {
  var $ = cheerio.load(data);
  
  // First remove all the lists of related articles
  $('ul').remove();

  // Strip out all the links, blockquotes, deleted data, and script tags.
  $('a').remove();
  $('blockquote').remove();
  $('del').remove();
  $('script').remove();
  $('.jekyll-twitter-plugin').remove();
  $('em:only-child').remove(); 

  // Replace #/ with #...
  $('p').each(function(i, el) {
      $(this).text($(this).text().replace('/ ', '... '));
      $(this).text($(this).text().replace('()', ''));
  });

  // Sometimes we end up with more than two blank lines
  var formatted = $.text().replace(/(\n){3,}/g, '\n\n');
  console.log('formatted: ' + formatted);

  return formatted;
}

// TODO: Put the other languages back for help text and the like.
var languageStrings = {
    'en-US': {
        translation: {
            SKILL_NAME: 'What The F Just Happened Today?',
            SPOKEN_NEWS_INTRO: "Here's what happened, from w t f j h t.com: ",
            SPOKEN_NEWS_OUTRO: " For more daily news roundups, visit w t f j h t.com.",
            IN_APP_NEWS_INTRO: "Here's what happened, from wtfjht.com: ",
            IN_APP_NEWS_OUTRO: " For more daily news roundups, visit wtfjht.com.",
            HELP_MESSAGE: 'You can say today, or, you can say exit... What can I help you with?',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
        },
    },
};

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetNews');
    },
    'GetNewsIntent': function () {
        this.emit('GetNews');
    },
    'GetNews': function () {
        var alexaHandlerThis = this; // Save context for inside callback.
        // Use this.t() to get corresponding language data
        getTodaysNews(function(formattedNews) {
          // Create speech output
          var speechOutput = alexaHandlerThis.t('SPOKEN_NEWS_INTRO') +
            formattedNews + alexaHandlerThis.t('SPOKEN_NEWS_OUTRO');
          var cardOutput = alexaHandlerThis.t('IN_APP_NEWS_INTRO') +
            formattedNews + alexaHandlerThis.t('IN_APP_NEWS_OUTRO');
          // TODO: internationalize.
          alexaHandlerThis.emit(
            ':tellWithCard', speechOutput, 
            alexaHandlerThis.t('SKILL_NAME'), cardOutput);
        });

        // TODO: If it takes too long to fetch the feed, add something like
        //this.emit(':tell', "Please wait while I find what happened today");
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    //alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
