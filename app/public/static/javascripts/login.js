$(document).ready(function () {
  var form = $('.form-login');
  
  var username = form.find('.username');
  var password = form.find('.password');
  
  var redirectTo = null;

  function showError(error) {
    form.find('.alert').show();
    form.find('.alert p').text(error);
  }

  function checkForInitialError() {
    if (!window.globalData) {
      return;
    }
    redirectTo = window.globalData.cameFrom;
    showError("You have to login before you can go to: " + redirectTo);
  }
  
  checkForInitialError();
  
  form.submit(function (event) {
    event.preventDefault();
    form.find('.alert').hide();
    
    var postData = {
      username: username.val(),
      password: password.val()
    };
    
    $.post('/api/login', postData, function (data) {
      if (!data.ok) {
        showError(data.error);
        username.focus();
        return;
      }
      
      window.location = redirectTo ? redirectTo : ('/' + postData.username);
    });
  });
});
