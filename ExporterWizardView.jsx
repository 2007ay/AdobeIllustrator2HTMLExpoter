/*
Author :Ashish Yadav.
Date : 20/02/2014
ExporterWizardView..
*/

function ExporterWizardView(layers) {
    this.layers = layers;
    this.totalItemsExport = 0;
    this.status = "export";
    this.selectedLayers = {};
    this.buildDefaultSelectedLayer();
    this.decalareStringConstants();
    this.exporterWiazdDialog = new Window('dialog', localize(this.WR));
    this.wizardLayout();
}

ExporterWizardView.prototype.buildDefaultSelectedLayer = function () {
    var count = 0;
    for (count = 0; count < this.layers.length; count++) {
        var layer = this.layers[count];
        this.selectedLayers[layer.name] = layer.name;
    }
};

Function.prototype.bind = function (scope, text) {
    var fn = this;
    return function () {
        return fn.apply(scope, text);
    };
};

ExporterWizardView.prototype.wizardLayout = function () {
    this.exporterWiazdDialog.alignChildren = 'left';
    this.exporterWiazdDialog.panel = this.exporterWiazdDialog.add('panel');
    this.exporterWiazdDialog.panel.alignChildren = 'left';

    //browse folder
    this.folerSelectorLayout();

    this.buildLayerSelectionLayout();

    //save and cancel button
    this.buttonLayoutPanel();

    //event registration
    this.exporterWiazdDialog.browseButton.onClick = this.onBrowseButtonClick.bind(this);
    this.exporterWiazdDialog.exportBtn.onClick = this.onExportButtonClick.bind(this);
    this.exporterWiazdDialog.cancelBtn.onClick = this.onCancelButtonClick.bind(this);
    this.exporterWiazdDialog.show();
};

ExporterWizardView.prototype.folerSelectorLayout = function () {

    this.exporterWiazdDialog.browseWorkSpacePnl = this.exporterWiazdDialog.panel.add('group', undefined);
    this.exporterWiazdDialog.browseWorkSpacePnl.add('statictext', undefined, localize(this.MSG_foldername));
    this.exporterWiazdDialog.outPathFolder = this.exporterWiazdDialog.browseWorkSpacePnl.add('edittext', undefined, "", {
        name: 'linkedimagesfolder'
    });
    this.exporterWiazdDialog.outPathFolder.characters = 40;
    this.exporterWiazdDialog.browseButton = this.exporterWiazdDialog.browseWorkSpacePnl.add('button', undefined, localize(this.BROWSE_MSG));
};

ExporterWizardView.prototype.buttonLayoutPanel = function () {
    this.exporterWiazdDialog.buttonGroup = this.exporterWiazdDialog.add('group', undefined, {
        orientation: 'row'
    });
    this.exporterWiazdDialog.buttonGroup.alignment = 'center';
    this.exporterWiazdDialog.cancelBtn = this.exporterWiazdDialog.buttonGroup.add('button', undefined, localize(this.MSG_Cancel), {
        name: 'cancel'
    });
    this.exporterWiazdDialog.exportBtn = this.exporterWiazdDialog.buttonGroup.add('button', undefined, localize(this.MSG_Ok), {
        name: 'export'
    });
    this.exporterWiazdDialog.cancelBtn.onClick = this.onCancelButtonClick;
};

ExporterWizardView.prototype.layerCBChange = function (checkBox) {
    this.selectedLayers = {};
    if (checkBox.value) {
        var count = 0;
        for (count = 0; count < this.layers.length; count++) {
            var layer = this.layers[count];
            if (layer.visible) {
                this.selectedLayers[layer.name] = layer.name;
            }
        }
    } else {
        this.buildDefaultSelectedLayer();
    }
};

ExporterWizardView.prototype.buildLayerSelectionLayout = function () {
    var that = this;
    that.exporterWiazdDialog.layerSelectionGroup = that.exporterWiazdDialog.panel.add('group', undefined);
    that.exporterWiazdDialog.layerSelectionGroup.add('statictext', undefined, "Export Layer(s) : ");
    that.exporterWiazdDialog.exportOptionCheckBox = that.exporterWiazdDialog.layerSelectionGroup.add('checkbox', undefined,
        'Should export only visible layer(s)?');
    that.exporterWiazdDialog.exportOptionCheckBox.onClick = function () {
        that.layerCBChange(this);
    }
};

ExporterWizardView.prototype.onBrowseButtonClick = function () {
    var selectedFolder = Folder.selectDialog("Select output folder");
    this.exporterWiazdDialog.outPathFolder.text = selectedFolder;
};

ExporterWizardView.prototype.onExportButtonClick = function () {
    this.exporterWiazdDialog.close();
};

ExporterWizardView.prototype.onCancelButtonClick = function () {
    this.status = "canceled";
    this.exporterWiazdDialog.close();
}

ExporterWizardView.prototype.getWorkSpacePath = function () {
    return this.exporterWiazdDialog.outPathFolder.text;
};

ExporterWizardView.prototype.getItemCount = function (groupItem) {
    var subItems = groupItem.pageItems;
    var i;
    for (i = subItems.length - 1; i >= 0; i--) {
        var subItem = subItems[i];
        if (subItem.typename === "GroupItem") {
            this.getItemCount(subItem);
        }
    }
    this.totalItemsExport += subItems.length;
};

ExporterWizardView.prototype.processLayer = function (layer) {
    var subItems = layer.pageItems;
    var sublayers = layer.layers;
    var j, k;
    for (j = 0; j < subItems.length; j++) {
        var subItem = subItems[j];
        if (subItem.typename === "GroupItem") {
            this.getItemCount(subItem);
        }
    }
    // parse sublayer recursively
    for (k = sublayers.length - 1; k >= 0; k--) {
        var subLayer = sublayers[k];
        this.processLayer(subLayer);
    }

    this.totalItemsExport += subItems.length;
}

ExporterWizardView.prototype.getPageItemsCount = function () {
    var i = 0;
    var layer;
    this.totalItemsExport = 0;
    for (i = 0; i < this.layers.length; i++) {
        layer = this.layers[i];
        if (this.selectedLayers[layer.name]) {
            this.processLayer(layer);
        }
    }
    return this.totalItemsExport;
};

ExporterWizardView.prototype.getSelectedLayers = function () {
    return this.selectedLayers;
};

ExporterWizardView.prototype.decalareStringConstants = function () {
    this.WR = "AI to HTML5 Exporter\n\n";

    this.MSG_foldername = {
        de: "Ordnername:",
        en: "Folder name:"
    };

    this.MSG_Cancel = {
        de: "Abbrechen",
        en: "Cancel"
    };

    this.MSG_Ok = {
        de: "Verknüpfungen sammeln",
        en: "Export"
    };

    this.BROWSE_MSG = {
        en: "Browse Folder"
    }

    this.All = {
        de: "",
        en: "All"
    };
}
