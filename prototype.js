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

const Alexa = require('alexa-sdk');
const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).
const NewsFeedURL = "https://whatthefuckjusthappenedtoday.com/atom.xml";
var https = require('https');

/** 
 * Pull the ATOM news feed in
 * TODO: Does LAMBDA support caching? This response won't change often.
 */
function getNewestData(callback) {
    return https.get(NewsFeedURL, function(response) {
        // Continuously update stream with data
        var rawAtomData = '';
        response.on('data', function(d) {
            rawAtomData += d;
        });
        response.on('end', function() {
            // Data reception is done, parse out the latest day from ATOM feed
            var parsedAtomDay = getLatestDayFromAtom(rawAtomData);
            // Extract the meaningful parts from that day to tell the user
            var toSpeak = getSpokenDataForDay(parsedAtomDay);
            callback(parsedAtomDay);
        });
    });
}

/**
 * Given a raw string of an ATOM feed, return the first <entry>.
 */
function getLatestDayFromAtom(rawAtomData) {
    return "";
}

var languageStrings = {
    'en-US': {
        translation: {
            FACTS: [
                "1/ **Court refuses to reinstate travel ban**, delivering the latest and most stinging judicial rebuke to his effort to make good on a campaign promise and tighten the standards for entry into the United States. The ruling was focused on the narrow question of whether the travel ban should be blocked while courts consider its lawfulness. The decision is likely to be appealed to the Supreme Court. 2/ **Conway may have broken key ethics rule by touting Ivanka Trump’s products**. Federal employees are banned from using their public office to endorse products. “I’m going to give it a free commercial here,” Conway said. “Go buy it today.” 3/ **Spicer misspoke on attack, meant Orlando, not Atlanta**. Three times in one week, Spicer alluded to a terror attack in Atlanta by someone from overseas. Spicer eventually admitted he misspoke. Oops. 4/ **Sessions sworn in as attorney general while Trump signed three executive actions aimed at bolstering law enforcement.** Sessions pledged to attack a crime problem that he described as \"a dangerous permanent trend that has places the health and safety of the American people at risk.\" Although murder jumped by 11% in 2015, the biggest one-year increase in more than 40 years, the overall rate remains the lowest in decades. 5/ **Trump attacks McCain for questioning success of deadly Yemen raid**. McCain initially referred to the raid as “a failure” but later dialed back his criticism, saying that some objectives were fulfilled in the mission but that he would “not describe any operation that results in the loss of American life as a success.” 6/ **Republican Senator admits GOP health-care plan has to remain secret because it will be unpopular**. Senator Mike Lee insists that Republicans repeal Obamacare first, before they decide on an alternative. And his reason is straightforward: If people saw the Republican alternative, they might not like it! ([New York Magazine](http://nymag.com/daily/intelligencer/2017/02/republican-admits-why-gop-health-plan-must-remain-secret.html){:target=\"_blank\"}) 7/ **Gun rights advocates prepare push for more guns in schools**. Attempts to allow more guns in K-12 schools were defeated in 15 states last year but second amendment campaigners are only encouraged by Trump’s election.8/ **Trump lashes out at Blumenthal for relaying Gorsuch’s “disheartening” comments**. The president resurfaces Senator Blumenthal's military record to minimize fallout from Gorsuch's Supreme Court's statements. 9/ **In call with Putin, Trump denounced Obama-era nuclear arms treaty that caps U.S. and Russian deployment of nuclear warheads**. When Putin raised the possibility of extending the 2010 treaty, Trump paused to ask his aides in an aside what the treaty was. The phone call with Putin has added to concerns that Trump is not adequately prepared for discussions with foreign leaders. 10/ **Whatever happened to the Trump-Russia story?** The biggest election-related scandal since Watergate occurred last year, and it has largely disappeared from the political-media landscape of Washington.11/ **Is the anti-Trump “Resistance\" the New Tea Party?** The parallels are striking: a massive grassroots movement, many of its members new to activism, that feeds primarily off fear and reaction."
            ],
            SKILL_NAME: 'American News',
            GET_FACT_MESSAGE: "Here's what happened: ",
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
        // Get a random space fact from the space facts list
        // Use this.t() to get corresponding language data
        const factArr = this.t('FACTS');
        const factIndex = Math.floor(Math.random() * factArr.length);
        const randomFact = factArr[factIndex];

        // Create speech output
        const speechOutput = this.t('GET_FACT_MESSAGE') + randomFact;
        this.emit(':tellWithCard', speechOutput, this.t('SKILL_NAME'), randomFact);
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
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

