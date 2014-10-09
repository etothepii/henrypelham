  function contractTree(id) {
    $("#a" + id).attr("onclick","expandTree('" + id + "')");
    $("#a" + id).text("+");
    $("#ul" + id).addClass("hidden");
  }
  function expandTree(id) {
    $("#a" + id).attr("onclick","contractTree('" + id + "')");
    $("#a" + id).text("-");
    $("#ul" + id).removeClass("hidden");
  }
