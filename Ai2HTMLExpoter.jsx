#include Utils.jsx;
#include Tracker.jsx;
#include HTMLParser.jsx;
#include JsonParser.jsx;
#include ExportedHeaderConfig.jsx;
#include UniqueIDProvider.jsx;
#include ProgressBar.jsx;
#include ExporterWizardView.jsx;

function Ai2HTMLExpoter() {

    if (app.documents.length === 0 || app.activeDocument.pageItems.length === 0) {
        alert("No  Art Work is availabe to export");
        return;
    }

    this.commonBackground = [];
    this.layerBackground = [];
    this.exporterView;
    this.defaultPath = '';
    this.screenFolderName = "Sections";
    this.uidProvider = new UIDProvider();
    this.defaultPath = this.getWorkSpacePath();
    this.isExported = false;
    this.exportedHeaderConfig = new exportedHeaderConfig();
    var documentStartTime;
    var documentEndTime;
    var selectedLayers = this.exporterView.getSelectedLayers();
    if (this.defaultPath === '' || this.defaultPath === undefined || this.defaultPath === null) {
        alert("Please select workspace/Layer path");
        return;
    } else if (this.getSelectedLayersCount(selectedLayers) === 0) {
        alert("Oops !!!!!! No layers is selected");
        return
    } else if (this.exporterView.status === "canceled") {
        alert("Process is cancelled");
        return;
    }

    this.tracer = new tracer(this.defaultPath);
    this.showProgressBar();
    documentStartTime = new Date();
    //this.getCommonBackGround();
    var index = 0;
    for (var count = 0; count < app.activeDocument.layers.length; count++) {

        if (this.progressBar.processCancelButton()) {
            break;
        }

        var sTime = new Date();
        ++index;
        this.activeDocument = app.activeDocument.layers[count];
        var docName = this.uidProvider.util_getIdFromObject(this.activeDocument);

        if (selectedLayers[this.activeDocument.name] === undefined) {
            continue;
        }
        //        else if (new RegExp(docName, "i").test("background")) {
        //            continue;
        //        }

        if (this.activeDocument.name == '')
            this.activeDocument.name = "Layers_" + index;

        this.activeDocument.width = app.activeDocument.width + "px";
        this.activeDocument.height = app.activeDocument.height + "px";
        this.activeDocument.top = "0px";
        this.activeDocument.left = "0px";
        //this.activeDocument.isDefaultBrackground = true;
        //this.layerBackground = [];
        //this.getBackground(this.activeDocument);

        //        if (this.isBackgroundSelected(selectedLayers)) {
        //            var j = 0;
        //            for (j = 0; j < this.commonBackground.length; j++) {
        //                this.layerBackground.push(this.commonBackground[j]);
        //            }
        //        }
        //
        //        if (this.activeDocument.layerBackground && this.activeDocument.layerBackground.length > 0) {
        //            this.activeDocument.isDefaultBrackground = true;
        //        }

        //this.activeDocument.layerBackground = this.layerBackground
        this.currentDocumentName = docName; //(this.activeDocument.name);
        this.exportedHeaderConfig.setSectionName(this.currentDocumentName);
        this.projectPath = this.buildProjectPath();
        this.jsonParser;
        this.htmlParser;
        this.intilize();
        this.save();
        this.exportedHeaderConfig.buildSectionObject();
        this.isExported = true;
        var eTime = new Date();
        this.logProcessingItemTime(sTime, eTime, this.currentDocumentName);
    }

    this.exportedHeaderConfig.svaeHeaderFile(this.defaultPath);

    this.progressBar.closeProgressBar();

    if (this.isExported)
        alert("Exporting Successfully Completed.");

    documentEndTime = new Date();
    this.logProcessingItemTime(documentStartTime, documentEndTime, this.currentDocumentName);
    this.tracer.save();
}

Ai2HTMLExpoter.prototype.isBackgroundSelected = function (selectedLayers) {
    var isSelected = false;
    var layerName;

    for (layerName in selectedLayers) {
        if (new RegExp(layerName, "i").test("background")) {
            isSelected = true;
        }
    }

    return isSelected;
};

// if any one wanted to export only selected layers from adobe illustrator
Ai2HTMLExpoter.prototype.getSelectedLayersCount = function (selectedLayers) {
    var count = 0;
    var name;
    for (name in selectedLayers) {
        count++;
    }
    return count;
};

// get the root path
Ai2HTMLExpoter.prototype.getWorkSpacePath = function () {
    this.exporterView = new ExporterWizardView(app.activeDocument.layers);
    var path = this.exporterView.getWorkSpacePath();
    return path;
}

//progressBar at the time of exporting
Ai2HTMLExpoter.prototype.showProgressBar = function () {
    var totalPageItems = this.exporterView.getPageItemsCount();
    this.progressBar = new ProgressBar(totalPageItems);
    this.progressBar.lunchProgressBar();
};

Ai2HTMLExpoter.prototype.logProcessingItemTime = function (sTime, eTime, name) {
    var diff = eTime - sTime;
    var sec = diff / 1000;
    var log = " Time Taken By : " + name + " IS : " + sec + "(sec)###########################:";
    this.tracer.writeTraceLog(log);
};

Ai2HTMLExpoter.prototype.getCommonBackGround = function () {

    for (var count = 0; count < app.activeDocument.layers.length; count++) {

        var layer = app.activeDocument.layers[count];

        if (new RegExp(layer.name, "i").test("background")) {
            if (layer.pageItems != undefined) {
                var pageItems = layer.pageItems;
                for (i = pageItems.length - 1; i >= 0; i--) {
                    var item = pageItems[i];
                    item.widgetType = "Background";
                    this.commonBackground.push(item);

                }
            }
        }
    }

}

Ai2HTMLExpoter.prototype.getBackground = function (currntLayer) {

    var bgObjet = null;
    this.layerBackground = [];
    delete currntLayer.layerBackground;

    if (currntLayer.pageItems != undefined) {
        var pageItems = currntLayer.pageItems;
        for (i = pageItems.length - 1; i >= 0; i--) {
            var item = pageItems[i];

            if (typeof item === "object" && item.tags != undefined && item.tags.length > 0) {
                for (var index = 0; index < item.tags.length; index++) {

                    var tag = item.tags[index];
                    if (tag.value === "Background") {
                        item.widgetType = "Background";
                        this.layerBackground.push(item);
                    } else if (tag.value == "List") {
                        item.webkitMarginBefore = "0";
                        item.webkitMarginAfter = "0";
                        item.webkitMarginStart = "0";
                        item.webkitMarginEnd = "0";
                        item.webkitPaddingStart = "0";
                    }
                }
            }
        }
    }

    // Iterate on sublayers if any
    if (currntLayer.typename == "Layer" && this.layerBackground.length == 0) {
        // parse sublayer recursively
        var sublayers = currntLayer.layers;
        for (var k = sublayers.length - 1; k >= 0; k--) {
            this.getBackground(sublayers[k]);
        }
    }
}

Ai2HTMLExpoter.prototype.buildProjectPath = function () {
    var path = combinePath(this.defaultPath, this.currentDocumentName);
    path = combinePath(path, "Resource");
    return path;
}

Ai2HTMLExpoter.prototype.getCurrentDocumentName = function () {
    return this.currentDocumentName; //removeExtension(this.activeDocument.name);
}

// read this json file and evaluate by eval function.
Ai2HTMLExpoter.prototype.intilize = function () {
    try {
        this.jsonExport();
        this.htmlExport();
    } catch (e) {
        this.tracer.writeErrorLog(e);
    }
}

//convert all the items/widget into the json
Ai2HTMLExpoter.prototype.jsonExport = function () {
    try {
        this.jsonParser = new jsonParser(this.projectPath, this.activeDocument, this.currentDocumentName, this.tracer, app.activeDocument, this.screenFolderName, this.exportedHeaderConfig, this.uidProvider, this.progressBar);
        this.jsonParser.processAiDocument();
        this.jsonParser.save();
        this.jsonParser.restImageDrawingCanvas();
    } catch (e) {
        this.tracer.writeErrorLog(e);
    }
}

//export equivalted html
Ai2HTMLExpoter.prototype.htmlExport = function () {
    try {
        this.htmlParser = new htmlParser(this.projectPath, this.currentDocumentName, this.tracer, this.screenFolderName, this.uidProvider);
        this.htmlParser.processJsonDocumentObject();
    } catch (e) {
        this.tracer.writeErrorLog(e);
    }
}

Ai2HTMLExpoter.prototype.save = function () {
    try {
        this.htmlParser.save();

    } catch (e) {
        this.tracer.writeErrorLog(e);
    }
}

var exporter = new Ai2HTMLExpoter();
