$(function () {
    let svgNode = DATAMatrix({ msg: "a.pendleton.cc/" + "{{{id}}}", dim: 100 });
    $("#barcode").html(svgNode);

    var c = document.getElementById("imgCanvas");
    var ctx = c.getContext("2d");


    ctx.font = "150px Roboto Mono";
    ctx.fillText(asset._id, 640, 170);
    ctx.font = "100px Roboto";
    ctx.fillText(asset.Brand, 640, 280);
    ctx.font = "100px Roboto";
    ctx.fillText(asset.Model, 640, 380);

    ctx.font = "100px Roboto";
    ctx.fillText("{{{tagUrl}}}", 640, 530);

    ctx.setTransform(23, 0, 0, 23, 70, 50);

    var path = new Path2D(document.getElementById("barcode").firstChild.firstChild.getAttribute("d"));
    ctx.fill(path);

    const urlParams = new URLSearchParams(window.location.search);
    const rParam = urlParams.get('r');
    if (rParam != 1) {
        window.location.href = window.location.href + "?r=1";
    }
});