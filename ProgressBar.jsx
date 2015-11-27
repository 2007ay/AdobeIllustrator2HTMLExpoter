/*
Author :Ashish Yadav.
Date : 20/02/2014
ProgressBar..
*/

function ProgressBar(totalPageItems) {
    this.totalPageItems = totalPageItems;
    this.isProgressCancled = false;
    this.progressWindow = new Window("palette", "Ai Exporter Progress Bar");
    this.progressWindow.pnl = this.progressWindow.add("panel", [10, 10, 440, 100], "Progress");
    this.progressWindow.pnl.progBar = this.progressWindow.pnl.add("progressbar", [20, 35, 410, 60], 0, totalPageItems);
    this.progressWindow.pnl.progBarLabel = this.progressWindow.pnl.add("statictext", [20, 20, 320, 35], "0%");
    //this.addCancelButton();
}

//TODO: need to fix the problem
//Cancel button is not working as of now . hence its disabled.
ProgressBar.prototype.addCancelButton = function () {
    this.progressWindow.proCancelBtn = this.progressWindow.add('button', undefined, "cancel", {
        name: 'cancel'
    });

    this.progressWindow.proCancelBtn.onClick = this.onProcessBtnClick;
};

ProgressBar.prototype.lunchProgressBar = function () {
    this.progressWindow.show();
};

//totalPageItems means only layers exist. this is NaN error handling case.
ProgressBar.prototype.updateProgress = function () {
    if (this.totalPageItems === 0) return;

    this.progressWindow.pnl.progBar.value++;
    this.progressWindow.pnl.progBarLabel.text = Math.round((this.progressWindow.pnl.progBar.value / this.totalPageItems) * 100) + "%";
    $.sleep(20);
    this.progressWindow.update();
};

ProgressBar.prototype.closeProgressBar = function () {
    this.progressWindow.close();
};

ProgressBar.prototype.onProcessBtnClick = function () {
    this.isProgressCancled = true;
};

ProgressBar.prototype.processCancelButton = function () {
    return this.isProgressCancled;
};
