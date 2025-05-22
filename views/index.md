---
title: Deník
layout: base
---


{% set navPages = collections.post | reverse %}

{% for item in navPages %}

<article class="pb-2">

<div class="font-semibold"><a href="{{ item.url }}">{{ item.data.title }}</a></div>

<p class="text-gray-600 dark:text-gray-400 italic pb-2">{{ item.data.date | postDate }}</p>

<p class="text">{{ item.page.excerpt }}</p>

</article>

{% endfor %}



