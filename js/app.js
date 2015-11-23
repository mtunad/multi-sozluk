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
    $('.dict-direction').addClass('hide');

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

    $.ajax({
      url: 'http://tureng.com/search/' + word,
      type: 'GET',
      beforeSend: function () {
        $('.pleaseWait').removeClass('hide');
      },
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

  this.__tdk = function (word) {
    console.log('tdk');
  };

  this.__eksi = function (word) {
    console.log('eksi');
  };

  return {
    tureng: function (word) {
      return parent.__tureng(parent.__beforeSearch(word, 'tureng'))
    },
    wordnik: function (word) {
      return parent.__wordnik(parent.__beforeSearch(word, 'wordnik'))
    },
    eksi: function (word) {
      return parent.__eksi(parent.__beforeSearch(word, 'eksi'))
    },
    tdk: function (word) {
      return parent.__tdk(parent.__beforeSearch(word, 'tdk'))
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