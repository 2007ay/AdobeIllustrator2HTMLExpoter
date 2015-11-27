/*
Author :Ashish Yadav.
Date : 31/10/2013
String Exporter for the current  all opened documents..
 */

#include Utils.jsx

function fontExpoter(projectPath, fontFolderName, tracer) {
    this.tracer = tracer;
    this.fontFolderName = fontFolderName;
    this.fontFolderPath = combinePath(projectPath, this.fontFolderName);
    this.createFolder();
}

fontExpoter.prototype.createFolder = function () {
    createFolder(this.fontFolderPath);
}
