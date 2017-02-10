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

const feedr = require('feedr').create();
const cheerio = require('cheerio');

const NewsFeedURL = "https://whatthefuckjusthappenedtoday.com/atom.xml";

// Read the ATOM feed.
feedr.readFeed(NewsFeedURL, {}, function (err, data, headers) {
    var entries = data.feed.entry;
    var rawMostRecentDay = entries[0].content[0]._;
    //console.log(rawMostRecentDay);
    var formatted = formatDay(rawMostRecentDay);
    console.log(formatted.text());
});

/**
 * data is HTML from the ATOM feed, representing one day's news.
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

  return $;
}

