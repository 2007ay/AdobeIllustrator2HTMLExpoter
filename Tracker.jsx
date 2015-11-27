function tracer(projectPath) {
    this.projectPath = projectPath;
    createFolder(this.projectPath);
    this.traceFile;
    this.errorFile;
    this.init();
}

tracer.prototype.init = function () {
    this.traceFile = new File(this.projectPath + "/trace.txt");
    this.traceFile.open("w");
    this.traceFile.writeln("###################################..........START............... ##################################");

    this.errorFile = new File(this.projectPath + "/error.txt");
    this.errorFile.open("w");
    this.errorFile.writeln("###################################..........START............... ##################################");
}

//----------------------------------------------------------------------
// Name: Track() 
// //----------------------------------------------------------------------
tracer.prototype.writeTraceLog = function (str) {
    this.traceFile.writeln("### TRACK : " + str);
}

//----------------------------------------------------------------------
// Name: errorLog() 
// Desc: Write an ERROR entry in the error log file
//----------------------------------------------------------------------
tracer.prototype.writeErrorLog = function (str) {
    this.errorFile.writeln("###: " + str);
}


tracer.prototype.save = function () {
    this.traceFile.writeln("###################################..........END............... ##################################");
    this.traceFile.close();

    this.errorFile.writeln("###################################..........END............... ##################################");
    this.errorFile.close();
}
