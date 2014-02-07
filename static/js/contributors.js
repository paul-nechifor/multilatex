function main() {
  registerAddContributor();
  registerRemoveContributors();
}

// TODO: Clean all of this.
function registerAddContributor() {
  $('.contrib-add-form .btn').click(function (e) {
    e.preventDefault();
    var input = $('.contrib-add-form input');
    var username = input.val();
    input.val('');

    var postData = {
      action: 'add',
      projectId: window.globalData.projectId,
      username: username
    };

    function showError(error) {
      $('.contrib-add-form .alert').show();
      $('.contrib-add-form .alert p').text(error);
    }

    $.post('/api/contributors', postData, function (data) {
      if (!data.ok) {
        showError(data.error);
        return;
      }

      var child = $('<p></p>')
        .append($('<a/>').attr('href', '/' + username).text(username));
      $('.panel-contrib .panel-body').append(child);
    });
  });
}

function registerRemoveContributors() {
  $('a.rem').click(function (e) {
    var $a = $(this);

    var postData = {
      action: 'remove',
      projectId: window.globalData.projectId,
      userId: $a.data('id')
    };

    function showError(error) {
      $('.contrib-add-form .alert').show();
      $('.contrib-add-form .alert p').text(error);
    }

    $.post('/api/contributors', postData, function (data) {
      if (!data.ok) {
        showError(data.error);
        return;
      }

      $a.parent().remove();
    });
  });
}

$(document).ready(main);
