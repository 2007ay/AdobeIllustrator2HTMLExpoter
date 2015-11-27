function createFolder(path) {
    var folder = new Folder(path);

    // dont remove this condition becuse if some files are already there it may overriden.
    if (!folder.exists)
        folder.create();
}

function combinePath(root, path) {
    var tempPath = root + "/" + path;
    return tempPath;
}

function removeExtension(fileWithExtension) {
    var withoutExtension = fileWithExtension.substr(0, fileWithExtension.lastIndexOf('.'));
    return withoutExtension;
}
//----------------------------------------------------------------------
// Name: util_isArray() 
// Desc: 
//----------------------------------------------------------------------
function util_isArray(testObject) {
    return testObject && !(testObject.propertyIsEnumerable('length')) && typeof testObject === 'object' && typeof testObject.length === 'number';
}

//----------------------------------------------------------------------
// Name: getUniqueCssId() 
// Desc: return unique css id for object;
//----------------------------------------------------------------------
function getUniqueCssId(obj) {
    var name;
    if (obj.typname == "layer")
        retrun
}

//----------------------------------------------------------------------
// Name: util_toInt() 
// Desc: return a int rounded value of the val input
//----------------------------------------------------------------------
function util_toInt(val) {
    var nb = parseFloat(val);
    return Math.round(nb);
}
//----------------------------------------------------------------------
// Name: util_toInvInt() 
// Desc: return the inverse of the int rounded value of the val input
//----------------------------------------------------------------------
function util_toInvInt(val) {
    var nb = parseFloat(val);
    return Math.round(-nb);
}
//----------------------------------------------------------------------
// Name: util_percentToFloat() 
// Desc: convert a percent value to float (i.e: 100-&gt;1  0-&gt;0) with two digits
//----------------------------------------------------------------------
function util_percentToFloat(val) {
    var nb = parseFloat(val);
    return Math.round(nb) / 100;
}

//----------------------------------------------------------------------
// Name: util_percentToFloat() 
// Desc: return the relative path (+name) of a file in HTML (Linux) format
//			The path is relative to 'mypath' variable
//----------------------------------------------------------------------
function relativeFilePath(obj, filePath) {
    // Is the 'file' field available ?
    try {
        var val = obj.file;
    } catch (e) {}

    var str = new String(val);
    str = str.replace(filePath, "./");
    str = str.replace(".//", "./");
    return str;
}


function cloneObject(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = cloneObject(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = this.cloneObject(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

function getContent(content) {
    var replaceCodes = {
        "%u0131": "%u007C",
        "%u2026": "&#x2026",
        "%20": "&nbsp;",
        "%09": "&emsp;",
        "%0D":"<br/>"
    };
    var rex;
    for (var code in replaceCodes) {
        rex = new RegExp(code, 'g');
        content = content.replace(rex, replaceCodes[code]);
    }
    return content;
}
