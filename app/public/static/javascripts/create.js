$(document).ready(function () {
  var form = $('.form-create');
  
  var name = form.find('.name');
  
  form.submit(function (event) {
    event.preventDefault();
    window.location += '/' + name.val();
  });
});
