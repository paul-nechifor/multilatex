function main() {
  $('.thumb').each(function () {
    wrapThumb($(this));
  });
}

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
}

function storeUrl(hash) {
  return '/store/' + hash.substring(0, 3) + '/' + hash.substring(3);
}

$(document).ready(main);
