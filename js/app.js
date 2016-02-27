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
    if (dictionary === 'tureng' || dictionary === 'wordnik') {}
    else $('.dict-direction').addClass('hide');
    $('.pleaseWait').removeClass('hide');

    // footer
    var footerHTML = {
      tureng: 'via <a target="_blank" href="http://tureng.com/search/' + encodeURIComponent(word) + '"><img src="/images/tureng-logo.png" alt="Tureng.com" width="84" /></a>',
      eksi: 'via <a target="_blank" href="http://www.eksisozluk.com/?q=' + encodeURIComponent(word) + '"><img src="/images/eksi-text.png" alt="eksi" height="32" /></a>',
      wordnik: "via <a target='_blank' href='https://www.wordnik.com/words/" + encodeURIComponent(word) + "'><img src='/images/wordnik-logo.png' alt='wordnik' width='84' /></a>",
      tdk: "via <a target='_blank' href='http://www.tdk.gov.tr/index.php?option=com_gts&arama=gts&kelime=" + encodeURIComponent(word) + "'><img src='/images/tdk-logo.png' alt='tdk.gov.tr' height='32' /></a>",
      vikipedi: "via <a target='_blank' href='http://tr.wikipedia.org/wiki/" + encodeURIComponent(word) + "'><img src='/images/vikipedi.png' alt='vikipedi' height='64' /></a>",
      wikipedia: "via <a target='_blank' href='http://en.wikipedia.org/wiki/" + encodeURIComponent(word) + "'><img src='/images/wikipedia.png' alt='wikipedia' height='64' /></a>"
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
        $('#enToEn').removeClass('success').addClass('secondary');
        $('#enToTR').removeClass('secondary').addClass('success');
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
		$.ajax({
			url: 'http://api.wordnik.com:80/v4/word.json/' + word + '/definitions?limit=10&includeRelated=true&sourceDictionaries=wiktionary&useCanonical=true&includeTags=false&api_key=7e21be24f37babb012408010cec0c5a212312f653348938f5',
			type: 'GET',
			complete: function () {
				$('.pleaseWait').addClass('hide');
        $('#enToEn').removeClass('secondary').addClass('success');
        $('#enToTR').removeClass('success').addClass('secondary');
			},
			success: function (data) {
				if (data.length > 0) {
					var i = Math.floor(Math.random() * (data.length - 1));
					var sourceDict = data[i].sourceDictionary != undefined ? data[i].sourceDictionary : '';
					$('#content').prepend('<p title="'+ safeResponse.cleanDomString(data[i].sourceDictionary) +'">' + safeResponse.cleanDomString(data[i].text) + '</p>')
				}
				else
					{
						$('#content').html('<p>Aradığınız <strong>kelimenin anlamını Wordnik arşivinde bulamadık!</strong> :( <br> Kelimedeki ekleri silmek belki yardımcı olabilir ya da <a target="_blank" href="https://www.google.com/search?q=' + word + '">Google <i class="fi-eject"></i></a> </p>');
					}
			}
		});

		$.ajax({
			url: 'http://api.wordnik.com:80/v4/word.json/' + word + '/relatedWords?useCanonical=true&relationshipTypes=synonym&limitPerRelationshipType=10&api_key=7e21be24f37babb012408010cec0c5a212312f653348938f5',
			type: 'GET',
			complete: function () {
				$('.pleaseWait').addClass('hide');
			},
			success: function (data) {
				if (data.length > 0) {
					if (data.length > 0) {
						$('#content').append('<p><span class="info label">' + safeResponse.cleanDomString(data[0].relationshipType) + '</span> ' + safeResponse.cleanDomString(data[0].words.join(', ')) +'</p>');
					}
				}
			}
		});
    
    $.ajax({
      url: 'http://api.wordnik.com:80/v4/word.json/' + word + '/examples?includeDuplicates=false&useCanonical=true&skip=0&limit=5&api_key=7e21be24f37babb012408010cec0c5a212312f653348938f5',
      type: 'GET',
      success: function (data) {
        if (data.examples && data.examples.length > 0) {
          var max = data.examples.length - 1;
          var i = Math.floor(Math.random() * (max + 1));
  
          var re = new RegExp(data.examples[i].word, "gi");
  
          $('#content').append('<p title="'+ safeResponse.cleanDomString(data.examples[i].title) +'"><span class="info label">example</span> ' + safeResponse.cleanDomString(data.examples[i].text.replace(re, "<strong>$&</strong>")) + '</p>');
        }
      }
    });
    
    parent.__wordnikAudio(word);
    
  };

  this.__wordnikAudio = function (word) {
    $.ajax({
			url: 'http://api.wordnik.com:80/v4/word.json/' + word + '/audio?useCanonical=true&limit=50&api_key=7e21be24f37babb012408010cec0c5a212312f653348938f5',
			type: 'GET',
			success: function (data) {

				if (data.length > 0) {
					for (var i = 0; i < data.length; i++) {
						$('.audio').append('<span class="fi-volume" data-url="' + safeResponse.cleanDomString(data[i].fileUrl) + '" aria-hidden="true" title="Kelimenin telaffuzunu dinlemek için tıklayın"></span> ');

						$('.audio span[class=fi-volume]')
              .on('click', function() {
                new Audio($(this).attr('data-url')).play();
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
          $('#content').html('<p>Aradığınız <strong>kelimeyi TDK sözlüğünde bulamadık!</strong> :( <br> Kelimedeki ekleri silmek belki yardımcı olabilir ya da <a target="_blank" href="https://www.google.com/search?q=' + word + '">Google <i class="fi-eject"></i></a></p>');
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

        $('#content').find('a[target!="_blank"]')
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
        $('#content').html('<p>Aradığınız <strong>kelimeyi Ekşi Sözlük\'te bulamadık!</strong> :( <br> Kelimedeki ekleri silmek belki yardımcı olabilir ya da <a target="_blank" href="https://www.google.com/search?q=' + word + '">Google <i class="fi-eject"></i></a> </p>');
        return false;
      }

      if (xhr.readyState == 4) {
        var responseURL = xhr.responseURL.split('?')[0];

        var data = xhr.responseText;

        if ($(data).find('#entry-list li').length < 1) {
          $('#content').html('<p>Aradığınız <strong>kelimeyi ekşi sözlüğünde bulamadık!</strong> :( <br> Kelimedeki ekleri silmek belki yardımcı olabilir ya da <a target="_blank" href="https://www.google.com/search?q=' + word + '">Google <i class="fi-eject"></i></a> </p>');
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
          
          $('.content a[class=url]').on('click', function (e) {
            e.preventDefault();
            window.open($(this).attr('href'))
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
  
    this.__wikipedia = function (word, language) {
        $.ajax({
            url: 'https://' + language + '.wikipedia.org/w/api.php?action=opensearch&search=' + word + '&format=json',
            type: 'GET',
            complete: function () {
                $('.pleaseWait').addClass('hide');
            },
            success: function (data) {
                if (data[1].length>0) {
                $('#content').html("<ol></ol>");
                for (cnt = 0; cnt < data[1].length; cnt++) {
                    $("#content ol").append("<li><strong>"+safeResponse.cleanDomString(data[1][cnt]) + "</strong>: " + safeResponse.cleanDomString(data[2][cnt]) + ' <a title="yeni sekmede aç" target="_blank" href="' + safeResponse.cleanDomString(data[3][cnt]) + '"><i class="fi-eject"></i></a>' + "</li>");
                }
                } else {
                $('#content').html('<p>Aradığınız <strong>kelimenin anlamını Wikipedia\'da bulamadık!</strong> :( <br> Kelimedeki ekleri silmek belki yardımcı olabilir ya da <a target="_blank" href="https://www.google.com/search?q=' + word + '">Google <i class="fi-eject"></i></a> </p>');
                }
            }
        });
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
      return parent.__wordnikAudio(parent.__beforeSearch(word, 'wordnik'));
    },
    wikipedia: function (word) {
      return parent.__wikipedia(parent.__beforeSearch(word, 'wikipedia'), "en");
    },
    vikipedi: function (word) {
      return parent.__wikipedia(parent.__beforeSearch(word, 'vikipedi'), "tr");
    }

  }
}();


if (document.location.hash) {
  search.tureng(document.location.hash.substr(1));
}

document.addEventListener("DOMContentLoaded", function () {
  $('button#tureng, #enToTR').on('click', function () {
    search.tureng();
  });

  $('button#tdk').on('click', function () {
    search.tdk();
  });

  $('button#eksi').on('click', function () {
    search.eksi();
  });
  
  $('#wikipedia').on('click', function () {
    search.wikipedia();
  });

  $('#vikipedi').on('click', function () {
    search.vikipedi();
  });

  $('#enToEn').on('click', function () {
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