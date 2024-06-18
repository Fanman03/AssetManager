$(function () {
  $('th').each(function () {
    // get element text
    var text = $(this).text();
    // modify text
    text = text.replace('_id', 'Asset Tag');
    // update element text
    $(this).text(text);
  });

  $('th').each(function () {
    // get element text
    var text = $(this).text();
    // modify text
    text = text.replace('_', ' ');
    // update element text
    $(this).text(text);
  });

  $("tr:contains('Image')").hide();

  $("#icon").html(statusIconConverter(asset.Status));
  $("#title").text(asset.Brand + " " + asset.Model);
  $("#subtitle").text(asset._id);
  $("#subtitle").attr("href", "/i/" + asset._id);

  if (asset.Image != undefined) {
    let imgUrl = "https://raw.githubusercontent.com/Fanman03/asset-images/master/" + asset.Image + ".png";
    $("#image").attr("src", imgUrl);
  }

  if (asset.Notes != undefined) {
    let converter = new showdown.Converter({ emoji: true });
    let desc = converter.makeHtml(asset.Notes).replace("<p>", "").replace("</p>", "");
    $("#v_Notes").html(desc);
  }

  if (asset.Status > -1) {
    $("#v_Status").text(statusConverter(asset.Status));
  }

  if (asset.Purchase_Date) {
    $("#v_Purchase_Date").text(timeConverter(asset.Purchase_Date));
  }

  if (asset.Brand) {
    if (asset.Brand === "Dell") {
      $("#v_Serial_Number").html("<a target='_blank' href='https://www.dell.com/support/home/en-us/product-support/servicetag/" + asset.Serial_Number + "/overview'>" + asset.Serial_Number + "</a>");
    }
  }

  if (asset.Monitor_1) {
    if (asset.Monitor_1.includes("$")) {
      $("#v_Monitor_1").html("<a href='{{{ domain }}}/" + asset.Monitor_1.replace("$", "") + "'>" + asset.Monitor_1.replace("$", "") + "</a>");
    }
  }

  if (asset.Monitor_2) {
    if (asset.Monitor_2.includes("$")) {
      $("#v_Monitor_2").html("<a href='{{{ domain }}}/" + asset.Monitor_2.replace("$", "") + "'>" + asset.Monitor_2.replace("$", "") + "</a>");
    }
  }

  if (asset.Monitor_3) {
    if (asset.Monitor_3.includes("$")) {
      $("#v_Monitor_3").html("<a href='{{{ domain }}}/" + asset.Monitor_3.replace("$", "") + "'>" + asset.Monitor_3.replace("$", "") + "</a>");
    }
  }

  if (asset.Monitor_4) {
    if (asset.Monitor_4.includes("$")) {
      $("#v_Monitor_4").html("<a href='{{{ domain }}}/" + asset.Monitor_4.replace("$", "") + "'>" + asset.Monitor_4.replace("$", "") + "</a>");
    }
  }

  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
});

function gotoAsset(element) {
  window.location.href = element.text;
}

function timeConverter(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var time = month + ' ' + date + ' ' + year + ' (' + time_ago(UNIX_timestamp * 1000) + ')';
  return time;
}

function statusConverter(status) {
  let outStatus = "";
  if (status === 0) {
    outStatus = "Spare";
  } else if (status === 1) {
    outStatus = "In Service";
  } else if (status === 2) {
    outStatus = "Retired";
  } else if (status === 3) {
    outStatus = "Sold";
  } else if (status === 4) {
    outStatus = "Lost";
  } else if (status === 5) {
    outStatus = "Stolen";
  } else {
    outStatus = status;
  }
  return outStatus;
}

function statusIconConverter(status) {
  if (status === undefined) {
    return '<i class="bi-question-circle-fill" data-bs-toggle="tooltip" data-bs-title="Unknown" data-bs-placement="bottom"></i>';
  } else if (status === 0) {
    return '<i class="bi bi-check-circle-fill text-info" data-bs-toggle="tooltip" data-bs-title="Spare" data-bs-placement="bottom"></i>';
  } else if (status === 1) {
    return '<i class="bi bi-check-circle-fill text-success" data-bs-toggle="tooltip" data-bs-title="In Service" data-bs-placement="bottom"></i>';
  } else if (status === 2) {
    return '<i class="bi bi-clock-fill text-warning" data-bs-toggle="tooltip" data-bs-title="Retired" data-bs-placement="bottom"></i>';
  } else if (status === 3) {
    return '<i class="bi bi-currency-exchange text-warning" data-bs-toggle="tooltip" data-bs-title="Sold" data-bs-placement="bottom"></i>';
  } else if (status === 4) {
    return '<i class="bi bi-question-circle-fill text-danger" data-bs-toggle="tooltip" data-bs-title="Lost" data-bs-placement="bottom"></i>';
  } else if (status === 5) {
    return '<i class="bi bi-exclamation-circle-fill text-danger" data-bs-toggle="tooltip" data-bs-title="Stolen" data-bs-placement="bottom"></i>';
  } else {
    return '<i class="bi bi-bug-fill text-danger" data-bs-toggle="tooltip" data-bs-title="Error" data-bs-placement="bottom"></i>';
  }
}

function time_ago(time) {

  switch (typeof time) {
    case 'number':
      break;
    case 'string':
      time = +new Date(time);
      break;
    case 'object':
      if (time.constructor === Date) time = time.getTime();
      break;
    default:
      time = +new Date();
  }
  var time_formats = [
    [60, 'seconds', 1], // 60
    [120, '1 minute ago', '1 minute from now'], // 60*2
    [3600, 'minutes', 60], // 60*60, 60
    [7200, '1 hour ago', '1 hour from now'], // 60*60*2
    [86400, 'hours', 3600], // 60*60*24, 60*60
    [172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
    [604800, 'days', 86400], // 60*60*24*7, 60*60*24
    [1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
    [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
    [4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
    [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
    [58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
    [2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
    [5806080000, 'Last century', 'Next century'], // 60*60*24*7*4*12*100*2
    [58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
  ];
  var seconds = (+new Date() - time) / 1000,
    token = 'ago',
    list_choice = 1;

  if (seconds == 0) {
    return 'Just now'
  }
  if (seconds < 0) {
    seconds = Math.abs(seconds);
    token = 'from now';
    list_choice = 2;
  }
  var i = 0,
    format;
  while (format = time_formats[i++])
    if (seconds < format[0]) {
      if (typeof format[2] == 'string')
        return format[list_choice];
      else
        return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
    }
  return time;
}