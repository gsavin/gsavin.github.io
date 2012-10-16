---
title: Animer du SVG dans une présentation revealjs
layout: post
---

[Revealjs](http://lab.hakim.se/reveal-js/) permet de créer des présentations en HTML, le principal avantage étant de pouvoir mettre votre présentation à disposition en ligne. Il est possible alors d'utiliser du CSS pour le style, et du javascript pour ajouter un peu de code.

Du fait que la présentation devient un petit site web, il est tentant de vouloir ajouter un peu d'interactivité. Pour ma part, je souhaitais utiliser des images SVG et rendre les choses interactives avec, par exemple, des éléments en surbrillance lorsqu'on passe la souris sur une partie de l'image.

Le problème est que lorsqu'on utilise une balise `img` pour inclure notre image SVG, la structure SVG n'est pas injectée dans le DOM. On ne peut donc pas accèder aux différents éléments. Dans ce qui suit, je montre comment injecter le SVG directement dans le DOM en utilisant [D3](http://d3js.org/), et comment mettre des éléments en surbrillance au passage de la souris.

## Inclure D3

N'oubliez pas d'inclure le script qui charge D3 (pensez à remplacer par le bon chemin) :

{% highlight HTML %}
<script src="js/d3.v3.min.js"></script>
{% endhighlight %}

## Injecter le SVG

Le code est relativement simple, il tient en deux lignes que vous pouvez insérer dans la balise `script` dans laquel Reveal est configuré.

{% highlight javascript %}
d3.xml('ma-super-image.svg', "image/svg+xml", function(error, doc) {
  document.querySelector('#section-svg').appendChild(doc.documentElement);
}
{% endhighlight %}

Deux choses que vous aurez à changer :

1. `ma-super-image.svg` qu'il vous faudra remplacer par le chemin vers votre image ;
2. `#section-svg` qui désigne l'endroit où sera injecté l'image (en dernier). Il suffit d'ajouter un `id` unique à la balise `section` de votre slide, et l'image sera ajoutée à la fin.

## Automatiser le chargement

Si vous avez plusieurs images à charger, cela va être un peu contraignant de devoir penser à ajouter le morceau de code à chaque fois. Comme je suis fainéant, j'ai ajouté une façon de charger automatiquement les images quand il y en a besoin.

Il vous suffit d'ajouter l'attribute `data-svg-hl` avec comme valeur le chemin vers votre image :

{% highlight HTML %}
<section data-svg-hl='mon-image.svg'>  
 ...
</section>
{% endhighlight %}

On remplace le code de chargement par celui-ci :

{% highlight javascript %}
d3.selectAll('[data-svg-hl]').each(function() {
  var self = this;
  
  d3.xml(this.getAttribute('data-svg-hl'), "image/svg+xml", function(error, doc) {
    self.appendChild(doc.documentElement);
    
    var svg = d3.select(self).select('svg');
    // Vous pouvez désormais utiliser la structure du svg...
  }
}
{% endhighlight %}

De cette manière, dès qu'un élément contiendra l'attribut `data-svg-hl` (il peut s'agir de n'importe quel élément, pas nécessairement une `section`), l'image correspondante sera chargée.

## Un peu de surbrillance

Vous pouvez donc manipuler l'élément `svg` comme n'importe quel autre élément du DOM. Je vous présente dans la suite comment mettre en surbrillance certaines zones de l'image lors du passage de la souris. Cela implique deux choses :

1. Une petite manip sur l'image svg, via Inkscape par exemple ;
2. L'ajout d'un peu de code dans ce que nous avons vu précedemment.

### Préparer votre image

Ouvrez votre image svg dans inkscape et cliquez droit sur l'élément que vous voulez mettre en surbrillance pour afficher les `propriétés de l'objet`. Notez la valeur de l'ID de l'objet (pour l'exemple `id-mon-objet`).  Affichez le code XML de l'élément (`Édition > Éditeur XML` ou `Maj + Ctrl + X`), les attributs de l'élément vous s'afficher sur la droite. Il faut ajouter l'attribut `class` avec pour valeur `hl` (cliquez sur `définir` pour que votre modif soit prise en compte). Cliquez ensuite sur l'élément qui déclenchera la surbrillance lors d'un passage de souris. Il faut rajouter deux attributs :

1. `class` avec pour valeur `highlighter` ;
2. `data-target`, avec pour valeur l'ID préalablement noté de votre objet, préfixé par `#` (`#id-mon-objet`).

Répéter l'opération pour chaque couple d'objets.

Si des éléments doivent être occultés pendant la surbrillance, cliquez dessus et ajouter l'attribut `class` avec comme valeur `hideonhl` depuis l'éditeur XML.

### Le code

Le code consiste à ajouter la classe `hover` à l'élément cible lors du passage de la souris sur l'élément `highlighter`, et à la retirer lorsque la souris quitte l'objet. On ajoute en plus la classe `hidden` à tous les éléments `hideonhl` pendant la surbrillance.

{% highlight javascript %}
d3.selectAll('[data-svg-hl]').each(function() {
  var self = this;

  d3.xml(this.getAttribute('data-svg-hl'), "image/svg+xml", function(error, doc) {
    self.appendChild(doc.documentElement);

    var svg = d3.select(self).select('svg');
    var selectors = svg.selectAll('.highlighter');

    selectors.on('mouseover', function() {
      var target = svg.select(this.getAttribute('data-target'));

      target.classed({'hover':true});
      svg.selectAll('.hideonhl').classed({'hidden':true});
    });

    selectors.on('mouseout', function() {
      var target = svg.select(this.getAttribute('data-target'));

      target.classed({'hover':false});
      svg.selectAll('.hideonhl').classed({'hidden':false});
    });
  });
});
{% endhighlight %}

### Dernière étape, le CSS

Pour finaliser, un peu de style pour définir l'opacité des éléments à mettre en surbrillance. Il ne s'agit que d'un exemple que vous pouvez (devez !) adapter à votre sauce.

{% highlight CSS %}
svg .hl {
  opacity: 0;
  -webkit-transition: opacity 500ms;
  transition: opacity 500ms;
}

svg .hl.hover {
  opacity: 1;
}

svg .hideonhl.hidden {
  opacity: 0.15;
}
{% endhighlight %}

Ce n'est qu'un petit hack fait rapidemment. N'hésitez pas à m'envoyer vos améliorations !
