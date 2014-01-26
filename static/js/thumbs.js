function main() {
  $('.thumb').each(function () {
    wrapThumb($(this));
  });
}

// TODO: Refactor this ugliness.
function wrapThumb(thumb) {
  var img = thumb.find('img');
  var pages = img.data('thumbs').split(' ');
  img.removeAttr('data-thumbs');
  var bar = $('<div class="bar"></div>');
  var frame = $('<div class="frame"></div>');
  frame.append(bar);
  img.after(frame);
  bar.css('width', '0');
  img.mousemove(function (e) {
    var p = e.offsetX / $(e.currentTarget).width();
    if (p < 0) {
      p = 0;
    } else if (p > 1) {
      p = 1;
    }
    var page = Math.min(Math.floor(p * pages.length), pages.length - 1);
    var url = storeUrl(pages[page]);
    if (img.attr('src') !== url) {
      img.attr('src', url);
    }
    bar.css('width', (((page + 1) / pages.length) * 100) + '%');
  });

  //handleFlipClick(img, thumb.find('.flip-book'), pages);
}

/*
jQuery.fn.center = function () {
  this.css("position","absolute");
  this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
    $(window).scrollTop()) + "px");
  this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
    $(window).scrollLeft()) + "px");
  return this;
}

function handleFlipClick(img, flipBook, pages) {

  flipBook.click(function () {
    var imgElem = img.get(0);

    var div = $('<div/>').css({
      width: (imgElem.naturalWidth * 2) + 'px',
      height: imgElem.naturalHeight + 'px'
    });

    var wrapper = $('<div class="magazine"/>').appendTo($('body')).append(div).center();

    for (var i = 0, len = pages.length; i < len; i++) {
      var page = $('<div/>').appendTo(div);
      $('<img/>').attr('src', storeUrl(pages[i])).appendTo(page);
    }
    var t = div.turn({gradients: true, acceleration: true});
    window.t = t;
  });
}
*/

function storeUrl(hash) {
  return '/store/' + hash.substring(0, 3) + '/' + hash.substring(3);
}

$(document).ready(main);
