function main() {
  registerLogout();
}

function registerLogout() {
  $('.btn-logout').click(function () {
    $.post('/api/logout', {}, function (data) {
      window.location.reload()
    })
  });
}

$(document).ready(main);
