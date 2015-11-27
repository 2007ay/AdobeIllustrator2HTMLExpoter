/*
Author :Ashish Yadav.
Date : 31/10/2013
stringsExpoter Exporter for the current opened documents..
 */

#include Utils.jsx
/* 
    this constructor  is called for every adobe illustrator document.
*/

function stringsExpoter(projectPath, fileName, stringFolderName, tracer) {
    this.tracer = tracer;
    this.stringFolderName = stringFolderName;
    this.stringFolderPath = combinePath(projectPath, this.stringFolderName);
    this.fileName = fileName;
    this.createFolder();
}

stringsExpoter.prototype.createFolder = function () {
    createFolder(this.stringFolderPath);
}
