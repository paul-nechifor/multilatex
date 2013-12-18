$(document).ready(function () {
  var form = $('.form-create');
  
  var location = form.find('.location');
  
  form.submit(function (event) {
    event.preventDefault();
    
    var postData = {
      location: location.val()
    };
    
    $.post('/api/create', postData, function (data) {
      if (!data.ok) {
        showError(data.error);
        return;
      }
      
      window.location = data.createdLocation;
    });
  });
});
