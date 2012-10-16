(function() {
  var tabs = document.querySelectorAll(".tabs");

  function installTabs(t) {
    var selectors = t.querySelectorAll(".nav li a")
      , panes     = t.querySelectorAll(".panes > div");

    for (var i = 0; i < selectors.length; i++) {
      var a      = selectors.item(i)
        , target = document.getElementById(a.getAttribute("data-target"));

      installTabSelector(selectors, panes, target, a);
    }
  }

  function installTabSelector(selectors, panes, target, a) {
    a.addEventListener('click', function(e) {
      e.preventDefault();

      for( var i = 0; i < selectors.length; i++) {
        var s = selectors.item(i);

        if (s != a) {
          s.classList.remove('active');
        }
      }

      for( var i = 0; i < panes.length; i++) {
        var p = panes.item(i);

        if (p != target) {
          p.classList.remove('active');
        }
      }

      a.classList.add('active');
      target.classList.add('active');
    }, true);
  }

  for (var i=0; i < tabs.length; i++) {
    installTabs(tabs.item(i));
  }
})();
