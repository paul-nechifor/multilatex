$(document).ready(function () {
  var form = $('.form-login');
  
  var username = form.find('.username');
  var password = form.find('.password');
  
  form.submit(function (event) {
    event.preventDefault();
    $('form .alert').hide();
    
    var postData = {
      username: username.val(),
      password: password.val()
    };
    
    $.post('/api/login', postData, function (data) {
      if (!data.ok) {
        $('form .alert').show();
        $('form .alert p').text(data.error);
        username.focus();
        return;
      }
      
      window.location = '/' + postData.username;
    });
  });
});
