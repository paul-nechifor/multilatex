$(document).ready(function () {
  if ($('.form-register').length > 0) {
    handleForm($('.form-register'));
  }
  if ($('.form-quick-register').length > 0) {
    handleForm($('.form-quick-register'));
  }
});

function handleForm(form, withEmail) {
  var username = form.find('.username');
  var email = withEmail ? form.find('.email') : null;
  var password = form.find('.password');
  var password2 = form.find('.password2');

  function showError(error) {
    form.find('.alert').show();
    form.find('.alert p').text(error);
  }

  form.submit(function (event) {
    event.preventDefault();
    form.find('.alert').hide();

    if (password.val() !== password2.val()) {
      showError('Passwords are different.');
      password.val('');
      password2.val('');
      password.focus();
      return;
    }

    var postData = {
      username: username.val(),
      email: withEmail ? email.val() : undefined,
      password: password.val()
    };

    $.post('/api/register', postData, function (data) {
      if (!data.ok) {
        showError(data.error);
        return;
      }

      window.location = '/' + postData.username;
    });
  });
}