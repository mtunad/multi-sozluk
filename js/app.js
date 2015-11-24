$(document).foundation();

//noinspection JSUnresolvedVariable,JSUnresolvedFunction
chrome.tabs.executeScript({
  code: 'window.getSelection().toString();'
}, function (selection) {
  var selected = selection[0].trim();
  document.getElementById('search').value = selected;
  if (selected.length > 0) search.tureng(selected);
});


search = function () {

  this.__beforeSearch = function (word, dictionary) {
    word = typeof word !== 'undefined' ? document.getElementById('search').value = word : document.getElementById('search').value;
    $('#content').html('');
    $('.audio span[class=fi-volume]').each(function(){$(this).remove();});
    $('.dict-direction').addClass('hide');
    $('.pleaseWait').removeClass('hide');

    // footer
    var footerHTML = {
      tureng: 'via <a target="_blank" href="http://tureng.com/search/' + word + '"><img src="/images/tureng-logo.png" alt="Tureng.com" width="84" /></a>',
      eksi: 'via <a target="_blank" href="http://www.eksisozluk.com/?q=' + encodeURIComponent(word) + '"><img src="/images/eksi-text.png" alt="eksi" height="32" /></a>',
      wordnik: "via <a target='_blank' href='https://www.wordnik.com/words/" + word + "'><img src='/images/wordnik-logo.png' alt='wordnik' width='84' /></a>",
      tdk: "via <a target='_blank' href='http://www.tdk.gov.tr/index.php?option=com_gts&arama=gts&kelime=" + encodeURIComponent(word) + "'><img src='/images/tdk-logo.png' alt='tdk.gov.tr' height='32' /></a>"
    };

    $('#footer').find('div').html(footerHTML[dictionary]);

    return word;
  };

  this.__tureng = function (word) {
    
    parent.__wordnikAudio(word);

    $.ajax({
      url: 'http://tureng.com/search/' + word,
      type: 'GET',
      complete: function () {
        $('.pleaseWait').addClass('hide');
      },
      success: function (data) {

        $('.dict-direction').removeClass('hide');

        // did you mean varsa: http://tureng.com/search/asfalya / merrymaker
        if ($(data).find('.suggestion-list').length > 0) {
          $('#content')
              .append('<h3>Did you mean?</h3>')
              .append("<ul class='suggestion-list'>" + safeResponse.cleanDomString($(data).find('.suggestion-list').html()) + '</ul>');
        }
        else {
          var response = $(data).find('.searchResultsTable');

          for (var i = 0; i < response.length; i++) {
            $('#content')
                .append(safeResponse.cleanDomString(response[i].outerHTML));

          }

          $.each($("td[colspan=2]"), function (e, v) {
            $(v).attr("colspan", 5)
          });
        }

        $('#content').find('a').on('click', function (e) {
          search.tureng($(this).text());
          e.preventDefault();
        });
      }
    });

  };

  this.__wordnik = function (word) {
    console.log('en to en');
  };

  this.__wordnikAudio = function (word) {
    $.ajax({
			url: 'http://api.wordnik.com:80/v4/word.json/' + word + '/audio?useCanonical=true&limit=50&api_key=7e21be24f37babb012408010cec0c5a212312f653348938f5',
			type: 'GET',
			success: function (data) {

				if (data.length > 0) {
					for (var i = 0; i < data.length; i++) {
						$('.audio').append('<span class="fi-volume" data-url="' + data[i].fileUrl + '" aria-hidden="true" title="Kelimenin telaffuzunu dinlemek için tıklayın"></span> ');

						$('.audio span[class=fi-volume]').on('click', function(){ new Audio($(this).attr('data-url')).play();
																										$(this).css('color', 'blue');
																									 });
					} 
				}
			}
		});
  };
  
  this.__tdk = function (word) {
    $.ajax({
      url: 'http://www.tdk.gov.tr/index.php?option=com_gts&arama=gts&kelime=' + encodeURIComponent(word),
      type: 'GET',
      complete: function () {
        $('.pleaseWait').addClass('hide');
      },
      success: function (data) {
        if ($(data).find('table[id=hor-minimalist-a]').length < 1 && $(data).find('table[id=hor-minimalist-c]').length < 1)
        { // suggestion ya da kelimenin anlamı bulunamadıysa
          $('#content').html('<p>Aradığınız <strong>kelimeyi TDK sözlüğünde bulamadık!</strong> :( <br> Kelimedeki ekleri silmek belki yardımcı olabilir.</p>')
        }
        else
        {
          if ($(data).find('table[id=hor-minimalist-c]').length > 0)
          {
            $('#content')
                .append(safeResponse.cleanDomString($(data).find('table[id=hor-minimalist-c]').html()))
                .append('<hr>');
            $("table[id=hor-minimalist-c]").each(function(){ $(this).removeAttr('width')});
          }
          for (var i = 0; i < $(data).find('table[id=hor-minimalist-a]').length; i++) {
            $('#content').append(safeResponse.cleanDomString($(data).find('table[id=hor-minimalist-a]')[i].outerHTML));
          }
          $("table[id=hor-minimalist-a]").each(function(){ $(this).removeAttr('width')});
        }

        $('#content').find('a')
            .on('click', function (e) {
              document.getElementById('search').value = $(this).text();
              search.tdk($(this).text());
              e.preventDefault();
            })
            .prepend('<br />');
      }
    });
  };

  this.__eksi = function (word, page) {
    var xhr = new XMLHttpRequest();
    if (typeof page !== 'undefined') {
      xhr.open("GET", page, true);
    } else {
      xhr.open("GET", 'https://eksisozluk.com/?q=' + encodeURIComponent(word), true); // pagination icin ?q='dan feragat.
    }
    xhr.onreadystatechange = function() {
      $('.pleaseWait').addClass('hide');

      if (xhr.statusCode == 404) {
        $('#content').html('<p>Aradığınız <strong>kelimeyi ekşi sözlükte bulamadık!</strong> :( <br> Kelimedeki ekleri silmek belki yardımcı olabilir.</p>')
        return false;
      }

      if (xhr.readyState == 4) {
        var responseURL = xhr.responseURL.split('?')[0];

        var data = xhr.responseText;

        if ($(data).find('#entry-list li').length < 1) {
          $('#content').html('<p>Aradığınız <strong>kelimeyi ekşi sözlüğünde bulamadık!</strong> :( <br> Kelimedeki ekleri silmek belki yardımcı olabilir.</p>')
        }
        else {
          for (var i = 0; i < $(data).find('#entry-list li').length; i++) {
            var entry = safeResponse.cleanDomString($(data).find('#entry-list li')[i].outerHTML);
            $('#content').append($(entry).find('.content'));
            var auth_info = '<div class="text-right">';
            auth_info += '<p class="auth_info">' + safeResponse.cleanDomString($(entry).find('.info .entry-author')[0].outerHTML);
            auth_info += '  ' + safeResponse.cleanDomString($(entry).find('.info .entry-date')[0].outerHTML)+'</p>';
            auth_info += '</div>';
            $('#content').append(auth_info);
            $('#content').append('<hr>');
          }

          if ($(data).find('.pager').length > 0) {
            $('#content').append('<select class="pager">');

            var currPage = $(data).find('.pager')[0].getAttribute('data-currentpage');

            for (i = 1; i <= $(data).find('.pager')[0].getAttribute('data-pagecount'); i++) {
              if (i == currPage)
              {
                $('#content .pager').append('<option value="' + responseURL + '?p=' + i + '" selected>' + i + '</option>');
              }
              else
              {
                $('#content .pager').append('<option value="' + responseURL + '?p=' + i + '">' + i + '</option>');
              }
            }

            $('#content .pager').on('change', function (e) {
              //var optionSelected = $("option:selected", this);
              var valueSelected = this.value;
              search.eksi(word, valueSelected);
            });
          }

          $('.auth_info a').on('click', function (e) {
            e.preventDefault();
            window.open('https://eksisozluk.com' + $(this).attr('href'))
          });

          $('.content a[class=b]').on('click', function (e) {
            e.preventDefault();
            document.getElementById('search').value = $(this).text();
            search.eksi($(this).text());
          });
        }
      }
    };
    xhr.send();

  };

  return {
    tureng: function (word) {
      return parent.__tureng(parent.__beforeSearch(word, 'tureng'))
    },
    wordnik: function (word) {
      return parent.__wordnik(parent.__beforeSearch(word, 'wordnik'))
    },
    eksi: function (word, page) {
      return parent.__eksi(parent.__beforeSearch(word, 'eksi'), page)
    },
    tdk: function (word) {
      return parent.__tdk(parent.__beforeSearch(word, 'tdk'))
    },
    wordnikAudio: function (word) {
      return parent.__tdk(parent.__beforeSearch(word));
    }

  }
}();

document.addEventListener("DOMContentLoaded", function () {
  $('button#tureng').on('click', function () {
    search.tureng();
  });

  $('button#tdk').on('click', function () {
    search.tdk();
  });

  $('button#eksi').on('click', function () {
    search.eksi();
  });

  $('button#wordnik').on('click', function () {
    search.wordnik();
  });

  document.getElementById('search').addEventListener('keydown', function (e) {
    if (e.keyCode == 13 && event.shiftKey) {
      search.tdk();
      return false;
    }
    if (e.keyCode == 13 && event.ctrlKey) {
      search.eksi();
      return false;
    }
    if (e.keyCode === 13) {
      search.tureng();
    }
  });
});