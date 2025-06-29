---
title: ma9y.net
layout: base
---
{% set posts = collections.post %}

{% for post in posts %}

<a href="{{ post.url }}">{{ post.data.title }}</a>

{% endfor %}



