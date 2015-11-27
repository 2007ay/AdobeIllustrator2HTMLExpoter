#include Utils.jsx

function jsonLoader(jsonFilePath, tracer) {
    this.tracer = tracer;
    this.jsonFilePath = jsonFilePath;
    this.jsonContent;
    this.jsonDocumentObject;
    this.readJsonFile();
}

// read this json file and evaluate by eval function.
jsonLoader.prototype.readJsonFile = function () {
    try {
        this.jsonFile = new File(this.jsonFilePath);
        this.jsonFile.open("r");
        this.jsonContent = this.jsonFile.read();
    } catch (e) {
        this.tracer.writeErrorLog(e);
    }
}

// Load Json Object into memory and copy into variable jsonDocumentObject;
jsonLoader.prototype.jsonDocumentObjectLoad = function () {
    try {
        eval("var obj =" + this.jsonContent);
        this.jsonDocumentObject = obj;
        //this.processJsonObjectRecursively(this.jsonDocumentObject);
    } catch (e) {
        this.tracer.writeErrorLog(e);
    }
}

jsonLoader.prototype.getJsonDocumentObject = function () {
    return this.jsonDocumentObject;
}

jsonLoader.prototype.getWidgetType = function (jsonObject) {
    var widgetType = '';
    if (jsonObject.typename == "Layer") {
        widgetType = jsonObject.widgetType;

        if (widgetType == undefined)
            widgetType = jsonObject.name;
    } else
        widgetType = jsonObject.widgetType;

    return unescape(widgetType);

}
// process json object recursively in future  multipule widget will come here.
jsonLoader.prototype.processJsonObjectRecursively = function (jsonObject) {

    switch (this.getWidgetType(jsonObject)) {
    case constants.matrix:
        {
            this.createMatrixWidget(jsonObject);
        }
        break;

    case constants.tabWidget:
        {
            this.createTabWidget(jsonObject);
        }
        break;

    case constants.tabWidget:
        {
            this.createTabWidget(jsonObject);
        }
        break;
    }

    this.writeCommonProperties(jsonObject);

    for (prop in jsonObject) {
        if (typeof (jsonObject[prop]) == 'object')
            this.processJsonObjectRecursively(jsonObject[prop]);
    }
}

//function writeCommonPrope

jsonLoader.prototype.writeCommonProperties = function (jsonObject) {
    if (this.isNeedToProcess(jsonObject)) {
        var commonProObject = {};
        var selectedObjectProperties = {};
        var commonProperties = [];
        var childObjects = this.getChildObjects(jsonObject);
        var obj = childObjects[0];
        for (var prop in obj) {
            var isCommon = false;

            if (prop == "typename" || prop == "file" || prop == "contents" || prop == "widgetType" || prop == "styleType" || prop == "parentWidgetType" || prop == "AXT_Left" || prop == "AXT_Top" || prop == constants.matrixItems) continue;

            for (var i = 0; i < childObjects.length; i++) {

                if (obj[prop] == childObjects[i][prop]) {
                    isCommon = true;
                } else {
                    isCommon = false;
                    break;
                }
            }
            if (isCommon) {
                commonProperties.push({
                    "prop": prop,
                    "value": obj[prop]
                });
            }
        }

        for (var j = 0; j < commonProperties.length; j++) {
            commonProObject[commonProperties[j]["prop"]] = commonProperties[j]["value"];
        }

        commonProObject["typename"] = undefined;
        jsonObject["CommonProperties"] = this.getCommonProperties(commonProObject);

        var selectedObject = this.getSelectedObject(jsonObject);
        if (selectedObject != null) {
            var cloneObj = cloneObject(selectedObject);
            cloneObj.typename = "selectedListItem";
            jsonObject["SelectedObjectProperties"] = cloneObj;
        }

        this.deletedChildsCommonProperties(jsonObject, commonProObject)
    }
}

jsonLoader.prototype.getSelectedObject = function (jsonObject) {
    var selectedObject = {};
    for (prop in jsonObject) {
        if (typeof (jsonObject[prop]) == 'object' && (jsonObject[prop]["styleType"] == constants.selectedItem)) {
            for (property in jsonObject[prop]) {
                if (property == "AXT_Left" || property == "AXT_Top" || property == "top" || property == "left") continue; {
                    selectedObject[property] = jsonObject[prop][property];
                }
            }
            break;
        }
    }
    return selectedObject;
}

jsonLoader.prototype.getChildCount = function (jsonObject) {
    var count = 0;
    for (prop in jsonObject) {
        if (typeof (jsonObject[prop]) == 'object')
        ++count;
    }
    return count;
}

jsonLoader.prototype.isNeedToProcess = function (jsonObject) {
    var isProcessed = false;
    var childCount = this.getChildCount(jsonObject);
    var widgetType = jsonObject.widgetType;

    if (childCount > 1 && (widgetType == constants.list || widgetType == constants.matrix || widgetType == constants.tabWidget))
        isProcessed = true;

    return isProcessed;
}

jsonLoader.prototype.getChildObjects = function (jsonObject) {
    var objects = [];
    for (prop in jsonObject) {
        if (typeof (jsonObject[prop]) == 'object' && (jsonObject[prop]["styleType"] != constants.selectedItem)) {
            objects.push(jsonObject[prop]);
        }
    }

    return objects;
}


jsonLoader.prototype.getCommonProperties = function (jsonObject) {
    if (jsonObject === null) {
            return null;
        }

    var selectedObject = {};
    var prop
    for(prop in jsonObject){
        var value =  jsonObject[prop];
        if(value !== undefined)
        {
            selectedObject[prop] = jsonObject[prop];
        }
    }

    return selectedObject;
}

/*// Get common properties for both image as well as Text in future it may changes.
jsonLoader.prototype.getCommonProperties = function (jsonObject) {
    if (jsonObject === null) {
            return null;
        }

        var selectedObject = {};

        if (jsonObject.margin !== undefined) {
            selectedObject.margin = jsonObject.margin;
        }

        if (jsonObject.fontFamily !== undefined) {
            selectedObject.fontFamily = jsonObject.fontFamily;
        }

        if (jsonObject.fontStyle !== undefined) {
            selectedObject.fontStyle = jsonObject.fontStyle;
        }

        if (jsonObject.fontWeight !== undefined) {
            selectedObject.fontWeight = jsonObject.fontWeight;
        }

        if (jsonObject.fontSize !== undefined) {
            selectedObject.fontSize = jsonObject.fontSize;
        }

        if (jsonObject.color !== undefined) {
            selectedObject.color = jsonObject.color;
        }

        if (jsonObject.backgroundColor !== undefined) {
            selectedObject.backgroundColor = jsonObject.backgroundColor;
        }

        if (jsonObject.backgroundImage !== undefined) {
            selectedObject.backgroundImage = jsonObject.backgroundImage;
        }

        if (jsonObject.background !== undefined) {
            selectedObject.background = jsonObject.background;
        }

        if (jsonObject.opacity !== undefined) {
            selectedObject.opacity = jsonObject.opacity;
        }

        if (jsonObject.textAlign !== undefined) {
            selectedObject.textAlign = jsonObject.textAlign;
        }

        if (jsonObject.whiteSpace !== undefined) {
            selectedObject.whiteSpace = jsonObject.whiteSpace;
        }

        if (jsonObject.width !== undefined) {
            selectedObject.width = jsonObject.width;
        }

        if (jsonObject.height !== undefined) {
            selectedObject.height = jsonObject.height;
        }

        if (jsonObject.strokeWidth !== undefined) {
            selectedObject.strokeWidth = jsonObject.strokeWidth;
        }

        if (jsonObject.strokeColor !== undefined) {
            selectedObject.strokeColor = jsonObject.strokeColor;
        }

        if (jsonObject.strokeStyle !== undefined) {
            selectedObject.strokeStyle = jsonObject.strokeStyle;
        }

        return selectedObject;
}*/

jsonLoader.prototype.deletedChildsCommonProperties = function (jsonObject, commonProObject) {
    var clonObj = cloneObject(commonProObject);
    for (prop in jsonObject) {
        if (prop == "CommonProperties" || prop == "SelectedObjectProperties") continue;

        if (typeof (jsonObject[prop]) == 'object') {
            for (p in clonObj) {

                if (p == "typename") continue;

                if (clonObj.hasOwnProperty(p) && jsonObject[prop][p]) {
                    delete jsonObject[prop][p];
                }
            }
        }
    }
}


jsonLoader.prototype.createMatrixWidget = function (jsonObject) {
    if (jsonObject.widgetType != constants.matrix || jsonObject.isProcessed) return;

    var groupItems = [];
    for (item in jsonObject) {
        if (typeof (jsonObject[item]) == 'object' && jsonObject[item].typename = constants.groupItem) {

            var groupItem = jsonObject[item];
            var matrixWidgetObject = {};
            var imageWidgets = [];

            for (prop in groupItem) {
                if (typeof (groupItem[prop]) == 'object' && (!this.isMatrixHeader(groupItem[prop]))) {
                    var obj = groupItem[prop];
                    imageWidgets.push(cloneObject(obj));
                    delete groupItem[prop];
                }
            }

            if (imageWidgets.length > 0) {
                this.buildMatrixWidget(groupItem, imageWidgets, jsonObject);
                delete jsonObject[item];
            }
        }
    }
}

jsonLoader.prototype.isMatrixHeader = function (jsonMatrixHeader) {
    var isHeader = false;

    if (jsonMatrixHeader.styleType == undefined)
        isHeader = false;
    else if (jsonMatrixHeader.styleType == constants.matrixHeader)
        isHeader = true;
    else if (jsonMatrixHeader.styleType == constants.selectedItem)
        isHeader = true;

    return isHeader;
}

jsonLoader.prototype.buildMatrixWidget = function (jsonObject, imageWidgets, parnetJasonObject) {
    var prop;
    var matrixWidgetParent = this.getParentForMatrixWidget(jsonObject);
    // var objs = imageWidgets;
    var objects = cloneObject(this.resetChildPosition(matrixWidgetParent, imageWidgets));

    matrixWidgetParent[constants.matrixItems] = objects;
    matrixWidgetParent[constants.matrixItems]["typename"] = "MartixGroupItem";
    matrixWidgetParent[constants.matrixItems]["widgetType"] = constants.matrix;
    matrixWidgetParent[constants.matrixItems]["isProcessed"] = true;
    matrixWidgetParent[constants.matrixItems].opacity = 0;
    parnetJasonObject[this.getName(jsonObject)] = matrixWidgetParent;
}

jsonLoader.prototype.getName = function (jsonObject) {
    var name;
    for (prop in jsonObject) {
        if (typeof (jsonObject[prop]) == 'object' && jsonObject[prop].typename == "TextFrame") {
            matrixWidgetParent = jsonObject[prop];
            name = prop;
        }
    }

    return name;
}

jsonLoader.prototype.getParentForMatrixWidget = function (jsonObject) {
    var matrixWidgetParent = null;
    for (prop in jsonObject) {
        if (typeof (jsonObject[prop]) == 'object' && (jsonObject[prop].typename == "TextFrame" && (jsonObject[prop].styleType == constants.matrixHeader || jsonObject[prop].styleType == constants.selectedItem))) {
            matrixWidgetParent = jsonObject[prop];
        }
    }

    if (matrixWidgetParent == null)
        matrixWidgetParent = jsonObject;

    return matrixWidgetParent;
}

jsonLoader.prototype.resetChildPosition = function (jsonObject, childsJsonObjects) {

    for (var i = 0; i < childsJsonObjects.length; i++) {
        var child = childsJsonObjects[i];
        for (prop in child) {
            if (prop == "AXT_Top") {
                child.AXT_Top = util_toInt(child.AXT_Top) - util_toInt(jsonObject.AXT_Top);
            } else if (prop == "AXT_Left") {
                child.AXT_Left = util_toInt(child.left) - util_toInt(jsonObject.AXT_Left);
            }

            childsJsonObjects[i] = child;
        }
    }

    return childsJsonObjects;
}

// I need to write this function for image list.
jsonLoader.prototype.buildImageListWidget = function (jsonObject) {
    if (typeof (jsonObject) == 'object' && jsonObject.typename == constants.groupItem && jsonObject.widgetType != constants.list) return;

    var isImages = true;

}

jsonLoader.prototype.createTabWidget = function (jsonObject) {
    if (jsonObject.isProcessed) return;

    jsonObject.widgetType = constants.tabWidget;
    jsonObject.styleType = "None";
    jsonObject.isProcessed = true;
    this.createTabs(jsonObject);
}

jsonLoader.prototype.createTabs = function (jsonObject) {
    if (jsonObject.typename == "Layer") {
        for (prop in jsonObject) {
            if (typeof (jsonObject[prop]) == 'object' && jsonObject[prop].typename == "Layer" && jsonObject[prop].name == constants.tab) {
                var tab = jsonObject[prop];
                if (tab.name == constants.tab) {
                    tab.wdgetType = constants.tab;
                    this.processTab(tab);
                }
            }
        }
    }
}

jsonLoader.prototype.processTab = function (tab) {
    for (prop in tab) {
        if (typeof (tab[prop]) == 'object' && tab[prop].typename == "Layer" && tab[prop].name == constants.tabPane) {
            var tabPane = tab[prop];
            if (tabPane.name == constants.tabPane) {
                tabPane.wdgetType = constants.tabPane;
                this.createSubMenu(tabPane);
            }
        }
    }
}

jsonLoader.prototype.createSubMenu = function (jsonObjectTab) {
    var submenu = {};
    submenu.opacity = jsonObjectTab.opacity;
    jsonObjectTab.submenu = submenu;
    jsonObjectTab.submenu.typename = constants.submenu;
}
