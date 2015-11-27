/*
Author :Ashish Yadav.
Date : 27/09/2013
CSS Exporter for the current  all opened documents..
 */

/* 
    this constructor  is called for every adobe illustrator document.
*/
#include Utils.jsx

function exporterCSSBuilder(projectPath, fileName, cssFolderName) {
    this.cssFolderName = cssFolderName;
    this.cssFolderPath = combinePath(projectPath, this.cssFolderName);
    this.fileName = fileName;
    this.createFolder();
    this.InitializeMemberVariables();
}

exporterCSSBuilder.prototype.createFolder = function () {
    createFolder(this.cssFolderPath);
}

/*
    Initialize all the member variables. and create the class level variables for the  operations
*/
exporterCSSBuilder.prototype.InitializeMemberVariables = function () {
    this.cssFileObject = new File(this.cssFolderPath + "/" + this.fileName);
    this.cssFileObject.open("w");
    this.cssDictionary = new Array();
    this.currentCSS = '';
    this.nestedCSS = '';
    this.preNestedClass = '';
}

/*
    Nested css for the child item in a group
*/
exporterCSSBuilder.prototype.setNestedCSS = function (css) {
    this.nestedCSS = css;
    this.currentCSS = css;
}

/*
    for the current object first we have to create  an entry in dictinory and then write corrensponding css in file.
*/
exporterCSSBuilder.prototype.addNewKeyInDictinory = function () {
    if (!util_isArray(this.cssDictionary[this.nestedCSS]))
        this.cssDictionary[this.nestedCSS] = new Array();
}

/*
    add css  data into dictinory bsed on item type .
    First write all the common property and then individual property of the ai items.
*/
exporterCSSBuilder.prototype.addCSSInDictinory = function (typeName, jsonObject) {

    switch (typeName) {
    case "Layer":
        {
            if (jsonObject.name == constants.tabWidget) {
                this.cssDictionary[this.nestedCSS]["opacity"] = "1 !important";
                this.cssDictionary[this.nestedCSS]["-webkit-transition"] = "opacity .9s ease";
            }
            this.addCommonProperty(jsonObject);
        }
        break;

    case "MartixGroupItem":
        {
            this.addCommonProperty(jsonObject);
        }
        break;

    case "ul":
        {
            this.listCommanProperties(jsonObject);
        }
        break;

    case constants.submenu:
        {
            this.cssDictionary[this.nestedCSS]["opacity"] = "1 !important";
            this.cssDictionary[this.nestedCSS]["-webkit-transition"] = "opacity .9s ease";
        }
        break;

    case "selectedListItem":
        {
            this.listCommanProperties(jsonObject);
        }
        break;

    case "GroupItem":
        {
            if (jsonObject.widgetType == "List")
                this.writeListCSS();
            this.cssDictionary[this.nestedCSS]["-webkit-margin-after"] = "0";
            this.cssDictionary[this.nestedCSS]["-webkit-margin-before"] = "0";
            this.cssDictionary[this.nestedCSS]["-webkit-margin-start"] = "0";
            this.cssDictionary[this.nestedCSS]["-webkit-margin-end"] = "0";
            this.cssDictionary[this.nestedCSS]["-webkit-padding-start"] = "0";
        }
        break;

    case "TextFrame":
        {
            this.addCommonProperty(jsonObject);

            // text if design in pt.
            this.cssDictionary[this.nestedCSS]["width"] = jsonObject.width;
            this.cssDictionary[this.nestedCSS]["height"] = jsonObject.height;

            var lineHeight = jsonObject.lineHeight;

            if (lineHeight === undefined || lineHeight === 0) {
                lineHeight = jsonObject.fontSize;
            }

            this.cssDictionary[this.nestedCSS]["line-height"] = lineHeight + "px";

            if (jsonObject.textOverflow) {
                this.cssDictionary[this.nestedCSS]["text-overflow"] = jsonObject.textOverflow;
            }

            if (jsonObject.overflow) {
                this.cssDictionary[this.nestedCSS]["overflow"] = jsonObject.overflow;
                this.cssDictionary[this.nestedCSS]["word-break"] = "break-all";
            } else {
                this.cssDictionary[this.nestedCSS]["white-space"] = "nowrap";
            }

            //indent
            if (jsonObject.firstLineIndent) {
                this.cssDictionary[this.nestedCSS]["text-indent"] = jsonObject.firstLineIndent;
            }
            if (jsonObject.rightIndent) {
                this.cssDictionary[this.nestedCSS]["padding-right"] = jsonObject.rightIndent;
            }

            if (jsonObject.leftIndent) {
                this.cssDictionary[this.nestedCSS]["padding-left"] = jsonObject.leftIndent;
            }


            // text-transform
            if (jsonObject.textTransform) {
                this.cssDictionary[this.nestedCSS]["text-transform"] = jsonObject.textTransform;
            }

            //text-decoration
            var txtDec = '';
            if (jsonObject.strikeThrough === "true") {
                txtDec = "line-through ";
            }

            if (jsonObject.underline === "true") {
                txtDec += "underline";
            }

            if (txtDec !== '') {
                this.cssDictionary[this.nestedCSS]["text-decoration"] = txtDec;
            }

        }
        break;

    case "PathItem":
        {
            this.addCommonProperty(jsonObject);
            var fillType = jsonObject.fillType;
            this.cssDictionary[this.nestedCSS]["width"] = jsonObject.width;
            this.cssDictionary[this.nestedCSS]["height"] = jsonObject.height;
        }
        break;

    case "PlacedItem":
    case "RasterItem":
        {
            this.addCommonProperty(jsonObject);
            this.writeImageData(jsonObject);
            this.cssDictionary[this.nestedCSS]["opacity"] = 1;
            this.cssDictionary[this.nestedCSS]["background-image"] = "url(" +jsonObject.file + ")";
        }
        break;

    default:
        break;
    }
}

exporterCSSBuilder.prototype.writeImageData = function (jsonObject) {
    this.cssDictionary[this.nestedCSS]["background-repeat"] = "no-repeat";
    this.cssDictionary[this.nestedCSS]["background-size"] = "100% 100%";
    this.cssDictionary[this.nestedCSS]["background-position"] = "center";
}
/*
    Write finl out in to  in given css file name .  File name is dynamic
 */
exporterCSSBuilder.prototype.save = function () {
    for (var key in this.cssDictionary) {
        if (!this.isNeedToWriteCSSData(key)) continue;

        this.cssFileObject.writeln(key + " {");

        for (var attrib in this.cssDictionary[key]) {
            this.cssFileObject.writeln("\t" + unescape(attrib) + ": " + unescape(this.cssDictionary[key][attrib]) + ";");
        }

        this.cssFileObject.writeln("}");
    }
    this.cssFileObject.close();
}

exporterCSSBuilder.prototype.isNeedToWriteCSSData = function (key) {
    var isNeed = false;

    for (var attrib in this.cssDictionary[key]) {
        isNeed = true;
        break;
    }
    return isNeed;
}
exporterCSSBuilder.prototype.writeListCSS = function () {
    this.cssDictionary[this.nestedCSS]["position"] = "absolute";
    this.cssDictionary[this.nestedCSS]["float"] = "left";
    this.cssDictionary[this.nestedCSS]["list-style-type"] = "none";
    this.cssDictionary[this.nestedCSS]["-webkit-transition"] = "-webkit-transform .9s ease";
}

/*
    i am looking for undefined property becuse may json contains this property as common property.
*/
exporterCSSBuilder.prototype.addCommonProperty = function (jsonObject) {
    this.cssDictionary[this.nestedCSS]["position"] = "absolute";
    this.cssDictionary[this.nestedCSS]["float"] = "left";
    this.listCommanProperties(jsonObject);

}

exporterCSSBuilder.prototype.listCommanProperties = function (jsonObject) {

    if (jsonObject.zOrderIndex != undefined)
        this.cssDictionary[this.nestedCSS]["z-index"] = jsonObject.zOrderIndex;

    if (jsonObject.opacity != undefined)
        this.cssDictionary[this.nestedCSS]["opacity"] = jsonObject.opacity;

    if (jsonObject.AXT_Left != undefined)
        this.cssDictionary[this.nestedCSS]["left"] = parseInt(jsonObject.AXT_Left, 10) + "px";

    if (jsonObject.AXT_Top != undefined)
        this.cssDictionary[this.nestedCSS]["top"] = parseInt(jsonObject.AXT_Top, 10) + "px";

    if (jsonObject.textAlign != undefined)
        this.cssDictionary[this.nestedCSS]["text-align"] = jsonObject.textAlign;

    if (jsonObject.fontFamily != undefined)
        this.cssDictionary[this.nestedCSS]["font-family"] = jsonObject.fontFamily;

    if (jsonObject.fontStyle != undefined)
        this.cssDictionary[this.nestedCSS]["font-style"] = jsonObject.fontStyle;

    if (jsonObject.fontWeight != undefined)
        this.cssDictionary[this.nestedCSS]["font-weight"] = jsonObject.fontWeight;

    if (jsonObject.fontSize != undefined)
        this.cssDictionary[this.nestedCSS]["font-size"] = jsonObject.fontSize;

    if (jsonObject.color != undefined)
        this.cssDictionary[this.nestedCSS]["color"] = jsonObject.color;

    if (jsonObject.background != undefined)
        this.cssDictionary[this.nestedCSS]["background-color"] = jsonObject.background;

    if (jsonObject.margin != undefined)
        this.cssDictionary[this.nestedCSS]["margin"] = jsonObject.margin;

    if (jsonObject.padding != undefined)
        this.cssDictionary[this.nestedCSS]["padding"] = jsonObject.padding;

    if (jsonObject.width != undefined)
        this.cssDictionary[this.nestedCSS]["width"] = jsonObject.width;

    if (jsonObject.height != undefined)
        this.cssDictionary[this.nestedCSS]["height"] = jsonObject.height;

    if (jsonObject.backgroundImage !== undefined)
        this.cssDictionary[this.nestedCSS]["background-image"] = jsonObject.backgroundImage;


    if (jsonObject.backgroundColor !== undefined)
        this.cssDictionary[this.nestedCSS]["background-color"] = jsonObject.backgroundColor;


    this.cssDictionary[this.nestedCSS]["-webkit-margin-after"] = "0";
    this.cssDictionary[this.nestedCSS]["-webkit-margin-before"] = "0";
    this.cssDictionary[this.nestedCSS]["-webkit-margin-start"] = "0";
    this.cssDictionary[this.nestedCSS]["-webkit-margin-end"] = "0";
    this.cssDictionary[this.nestedCSS]["-webkit-padding-start"] = "0";


    this.writeBoderProperties(jsonObject);
}

exporterCSSBuilder.prototype.writeBoderProperties = function (jsonObject) {
    if (jsonObject.strokeWidth != undefined) {
        this.cssDictionary[this.nestedCSS]["border-width"] = jsonObject.strokeWidth;
        this.cssDictionary[this.nestedCSS]["border-color"] = jsonObject.strokeColor;
        this.cssDictionary[this.nestedCSS]["border-style"] = jsonObject.strokeStyle;
    }
}

exporterCSSBuilder.prototype.writeCSSHTMLLiTag = function () {
    this.cssDictionary[this.nestedCSS]["position"] = "relative";
    this.cssDictionary[this.nestedCSS]["float"] = "left";
    this.cssDictionary[this.nestedCSS]["padding"] = " 10px 20px";
}

exporterCSSBuilder.prototype.getChildObject = function (jsonObject) {
    var childObject = null;
    for (var prop in jsonObject) {
        if (typeof jsonObject[prop] === 'object') {
            if (jsonObject[prop].typename != undefined) {
                childObject = jsonObject[prop];
                break;
            }
        }
    }

    return childObject;
}
