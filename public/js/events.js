$("#search").click(function() {
  var queryStr = $("#events-query").val();
  console.log("SEARCHING FOR '" + queryStr + "'");

  $.ajax({
    type: "GET",
    url: 'http://localhost:3000/api/events?query=' + queryStr,
    error: function(xhr, statusText) {
      console.log("Error: " + statusText);
    },
    success: function(results) {
      var resultsList = $("#results-list");
      resultsList.empty();
      results.forEach(function (result) {
        resultsList.append("<li><span>" + result.date + " - " + result.description + "</span></li>");
      });
    }
  });
});
