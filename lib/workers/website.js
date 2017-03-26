var fs = require('fs');
var path = require('path');
var express = require('express');
var async = require('async');

module.exports = function() {
    var config = JSON.parse(process.env.config);
    var websiteConfig = config.website;

    console.log('ignore, website')
}
