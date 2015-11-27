function UIDProvider() {
    this.uniqId = 1;
}
//----------------------------------------------------------------------
// Name: util_getIdFromObject() 
// Desc: create a unique id (=name) for an object
// try to get name from the object .. if not avilable then dynamically renegrated.
//----------------------------------------------------------------------
UIDProvider.prototype.util_getIdFromObject = function (obj) {
    var id = obj.name;
    switch (obj.typename) {
    case "RasterItem":
    case "PlacedItem":
        {
            if (id === "") {
                if (obj.typename === "PlacedItem" && obj.file) {
                    var fileName = obj.file.name;
                    id += fileName;
                }
            }
            id += "image_" + this.util_getNextUniqId();;
        }
        break;
    case "GroupItem":
    case "Layer":
    case "PathItem":
    case "TextFrame":
        {
            id = obj.name;
            if (id === "" && obj !== undefined && obj.typename !== undefined) {
                id = String(obj.typename) + "_" + this.util_getNextUniqId();
            }

            id = id.replace(" ", "_");
        }
        break;
    }

    var regx = new RegExp(" ", 'g');
    id = unescape(id);
    id = id.replace(regx, "_");
    return id;
};

//----------------------------------------------------------------------
// Name: util_getNextUniqId() 
// Desc: return a unique Id number
//----------------------------------------------------------------------
UIDProvider.prototype.util_getNextUniqId = function () {
    return (this.uniqId += 1);
};
