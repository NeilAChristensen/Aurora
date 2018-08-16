var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// NAC 2018 

const request = require('request');
const readline = require('readline');

// Set to minimum threshold of visibility i.e. useful data
var filterValue = 4;
var lineCount = 0;
var charCount;

// Conversion values pulled from Aurora Specification Tabular Values aurora-nowcast-map.txt
const latDegValue = 0.3515625;
const longDegValue = 0.32846715;


function init() {
    parseFile('http://nacinteractive.com/demo/Aurora/aurora-short-text.txt');
}

function parseFile(url) {
    //const lineBuffer = [];

    const rl = readline.createInterface({
        input: request.get(url)
    });

    rl
        .on('line', (line) => {
            lineCount++;
            // strip out comments or parse the line
            if (line.indexOf('#') == -1) {
                //console.log('Line: ' + lineCount + ' ' + line);
                // parse the line
                parseLine(line);
            }
        })
        .on('close', () => {
        });
}

function parseLine(line) {

    var longConverted;
    var latConverted;
    charCount = 0;

    // Using split and join with known whitespace is faster than Regex
    // Removes all whitespaces from string
    var nospaceLine = line.split(' ').join('');

    for (let value of nospaceLine) {
        if (value >= filterValue) {
            charCount++;
            // Longitude
            longConverted = value * longDegValue * charCount;
            // Latitude
            latConverted = lineCount * latDegValue;
            //***** MAY NEED ROUNDING FOR PERFORMANCE *****
            //console.log("Long & Lat: " + latConverted + ' ' + longConverted);
            addCoordinates(longConverted, latConverted);
        }
    }
}

function addCoordinates(lon, lat) {
    // Create object for GeoJSON insertion
    // ***** MAY NEED TO BREAK THIS OUT DEPENDING ON GeoJSON FORMAT*****
    var obj = {}
    var key = 'features';
    obj[key] = [];


    var features = {
        geometry: {
            coordinates: [lon, lat]
        }
    }

    obj[key].push(features);

    var output = JSON.stringify(obj);
    console.log('JSON: ' + output);
}

init();