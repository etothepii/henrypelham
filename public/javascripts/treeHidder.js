  function contractTree(id) {
    $("#a" + id).attr("onclick","expandTree('" + id + "')");
    $("#span" + id).addClass("glyphicon-plus");
    $("#span" + id).removeClass("glyphicon-minus");
    $("#span" + id).removeClass("treeContractor");
    $("#span" + id).addClass("treeExpander");
    $("#ul" + id).addClass("hidden");
  }
  function expandTree(id) {
    $("#a" + id).attr("onclick","contractTree('" + id + "')");
    $("#span" + id).removeClass("glyphicon-plus");
    $("#span" + id).addClass("glyphicon-minus");
    $("#span" + id).addClass("treeContractor");
    $("#span" + id).removeClass("treeExpander");
    $("#ul" + id).removeClass("hidden");
  }
