//const Discord = require('discord.js');

const { Client, Attachment } = require('discord.js');

const client = new Client();
const GphApiClient = require('giphy-js-sdk-core');
giphyClient = GphApiClient(process.env.gifToken);

class Status {
  constructor(status) {
    this._status = status;
  }

  status() {
    return this._status;
  }

  set(newStatus) {
    this._status = newStatus; 
  }

  strStatus() {
    if(this._status === true){
        return 'Online';
    }
    else{
        return 'Offline';
    }
  }
}

class Mode {
  constructor(mode) {
    this._mode = mode;
  }

  mode() {
    return this._mode;
  }

  set(newMode) {
    this._mode = newMode; 
  }

  strMode() {
    if(this._mode === true){
        return 'Phrase Mode';
    }
    else{
        return 'Keyword Mode';
    }
  }
}

let on = new Status(true);
var messagesToIgnore = 0;
var lowFrequencyThresh = 3;
var highFrequencyThresh = 15;
let phraseMode = new Mode(false);
var messageMinSize = 2;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content.substring(0,7) === '!gifbot'){
        var args = msg.content.substring(7).split(' ');
        var cmd = args[1];
        switch(cmd) {
            case 'start':
                on.set(true);
                msg.channel.send('GifBot Online...');
                break;
            case 'stop':
                on.set(false);
                msg.channel.send('GifBot Offline...');
                break;
            case 'freqSetHigh':
                if(Number.isInteger(args[2])){
                    if(args[2] > 0 && args[2] >= lowFrequencyThresh){
                        highFrequencyThresh = args[2];
                        msg.channel.send('High Frequency Threshold: ' + highFrequencyThresh);  
                    }
                    else{
                        msg.channel.send('Number: ' + args[2] + ' must be higher than low: ' + lowFrequencyThresh);
                    }
                }
                else{
                    msg.channel.send(args[2] + ' isn\'t a number');
                }
                break;
            case 'freqSetLow':
                if(Number.isInteger(args[2])){
                    if(args[2] > 0 && args[2] <= highFrequencyThresh){
                        lowFrequencyThresh = args[2];
                        msg.channel.send('Low Frequency Threshold: ' + lowFrequencyThresh);   
                    }
                    else{
                        msg.channel.send('Number: ' + args[2] + ' must be lower than high: ' + highFrequencyThresh);
                    }
                }
                else{
                    msg.channel.send(args[2] + ' isn\'t a number');
                }
                break;
            case 'changeMode':
                phraseMode.set(!phraseMode.mode());
                msg.channel.send('Mode changed to: ' + phraseMode.strMode());
                break;
            case 'reset':
                messagesToIgnore = 0;
                msg.channel.send('Next message will be sent in : ' + messagesToIgnore + ' messages...');
                break;
            case 'help':
                msg.channel.send('GifBot Commands:\n' + 
                                 '\n\tstart: starts GifBot' +
                                 '\n\tstop: stops GifBot' +
                                 '\n\tfreqSetHigh: sets upper frequency threshold' +
                                 '\n\tfreqSetLow: sets lower frequency threshold' +
                                 '\n\tchangeMode: changes gif search' +
                                 '\n\treset: resets message countdown');
                break;
            default:
                msg.channel.send('GifBot Status: ' + on.strStatus()
                                + '\nHigh Frequency Threshold: ' + highFrequencyThresh
                                + '\nLow Frequency Threshold: ' + lowFrequencyThresh
                                + '\nMode: ' + phraseMode.strMode()
                                + '\n\nNext message will be sent in : ' + messagesToIgnore + ' messages...');
                break;
        }
    }
    else if(on.status()){
        if(messagesToIgnore > 0){
            messagesToIgnore--;
        }
        if(msg.author.username != 'GifBot' && messagesToIgnore < 1){
            messagesToIgnore = Math.floor((Math.random() * (highFrequencyThresh - lowFrequencyThresh)) + lowFrequencyThresh);

            var keyword = '';
            var args = msg.content.split(' ');
            if(phraseMode.mode()){
                keyword = args.join('+')
            }
            else{
                var potentialKeywords = [];
                for(i = 0; i < args.length; i++){
                    if(args[i].length >= messageMinSize){ 
                        potentialKeywords.push(args[i]);
                    }
                }

                var keywordIndex = Math.floor(Math.random() * potentialKeywords.length);
                keyword = potentialKeywords[keywordIndex];
            }
//            msg.channel.send('This is the keyword: ' + keyword);
            giphyClient.search('gifs', {"q": keyword,
                                       "limit": 6,
                                       "rating": "pg",
                                       "offset": 5 })
              .then((response) => {
                var randomIndex = Math.floor(Math.random() * response.data.length);
                const attachment = new Attachment(response.data[randomIndex].images.original.url);
                msg.channel.send(attachment);
//                msg.channel.send(response.data[randomIndex].title);
              })
              .catch((err) => {
//                console.log('nothing found: ' + err);
              })
        } 
    } 
});

client.login(process.env.token);