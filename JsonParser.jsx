#include Utils.jsx

function jsonParser(projectPath, activeDocument, currentDocumentName, tracer, parentJsonObject, screenFolderName, exportedHeaderConfig, uidProvider, progressBar) {
    this.tracer = tracer;
    this.uidProvider = uidProvider;
    this.progressBar = progressBar;
    this.exportedHeaderConfig = exportedHeaderConfig;
    this.screenFolderName = screenFolderName;
    this.parentJsonObject = parentJsonObject;
    this.currentDocument = activeDocument;
    this.fileName = currentDocumentName;
    this.imageDrawingCanvas = app.documents.add();
    this.projectPath = this.createScreenFolder(projectPath);
    this.defaultImageFolder = "Images";
    this.imageFolder = combinePath(projectPath, this.defaultImageFolder);
    createFolder(this.projectPath);
    createFolder(this.imageFolder);
    this.jsonFile = undefined;
    this.uniqId = 0;
    this.isAnyPropertyWritten;
    this.init();
}

jsonParser.prototype.createScreenFolder = function (projectPath) {
    return combinePath(projectPath, this.screenFolderName)
}

jsonParser.prototype.processAiDocument = function () {
    this.jsonFile.write("{");
    this.jsonFile.write("\n");
    try {
        this.processObjectRecursive(this.currentDocument, this.parentJsonObject, 1);
        this.jsonFile.write("\n");
    } catch (e) {
        this.tracer.writeErrorLog(e);
    }

    this.jsonFile.write("}");
    this.jsonFile.write("\n");
}

jsonParser.prototype.restImageDrawingCanvas = function () {
    this.imageDrawingCanvas.close(SaveOptions.DONOTSAVECHANGES);
}

jsonParser.prototype.init = function () {
    this.jsonFile = new File(this.projectPath + "/" + this.fileName + ".json");
    this.jsonFile.open("w");
    this.exportedHeaderConfig.setSectionName(this.fileName);
}

//----------------------------------------------------------------------
// Name: close() 
// Desc: do some close stuff
//----------------------------------------------------------------------
jsonParser.prototype.save = function () {
    this.jsonFile.close();
    this.initExportingLayerAsSVG();
}

jsonParser.prototype.getPropertiesCount = function (obj) {
    var count = 0;
    for (prop in obj)++count;

    return count;
}

// write stroke related property of the object
jsonParser.prototype.writeStrokeProperties = function (tab, obj) {
    // write stroke color 
    var strokColor = this.util_colorToHTML(obj.strokeColor);
    this.writeValue(tab, "strokeColor", this.util_colorToHTML(obj.strokeColor), ",");
    //write stokewidth
    var stokewidth = Math.round(parseFloat(obj.strokeWidth, 10));
    this.writeValue(tab, "strokeWidth", stokewidth + "px", ",");
    // write stroke border style 
    var borderStyle = "Solid";

    if (obj.strokeDashes != '')
        borderStyle = "dashed";
    this.writeValue(tab, "strokeStyle", borderStyle, ",");
};

//----------------------------------------------------------------------
// Name: processObjectRecursive() 
// Desc: parse the object recursively
//----------------------------------------------------------------------
jsonParser.prototype.processObjectRecursive = function (obj, parent, tabulation) {

    this.isAnyPropertyWritten = false;
    var tagname = "div";
    var tab = "";
    var objectId = "";
    var i;

    for (i = 0; i < tabulation; i++) tab += "\t";

    objectId = this.uidProvider.util_getIdFromObject(obj);

    this.jsonFile.write(tab + "\"" + objectId + "\"" + ":{");
    this.jsonFile.write("\n");

    obj["AXT_Top"] = 0;
    obj["AXT_Left"] = 0;
    obj["widgetName"] = objectId;
    var width = obj.widget;
    var height = obj.height;

    // dont know why  in textFrame obje able to see the paragraphs property. becuse of that i am doing tihs.
    if (obj.typename == "TextFrame")
        var px = obj.paragraphs;

    this.setZOderPostion(obj, parent);

    // Write the property of the object.
    var count = 0;
    for (var property in obj) {

        if (property == null || property == undefined || property == "top" || property == "left") continue;

        var terminator = "";
        if (count > 0 && this.isAnyPropertyWritten == true)
            terminator = ",";

        if (property == null || property == undefined) continue;

        try {
            if (obj.hasOwnProperty(property)) {
                if (typeof obj[property] != "object") {
                    this.writeValue(tab, property, obj[property], terminator);
                } else if (typeof obj[property] == "object" && this.isNeedToWritePropertyValue(property) == true && obj.typename != "GroupItem") {
                    if (property == "position") {
                        this.writePositionCoordinate(obj, tab);
                    }

                    if (property == "paragraphs") {
                        this.writeParagraphsProperty(tab, obj, terminator);
                    }

                    // filled condtion will tell wheter backgound is filled or not.
                    if (property == "fillColor" && obj.filled) {
                        this.writeColorValue(tab, obj);
                    }
                } else
                    continue;
            }
        } catch (e) {
            continue;
        }
        count++;
    }

    // for placed Image and RasterItem export Images
    try {
        this.writeRasterAndPlacedItem(tab, obj, objectId);
        //Write the tage values of the object , If value is associated with the help of the AI Plugin (  property gird) other wise tags will be the undefined.
        // this.writeParentTagValues(parent, tab);
        this.writeTagValues(obj, tab);

        //becuse layer and groupt item dont have the positon becuse of that this function has been written.   
        this.uxWidgetCoordinate(obj, tab);

        // write stroke properties of the object.
        if (obj.stroked == true && obj.strokeWidth != undefined) {
            this.writeStrokeProperties(tab, obj);
        }
    } catch (e) {
        this.tracer.writeErrorLog("JsonParser.processObjectRecursive: Object Id :" + obj.widgetName + e);
    }

    // Iterate on subitems if any
    if (obj.pageItems != undefined) {
        // Iterate on page content items
        var subItems = obj.pageItems;
        for (i = subItems.length - 1; i >= 0; i--) {
            var subItem = subItems[i];
            if (subItem.typename != undefined && subItem.widgetType != "Background") {
                this.jsonFile.write(tab + ",");
                this.processObjectRecursive(subItem, obj, tabulation + 1);
            }
        }
    }

    // Iterate on sublayers if any
    if (obj.typename == "Layer") {
        // parse sublayer recursively
        var sublayers = obj.layers;
        var j;
        for (j = sublayers.length - 1; j >= 0; j--) {
            this.jsonFile.write(tab + ",");
            this.processObjectRecursive(sublayers[j], obj, tabulation + 1);
        }
    }

    if (obj.typename === "Layer") {
        if (obj.layerBackground !== undefined && obj.layerBackground.length > 0) {
            for (var i = 0; i < obj.layerBackground.length; i++) {
                var bgObject = obj.layerBackground[i];
                this.jsonFile.write(tab + ",");
                this.processObjectRecursive(bgObject, obj, tabulation + 1);
            }
        }
    }

    this.jsonFile.writeln(tab + "}");
    this.progressBar.updateProgress();
};

jsonParser.prototype.uxWidgetCoordinate = function (obj, tab) {
    if (obj.typename === "GroupItem") {
        this.writeValue(tab, "left", util_toInt(obj.left) + "px", ",");
        this.writeValue(tab, "top", util_toInvInt(obj.top) + "px", ",");
        this.writeValue(tab, "AXT_Left", util_toInt(obj.left) + "px", ",");
        this.writeValue(tab, "AXT_Top", util_toInvInt(obj.top) + "px", ",");
    }
};

jsonParser.prototype.writePadding = function (tab, obj) {

    if (obj.value !== null && obj.value !== undefined && obj.value !== "") {
        try {
            var rex = new RegExp(/;|,| |:/);
            var paddingArr = obj.value.split(rex);
            this.writeValue(tab, "paddingTop", paddingArr[0], ",");
            this.writeValue(tab, "paddingRight", paddingArr[1], ",");
            this.writeValue(tab, "paddingBottom", paddingArr[2], ",");
            this.writeValue(tab, "paddingLeft", paddingArr[3], ",");
        } catch (e) {
            this.tracer.writeErrorLog("JsonParser.writePadding: Object Id :" + obj.widgetName + e);
        }
    }
};

jsonParser.prototype.writeMargin = function (tab, obj) {

    if (obj.value !== null && obj.value !== undefined && obj.value !== "") {

        try {
            var rex = new RegExp(/;|,| |:/);
            var marginArr = obj.value.split(rex);
            this.writeValue(tab, "isDefaultMarginAvailable", "true", ",");
            this.writeValue(tab, "marginTop", marginArr[0], ",");
            this.writeValue(tab, "marginBottom", marginArr[1], ",");
            this.writeValue(tab, "marginRight", marginArr[2], ",");
            this.writeValue(tab, "marginLeft", marginArr[3], ",");
        } catch (e) {
            this.tracer.writeErrorLog("JsonParser.writeMargin: Object Id :" + obj.widgetName + e);
        }
    }
};

jsonParser.prototype.setZOderPostion = function (obj, parent) {
    if (obj.typename === "Layer") {
        obj["zOrderIndex"] = this.util_extractZIndex(obj);
    } else if (obj.widgetType === "Background" && obj.typename !== "Layer") {
        obj["zOrderIndex"] = "-1";
    } else {
        obj["zOrderIndex"] = this.util_extractZIndex(parent);
    }
};

//----------------------------------------------------------------------
// Name: util_extractZIndex() 
// Desc: return the zOrderPosition of an object (if any)
//----------------------------------------------------------------------
jsonParser.prototype.util_extractZIndex = function (obj) {
    var zindex = 0;
    try {
        zindex = obj.zOrderPosition;
    } catch (e) {
        zindex = 1;
        this.tracer.writeErrorLog(e);
    }
    return zindex;
};

jsonParser.prototype.writeValue = function (tab, key, value, terminator) {
    if (value === undefined) return;

    if (key == "width" || key == "height") {
        var val = util_toInt(value);
        value = val + "px";
    }
    if (key == "opacity") {
        value = util_percentToFloat(value);
    }
    if (key === "contents") {
        value = getContent(escape(value));
    } else {
        value = escape(value);
    }

    this.isAnyPropertyWritten = true;
    this.jsonFile.write(tab + terminator + "\"" + escape(key) + "\"" + "  : " + "\"" + value + "\"");
    this.jsonFile.write("\n");
};

jsonParser.prototype.writeRasterAndPlacedItem = function (tab, obj, objectId) {
    if (obj.typename == "PlacedItem" || obj.typename == "RasterItem") {
        var imagePath;
        var imageName;
        if (!obj.embedded) {
            var imagePath = '';
            var file_path = relativeFilePath(obj, this.imageFolder);
            var oldImage = new File(file_path);
            imageName = obj.file.name;
            oldImage.copy(this.imageFolder + "/" + obj.file.name);
            imagePath = '../' + this.defaultImageFolder + '/' + obj.file.name;
        } else {
            try {
                var fileName = "file_" + objectId + ".png";
                if (!File(this.imageFolder + "/" + fileName).exists) {
                    var tempLayer = this.imageDrawingCanvas.layers[0];
                    tempLayer.pageItems.removeAll();
                    var tempObj = obj.duplicate(tempLayer);
                    this.util_exportFileToPNG24(this.imageDrawingCanvas, this.imageFolder + "/" + fileName);
                }

                imagePath = '../' + this.defaultImageFolder + '/' + fileName;
                imageName = fileName;

            } catch (e) {
                this.tracer.writeErrorLog("JsonParser.writeRasterAndPlacedItem" + obj.widgetName + e);
            }
        }

        this.writeValue(tab, "file", imagePath, ",");
        this.exportedHeaderConfig.AddImageFile(imageName);
    }
};

jsonParser.prototype.writeColorValue = function (tab, obj) {
    var terminator = ",";
    var colorPropName = "color"

    if (obj.widgetType == "Background" || obj.typename == "PathItem")
        colorPropName = "background";

    if (obj.typename === "PathItem") {
        var fillType = obj.fillColor.typename;

        if (fillType === "GradientColor") {
            colorPropName = "backgroundImage";
        } else {
            colorPropName = "backgroundColor";
        }
    }

    this.writeValue(tab, colorPropName, this.util_colorToHTML(obj.fillColor), terminator);
    this.writeValue(tab, "fillType", obj.fillColor.typename, terminator);
};

jsonParser.prototype.writeParagraphsProperty = function (tab, obj, totalProperties, count) {
    if (obj.paragraphs.length <= 0) return;
    try {
        var terminator = ",";
        var fontName = this.util_extractFontName(obj.paragraphs[0].textFont);
        this.writeValue(tab, "fontName", fontName, terminator);
        this.writeValue(tab, "fontFamily", this.util_extractFontFamily(obj.paragraphs[0].textFont), terminator);
        this.writeValue(tab, "fontStyle", this.util_extractFontStyle(obj.paragraphs[0].textFont), terminator);
        this.writeValue(tab, "fontWeight", this.util_extractFontWeight(obj.paragraphs[0].textFont), terminator);
        this.writeValue(tab, "fontSize", obj.paragraphs[0].size + "px", terminator);
        this.writeValue(tab, "color", this.util_colorToHTML(obj.paragraphs[0].fillColor), terminator);
        this.writeValue(tab, "textAlign", this.util_extractAlignement(obj.paragraphs[0]), terminator);
        this.writeValue(tab, "margin", "0px", terminator);
        this.writeValue(tab, "padding", "0px", terminator);
        this.writeValue(tab, "lineHeight", this.getTextLineHeight(obj), terminator);
        var overFlow = this.isTextOverFlow(obj);
        if (overFlow) {
            this.writeValue(tab, "textOverflow", "clip", terminator);
            this.writeValue(tab, "overflow", "hidden", terminator);
        } else {
            this.writeValue(tab, "whiteSpace", "nowrap", terminator);
        }

        // this.writeValue(tab, "textHeight", util_toInt(obj.height) + "pt", terminator);
        // this.writeValue(tab, "textWidth", util_toInt(obj.width) + "pt", terminator);

        // Indent
        try{
            this.writeValue(tab, "firstLineIndent", obj.lines[0].firstLineIndent + "px", terminator);
            this.writeValue(tab, "leftIndent",  obj.lines[0].leftIndent + "px", terminator);
            this.writeValue(tab, "rightIndent", obj.lines[0].rightIndent + "px", terminator);
        }catch(e){
            this.tracer.writeErrorLog("JsonParser.writeParagraphsProperty: Indent" + obj.widgetName + e);
        }

        this.writeValue(tab, "textTransform", this.getTextTransform(obj), terminator);
        this.writeValue(tab, "underline", obj.textRange.underline, terminator);
        this.writeValue(tab, "strikeThrough", obj.textRange.strikeThrough, terminator);
        this.exportedHeaderConfig.AddFontFile(fontName);
    } catch (e) {
        this.tracer.writeErrorLog("JsonParser.writeParagraphsProperty" + obj.widgetName + e);
    }
};

jsonParser.prototype.getTextTransform = function (txtObj) {
    var txtTransform;
    switch (txtObj.textRange.capitalization) {
    case FontCapsOption.NORMALCAPS:
        txtTransform = "none";
        break;
    case FontCapsOption.ALLCAPS:
        txtTransform = "uppercase";
        break;
    }

    return txtTransform;
}

jsonParser.prototype.isTextOverFlow = function (txObj) {
    var visibleCount = 0,
        totalTextCount = 0,
        isoverflow = false;
    for (var i = 0; i < txObj.lines.length; i++) {
        visibleCount += txObj.lines[i].characters.length;
    }

    for (var i = 0; i < txObj.paragraphs.length; i++) {
        totalTextCount += txObj.paragraphs[i].characters.length;
    }

    if (totalTextCount > visibleCount) {
        isoverflow = true;
    }
    return isoverflow;
}


jsonParser.prototype.getTextLineHeight = function (obj) {
    var lineHeight = 0;
    try {
        lineHeight = obj.textRange.leading;
    } catch (e) {
        this.tracer.writeErrorLog("JsonParser.getTextLineHeight :" + e);
    }
    return lineHeight;
};

jsonParser.prototype.writeTagValues = function (obj, tab) {
    if (obj.tags != undefined && obj.tags.length > 0) {
        for (var index = 0; index < obj.tags.length; index++) {
            try {
                var tag = obj.tags[index];

                if (tag.name == "padding") {
                    this.writePadding(tab, tag);
                } else if (tag.name == "margin") {
                    this.writeMargin(tab, tag);
                } else {
                    this.writeValue(tab, tag.name, tag.value, ",");
                }
            } catch (e) {
                this.tracer.writeErrorLog("JsonParser.writeTagValues" + obj.widgetName + e);
            }
        }
    }
};

jsonParser.prototype.writePositionCoordinate = function (obj, tab) {

    try {
        this.writeValue(tab, "left", this.util_convertCoordinate(obj.position[0], 'left', obj), ",");
        this.writeValue(tab, "top", this.util_convertCoordinate(obj.position[1], 'top', obj), ",");
    } catch (e) {
        this.tracer.writeErrorLog("JsonParser.writePositionCoordinate" + obj.widgetName + e);
    }
};

jsonParser.prototype.isNeedToWritePropertyValue = function (property) {
    var isValid = false;

    if (property == "position" || property == "file" || property == "paragraphs" || property == "fillColor")
        isValid = true;

    return isValid;
};

jsonParser.prototype.util_convertCoordinate = function (val, type, obj) {
    var ret = 0;
    var parent = obj.parent;

    switch (type) {
    case 'top':
        ret = util_toInvInt(val);
        obj["AXT_Top"] = ret;
        if (parent)
            ret -= parent["AXT_Top"];
        break;
    case 'left':
        ret = util_toInt(val);
        obj["AXT_Left"] = ret;
        if (parent)
            ret -= parent["AXT_Left"];
        break;

    }
    return "" + ret + "px";
};

//----------------------------------------------------------------------
// Name: util_extractFontWeight() 
// Desc: return the html font weight from an Illustrator font object
//----------------------------------------------------------------------
jsonParser.prototype.util_extractFontWeight = function (illustratorFont) {
    var str = undefined;
    try {
        str = illustratorFont.style;
    } catch (e) {
        this.tracer.writeErrorLog("JsonParser.util_extractFontWeight :" + e);
    }
    if (str.toLowerCase() == "bold")
        return 'bold';
    return 'normal';
}

//----------------------------------------------------------------------
// Name: util_extractFontStyle() 
// Desc: return the html font style from an Illustrator font object
//----------------------------------------------------------------------
jsonParser.prototype.util_extractFontStyle = function (illustratorFont) {
    var str = undefined;
    try {
        str = illustratorFont.style;
    } catch (e) {
        this.tracer.writeErrorLog("JsonParser.util_extractFontStyle :" + e);
    }
    if (str.toLowerCase() == "italic"){
        str = 'italic';
    }
    
    return str;
};

//----------------------------------------------------------------------
// Name: util_extractFontName() 
// Desc: return the font family name from an Illustrator font object
//----------------------------------------------------------------------
jsonParser.prototype.util_extractFontName = function (illustratorFont) {
    //util_dumpObject(illustratorFont, "###AXT:: util_extractFontName() textFont");
    var str = undefined;

    try {
        str = illustratorFont.name;
    } catch (e) {}

    if (str == undefined || str == "") {
        str = String(illustratorFont);
        str = str.replace("[TextFont ", "");
        str = str.replace("]", "");
    }
    return str;
};

//----------------------------------------------------------------------
// Name: util_extractFontName() 
// Desc: return the font family name from an Illustrator font object
//----------------------------------------------------------------------
jsonParser.prototype.util_extractFontFamily = function (illustratorFont) {
    var str = undefined;
    try {
        str = illustratorFont.family;
    } catch (e) {}

    if (str == undefined || str == "") {
        str = String(illustratorFont);
        str = str.replace("[TextFont ", "");
        str = str.replace("]", "");
    }
    return str;
};

//----------------------------------------------------------------------
// Name: util_colorToHTML() 
// Desc: return the html color from an Illustrator font object
//----------------------------------------------------------------------
jsonParser.prototype.util_colorToHTML = function (illustratorColor) {
    var type = "nocolor";
    var ret = "#111";

    try {
        type = illustratorColor.typename
    } catch (e) {}

    switch (type.toLowerCase()) {
    case "nocolor":
        ret = "#000";
        break;

    case "cmykcolor":

        var red = this.CMYKtoRGB(illustratorColor.cyan, illustratorColor);
        var green = this.CMYKtoRGB(illustratorColor.magenta, illustratorColor);
        var blue = this.CMYKtoRGB(illustratorColor.yellow, illustratorColor);
        ret = "#" + this.util_hexaThis(red.toString(16)) + this.util_hexaThis(green.toString(16)) + this.util_hexaThis(blue.toString(16));
        break;

    case "rgbcolor":
        ret = "#" + this.util_hexaThis(illustratorColor.red.toString(16)) +
            this.util_hexaThis(illustratorColor.green.toString(16)) +
            this.util_hexaThis(illustratorColor.blue.toString(16));
        break;

    case "graycolor":
        var color = 100 - illustratorColor.gray;
        ret = "#" + this.util_hexaThis(color.toString(16)) +
            this.util_hexaThis(color.toString(16)) +
            this.util_hexaThis(color.toString(16));
        break;
    case "gradientcolor":
        var gradient = illustratorColor["gradient"];
        var gradiantType = String(gradient.type);
        var gradientStops = gradient.gradientStops;
        var currSin = illustratorColor.matrix.mValueC;
        var currAngleInDeg = illustratorColor.angle - Math.asin(currSin) * (180 / Math.PI);

        if (gradiantType == "GradientType.LINEAR") {
            ret = "-webkit-linear-gradient(";

            if (currAngleInDeg == -90 || currAngleInDeg == 270)
                ret += "top";
            else if (currAngleInDeg == 90)
                ret += "bottom";
            else if (currAngleInDeg == 0)
                ret += "left";
            else if (currAngleInDeg == 180)
                ret += "right";
            else
                ret += "top";

            var ramPoints = this.getRamPoint(gradientStops);
            if (illustratorColor.matrix.mValueA > 0) {
                for (var i = 0; i < gradientStops.length; i++) {
                    ret = this.getGradient(gradientStops[i], ret, ramPoints[i]);
                }
            } else {
                for (var i = gradientStops.length - 1; i >= 0; i--) {
                    ret = this.getGradient(gradientStops[i], ret, ramPoints[gradientStops.length - i - 1]);
                }
            }
            ret += ")";
        } else if (gradiantType == "GradientType.RADIAL") {
            for (var i = 0; i < gradientStops.length; i++) {
                //TODO : I NEED TO WORK ON THIS
            }
        }
        break;
    }
    return ret;
};

jsonParser.prototype.getRamPoint = function (gradientStops) {
    var ramPoints = [],
        i;
    for (i = 0; i < gradientStops.length; i++) {
        ramPoints.push(gradientStops[i].rampPoint);
    }

    return ramPoints;
};

jsonParser.prototype.getGradient = function (gradientStop, ret, rampPoint) {

    switch (gradientStop.color.typename.toLowerCase()) {
    case "cmykcolor":
        var red = this.CMYKtoRGB(gradientStop.color.cyan, gradientStop.color);
        var green = this.CMYKtoRGB(gradientStop.color.magenta, gradientStop.color);
        var blue = this.CMYKtoRGB(gradientStop.color.yellow, gradientStop.color);
        //ret += ", rgba(" + Math.round(red) + "," + Math.round(green) + "," + Math.round(blue) + "," + gradientStop.opacity / 100 + ") " + gradientStop.rampPoint + "%";
        ret += ", rgba(" + Math.round(red) + "," + Math.round(green) + "," + Math.round(blue) + "," + gradientStop.opacity / 100 + ") " + rampPoint + "%";
        break;

    case "rgbcolor":
        //ret += ", rgba(" + Math.round(gradientStop.color.red) + "," + Math.round(gradientStop.color.green) + "," + Math.round(gradientStop.color.blue) + "," + gradientStop.opacity / 100 + ") " + gradientStop.rampPoint + "%";
        ret += ", rgba(" + Math.round(gradientStop.color.red) + "," + Math.round(gradientStop.color.green) + "," + Math.round(gradientStop.color.blue) + "," + gradientStop.opacity / 100 + ") " + rampPoint + "%";
        break;

    case "graycolor":
        var color = 100 - gradientStop.color.gray;
        var grayValue = (Math.round((color / 100) * 255));
        //ret += ", rgba(" + Math.round(grayValue) + "," + Math.round(grayValue) + "," + Math.round(grayValue) + "," + gradientStop.opacity / 100 + ") " + gradientStop.rampPoint + "%";
        ret += ", rgba(" + Math.round(grayValue) + "," + Math.round(grayValue) + "," + Math.round(grayValue) + "," + gradientStop.opacity / 100 + ") " + rampPoint + "%";
        break;
    }
    return ret;
};
//----------------------------------------------------------------------
// Name: util_extractAlignement() 
// Desc: extract the text alignement
//----------------------------------------------------------------------
jsonParser.prototype.util_extractAlignement = function (illustratorParagraph) {
    var ret = "left";
    try {
        //myTrace.writeln("###AXT:: util_extractAlignement(): justification='"+illustratorParagraph.justification+"'");
        switch (String(illustratorParagraph.justification)) {
        case "Justification.CENTER":
            ret = "center";
            break;
        case "Justification.RIGHT":
            ret = "right";
            break;
        default:
            ret = "left";
            break;
        }
    } catch (e) {
        ret = "left";
    }
    return ret;
};
//----------------------------------------------------------------------
// Name: util_exportFileToPNG24() 
// Desc: export a document object on PNG format
//----------------------------------------------------------------------
jsonParser.prototype.util_exportFileToPNG24 = function (doc, dest) {
    var exportOptions = new ExportOptionsPNG24();
    var type = ExportType.PNG24;
    var fileSpec = new File(dest);
    exportOptions.antiAliasing = false;
    exportOptions.transparency = true;
    exportOptions.qualitySetting = 100;
    exportOptions.verticalScale = 100;
    exportOptions.horizontalScale = 100;
    doc.exportFile(fileSpec, type, exportOptions);
};

//----------------------------------------------------------------------
// Name: util_exportFileToJPEG() 
// Desc: export a document object on JPG format
//----------------------------------------------------------------------
jsonParser.prototype.util_exportFileToJPEG = function (dest) {
    var exportOptions = new ExportOptionsJPEG();
    var type = ExportType.JPEG;
    var fileSpec = new File(dest);
    exportOptions.antiAliasing = false;
    //The next exporOptions allow for a very high quality JPEG to be saved.
    exportOptions.qualitySetting = 100;
    exportOptions.verticalScale = 700;
    exportOptions.horizontalScale = 700;
    doc.exportFile(fileSpec, type, exportOptions);
}

//----------------------------------------------------------------------
// Name: util_getFileSize() 
// Desc: 
//----------------------------------------------------------------------
jsonParser.prototype.util_getFileSize = function (file_path) {
    var fd = new File(mypath + "/" + file_path);
    return fd.length;
};

// convert one by one color to RGB
jsonParser.prototype.CMYKtoRGB = function (color, illustratorColor) {
    var color = 255 - parseFloat(2.55 * (color + illustratorColor.black));
    if (color < 0) color = 0;
    return color;
};

//----------------------------------------------------------------------
// Name: util_hexaThis() 
// Desc: return the formated hexa value
//----------------------------------------------------------------------
jsonParser.prototype.util_hexaThis = function (hex) {
    if (hex.length == 1) {
        hex = "0" + hex;
    }
    return hex;
};

jsonParser.prototype.initExportingLayerAsSVG = function () {
    var destLayer = this.imageDrawingCanvas.layers[0];
    destLayer.pageItems.removeAll();
    this.copyLayerItems(this.currentDocument, destLayer);
    var dest = this.projectPath + "/" + this.fileName;
    this.exportFileToPNG24(this.imageDrawingCanvas, dest);
};

jsonParser.prototype.copyLayerItems = function (sourceLayer, destLayer) {
    for (var a = sourceLayer.pageItems.length - 1; a >= 0; a--) {
        sourceLayer.pageItems[a].duplicate(destLayer, ElementPlacement.PLACEATBEGINNING);
    }
};

//----------------------------------------------------------------------
// Name: util_exportFileToPNG24() 
// Desc: export a document object on PNG format
//----------------------------------------------------------------------
jsonParser.prototype.exportFileToPNG24 = function (doc, dest) {
    var exportOptions = new ExportOptionsPNG24();
    var type = ExportType.PNG24;
    var fileSpec = new File(dest);
    exportOptions.antiAliasing = false;
    exportOptions.transparency = true;
    exportOptions.qualitySetting = 100;
    exportOptions.verticalScale = 50;
    exportOptions.horizontalScale = 50;
    doc.exportFile(fileSpec, type, exportOptions);
};
