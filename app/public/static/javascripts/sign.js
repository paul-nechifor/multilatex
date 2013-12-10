function main() {
  handleSignIn();
  handleSignUp();
}

function handleSignIn() {
  var form = $('.form-signin');
  
  if (!form) {
    return;
  }
  
  var username = form.find('.username');
  var password = form.find('.password');
}

function handleSignUp() {
  var form = $('.form-signup');
  
  var username = form.find('.username');
  var password = form.find('.password');
  
  form.submit(function (event) {
    event.preventDefault();
    
    var postData = {
      username: username.val(),
      password: password.val()
    };
    
    $.post('/api/sign-up', postData, function (data) {
      if (data.error) {
        alert(data.error);
        return;
      }
      
      window.location = '/user/' + postData.username + '/projects';
    });
  });
}

$(document).ready(main);