function exportedHeaderConfig() {
    this.adHeaderConfig = {}
    this.resourceObject = {};
    this.fileName = "ADHeaderConfig.json";

}

exportedHeaderConfig.prototype.init = function () {

    this.sectionName = '';
    this.fontArray = [];
    this.sectionArray = [];
    this.imageArray = [];
    this.stringArray = [];
    this.styleArray = [];
    this.configFileStr = '';
    this.arrCount = 0;
}

exportedHeaderConfig.prototype.defaultFiles = function () {
    this.AddStyleFile(this.sectionName + ".css");
    this.AddStyleFile("layout.css");
    this.AddStringFile("strings.json");
}

exportedHeaderConfig.prototype.setSectionName = function (sectionName) {

    this.init();
    this.sectionName = sectionName;
    this.sectionArray.push(this.sectionName + ".scr");
    this.sectionArray.push(this.sectionName + ".json");
    this.defaultFiles();
}

exportedHeaderConfig.prototype.buildResourceObj = function () {

    this.resourceObject = {};
    this.resourceObject["Fonts"] = {}
    this.resourceObject["Fonts"] = this.fontArray;

    this.resourceObject["Images"] = {}
    this.resourceObject["Images"] = this.imageArray;

    this.resourceObject["Sections"] = {}
    this.resourceObject["Sections"] = this.sectionArray;

    this.resourceObject["Strings"] = {}
    this.resourceObject["Strings"] = this.stringArray;

    this.resourceObject["Styles"] = {}
    this.resourceObject["Styles"] = this.styleArray;

    return this.resourceObject;
};

exportedHeaderConfig.prototype.AddImageFile = function (imageName) {
    this.imageArray.push(imageName);
}

exportedHeaderConfig.prototype.AddStyleFile = function (styleName) {
    this.styleArray.push(styleName);
}

exportedHeaderConfig.prototype.AddFontFile = function (fontName) {
    this.fontArray.push(fontName);
}

exportedHeaderConfig.prototype.AddStringFile = function (stringFileName) {
    this.stringArray.push(stringFileName);
}

exportedHeaderConfig.prototype.buildSectionObject = function () {

    this.adHeaderConfig[this.sectionName] = {};
    this.adHeaderConfig[this.sectionName]["Resource"] = this.buildResourceObj();
}

exportedHeaderConfig.prototype.svaeHeaderFile = function (relativePath) {

    this.configFileStr = '{\n  "ADHeader" : {';
    var tab = 1;
    var count = 0;
    for (var prop in this.adHeaderConfig) {
        this.arrCount = 0;

        this.configFileStr += "\t";

        if (count > 0)
            this.configFileStr += ',"' + prop + '":' + "\n";
        else
            this.configFileStr += '"' + prop + '":' + "\n";

        this.buildResultStr(this.adHeaderConfig[prop], tab);

        count++;
    }

    this.configFileStr += "\t }";
    this.configFileStr += "}";

    var adConfigFile = new File(relativePath + "/" + this.fileName);
    adConfigFile.open("w");
    adConfigFile.write(this.configFileStr);
    adConfigFile.close();
}

exportedHeaderConfig.prototype.buildResultStr = function (jsonObject, tabCount) {

    var tab = '';
    for (var j = 0; j < tabCount; j++) tab += "\t";
    tabCount++;

    this.configFileStr += "\n";

    var isArray = jsonObject != undefined && jsonObject.length >= 0;

    // Need to do  correction for is object type is array.
    if (isArray) {

        this.configFileStr += tab + "[\n";

        for (var i = 0; i < jsonObject.length; i++) {
            if (i > 0)
                this.configFileStr += tab + ",";

            this.configFileStr += tab + '"' + jsonObject[i] + '"';
            this.configFileStr += "\n";
        }

        if (this.arrCount < 4)
            this.configFileStr += tab + "],\n";
        else
            this.configFileStr += tab + "]\n";

        ++this.arrCount;

        return;
    } else
        this.configFileStr += tab + "{";


    for (var prop in jsonObject) {

        this.configFileStr += tab + '"' + prop + '":' + "\n";

        if (typeof (jsonObject[prop] === 'object')) {
            this.buildResultStr(jsonObject[prop], tabCount);
        }

    }

    if (!isArray)
        this.configFileStr += tab + "}";
}
