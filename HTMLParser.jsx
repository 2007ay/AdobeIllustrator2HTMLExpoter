#include Utils.jsx;
#include Strings.js;
#include CSSBuilder.jsx;
#include JsonLoader.jsx;
#include StringsExpoter.jsx;
#include FontExpoter.jsx;

function htmlParser(projectPath, currentDocName, tracer, screenFolderName, idProvider) {
    this.cssFolderName = "Styles";
    this.uidProvider = idProvider;
    this.screenFolderName = screenFolderName;
    this.layoutCSSFileName = "layout.css";
    this.styleFileName = currentDocName + ".css";
    this.fontFolderName = "Fonts";
    this.tracer = tracer;
    this.projectPath = projectPath;
    this.currentDocumentName = currentDocName;
    this.currentFilePath = combinePath(projectPath, currentDocName);
    this.fileHTML = undefined;
    this.commonProp;
    this.jsonContent;
    this.jsonFile;
    this.jsonDocumentObject;
    this.tabulation = 0;
    this.objectId;
    this.uniqId = '';
    this.layoutCSSBuilder;
    this.stlyeCSSBuilder;
    this.fontExpoter;
    this.stringBuilder;
    this.stringFileName = "strings.js";
    this.stringFolderName = "Strings";
    this.jsonLoader
    this.intilize();
}


htmlParser.prototype.createScreenFolder = function (projectPath) {
    return combinePath(projectPath, this.screenFolderName)
}

// init html meta data.
htmlParser.prototype.processJsonDocumentObject = function () {
    try {
        // as of now process only layers.
        for (var prop in this.jsonDocumentObject) {
            if (typeof this.jsonDocumentObject[prop] === 'object') {
                if (this.jsonDocumentObject[prop].typename != undefined) {
                    var currentCss = "";
                    this.processHTMLDocument(this.jsonDocumentObject[prop], this.jsonDocumentObject, this.tabulation, currentCss);
                }
            }
        }
    } catch (e) {
        this.tracer.writeErrorLog(e);
    }
}

// init html meta data.
htmlParser.prototype.intilize = function () {
    try {
        this.loadJsonFile();
        this.layoutCSSBuilder = new exporterCSSBuilder(this.projectPath, this.layoutCSSFileName, this.cssFolderName);
        this.stlyeCSSBuilder = new exporterCSSBuilder(this.projectPath, this.styleFileName, this.cssFolderName);
        this.stringBuilder = new stringsExpoter(this.projectPath, this.stringFileName, this.stringFolderName, this.tracer);
        this.fontExpoter = new fontExpoter(this.projectPath, this.fontFolderName, this.tracer);
        this.createHTMLFile();
    } catch (e) {
        this.tracer.writeErrorLog(e);
    }
}

htmlParser.prototype.loadJsonFile = function () {
    try {
        this.jsonLoader = new jsonLoader(this.createScreenFolder(this.projectPath) + "/" + this.currentDocumentName + '.json', this.tracer);
        this.jsonLoader.jsonDocumentObjectLoad();
        this.jsonDocumentObject = this.jsonLoader.getJsonDocumentObject();
    } catch (e) {
        this.tracer.writeErrorLog(e);
    }
}

htmlParser.prototype.createHTMLFile = function () {

    try {
        // open the html file
        this.fileHTML = new File(this.createScreenFolder(this.projectPath) + "/" + this.currentDocumentName + ".html");
        this.fileHTML.open("w");

        // print HTML header
        this.fileHTML.write(
            "<!DOCTYPE htm>\n" +
            "<html lang=\"en\">\n" +
            "<head>\n" +
            "\t<meta charset=\"utf-8\" />\n\n" +
            "\t<link rel=\"stylesheet\" href=\"../" + this.cssFolderName + "/" + this.layoutCSSFileName + "\" />\n" +
            "\t<link rel=\"stylesheet\" href=\"../" + this.cssFolderName + "/" + this.styleFileName + "\" />\n" +
            "\t<title>" + this.currentDocumentName + "</title>\n" + "</head>\n");

        this.fileHTML.writeln("<body>");
    } catch (e) {
        this.tracer.writeErrorLog(e);
    }
}

htmlParser.prototype.writeLayoutCSSData = function (tagTypeName, css, jsonObject) {
    this.layoutCSSBuilder.setNestedCSS(css);
    this.layoutCSSBuilder.addNewKeyInDictinory();
    // this codition for the background of the body.
    if (jsonObject.typename === "Layer" && jsonObject.backGroundItem_Item != undefined) {
        this.layoutCSSBuilder.addCSSInDictinory(tagTypeName, jsonObject.backGroundItem_Item);
    } else
        this.layoutCSSBuilder.addCSSInDictinory(tagTypeName, jsonObject);
}

htmlParser.prototype.writeStyleCSSData = function (tagTypeName, css, jsonObject) {
    try {
        this.stlyeCSSBuilder.setNestedCSS(css);
        this.stlyeCSSBuilder.addNewKeyInDictinory();
        this.stlyeCSSBuilder.addCSSInDictinory(tagTypeName, jsonObject);
    } catch (e) {
        this.tracer.writeErrorLog("writeStyleCSSData : " + e);
    }
}

htmlParser.prototype.writeHTMLData = function (tab, tag, objectId, cssName) {
    try {
        this.fileHTML.write(tab + "<" + tag + ' id="' + objectId + "\"");
        this.fileHTML.write(' class="' + cssName + "\"");
        this.fileHTML.write(">\n");
    } catch (e) {
        this.tracer.writeErrorLog("writeHTMLData : " + e);
    }
}


htmlParser.prototype.writeULTag = function (tabulation, jsonObject, nestedCSS) {
    try {
        var cssName = "list_widget";
        var tab = getTabs(tabulation + 1);
        this.writeHTMLData(tab, "ul", "", cssName);
    } catch (e) {
        this.tracer.writeErrorLog("writeULTag : " + e);
    }

    return cssName;
}

htmlParser.prototype.writeCSSForULTag = function (jsonObject, nestedCSS) {
    nestedCSS = nestedCSS + " ." + "ul";
    this.writeLayoutCSSData("ul", nestedCSS, jsonObject);

    return nestedCSS;

}

htmlParser.prototype.writeItemSpecificCSS = function (jsonObject, nestedCSS, parentJsonObject) {
    try {
        switch (jsonObject.styleType) {
        case "SelectedItem":
            {
                if (parentJsonObject.SelectedObjectProperties != undefined) {
                    var selectedCSSKey = this.getSpecifiyKey(nestedCSS, "selected");
                    var selectedItemObj = parentJsonObject.SelectedObjectProperties;
                    this.writeStyleCSSData(selectedItemObj.typename, selectedCSSKey, selectedItemObj)
                }
            }
            break;
        }

        if (jsonObject.submenu != undefined && jsonObject.submenu.typename == constants.submenu) {
            var strs = nestedCSS.split(' .');
            var str = strs[strs.length - 2];
            var selectedNestedKey = nestedCSS.replace(str, "selected");
            var key = this.getSpecifiyKey(selectedNestedKey, constants.submenu);
            var subMenuObject = jsonObject.submenu;
            this.writeStyleCSSData(subMenuObject.typename, key, subMenuObject);
        }
    } catch (e) {
        this.tracer.writeErrorLog(e);
    }
}

htmlParser.prototype.writeMatrixWidgetCSS = function (nestedCSS, jsonObject) {
    try {
        var strs = nestedCSS.split(' .');
        var str = strs[strs.length - 2];
        var selectedNestedKey = nestedCSS.replace(str, "selected");
        var key = this.getSpecifiyKey(selectedNestedKey, constants.submenu);
        var subMenuObject = jsonObject.submenu;
        this.writeLayoutCSSData(constants.submenu, key, subMenuObject);
    } catch (e) {
        this.tracer.writeErrorLog("writeMatrixWidgetCSS : " + e);
    }
}

htmlParser.prototype.getSpecifiyKey = function (nestedCSS, key) {
    try {
        var strs = nestedCSS.split(' .');
        var str = strs[strs.length - 1];
        return nestedCSS.replace(str, key);
    } catch (e) {
        this.tracer.writeErrorLog("getSpecifiyKey : " + e);
    }
}


htmlParser.prototype.isCommonPropertyAvailable = function (jsonObject) {
    if (jsonObject.CommonProperties != undefined)
        return true;
    else
        return false;
}

htmlParser.prototype.processHTMLDocument = function (jsonObject, parentJsonObject, tabulation, nestedCSS) {

    var currentCSS;
    var commonProp;
    var listWidgetConstants = "list_Widget";
    var tab = this.getTabs(tabulation);
    var objectId = this.uidProvider.util_getIdFromObject(jsonObject);;
    var tag = "div"; //this.getHTMLTag(jsonObject, parentJsonObject);
    currentCSS = objectId;

    if ((jsonObject.typename == constants.layer && jsonObject.widgetName == constants.tabWidget) || (jsonObject.typename == constants.groupItem && jsonObject.widgetType == constants.list) || (jsonObject.typename == constants.groupItem && jsonObject.widgetType == constants.matrix))
        currentCSS = jsonObject.styleType;

    nestedCSS = nestedCSS + " ." + currentCSS;

    jsonObject["endTagNeedToWrite"] = true;

    var isTrue = this.isCommonPropertyAvailable(parentJsonObject);

    if (isTrue)
        currentCSS = currentCSS + " " + constants.commonProp;


    this.writeLayoutCSSData(jsonObject.typename, nestedCSS, jsonObject);
    this.writeItemSpecificCSS(jsonObject, nestedCSS, parentJsonObject);

    switch (jsonObject.typename) {
    case "Layer":
        {
            this.fileHTML.write(tab + "<" + tag);
            this.fileHTML.write(' class="' + currentCSS);

            if (jsonObject.wdgetType == constants.tabPane)
                this.fileHTML.write(' submenu');

            this.fileHTML.write("\"" + ">\n");
            break;
        }
    case "GroupItem":
        {
            switch (jsonObject.widgetType) {
            case constants.list:
            case constants.matrix:
                {
                    this.writeHTMLData(tab, tag, objectId, currentCSS);
                    var cssName = constants.commonProp;

                    if (jsonObject.CommonProperties != undefined) {
                        this.writeStyleCSSData("ul", nestedCSS + " ." + cssName, jsonObject.CommonProperties);
                        tabulation = tabulation + 1;
                    }
                }
                break;
            default:
                this.writeHTMLData(tab, tag, objectId, currentCSS);
                break;
            }
        }
        break;
    case "MartixGroupItem":
        {
            this.fileHTML.write(tab + "<" + tag);
            this.fileHTML.write(' class="' + currentCSS + " submenu" + "\"");
            this.fileHTML.write(">\n");
            this.writeMatrixWidgetCSS(nestedCSS, jsonObject);
            break;
        }
    case "TextFrame":
        {
            this.fileHTML.write(tab + "<" + tag + ' id="' + objectId + "\"");
            this.fileHTML.write(' class="' + currentCSS + "\"");
            this.fileHTML.write(">");
            this.fileHTML.write(unescape(getContent(jsonObject.contents)));
            this.fileHTML.write("\n");
        }
        break;
    case "PathItem":
    case "PlacedItem":
    case "RasterItem":
        {
            this.fileHTML.write(tab + "<" + tag + ' id="' + objectId + "\"");
            this.fileHTML.write(' class="' + currentCSS + "\"");
            this.fileHTML.write(">\n");
        }
        break;
        //    case "PlacedItem":
        //    case "RasterItem":
        //    {
        //
        //                this.fileHTML.write(tab + "<" + tag + ">");
        //                this.fileHTML.write("<img src=\"" + jsonObject.file + "\"" + ' id="' + currentCSS + '" class="' + currentCSS + " " + constants.listWidget + "\"" + "/>");
        //            /*if (parentJsonObject.widgetType == constants.list) {
        //                this.fileHTML.write(tab + "<" + tag + ">");
        //                this.fileHTML.write("<img src=\"" + jsonObject.file + "\"" + ' class="' + currentCSS + " " + constants.listWidget + " \"" + "/>");
        //            } else
        //            //this.fileHTML.write(tab + "<" + tag  + " src=\"" + jsonObject.file + "\"" + 'class="poster"'+">");
        //                this.fileHTML.write(tab + "<" + tag + " src=\"" + jsonObject.file + "\"" + ' class="' + currentCSS + "\"" + ">");*/
        //
        //        }
        //        break;
    default:
        {
            jsonObject["endTagNeedToWrite"] = false;
        }
        break;
    }

    for (var prop in jsonObject) {
        try {
            if (typeof jsonObject[prop] === 'object') {
                if (jsonObject[prop].typename == "selectedListItem" || jsonObject[prop].typename == constants.submenu || jsonObject[prop].typename == undefined) continue;
                this.processHTMLDocument(jsonObject[prop], jsonObject, tabulation + 1, nestedCSS);
            }
        } catch (e) {
            this.tracer.writeErrorLog(e);
        }
    }

    if (jsonObject.endTagNeedToWrite != undefined && jsonObject.endTagNeedToWrite == true)
        this.fileHTML.write(tab + "</" + tag + ">\n");
}


//htmlParser.prototype.getContent = function (content) {
//    var replaceCodes = {
//        "%u0131": "%u007C",
//        "%u2026": "&#x2026",
//        "%20":"&nbsp"
//    };
//   var rex;
//    for (var code in replaceCodes) {
//        rex = new RegExp(code, 'g');
//        content = content.replace(rex, replaceCodes[code]);
//    }
//    return content;
//}
//----------------------------------------------------------------------
// Name: save() 
// Desc: do some save stuff
//----------------------------------------------------------------------
htmlParser.prototype.save = function () {
    try {
        this.fileHTML.writeln("</body>");
        this.fileHTML.write("</html>\n");
        this.fileHTML.close();
        this.layoutCSSBuilder.save();
        this.stlyeCSSBuilder.save();
    } catch (e) {
        this.tracer.writeErrorLog("HTMLParser.save : " + e);
    }
}

//----------------------------------------------------------------------
// Name: util_getNextUniqId() 
// Desc: return a unique Id number
//----------------------------------------------------------------------
htmlParser.prototype.getNextUniqId = function () {
    return ++objectId;
}

htmlParser.prototype.getHTMLTag = function (obj, parentJsonObject) {
    var tag = '';

    switch (obj.typename) {
    case "Layer":
        {
            if (obj.widgetType == constants.tabWidget)
                tag = constants.ul;
            else if (parentJsonObject.widgetType == constants.tabWidget)
                tag = constants.li;
            else
                tag = constants.div;
        }
        break;
    case "TextFrame":
        {

            switch (parentJsonObject.typename) {
            case constants.layer:
                {
                    switch (parentJsonObject.widgetType) {
                    case constants.list:
                        {
                            tag = constants.li;
                            break;
                        }
                    case constants.tabWidget:
                        {
                            tag = constants.li;
                            break;
                        }
                    default:
                        tag = constants.div;
                        break;
                    }
                    break;

                }
            case constants.groupItem:
                {
                    switch (parentJsonObject.widgetType) {
                    case constants.list:
                        {
                            tag = constants.li;
                            break;
                        }
                    case constants.tabWidget:
                        {
                            tag = constants.li;
                            break;
                        }
                    case constants.matrix:
                        {
                            // if(obj.styleType == constants.matrixHeader || obj.styleType == constants.selectedItem)
                            tag = constants.li;
                            // else
                            //  tag = constants.div;
                            // if(parentJsonObject.parentWidgetType == constants.list || parentJsonObject.widgetType == constants.matrix)
                            //tag =constants.li;
                            //   else
                            //  tag =constants.div;
                        }
                        break;
                    default:
                        tag = constants.div;
                        break;
                    }
                }
                break;
            case constants.martixGroupItem:
                {
                    if (obj.styleType == constants.matrixHeader || obj.styleType == constants.selectedItem)
                        tag = constants.li;
                    else
                        tag = constants.div;

                }
                break;
            default:
                tag = constants.div;
            }
            break;
        }
    case "PlacedItem":
    case "RasterItem":
        {
            if ((parentJsonObject.typename == constants.groupItem || parentJsonObject.typename == constants.martixGroupItem) && parentJsonObject.widgetType == constants.matrix)
                tag = constants.img;
            else if (parentJsonObject.typename == constants.groupItem && parentJsonObject.widgetType == constants.list)
                tag = constants.li;
            else
                tag = constants.img;
        }
        break;
    case "GroupItem":
        {
            if (obj.widgetType == constants.list || obj.widgetType == constants.matrix)
                tag = constants.ul;
            else
                tag = constants.div;
        }
        break;
    case "PathItem":
        {
            if (parentJsonObject.widgetType == constants.list)
                tag = constants.li;
            else
                tag = constants.div;
        }
        break;

    case constants.martixGroupItem:
        {
            tag = constants.div;
        }
        break;

    default:
        {
            tag = constants.div;
        }
        break;
    }
    return tag;
}

htmlParser.prototype.getTabs = function (tabulation) {
    var tabs = "";

    for (i = 0; i < tabulation; i++) tabs += "\t";

    return tabs;
}

htmlParser.prototype.util_getIdFromObject = function (obj) {
    var id = "";

    // ... otherwise, try to get an id from the object typename
    if (id == "" && obj != undefined && obj.typename != undefined)
        id = String(obj.typename) + "_" + this.util_getNextUniqId();

    // ... otherwise, get a generiq name
    if (id == "")
        id = "id_" + this.util_getNextUniqId();

    id = id.replace(" ", "_");

    return id;
}

//----------------------------------------------------------------------
// Name: util_getNextUniqId() 
// Desc: return a unique Id number
//----------------------------------------------------------------------
htmlParser.prototype.util_getNextUniqId = function () {
    return ++this.uniqId;
}
